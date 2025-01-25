import client from "../dbhandler/index"; // Import the centralized MongoDB client
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison

export default async function handler(req, res) {
  // Handle preflight requests (CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow only POST and OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
    res.status(200).end(); // End the preflight response
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']); // Inform the client that only POST is allowed
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Validate request body
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        error: 'Bad request',
        details: 'Email and password are required'
      });
    }

    // Extract email and password from the request body
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Log the login attempt

    // Connect to the database using the centralized client
    await client.connect(); // Ensure connection to MongoDB
    const database = client.db("eventsDB"); // Access the database
    const users = database.collection("users"); // Access the users collection

    // Find the user by email
    const user = await users.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no'); // Log if the user exists or not

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No account found with this email'
      });
    }

    // Compare the provided password with the stored hashed password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid); // Log if the password is valid

    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    // Remove sensitive data before returning the user object
    const sanitizedUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Return a successful response with the sanitized user data
    return res.status(200).json({ user: sanitizedUser });

  } catch (error) {
    // Log and handle any server-side errors
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    // Close the database connection to avoid memory leaks
    if (client) {
      await client.close();
    }
  }
}
