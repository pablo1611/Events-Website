import { MongoClient } from "mongodb";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  const { id } = req.query;

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const events = database.collection("events");

    const event = await events.findOne({ 
      _id: id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 