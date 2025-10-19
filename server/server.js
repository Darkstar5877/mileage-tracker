import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { initDB } from "./db.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

app.use(cors());
app.use(bodyParser.json());

// ✅ Initialize database (synchronous now)
const db = initDB();

// ✅ Register a new user
app.post("/register", (req, res) => {
  console.log("📩 Register request body:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("🔐 Hashed password:", hashedPassword);

  try {
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
    console.log("✅ User inserted into DB!");
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    if (error.message.includes("UNIQUE")) {
      res.status(400).json({ message: "Email already registered." });
    } else {
      res.status(500).json({ message: "Registration failed." });
    }
  }
});


// ✅ Login existing user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials." });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// ✅ Middleware to protect routes
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ✅ Get all trips for the logged-in user
app.get("/trips", authenticate, (req, res) => {
  const trips = db.prepare("SELECT * FROM trips WHERE user_id = ?").all(req.userId);
  res.json(trips);
});

// ✅ Add a new trip
app.post("/trips", authenticate, (req, res) => {
  const { from_school, to_school, miles, date } = req.body;
  if (!from_school || !to_school || !miles || !date) {
    return res.status(400).json({ message: "All trip fields are required." });
  }

  db.prepare(
    "INSERT INTO trips (user_id, from_school, to_school, miles, date) VALUES (?, ?, ?, ?, ?)"
  ).run(req.userId, from_school, to_school, miles, date);

  res.json({ message: "Trip added successfully." });
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "Mileage Tracker API is running 🚀" });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
