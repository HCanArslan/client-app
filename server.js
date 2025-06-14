const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Request received`);
  next();
});

// In-memory database (demonstration purposes - replace with real database in production)
let clients = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    company: 'Acme Corp',
    address: '123 Main St, Anytown, USA',
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    company: 'Tech Solutions Inc',
    address: '456 Oak Ave, Somewhere, USA',
    status: 'active',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-456-7890',
    company: 'Global Industries',
    address: '789 Pine Rd, Elsewhere, USA',
    status: 'inactive',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString()
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1-555-789-0123',
    company: 'Startup Ventures',
    address: '321 Elm St, Nowhere, USA',
    status: 'active',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  }
];

let nextId = 5;

/**
 * Structured logging utility
 * Demonstrates professional logging practices for production applications
 */
const logger = {
  info: (message, context = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, 
      Object.keys(context).length > 0 ? context : '');
  },
  error: (message, context = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, 
      Object.keys(context).length > 0 ? context : '');
  },
  warn: (message, context = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, 
      Object.keys(context).length > 0 ? context : '');
  }
};

/**
 * Helper function to find client by ID with type conversion
 * @param {string|number} id - Client ID
 * @returns {Object|undefined} - Found client or undefined
 */
const findClient = (id) => clients.find(client => client.id === parseInt(id));

/**
 * Comprehensive client validation
 * Demonstrates input validation best practices
 * @param {Object} client - Client data to validate
 * @returns {Array} - Array of validation errors
 */
const validateClient = (client) => {
  const errors = [];
  
  if (!client.name || client.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!client.email || client.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!client.phone || client.phone.trim() === '') {
    errors.push('Phone is required');
  }
  
  if (client.status && !['active', 'inactive'].includes(client.status)) {
    errors.push('Status must be either "active" or "inactive"');
  }
  
  return errors;
};

// API Routes

/**
 * GET /clients - Retrieve all clients
 * Demonstrates RESTful API design and data retrieval
 */
app.get('/clients', (req, res) => {
  logger.info('Fetching all clients', { count: clients.length });
  res.json(clients);
});

/**
 * GET /clients/:id - Retrieve specific client
 * Demonstrates parameterized routes and error handling
 */
app.get('/clients/:id', (req, res) => {
  const clientId = req.params.id;
  logger.info(`Fetching client by ID: ${clientId}`);
  
  const client = findClient(clientId);
  if (!client) {
    logger.warn(`Client not found`, { requestedId: clientId });
    return res.status(404).json({ error: 'Client not found' });
  }
  
  logger.info('Client retrieved successfully', { clientId: client.id, clientName: client.name });
  res.json(client);
});

/**
 * POST /clients - Create new client
 * Demonstrates data validation and conflict handling
 */
app.post('/clients', (req, res) => {
  logger.info('Creating new client', { requestData: req.body });
  
  const clientData = req.body;
  const validationErrors = validateClient(clientData);
  
  if (validationErrors.length > 0) {
    logger.warn('Client validation failed', { errors: validationErrors });
    return res.status(400).json({ errors: validationErrors });
  }
  
  // Check for duplicate email
  const existingClient = clients.find(c => c.email.toLowerCase() === clientData.email.toLowerCase());
  if (existingClient) {
    logger.warn('Duplicate email attempted', { email: clientData.email });
    return res.status(409).json({ error: 'Client with this email already exists' });
  }
  
  const newClient = {
    id: nextId++,
    name: clientData.name.trim(),
    email: clientData.email.trim(),
    phone: clientData.phone.trim(),
    company: clientData.company?.trim() || '',
    address: clientData.address?.trim() || '',
    status: clientData.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  clients.push(newClient);
  logger.info('Client created successfully', { 
    clientId: newClient.id, 
    clientName: newClient.name,
    totalClients: clients.length 
  });
  
  res.status(201).json(newClient);
});

/**
 * PUT /clients/:id - Update existing client
 * Demonstrates full resource update with conflict detection
 */
app.put('/clients/:id', (req, res) => {
  const clientId = req.params.id;
  logger.info(`Updating client ID: ${clientId}`, { updateData: req.body });
  
  const client = findClient(clientId);
  if (!client) {
    logger.warn(`Update failed - client not found`, { requestedId: clientId });
    return res.status(404).json({ error: 'Client not found' });
  }
  
  const updateData = req.body;
  const validationErrors = validateClient(updateData);
  
  if (validationErrors.length > 0) {
    logger.warn('Update validation failed', { clientId, errors: validationErrors });
    return res.status(400).json({ errors: validationErrors });
  }
  
  // Check for duplicate email (excluding current client)
  const existingClient = clients.find(c => 
    c.id !== parseInt(clientId) && 
    c.email.toLowerCase() === updateData.email.toLowerCase()
  );
  if (existingClient) {
    logger.warn('Update failed - duplicate email', { 
      clientId, 
      email: updateData.email,
      conflictingClientId: existingClient.id 
    });
    return res.status(409).json({ error: 'Another client with this email already exists' });
  }
  
  // Perform update
  const updatedClient = {
    ...client,
    name: updateData.name.trim(),
    email: updateData.email.trim(),
    phone: updateData.phone.trim(),
    company: updateData.company?.trim() || '',
    address: updateData.address?.trim() || '',
    status: updateData.status || client.status,
    updatedAt: new Date().toISOString()
  };
  
  const clientIndex = clients.findIndex(c => c.id === parseInt(clientId));
  clients[clientIndex] = updatedClient;
  
  logger.info('Client updated successfully', { 
    clientId: updatedClient.id,
    clientName: updatedClient.name,
    changes: Object.keys(updateData)
  });
  
  res.json(updatedClient);
});

/**
 * DELETE /clients/:id - Remove client
 * Demonstrates safe resource deletion
 */
app.delete('/clients/:id', (req, res) => {
  const clientId = req.params.id;
  logger.info(`Deleting client ID: ${clientId}`);
  
  const clientIndex = clients.findIndex(c => c.id === parseInt(clientId));
  if (clientIndex === -1) {
    logger.warn(`Delete failed - client not found`, { requestedId: clientId });
    return res.status(404).json({ error: 'Client not found' });
  }
  
  const deletedClient = clients[clientIndex];
  clients.splice(clientIndex, 1);
  
  logger.info('Client deleted successfully', { 
    deletedClientId: deletedClient.id,
    deletedClientName: deletedClient.name,
    remainingClients: clients.length 
  });
  
  res.status(204).send();
});

/**
 * GET /health - Health check endpoint
 * Demonstrates application monitoring and health checks
 */
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
          message: 'Client Management API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    clients: clients.length
  };
  
  logger.info('Health check requested', { status: healthStatus.status });
  res.json(healthStatus);
});

/**
 * Global error handling middleware
 * Demonstrates centralized error handling for production applications
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled server error', { 
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  });
});

/**
 * 404 handler for undefined routes
 * Demonstrates proper API endpoint documentation
 */
app.use((req, res) => {
  logger.warn(`Route not found`, { 
    method: req.method, 
    path: req.path,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({ 
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /clients',
      'GET /clients/:id',
      'POST /clients',
      'PUT /clients/:id',
      'DELETE /clients/:id',
      'GET /health'
    ]
  });
});

// Server startup
app.listen(PORT, () => {
  logger.info('🚀 Client Management API Server Started Successfully');
  logger.info(`📍 Server Configuration`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform
  });
  logger.info('📋 Available API Endpoints', {
    endpoints: [
      'GET    /clients       - Retrieve all clients',
      'GET    /clients/:id   - Retrieve client by ID',
      'POST   /clients       - Create new client',
      'PUT    /clients/:id   - Update existing client',
      'DELETE /clients/:id   - Delete client',
      'GET    /health        - Health check'
    ]
  });
  logger.info(`📊 Database Status`, {
    totalClients: clients.length,
    nextAvailableId: nextId
  });
  
  console.log('\n🎯 Ready for Technical Interview Demonstration');
  console.log('   - RESTful API with full CRUD operations');
  console.log('   - Comprehensive error handling');
  console.log('   - Input validation and sanitization');
  console.log('   - Structured logging for monitoring');
  console.log('   - Professional code documentation\n');
});

/**
 * Graceful shutdown handling
 * Demonstrates proper application lifecycle management
 */
process.on('SIGINT', () => {
  logger.info('🛑 Shutdown signal received - shutting down gracefully');
  logger.info('📊 Final Statistics', {
    totalClients: clients.length,
    uptime: `${Math.floor(process.uptime())} seconds`
  });
  process.exit(0);
});

// Export for testing purposes
module.exports = app; 