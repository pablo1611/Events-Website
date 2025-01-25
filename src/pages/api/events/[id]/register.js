import client from "../../dbHandler/index"; // Import the centralized MongoDB client
import { ObjectId } from "mongodb"; // Import ObjectId for MongoDB document IDs

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get the event ID from the URL query
  const { userId } = req.body; // Get the user ID from the request body

  // Validate the event ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    // Connect to the database using the centralized client
    await client.connect(); // Ensure connection to MongoDB
    const database = client.db("eventsDB"); // Access the eventsDB database
    const events = database.collection("events"); // Access the events collection

    // Add the user to the registered users array
    const result = await events.updateOne(
      { _id: new ObjectId(id) }, // Find the event by its ID
      { $addToSet: { registeredUsers: userId } } // Add the user to the array (no duplicates)
    );

    // Check if the event exists
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Return success response
    return res.status(200).json({ message: 'Successfully registered for event' });

  } catch (error) {
    // Handle and log server-side errors
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Ensure the database connection is closed properly
    if (client) {
      await client.close();
    }
  }
}
