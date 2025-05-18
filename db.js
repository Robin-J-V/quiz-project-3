const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.ATLAS_URI;
if (!uri) {
  throw new Error("Missing ATLAS_URI in environment variables");
}

const client = new MongoClient(uri);
let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('cs355db');
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting MongoDB:", err);
    throw err;
  }
}

function getDB() {
  if (!db) {
    throw new Error("DB not initialized. Call connectToDB first.");
  }
  return db;
}

module.exports = { connectToDB, getDB };
