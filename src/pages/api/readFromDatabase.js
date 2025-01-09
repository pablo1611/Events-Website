const { MongoClient } = require("mongodb");

const client = require("./dbHandler");

const handler = async (req, res) => {
    await client.connect();
    const database = client.db("eventsDB");
    const collection = database.collection("events");
    const result = await collection.find({}).toArray();
    res.status(200).json(result);
}

export default handler;
