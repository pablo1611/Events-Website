import { MongoClient } from "mongodb";

const uri = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const category = req.query.category;

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db("eventsDB");
    const events = database.collection("events");

    // Build query
    const query = category && category !== 'all' ? { 
      category: { $regex: `^${category}$`, $options: 'i' } 
    } : {};

    // Get total count of events
    const total = await events.countDocuments(query);

    // Find events with pagination
    const result = await events
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Convert ObjectIds to strings
    const eventsWithStringIds = result.map(event => ({
      ...event,
      _id: event._id.toString()
    }));
    
    return res.status(200).json({
      events: eventsWithStringIds,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Error connecting to database' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
