const dbstring = process.env.DB_URL;
const client = new MongoClient(dbstring);

export default client;