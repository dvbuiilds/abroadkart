import { MongoClient } from "mongodb";

const mongoClientUrl = process.env.MONGODB_URI ?? "";

// Create a new MongoClient instance with credentials
const client = new MongoClient(mongoClientUrl, {
  connectTimeoutMS: 4000,
});

// Get the database instance directly
const db = client.db();

// Export the client and database instance
export default client;
export { db };
