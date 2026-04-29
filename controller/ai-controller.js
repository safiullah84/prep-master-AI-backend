// AI Controller — generates questions and explanations via Gemini API
// Supports difficulty levels, custom topics, and MCQ format

import { GoogleGenAI } from "@google/genai";
import Question from "../models/question-model.js";
import Session from "../models/session-model.js";
import {
  generateFallbackExplanation,
  generateFallbackQuestions,
} from "../utils/local-ai-fallback.js";
import {
  conceptExplainPrompt,
  questionAnswerPrompt,
} from "../utils/prompts-util.js";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "replace-with-your-gemini-api-key") {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

// @desc    Generate + save interview questions for a session
// @route   POST /api/ai/generate-questions
// @access  Private
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { sessionId, difficulty, customTopic } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Use provided values or fall back to session defaults
    const useDifficulty = difficulty || session.difficulty || "medium";
    const useTopic = customTopic || session.customTopic || "";

    const prompt = questionAnswerPrompt(
      session.role,
      session.experience,
      session.topicsToFocus,
      10,
      useDifficulty,
      useTopic,
    );
    const ai = getAiClient();
    let questions;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const rawText = parts
        .filter((p) => !p.thought)
        .map((p) => p.text ?? "")
        .join("");

      const cleanedText = rawText
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "")
        .replace(/^json\s*/, "")
        .trim();

      try {
        questions = JSON.parse(cleanedText);
      } catch {
        const jsonMatch = cleanedText.match(/[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    } else {
      questions = generateFallbackQuestions({
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        numberOfQuestions: 10,
      });
    }

    if (!Array.isArray(questions)) {
      throw new Error("Response is not an array");
    }

    const saved = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        question: q.question,
        answer: q.answer || "",
        options: q.options || [],
        correctOption: typeof q.correctOption === "number" ? q.correctOption : -1,
        difficulty: useDifficulty,
        note: "",
        isPinned: false,
      })),
    );

    session.questions.push(...saved.map((q) => q._id));
    session.difficulty = useDifficulty;
    if (useTopic) session.customTopic = useTopic;
    await session.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// @desc    Generate explanation for an interview question
// @route   POST /api/ai/generate-explanation
// @access  Private
export const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const prompt = conceptExplainPrompt(question);
    const ai = getAiClient();
    let explanation;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
      });

      const cleanedText = response.text
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "")
        .replace(/^json\s*/, "")
        .trim();

      try {
        explanation = JSON.parse(cleanedText);
      } catch {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          explanation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    } else {
      explanation = generateFallbackExplanation(question);
    }

    if (!explanation.title || !explanation.explanation) {
      throw new Error("Response missing required fields: title and explanation");
    }

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};
