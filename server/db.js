import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDB() {
  const db = await open({
    filename: path.join(__dirname, "mileage.db"),
    driver: sqlite3.Database,
  });

  // Create table if it doesn’t exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mileage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      miles REAL NOT NULL,
      description TEXT
    );
  `);

  return db;
}

