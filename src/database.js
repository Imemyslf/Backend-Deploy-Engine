import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;

async function connectToDb(cb) {
  // const client = new MongoClient(`mongodb://127.0.0.1:27017`);
  const client = new MongoClient(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.bwraixm.mongodb.net/?retryWrites=true&w=majority&appName=mongosh`
  );

  try {
    await client.connect();
    db = client.db("fourage");
    console.log("Connected to MongoDB Atlas.");
    cb();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

export { db, connectToDb };
