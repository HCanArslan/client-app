// Mock data for demonstration - same as index.js
let clients = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    company: "Tech Solutions Inc.",
    status: "active",
    address: "123 Main St, Anytown, USA 12345",
    notes: "Key decision maker for technology purchases."
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-0456",
    company: "Digital Marketing Pro",
    status: "inactive",
    address: "456 Oak Ave, Business City, USA 67890",
    notes: "Interested in our premium service package."
  }
];

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API called:', req.method, req.url, req.query);

  const { method, query } = req;
  const clientId = parseInt(query.id);

  try {
    switch (method) {
      case 'GET':
        // Get single client
        const client = clients.find(c => c.id === clientId);
        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(200).json(client);

      case 'PUT':
        // Update client
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
          return res.status(404).json({ error: 'Client not found' });
        }
        clients[clientIndex] = { ...clients[clientIndex], ...req.body, id: clientId };
        return res.status(200).json(clients[clientIndex]);

      case 'DELETE':
        // Delete client
        const deleteIndex = clients.findIndex(c => c.id === clientId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Client not found' });
        }
        clients.splice(deleteIndex, 1);
        return res.status(200).json({ message: 'Client deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}; 