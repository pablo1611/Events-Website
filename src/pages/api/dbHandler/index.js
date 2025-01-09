const { MongoClient } = require("mongodb");

const dbstring = "mongodb+srv://pablo161198:Pablo1998@cluster0.tz2ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(dbstring);

module.exports = client;