const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017";
const DB_NAME = "notesdb";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

app.get("/notes", async (req, res) => {
  try {
    const notes = await db.collection("notes").find().toArray();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/notes", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Note text is required" });
    }

    const result = await db.collection("notes").insertOne({ text });
    res.json({ message: "Note added", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to add note" });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
