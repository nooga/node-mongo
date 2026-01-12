const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongodb:27017/nodeapp";
const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB connection
const connectDB = async () => {
  try {
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Add authentication if username and password are provided
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      connectionOptions.auth = {
        username: MONGODB_USERNAME,
        password: MONGODB_PASSWORD,
      };
    }

    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log("✅ Connected to MongoDB");
    console.log(`🔗 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("🔍 Connection details:", {
      uri: MONGODB_URI.replace(/\/\/.*@/, "//***:***@"), // Hide credentials in logs
      hasAuth: !!(MONGODB_USERNAME && MONGODB_PASSWORD),
    });
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
