// Question model — stores individual interview questions
// Supports MCQ (options array) and open-ended questions

import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "" },
    options: [{ type: String }], // MCQ options (A, B, C, D)
    correctOption: { type: Number, default: -1 }, // index of correct option, -1 = open-ended
    userAnswer: { type: String, default: "" }, // what user selected/typed
    isCorrect: { type: Boolean, default: null }, // null = not answered yet
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    note: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Question = mongoose.model("Question", questionsSchema);

export default Question;
