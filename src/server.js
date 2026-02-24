const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const { auth } = require("express-oauth2-jwt-bearer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Auth0 JWT configuration
// For local dev, Auth0 is optional: if env vars are missing, auth is disabled.
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_ISSUER_BASE_URL =
  process.env.AUTH0_ISSUER_BASE_URL ||
  (process.env.AUTH0_DOMAIN
    ? `https://${process.env.AUTH0_DOMAIN.replace(/^https?:\/\//, "")}`
    : undefined);

let jwtCheck = (req, res, next) => next();
if (AUTH0_ISSUER_BASE_URL && AUTH0_AUDIENCE) {
  jwtCheck = auth({
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    audience: AUTH0_AUDIENCE,
    tokenSigningAlg: "RS256",
  });
} else {
  console.warn(
    "⚠️  Auth0 is disabled: missing AUTH0_AUDIENCE and/or AUTH0_ISSUER_BASE_URL (or AUTH0_DOMAIN)."
  );
  console.warn("   All /api/* routes will run without JWT validation.");
}

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

app.get("/api/users", jwtCheck, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", jwtCheck, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/users/:id", jwtCheck, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Debug route: returns validated JWT claims
app.get("/api/me", jwtCheck, (req, res) => {
  res.json(req.auth || {});
});

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Auth error handler
app.use((err, req, res, next) => {
  if (err && err.status === 401) {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message,
    });
  }
  return next(err);
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
