import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const client = require("../dbHandler");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    const { firstName, lastName, email, password } = req.body;

    
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
      password: hashedPassword
    };

    const result = await users.insertOne(newUser);

    return res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertedId 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 