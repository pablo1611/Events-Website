const { MongoClient } = require("mongodb");

const client = require("./dbHandler");

const handler = async (req, res) => {
    await client.connect();
    const database = client.db("test");
    const collection = database.collection("documents");
    const result = await collection.insertOne({ name: "John", age: 25 });
    res.status(200).json(result);
}
 
export default handler;
