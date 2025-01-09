const client = require("./dbHandler");

const handler = async (req, res) => {
    try {
        await client.connect();
        const database = client.db("eventsDB");
        const collection = database.collection("events");
        const result = await collection.find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Error connecting to database' });
    } finally {
        // Close the connection when done
        await client.close();
    }
}

export default handler;
