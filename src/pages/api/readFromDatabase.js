import clientPromise from "./dbHandler/index";

export default async function handler(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const category = req.query.category;

  try {
    const client = await clientPromise;
    const database = client.db("eventsDB");
    const events = database.collection("events");

    const query = category && category !== 'all' ? { 
      category: { $regex: `^${category}$`, $options: 'i' } 
    } : {};

    const total = await events.countDocuments(query);

    const result = await events
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
    
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
  }
}
