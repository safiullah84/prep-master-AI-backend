// Bookmark routes

import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark,
} from "../controller/bookmark-controller.js";

const router = express.Router();

router.post("/", protect, addBookmark);
router.delete("/:questionId", protect, removeBookmark);
router.get("/", protect, getBookmarks);
router.get("/check/:questionId", protect, checkBookmark);

export default router;
