import { Component } from '@angular/core';
import { DynamicFormComponent, FormConfig } from './dynamic-form/dynamic-form.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, DynamicFormComponent, ClientListComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Dynamic Form Demo - JSON Parsing';
  
  // Toggle between different demo modes
  currentView: 'dynamic-form' | 'client-management' = 'client-management';
  useJsonMode = true;
  
  // JSON structure example for display
  jsonExample = `{
  "formTitle": "Dynamic Form from JSON",
  "formDescription": "Form with field, hidden, mandatory properties",
  "fields": [
    {
      "field": "firstName",
      "label": "First Name",
      "type": "text",
      "hidden": "false",
      "mandatory": "true"
    },
    {
      "field": "secretField",
      "label": "Secret Field",
      "type": "text",
      "hidden": "true",
      "mandatory": "false"
    },
    {
      "field": "newsletter",
      "label": "Subscribe to Newsletter",
      "type": "checkbox",
      "hidden": "false",
      "mandatory": "false"
    }
  ],
  "submitButtonText": "Submit Form",
  "resetButtonText": "Reset Form"
}`;
  
  // Static configuration for comparison
  staticConfig: FormConfig = {
    formTitle: 'Static Form Configuration',
    formDescription: 'This form uses hardcoded configuration with the standard FormField interface',
    fields: [
      {
        key: 'username',
        type: 'text',
        label: 'Username',
        required: true,
        placeholder: 'Enter your username'
      },
      {
        key: 'password',
        type: 'password',
        label: 'Password',
        required: true,
        placeholder: 'Enter your password'
      },
      {
        key: 'rememberMe',
        type: 'checkbox',
        label: 'Remember me',
        value: false
      }
    ],
    submitButtonText: 'Login',
    resetButtonText: 'Clear'
  };

  // Toggle between modes
  toggleMode() {
    this.useJsonMode = !this.useJsonMode;
    console.log(`Switched to: ${this.useJsonMode ? 'JSON Mode' : 'Static Mode'}`);
  }

  // Switch between different views
  switchView(view: 'dynamic-form' | 'client-management') {
    this.currentView = view;
    console.log(`Switched to: ${view}`);
  }

  // Get Angular version (mock for display)
  getAngularVersion(): string {
    return '18+';
  }

  // Event handlers
  onFormSubmit(formData: any) {
    console.log('Form submitted:', formData);
    alert('Form submitted successfully! Check console for data.');
  }

  onFormReset() {
    console.log('Form reset');
    alert('Form has been reset!');
  }

  onConfigLoaded(config: FormConfig) {
    console.log('Config loaded from JSON:', config);
    console.log('Processed fields with boolean conversion:');
    
    // Show how the fields were processed
    if (config.fields) {
      config.fields.forEach((field: any, index) => {
        if ('field' in field) {
          console.log(`Field ${index + 1}:`, {
            key: field.field,
            label: field.label,
            type: field.type,
            hidden: field.hidden,
            mandatory: field.mandatory,
            hiddenType: typeof field.hidden,
            mandatoryType: typeof field.mandatory
          });
        }
      });
    }
  }

  onLoadError(error: string) {
    console.error('Failed to load configuration:', error);
    alert(`Failed to load form configuration: ${error}`);
  }
}
