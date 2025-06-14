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

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all clients
        console.log('Returning clients:', clients);
        return res.status(200).json(clients);

      case 'POST':
        // Create new client
        const newClient = {
          id: nextId++,
          ...req.body,
          status: req.body.status || 'active'
        };
        clients.push(newClient);
        return res.status(201).json(newClient);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}; 