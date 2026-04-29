// Score Controller — submit quiz results, get history, per-session scores

import Score from "../models/score-model.js";
import Session from "../models/session-model.js";
import Question from "../models/question-model.js";

// @desc    Submit answers and calculate score
// @route   POST /api/scores/submit
// @access  Private
export const submitScore = async (req, res) => {
  try {
    const { sessionId, answers, timeTaken } = req.body;
    // answers = [{ questionId, userAnswer, selectedOption }]
    const userId = req.user._id;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "sessionId and answers array are required",
      });
    }

    const session = await Session.findById(sessionId).populate("questions");
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    let correct = 0;
    const total = answers.length;

    // Process each answer
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      const isCorrect =
        question.correctOption >= 0
          ? ans.selectedOption === question.correctOption
          : false; // open-ended questions aren't auto-graded

      question.userAnswer = ans.userAnswer || "";
      question.isCorrect = isCorrect;
      await question.save();

      if (isCorrect) correct++;
    }

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Update session with score
    session.score = { correct, total, percentage };
    session.timeTaken = timeTaken || 0;
    session.status = "completed";
    await session.save();

    // Save to Score history
    const score = await Score.create({
      user: userId,
      session: sessionId,
      correct,
      total,
      percentage,
      timeTaken: timeTaken || 0,
      difficulty: session.difficulty,
      track: session.role,
    });

    res.status(201).json({
      success: true,
      data: {
        score,
        correct,
        total,
        percentage,
        timeTaken: timeTaken || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit score",
      error: error.message,
    });
  }
};

// @desc    Get score history for current user
// @route   GET /api/scores/history
// @access  Private
export const getScoreHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const scores = await Score.find({ user: userId })
      .populate("session", "role topicsToFocus difficulty")
      .sort({ completedAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch score history",
      error: error.message,
    });
  }
};

// @desc    Get score for a specific session
// @route   GET /api/scores/session/:sessionId
// @access  Private
export const getSessionScore = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const score = await Score.findOne({
      user: userId,
      session: sessionId,
    }).populate("session", "role topicsToFocus difficulty");

    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Score not found for this session",
      });
    }

    // Also get questions with answers for detailed review
    const session = await Session.findById(sessionId).populate("questions");

    res.status(200).json({
      success: true,
      data: {
        score,
        questions: session?.questions || [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session score",
      error: error.message,
    });
  }
};
