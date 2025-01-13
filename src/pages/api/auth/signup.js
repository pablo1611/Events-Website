import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    const { firstName, lastName, email, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'All fields are required'
      });
    }

    // Initialize MongoDB client
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const users = database.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Registration failed',
        details: 'An account with this email already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    return res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertedId 
    });

  } catch (error) {
    console.error('Signup error:', error);
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