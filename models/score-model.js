// Score model — stores completed quiz results for history & leaderboard

import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    track: { type: String, default: "" }, // e.g., "MERN", "DSA", "Java"
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Score = mongoose.model("Score", scoreSchema);

export default Score;
