// Bookmark Controller — add, remove, and list bookmarked questions

import Bookmark from "../models/bookmark-model.js";

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const { questionId, sessionId } = req.body;
    const userId = req.user._id;

    if (!questionId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "questionId and sessionId are required",
      });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      user: userId,
      question: questionId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Question already bookmarked",
        data: existing,
      });
    }

    const bookmark = await Bookmark.create({
      user: userId,
      question: questionId,
      session: sessionId,
    });

    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add bookmark",
      error: error.message,
    });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const deleted = await Bookmark.findOneAndDelete({
      user: userId,
      question: questionId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    res.status(200).json({ success: true, message: "Bookmark removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
      error: error.message,
    });
  }
};

// @desc    Get all bookmarks for current user
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookmarks = await Bookmark.find({ user: userId })
      .populate("question")
      .populate("session", "role topicsToFocus difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookmarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    });
  }
};

// @desc    Check if a question is bookmarked
// @route   GET /api/bookmarks/check/:questionId
// @access  Private
export const checkBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const bookmark = await Bookmark.findOne({
      user: userId,
      question: questionId,
    });

    res.status(200).json({
      success: true,
      isBookmarked: !!bookmark,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to check bookmark",
      error: error.message,
    });
  }
};
