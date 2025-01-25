import client from "../dbHandler/index"; // Import the centralized MongoDB client
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'All fields are required'
      });
    }

    // Connect to the database using the centralized client
    await client.connect(); // Ensure connection to MongoDB
    const database = client.db("eventsDB"); // Access the database
    const users = database.collection("users"); // Access the users collection

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Registration failed',
        details: 'An account with this email already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create the new user object
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store hashed password
      createdAt: new Date() // Add creation date
    };

    // Insert the new user into the database
    const result = await users.insertOne(newUser);

    // Return a success response with the inserted user's ID
    return res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertedId 
    });

  } catch (error) {
    // Log the error and return a 500 status
    console.error('Signup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  } finally {
    // Ensure the database connection is closed properly
    if (client) {
      await client.close();
    }
  }
}
