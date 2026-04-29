// Leaderboard Controller — global and per-track rankings

import Score from "../models/score-model.js";
import User from "../models/user-model.js";

// @desc    Get global leaderboard (top scores)
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    // Aggregate best scores per user
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: "$user",
          bestPercentage: { $max: "$percentage" },
          totalSessions: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
          totalCorrect: { $sum: "$correct" },
          totalQuestions: { $sum: "$total" },
          lastPlayed: { $max: "$completedAt" },
        },
      },
      { $sort: { bestPercentage: -1, totalSessions: -1 } },
      { $limit: limit },
    ]);

    // Populate user names
    const userIds = leaderboard.map((entry) => entry._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const result = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: userMap[entry._id.toString()]?.name || "Unknown",
      bestPercentage: Math.round(entry.bestPercentage),
      avgPercentage: Math.round(entry.avgPercentage),
      totalSessions: entry.totalSessions,
      totalCorrect: entry.totalCorrect,
      totalQuestions: entry.totalQuestions,
      lastPlayed: entry.lastPlayed,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
};

// @desc    Get leaderboard filtered by track
// @route   GET /api/leaderboard/track/:track
// @access  Public
export const getLeaderboardByTrack = async (req, res) => {
  try {
    const { track } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const leaderboard = await Score.aggregate([
      { $match: { track: { $regex: new RegExp(track, "i") } } },
      {
        $group: {
          _id: "$user",
          bestPercentage: { $max: "$percentage" },
          totalSessions: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
          totalCorrect: { $sum: "$correct" },
          totalQuestions: { $sum: "$total" },
          lastPlayed: { $max: "$completedAt" },
        },
      },
      { $sort: { bestPercentage: -1, totalSessions: -1 } },
      { $limit: limit },
    ]);

    const userIds = leaderboard.map((entry) => entry._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const result = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: userMap[entry._id.toString()]?.name || "Unknown",
      bestPercentage: Math.round(entry.bestPercentage),
      avgPercentage: Math.round(entry.avgPercentage),
      totalSessions: entry.totalSessions,
      totalCorrect: entry.totalCorrect,
      totalQuestions: entry.totalQuestions,
      lastPlayed: entry.lastPlayed,
      track,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch track leaderboard",
      error: error.message,
    });
  }
};
