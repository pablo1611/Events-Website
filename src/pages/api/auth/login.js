import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const client = require("../dbHandler");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    
    await client.connect();

    const database = client.db("eventsDB");
    const users = database.collection("users");

    // Find user by email
    const user = await users.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No account found with this email'
      });
    }

    // Compare password with hashed password in DB
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    // Create a sanitized user object (without password)
    const sanitizedUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return res.status(200).json({ user: sanitizedUser });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 