// AI Controller — generates questions and explanations via Groq API (Llama 3)
// Supports difficulty levels, custom topics, and MCQ format

import Groq from "groq-sdk";
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
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "replace-with-your-groq-api-key") {
    return null;
  }

  return new Groq({ apiKey });
};

// Helper to call Groq and get text response
const generateWithGroq = async (client, prompt) => {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Always respond with valid JSON only. No extra text outside the JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
};

// Helper to parse JSON from AI response
const parseJsonResponse = (rawText) => {
  const cleanedText = rawText
    .replace(/^```json\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .replace(/^json\s*/, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    // Try to extract JSON array or object from the text
    const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);

    const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);

    throw new Error("Failed to parse AI response as JSON");
  }
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
      const rawText = await generateWithGroq(ai, prompt);
      questions = parseJsonResponse(rawText);
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
      const rawText = await generateWithGroq(ai, prompt);
      explanation = parseJsonResponse(rawText);
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
