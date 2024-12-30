import { MongoClient } from "mongodb";

const mongoClientUrl = process.env.MONGODB_URI ?? "";

// Create a new MongoClient instance with credentials
const client = new MongoClient(mongoClientUrl, {
  connectTimeoutMS: 4000,
});

// Export the client and ensure  it's connected
export default client;
