# Client Management Application

A modern Angular application for managing client data with dynamic forms and comprehensive CRUD operations.

## 🚀 Features

### Dynamic Form Engine
- **JSON-driven forms**: Create forms from JSON configuration
- **Field types**: Text, email, password, number, date, select, textarea, checkbox, radio
- **Validation**: Built-in and custom validation rules
- **Conditional logic**: Show/hide fields based on conditions
- **Real-time validation**: Immediate feedback for users

### Client Management System
- **Complete CRUD operations**: Create, read, update, delete clients
- **Advanced filtering**: Search by name, email, company
- **Status management**: Active/inactive client states
- **Real-time search**: Debounced search with instant results
- **Data persistence**: RESTful API with Express.js backend

### User Experience
- **Responsive design**: Works on desktop, tablet, and mobile
- **Modal dialogs**: Clean editing and confirmation interfaces
- **Toast notifications**: User feedback for all operations
- **Loading states**: Visual indicators for async operations
- **Error handling**: Comprehensive error management

## 🛠️ Technology Stack

### Frontend
- **Angular 19**: Latest Angular framework with standalone components
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming for data streams
- **Reactive Forms**: Form management and validation
- **SCSS**: Advanced styling with variables and mixins

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **CORS**: Cross-origin resource sharing
- **RESTful API**: Standard HTTP methods for data operations

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **Hot Reload**: Development server with live updates
- **TypeScript Compiler**: Type checking and compilation
- **SCSS Preprocessor**: CSS preprocessing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run backend
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

### Alternative: Start both servers simultaneously
```bash
npm run dev
```

## 🏗️ Project Structure

```
client-management-app/
├── src/
│   ├── app/
│   │   ├── client-list/           # Client management component
│   │   ├── client-edit/           # Client editing component
│   │   ├── dynamic-form/          # Dynamic form engine
│   │   ├── confirmation-dialog/   # Reusable confirmation dialog
│   │   ├── services/              # Angular services
│   │   │   ├── client.service.ts  # Client API operations
│   │   │   └── toast.service.ts   # Notification service
│   │   ├── models/                # TypeScript interfaces
│   │   └── app.component.ts       # Root component
│   ├── assets/                    # Static assets and JSON configurations
│   └── styles/                    # Global styles
├── server.js                      # Express backend server
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## 🎯 Usage Guide

### Client Management

#### Viewing Clients
- Navigate to the main page to see all clients
- Use the search bar to filter by name, email, or company
- Toggle status filters to show active/inactive clients only
- Click the filter toggle to show/hide advanced filters

#### Adding Clients
- Click the "Add New Client" button
- Fill in the required information
- Click "Save" to add the client

#### Editing Clients
- Click the "Edit" button next to any client
- Modify the information in the modal dialog
- Click "Save Changes" to update
- Click "Cancel" to discard changes

#### Deleting Clients
- Click the "Delete" button next to any client
- Confirm the deletion in the dialog
- The client will be permanently removed

### Dynamic Forms

#### JSON Configuration
Create form configurations in `src/assets/` directory:

```json
{
  "formTitle": "Contact Form",
  "formDescription": "Please fill out your information",
  "submitButtonText": "Submit",
  "resetButtonText": "Reset",
  "fields": [
    {
      "key": "name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your name",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    {
      "key": "email",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "validation": {
        "email": true
      }
    }
  ]
}
```

#### Using Dynamic Forms
```typescript
// In your component
<app-dynamic-form 
  [config]="formConfig"
  (formSubmit)="handleSubmit($event)">
</app-dynamic-form>
```

## 🔧 Configuration

### Environment Variables
The application uses environment-specific configurations:

- **Development**: `http://localhost:3000` for API
- **Production**: Configure your production API URL

### Backend Configuration
Edit `server.js` to modify:
- Port number (default: 3000)
- CORS settings
- Data storage location
- API endpoints

### Angular Configuration
Edit `angular.json` to modify:
- Build configurations
- Asset locations
- Style preprocessors

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run End-to-End Tests
```bash
npm run e2e
```

### Code Coverage
```bash
npm run test:coverage
```

## 🚀 Building for Production

### Build the Application
```bash
npm run build
```

### Serve Production Build
```bash
npm run serve:prod
```

The build artifacts will be stored in the `dist/` directory.

## 📊 API Endpoints

### Client Management
- `GET /clients` - Retrieve all clients
- `GET /clients/:id` - Retrieve specific client
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update existing client
- `DELETE /clients/:id` - Delete client

### Health Check
- `GET /health` - Server health status

### Request/Response Examples

#### Get All Clients
```bash
GET /clients
```

Response:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "company": "Tech Corp",
    "address": "123 Main St",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create Client
```bash
POST /clients
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-987-6543",
  "company": "Design Studio",
  "address": "456 Oak Ave",
  "status": "active"
}
```

## 🎨 Customization

### Styling
- Edit SCSS files in `src/styles/` for global styles
- Component-specific styles are in each component's `.scss` file
- Use CSS custom properties for theming

### Form Fields
Add new field types by:
1. Extending the field type union in `models/form-field.model.ts`
2. Adding the template in `dynamic-form.component.html`
3. Adding validation logic in `dynamic-form.component.ts`

### API Integration
Modify `client.service.ts` to:
- Change API endpoints
- Add authentication headers
- Implement caching strategies
- Add error retry logic

## 🔒 Security Considerations

### Frontend Security
- Input validation on all forms
- XSS protection through Angular's sanitization
- CSRF protection for state-changing operations
- Secure HTTP-only cookies for authentication

### Backend Security
- Input validation and sanitization
- CORS configuration
- Rate limiting for API endpoints
- Authentication and authorization
- SQL injection prevention

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 4200
npx kill-port 4200

# Kill process on port 3000
npx kill-port 3000
```

#### Module Not Found
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Clear Angular cache
ng cache clean

# Rebuild with verbose output
ng build --verbose
```

### Getting Help
- Check the browser console for error messages
- Review the server logs for API issues
- Ensure all dependencies are properly installed
- Verify that both frontend and backend servers are running

## 📈 Performance Optimization

### Frontend Optimizations
- OnPush change detection strategy
- TrackBy functions for *ngFor loops
- Lazy loading for routes
- Tree shaking for smaller bundles
- Image optimization and lazy loading

### Backend Optimizations
- Gzip compression
- Request/response caching
- Database query optimization
- Connection pooling
- Rate limiting

## 🤝 Contributing

### Development Guidelines
1. Follow Angular style guide
2. Write comprehensive tests
3. Use meaningful commit messages
4. Update documentation for new features
5. Ensure accessibility compliance

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier code formatting
- Husky pre-commit hooks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Dynamic form engine
- Client management system
- RESTful API backend
- Responsive design
- Comprehensive test suite

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Express.js community for the robust backend framework
- TypeScript team for type safety
- RxJS for reactive programming patterns
