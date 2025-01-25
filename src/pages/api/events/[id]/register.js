import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { userId } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const events = database.collection("events");

    // Add user to registered users array
    const result = await events.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { registeredUsers: userId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 