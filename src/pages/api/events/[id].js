import client from "../dbHandler/index"; // Import the centralized MongoDB client
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs

export default async function handler(req, res) {
  const { id } = req.query; // Get the event ID from the query parameters

  // Validate the event ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    // Connect to the database using the centralized client
    await client.connect(); // Ensure connection to MongoDB
    const database = client.db("eventsDB"); // Access the eventsDB database
    const events = database.collection("events"); // Access the events collection

    // Find the event by its ID
    const event = await events.findOne({ 
      _id: new ObjectId(id) 
    });

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Return the event details
    return res.status(200).json(event);

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
