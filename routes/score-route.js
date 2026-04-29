// Score routes

import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  submitScore,
  getScoreHistory,
  getSessionScore,
} from "../controller/score-controller.js";

const router = express.Router();

router.post("/submit", protect, submitScore);
router.get("/history", protect, getScoreHistory);
router.get("/session/:sessionId", protect, getSessionScore);

export default router;
