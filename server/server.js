import express from "express";
import cors from "cors";
import { initDB } from "./db.js";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

let db;

// Initialize database before starting server
initDB()
  .then((database) => {
    db = database;
    console.log("✅ Connected to SQLite database");

    // Routes
    app.get("/", (req, res) => {
      res.json({ message: "Server is running with SQLite!" });
    });

    // Get all mileage entries
    app.get("/api/mileage", async (req, res) => {
      const entries = await db.all("SELECT * FROM mileage ORDER BY date DESC");
      res.json(entries);
    });

    // Add new mileage entry
    app.post("/api/mileage", async (req, res) => {
      const { date, miles, description } = req.body;
      if (!date || !miles)
        return res.status(400).json({ error: "Date and miles are required" });

      const result = await db.run(
        "INSERT INTO mileage (date, miles, description) VALUES (?, ?, ?)",
        [date, miles, description]
      );

      const newEntry = await db.get(
        "SELECT * FROM mileage WHERE id = ?",
        result.lastID
      );
      res.status(201).json(newEntry);
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("❌ Database initialization failed:", err));

