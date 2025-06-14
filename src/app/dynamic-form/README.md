# Dynamic Form Component

A flexible, reusable Angular component that renders forms dynamically based on configuration objects. This component supports multiple field types, validation, and responsive design.

## Features

- ✅ **Multiple Field Types**: text, email, password, number, select, textarea, checkbox, radio
- ✅ **Built-in Validation**: Required fields, email validation, custom validators
- ✅ **TypeScript Support**: Full type safety with interfaces
- ✅ **Reactive Forms**: Built on Angular Reactive Forms with FormBuilder
- ✅ **Responsive Design**: Mobile-first approach with responsive styling
- ✅ **Accessibility**: ARIA labels, focus management, and keyboard navigation
- ✅ **Customizable**: Custom CSS classes and styling options
- ✅ **Dark Mode**: Automatic dark mode support based on system preferences

## Installation

The component is already included in this Angular project. To use it in other projects:

1. Copy the `dynamic-form` directory to your project
2. Import the component in your module or standalone component
3. Make sure you have Angular Reactive Forms imported

## Basic Usage

### 1. Import the Component

```typescript
import { DynamicFormComponent, FormConfig } from './dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-example',
  imports: [DynamicFormComponent],
  template: `
    <app-dynamic-form 
      [config]="formConfig"
      (formSubmit)="onSubmit($event)"
      (formReset)="onReset()">
    </app-dynamic-form>
  `
})
export class ExampleComponent {
  // Your component logic here
}
```

### 2. Create Form Configuration

```typescript
formConfig: FormConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true
    },
    {
      key: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' }
      ]
    }
  ],
  submitButtonText: 'Submit Form',
  resetButtonText: 'Clear Form'
};
```

### 3. Handle Form Events

```typescript
onSubmit(formData: any): void {
  console.log('Form submitted:', formData);
  // Handle form submission
}

onReset(): void {
  console.log('Form reset');
  // Handle form reset
}
```

## Field Types

### Text Input
```typescript
{
  key: 'username',
  type: 'text',
  label: 'Username',
  placeholder: 'Enter username',
  required: true
}
```

### Email Input
```typescript
{
  key: 'email',
  type: 'email',
  label: 'Email Address',
  placeholder: 'Enter email',
  required: true
}
```

### Password Input
```typescript
{
  key: 'password',
  type: 'password',
  label: 'Password',
  placeholder: 'Enter password',
  required: true
}
```

### Number Input
```typescript
{
  key: 'age',
  type: 'number',
  label: 'Age',
  placeholder: 'Enter age'
}
```

### Select Dropdown
```typescript
{
  key: 'category',
  type: 'select',
  label: 'Category',
  placeholder: 'Choose category',
  required: true,
  options: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]
}
```

### Textarea
```typescript
{
  key: 'description',
  type: 'textarea',
  label: 'Description',
  placeholder: 'Enter description'
}
```

### Checkbox
```typescript
{
  key: 'subscribe',
  type: 'checkbox',
  label: 'Subscribe to newsletter'
}
```

### Radio Buttons
```typescript
{
  key: 'gender',
  type: 'radio',
  label: 'Gender',
  required: true,
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ]
}
```

## Configuration Options

### FormField Interface

```typescript
interface FormField {
  key: string;                    // Unique identifier for the field
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;                  // Display label for the field
  placeholder?: string;           // Placeholder text
  required?: boolean;             // Whether the field is required
  options?: { label: string; value: any }[];  // Options for select/radio fields
  validators?: any[];             // Custom validators
  value?: any;                    // Default value
  disabled?: boolean;             // Whether the field is disabled
  cssClass?: string;              // Custom CSS class for the field
}
```

### FormConfig Interface

```typescript
interface FormConfig {
  fields: FormField[];            // Array of form fields
  submitButtonText?: string;      // Text for submit button (default: 'Submit')
  resetButtonText?: string;       // Text for reset button (default: 'Reset')
}
```

## Advanced Usage

### Custom Validation

```typescript
import { Validators } from '@angular/forms';

const formConfig: FormConfig = {
  fields: [
    {
      key: 'username',
      type: 'text',
      label: 'Username',
      required: true,
      validators: [
        Validators.minLength(3),
        Validators.maxLength(20)
      ]
    }
  ]
};
```

### Pre-filled Form

```typescript
const formConfig: FormConfig = {
  fields: [
    {
      key: 'name',
      type: 'text',
      label: 'Name',
      value: 'John Doe'  // Pre-filled value
    }
  ]
};
```

### Disabled Fields

```typescript
const formConfig: FormConfig = {
  fields: [
    {
      key: 'email',
      type: 'email',
      label: 'Email (Read-only)',
      value: 'user@example.com',
      disabled: true
    }
  ]
};
```

### Custom CSS Classes

```typescript
const formConfig: FormConfig = {
  fields: [
    {
      key: 'important',
      type: 'text',
      label: 'Important Field',
      cssClass: 'highlight-field'
    }
  ]
};
```

## Styling Customization

The component uses CSS custom properties that can be overridden:

```scss
app-dynamic-form {
  --primary-color: #your-color;
  --error-color: #your-error-color;
  --border-radius: 8px;
}
```

## Events

### formSubmit
Emitted when the form is submitted and valid.
```typescript
(formSubmit)="onSubmit($event)"
```

### formReset
Emitted when the form is reset.
```typescript
(formReset)="onReset()"
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This component is available under the MIT License. 