import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { Client, UpdateClientRequest } from '../models/client.model';

@Component({
  selector: 'app-client-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.scss'
})
export class ClientEditComponent implements OnInit {
  @Input() clientId!: number;
  @Output() clientUpdated = new EventEmitter<Client>();
  @Output() editCancelled = new EventEmitter<void>();

  editForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  originalClient: Client | null = null;

  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
    this.loadClient();
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      company: ['', [Validators.maxLength(100)]],
      address: ['', [Validators.maxLength(500)]],
      status: ['active', [Validators.required]]
    });
  }

  /**
   * Load client data from the API
   */
  loadClient(): void {
    this.isLoading = true;
    this.error = null;

    this.clientService.getClient(this.clientId).subscribe({
      next: (client: Client) => {
        this.originalClient = client;
        this.populateForm(client);
        this.isLoading = false;
        console.log('✅ Client loaded for editing:', client);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.isLoading = false;
        console.error('❌ Failed to load client:', error);
      }
    });
  }

  /**
   * Populate form with client data
   */
  private populateForm(client: Client): void {
    this.editForm.patchValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company || '',
      address: client.address || '',
      status: client.status
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.editForm.valid && !this.isSaving) {
      this.updateClient();
    } else {
      this.markAllFieldsAsTouched();
      console.warn('⚠️ Form is invalid, please check all fields');
    }
  }

  /**
   * Update client via PUT request
   */
  private updateClient(): void {
    this.isSaving = true;
    this.error = null;

    const formValue = this.editForm.value;
    const updateRequest: UpdateClientRequest = {
      id: this.clientId,
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: formValue.phone.trim(),
      company: formValue.company?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      status: formValue.status
    };

    console.log('🔄 Sending PUT request to update client:', updateRequest);

    this.clientService.updateClient(this.clientId, updateRequest).subscribe({
      next: (updatedClient: Client) => {
        this.isSaving = false;
        console.log('✅ Client updated successfully:', updatedClient);
        this.clientUpdated.emit(updatedClient);
      },
      error: (error: Error) => {
        this.isSaving = false;
        this.error = error.message;
        console.error('❌ Failed to update client:', error);
      }
    });
  }

  /**
   * Cancel edit operation
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.editCancelled.emit();
      }
    } else {
      this.editCancelled.emit();
    }
  }

  /**
   * Check if form has unsaved changes
   */
  hasUnsavedChanges(): boolean {
    if (!this.originalClient) return false;

    const formValue = this.editForm.value;
    return (
      formValue.name !== this.originalClient.name ||
      formValue.email !== this.originalClient.email ||
      formValue.phone !== this.originalClient.phone ||
      formValue.company !== (this.originalClient.company || '') ||
      formValue.address !== (this.originalClient.address || '') ||
      formValue.status !== this.originalClient.status
    );
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string | null {
    const field = this.editForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      const errors = field.errors;
      if (errors) {
        if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
        if (errors['email']) return 'Please enter a valid email address';
        if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
        if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
        if (errors['pattern']) return 'Please enter a valid phone number';
      }
    }
    return null;
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      address: 'Address',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if a field has an error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Reset form to original values
   */
  resetForm(): void {
    if (this.originalClient) {
      this.populateForm(this.originalClient);
      this.editForm.markAsUntouched();
    }
  }
}
