// Session model — stores interview prep session metadata
// Linked to User (owner) and Question documents

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    topicsToFocus: { type: String, default: "" },
    customTopic: { type: String, default: "" },
    description: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    score: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    timeTaken: { type: Number, default: 0 }, // total seconds spent
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  { timestamps: true },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
