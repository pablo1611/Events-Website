import { MongoClient } from "mongodb";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const events = database.collection("events");

    // Get all events for now (you can filter by user registration later)
    const result = await events.find({}).toArray();
    
    const eventsWithStringIds = result.map(event => ({
      ...event,
      _id: event._id.toString()
    }));

    return res.status(200).json({ events: eventsWithStringIds });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Error connecting to database' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 