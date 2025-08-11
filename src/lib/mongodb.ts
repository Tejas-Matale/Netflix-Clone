import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL as string;
if (!uri) throw new Error("DATABASE_URL not set");

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

