import clientPromise from "./dbHandler/index";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const database = client.db("eventsDB");
    const events = database.collection("events");

    const categories = await events.distinct('category');
    
    return res.status(200).json(categories);

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Error connecting to database' });
  }
} 