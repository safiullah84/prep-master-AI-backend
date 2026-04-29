// Leaderboard routes

import express from "express";
import {
  getLeaderboard,
  getLeaderboardByTrack,
} from "../controller/leaderboard-controller.js";

const router = express.Router();

// Public routes — no auth required
router.get("/", getLeaderboard);
router.get("/track/:track", getLeaderboardByTrack);

export default router;
