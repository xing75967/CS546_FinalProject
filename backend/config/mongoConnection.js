import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const dbName = "ai_service_aggregator";

let _db;

export async function connectToDb() {
  if (_db) return _db;
  const client = new MongoClient(url);
  await client.connect();
  _db = client.db(dbName);
  console.log("Connected to MongoDB");
  return _db;
}
