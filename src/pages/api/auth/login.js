import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  let client;
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        error: 'Bad request',
        details: 'Email and password are required'
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const users = database.collection("users");

    const user = await users.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No account found with this email'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    const sanitizedUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return res.status(200).json({ user: sanitizedUser });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 