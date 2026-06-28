import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import protect from "./middleware/authMiddleware.js";

dotenv.config();

connectDB();

const app = express();

// =======================
// Allowed Origins
// =======================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// =======================
// CORS
// =======================

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);

      // Allow Postman and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// =======================
// Middleware
// =======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded PDFs
app.use("/uploads", express.static("uploads"));

// =======================
// Health Check
// =======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NearKnowledge API is running 🚀",
  });
});

// Protected test route
app.get("/api/test", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// =======================
// API Routes
// =======================

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// =======================
// 404 Handler
// =======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// Error Handler
// =======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

export default app;