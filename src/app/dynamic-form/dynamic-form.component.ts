import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, finalize } from 'rxjs';

// Original interface for backward compatibility
export interface FormField {
  key: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  validators?: any[];
  value?: any;
  disabled?: boolean;
  cssClass?: string;
  hidden?: boolean;
}

// New interface for JSON structure with field, hidden, mandatory
export interface JsonFormField {
  field: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  hidden: string | boolean; // Can be string "true"/"false" or boolean
  mandatory: string | boolean; // Can be string "true"/"false" or boolean
  options?: { label: string; value: any }[];
  placeholder?: string;
  cssClass?: string;
}

export interface FormConfig {
  formTitle?: string;
  formDescription?: string;
  fields: FormField[] | JsonFormField[]; // Support both formats
  submitButtonText?: string;
  resetButtonText?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

@Component({
  selector: 'app-dynamic-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  @Input() config?: FormConfig;
  @Input() jsonFilePath?: string; // Optional: path to JSON file in assets
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();
  @Output() configLoaded = new EventEmitter<FormConfig>();
  @Output() loadError = new EventEmitter<string>();

  dynamicForm!: FormGroup;
  processedFields: FormField[] = []; // Processed and normalized fields
  loadingState: LoadingState = {
    isLoading: false,
    error: null,
    hasData: false
  };

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    if (this.jsonFilePath) {
      this.loadConfigFromJson(this.jsonFilePath);
    } else if (this.config) {
      this.initializeForm(this.config);
    } else {
      this.setError('No configuration provided. Please provide either a config object or jsonFilePath.');
    }
  }

  /**
   * Load form configuration from JSON file in assets folder
   */
  loadConfigFromJson(filePath: string): void {
    this.setLoading(true);
    this.clearError();

    // Ensure the path starts with assets/
    const fullPath = filePath.startsWith('assets/') ? filePath : `assets/${filePath}`;

    this.fetchJsonFile(fullPath).subscribe({
      next: (config: FormConfig) => {
        this.config = config;
        this.initializeForm(config);
        this.configLoaded.emit(config);
        this.loadingState.hasData = true;
      },
      error: (error: string) => {
        this.setError(error);
        this.loadError.emit(error);
      },
      complete: () => {
        this.setLoading(false);
      }
    });
  }

  /**
   * Fetch JSON file with proper error handling
   */
  private fetchJsonFile(filePath: string): Observable<FormConfig> {
    return this.http.get<FormConfig>(filePath).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load form configuration';
        
        if (error.status === 404) {
          errorMessage = `Configuration file not found: ${filePath}`;
        } else if (error.status === 0) {
          errorMessage = 'Network error: Please check your connection';
        } else if (error.error instanceof ErrorEvent) {
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          errorMessage = `Server error: ${error.status} - ${error.message}`;
        }

        console.error('Error loading JSON configuration:', error);
        return of(null as any).pipe(
          finalize(() => {
            throw errorMessage;
          })
        );
      })
    );
  }

  /**
   * Initialize the form with the provided configuration
   */
  private initializeForm(config: FormConfig): void {
    if (!config || !config.fields || config.fields.length === 0) {
      this.setError('Invalid configuration: No fields provided');
      return;
    }

    try {
      // Process and normalize fields
      this.processedFields = this.normalizeFields(config.fields);
      this.createForm(this.processedFields);
      this.clearError();
      
      console.log('Processed fields:', this.processedFields);
      console.log('Form created successfully');
    } catch (error) {
      this.setError(`Error creating form: ${error}`);
    }
  }

  /**
   * Normalize fields from either format to the standard FormField format
   */
  private normalizeFields(fields: (FormField | JsonFormField)[]): FormField[] {
    return fields.map(field => this.normalizeField(field));
  }

  /**
   * Normalize a single field, handling both formats
   */
  private normalizeField(field: FormField | JsonFormField): FormField {
    // Check if it's the new JSON format (has 'field' property)
    if ('field' in field) {
      const jsonField = field as JsonFormField;
      
      return {
        key: jsonField.field,
        label: jsonField.label,
        type: jsonField.type,
        hidden: this.stringToBoolean(jsonField.hidden),
        required: this.stringToBoolean(jsonField.mandatory),
        options: jsonField.options,
        placeholder: jsonField.placeholder,
        cssClass: jsonField.cssClass,
        // Set default values based on type
        value: this.getDefaultValue(jsonField.type)
      };
    } else {
      // It's the original format, return as-is
      return field as FormField;
    }
  }

  /**
   * Convert string boolean ("true"/"false") to actual boolean
   */
  private stringToBoolean(value: string | boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    return value?.toLowerCase() === 'true';
  }

  /**
   * Get default value based on field type
   */
  private getDefaultValue(type: string): any {
    switch (type) {
      case 'checkbox':
        return false;
      case 'number':
        return null;
      default:
        return ''; // text, email, password, textarea, select, etc.
    }
  }

  /**
   * Create the reactive form based on processed fields
   */
  private createForm(fields: FormField[]): void {
    const formControls: { [key: string]: any } = {};

    fields.forEach(field => {
      // Skip hidden fields - don't add them to the form
      if (field.hidden) {
        console.log(`Skipping hidden field: ${field.key}`);
        return;
      }

      const validators = [];
      
      // Add required validator for mandatory fields
      if (field.required) {
        validators.push(Validators.required);
      }
      
      // Add email validator for email fields
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      
      // Add custom validators if provided
      if (field.validators) {
        validators.push(...field.validators);
      }

      // Create form control with initial value and validators
      formControls[field.key] = [
        { 
          value: field.value ?? this.getDefaultValue(field.type), 
          disabled: field.disabled || false 
        },
        validators
      ];

      console.log(`Added form control: ${field.key}, required: ${field.required}, initial value: ${field.value ?? this.getDefaultValue(field.type)}`);
    });

    this.dynamicForm = this.fb.group(formControls);
    
    // Log form creation details
    console.log('Form controls created:', Object.keys(formControls));
    console.log('Form valid:', this.dynamicForm.valid);
    console.log('Form value:', this.dynamicForm.value);
  }

  /**
   * Get visible fields (non-hidden) for template rendering
   */
  get visibleFields(): FormField[] {
    return this.processedFields.filter(field => !field.hidden);
  }

  /**
   * Reload configuration from JSON file
   */
  reloadConfig(): void {
    if (this.jsonFilePath) {
      this.loadConfigFromJson(this.jsonFilePath);
    }
  }

  /**
   * Enhanced form submission with comprehensive validation and logging
   */
  onSubmit(): void {
    this.submitForm();
  }

  /**
   * Comprehensive form submission method with detailed validation and logging
   */
  submitForm(): void {
    console.log('🚀 Form submission initiated...');
    console.log('📊 Form status:', {
      valid: this.dynamicForm.valid,
      invalid: this.dynamicForm.invalid,
      pending: this.dynamicForm.pending,
      disabled: this.dynamicForm.disabled,
      touched: this.dynamicForm.touched,
      dirty: this.dynamicForm.dirty
    });

    // Check if form is valid
    if (this.dynamicForm.valid) {
      // ✅ FORM IS VALID - Process submission
      const formData = this.dynamicForm.value;
      
      console.log('✅ Form is VALID! Submitting data...');
      console.log('📝 Form Data:', formData);
      
      // Log individual field values
      console.log('🔍 Individual Field Values:');
      this.visibleFields.forEach(field => {
        const value = formData[field.key];
        console.log(`  • ${field.label} (${field.key}):`, value, `[${typeof value}]`);
      });

      // Log hidden fields (if any)
      const hiddenFields = this.processedFields.filter(field => field.hidden);
      if (hiddenFields.length > 0) {
        console.log('👁️‍🗨️ Hidden Fields (not in form data):');
        hiddenFields.forEach(field => {
          console.log(`  • ${field.label} (${field.key}): [HIDDEN]`);
        });
      }

      // Emit the form data
      this.formSubmit.emit(formData);
      
      console.log('🎉 Form submitted successfully!');
      
      // Optional: Show success message to user
      this.showSuccessMessage('Form submitted successfully!');
      
    } else {
      // ❌ FORM IS INVALID - Handle validation errors
      console.log('❌ Form is INVALID! Cannot submit.');
      
      // Mark all fields as touched to show validation errors
      this.markAllFieldsAsTouched();
      
      // Get detailed validation errors
      const formErrors = this.getDetailedFormErrors();
      
      console.log('🚨 Validation Errors:', formErrors);
      
      // Log specific field errors
      console.log('📋 Field-by-Field Validation:');
      this.visibleFields.forEach(field => {
        const control = this.dynamicForm.get(field.key);
        if (control) {
          const fieldError = this.getFieldError(field.key);
          const status = control.valid ? '✅' : '❌';
          console.log(`  ${status} ${field.label} (${field.key}):`, {
            value: control.value,
            valid: control.valid,
            errors: control.errors,
            errorMessage: fieldError
          });
        }
      });
      
      // Count total errors
      const errorCount = Object.keys(formErrors).length;
      console.log(`🔢 Total validation errors: ${errorCount}`);
      
      // Show error message to user
      this.showErrorMessage(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} before submitting.`);
    }
  }

  /**
   * Mark all form controls as touched to trigger validation display
   */
  private markAllFieldsAsTouched(): void {
    console.log('👆 Marking all fields as touched to show validation errors...');
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }

  /**
   * Get detailed form validation errors with field information
   */
  private getDetailedFormErrors(): any {
    const errors: any = {};
    
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control && control.errors) {
        const field = this.processedFields.find(f => f.key === key);
        errors[key] = {
          fieldLabel: field?.label || key,
          fieldType: field?.type || 'unknown',
          value: control.value,
          errors: control.errors,
          errorMessage: this.getFieldError(key)
        };
      }
    });
    
    return errors;
  }

  /**
   * Show success message to user (you can customize this)
   */
  private showSuccessMessage(message: string): void {
    // You can replace this with your preferred notification system
    // Examples: Angular Material Snackbar, ngx-toastr, custom modal, etc.
    
    console.log('🎉 SUCCESS:', message);
    
    // Simple browser alert (replace with better UX)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`✅ ${message}`);
      }, 100);
    }
  }

  /**
   * Show error message to user (you can customize this)
   */
  private showErrorMessage(message: string): void {
    // You can replace this with your preferred notification system
    
    console.log('🚨 ERROR:', message);
    
    // Simple browser alert (replace with better UX)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`❌ ${message}`);
      }, 100);
    }
  }

  /**
   * Validate specific field programmatically
   */
  validateField(fieldKey: string): boolean {
    const control = this.dynamicForm.get(fieldKey);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
      
      const isValid = control.valid;
      const field = this.processedFields.find(f => f.key === fieldKey);
      
      console.log(`🔍 Field validation - ${field?.label || fieldKey}:`, {
        valid: isValid,
        value: control.value,
        errors: control.errors
      });
      
      return isValid;
    }
    
    return false;
  }

  /**
   * Validate entire form programmatically
   */
  validateForm(): boolean {
    console.log('🔍 Validating entire form...');
    
    // Mark all fields as touched
    this.markAllFieldsAsTouched();
    
    // Update form validation
    this.dynamicForm.updateValueAndValidity();
    
    const isValid = this.dynamicForm.valid;
    
    console.log('📊 Form validation result:', {
      valid: isValid,
      errors: isValid ? null : this.getDetailedFormErrors()
    });
    
    return isValid;
  }

  /**
   * Get form summary for debugging
   */
  getFormSummary(): any {
    return {
      formStatus: {
        valid: this.dynamicForm.valid,
        invalid: this.dynamicForm.invalid,
        pending: this.dynamicForm.pending,
        disabled: this.dynamicForm.disabled,
        touched: this.dynamicForm.touched,
        dirty: this.dynamicForm.dirty
      },
      fieldCount: {
        total: this.processedFields.length,
        visible: this.visibleFields.length,
        hidden: this.processedFields.length - this.visibleFields.length,
        required: this.visibleFields.filter(f => f.required).length
      },
      formData: this.dynamicForm.value,
      errors: this.dynamicForm.invalid ? this.getDetailedFormErrors() : null
    };
  }

  onReset(): void {
    this.dynamicForm.reset();
    
    // Reset to default values based on field types
    this.visibleFields.forEach(field => {
      const defaultValue = this.getDefaultValue(field.type);
      this.dynamicForm.get(field.key)?.setValue(defaultValue);
    });
    
    console.log('Form reset to default values');
    this.formReset.emit();
  }

  /**
   * Get form validation errors for debugging
   */
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  getFieldError(fieldKey: string): string | null {
    const control = this.dynamicForm.get(fieldKey);
    
    if (control?.errors && control.touched) {
      const field = this.processedFields.find(f => f.key === fieldKey);
      const fieldLabel = field?.label || fieldKey;
      
      // Required field error
      if (control.errors['required']) {
        if (field?.type === 'checkbox') {
          return `Please check ${fieldLabel} to continue`;
        }
        return `${fieldLabel} is required`;
      }
      
      // Email validation error
      if (control.errors['email']) {
        return `Please enter a valid email address`;
      }
      
      // Min length error
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${fieldLabel} must be at least ${requiredLength} characters long`;
      }
      
      // Max length error
      if (control.errors['maxlength']) {
        const requiredLength = control.errors['maxlength'].requiredLength;
        return `${fieldLabel} cannot exceed ${requiredLength} characters`;
      }
      
      // Pattern validation error
      if (control.errors['pattern']) {
        if (field?.type === 'email') {
          return `Please enter a valid email address`;
        }
        return `${fieldLabel} format is invalid`;
      }
      
      // Min value error (for number inputs)
      if (control.errors['min']) {
        const minValue = control.errors['min'].min;
        return `${fieldLabel} must be at least ${minValue}`;
      }
      
      // Max value error (for number inputs)
      if (control.errors['max']) {
        const maxValue = control.errors['max'].max;
        return `${fieldLabel} cannot exceed ${maxValue}`;
      }
      
      // Custom validation errors
      if (control.errors['custom']) {
        return control.errors['custom'];
      }
      
      // Generic error fallback
      const errorKeys = Object.keys(control.errors);
      return `${fieldLabel} is invalid (${errorKeys.join(', ')})`;
    }
    
    return null;
  }

  private getFieldLabel(fieldKey: string): string {
    const field = this.processedFields.find(f => f.key === fieldKey);
    return field?.label || fieldKey;
  }

  trackByKey(index: number, field: FormField): string {
    return field.key;
  }

  // Loading state management
  private setLoading(loading: boolean): void {
    this.loadingState.isLoading = loading;
  }

  private setError(error: string): void {
    this.loadingState.error = error;
    this.loadingState.hasData = false;
  }

  private clearError(): void {
    this.loadingState.error = null;
  }

  // Public getters for template
  get isLoading(): boolean {
    return this.loadingState.isLoading;
  }

  get hasError(): boolean {
    return !!this.loadingState.error;
  }

  get errorMessage(): string | null {
    return this.loadingState.error;
  }

  get hasValidConfig(): boolean {
    return !!(this.processedFields && this.processedFields.length > 0 && this.dynamicForm);
  }
}
