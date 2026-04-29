import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import { connectDB } from "./config/database-config.js";
import authRoutes from "./routes/auth-route.js";
import sessionRoutes from "./routes/session-route.js";
import aiRoutes from "./routes/ai-route.js";
import bookmarkRoutes from "./routes/bookmark-route.js";
import scoreRoutes from "./routes/score-route.js";
import leaderboardRoutes from "./routes/leaderboard-route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Unexpected server error",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
