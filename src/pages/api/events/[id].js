import clientPromise from "../dbHandler/index";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await clientPromise;
    const database = client.db("eventsDB");
    const events = database.collection("events");

    // Check if id is a valid ObjectId
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const event = await events.findOne(query);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 