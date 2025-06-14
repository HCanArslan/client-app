// Mock data for demonstration
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

let nextId = 3;

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        if (query.id) {
          // Get single client
          const client = clients.find(c => c.id === parseInt(query.id));
          if (!client) {
            return res.status(404).json({ error: 'Client not found' });
          }
          return res.status(200).json(client);
        } else {
          // Get all clients
          return res.status(200).json(clients);
        }

      case 'POST':
        // Create new client
        const newClient = {
          id: nextId++,
          ...req.body,
          status: req.body.status || 'active'
        };
        clients.push(newClient);
        return res.status(201).json(newClient);

      case 'PUT':
        // Update client
        const clientIndex = clients.findIndex(c => c.id === parseInt(query.id));
        if (clientIndex === -1) {
          return res.status(404).json({ error: 'Client not found' });
        }
        clients[clientIndex] = { ...clients[clientIndex], ...req.body, id: parseInt(query.id) };
        return res.status(200).json(clients[clientIndex]);

      case 'DELETE':
        // Delete client
        const deleteIndex = clients.findIndex(c => c.id === parseInt(query.id));
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Client not found' });
        }
        clients.splice(deleteIndex, 1);
        return res.status(200).json({ message: 'Client deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 