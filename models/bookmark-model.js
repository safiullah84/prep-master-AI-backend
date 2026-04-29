// Bookmark model — saves questions users want to revisit later

import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
