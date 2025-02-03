import clientPromise from "./dbHandler/index";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const database = client.db("test");
    const collection = database.collection("documents");
    const result = await collection.insertOne({ name: "John", age: 25 });
    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Error connecting to database' });
  }
}
