// Prompt builders for Gemini AI — supports difficulty levels, custom topics, and MCQ format

export const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
  difficulty = "medium",
  customTopic = "",
) => {
  const difficultyGuide = {
    easy: "basic conceptual questions suitable for beginners. Focus on definitions, simple examples, and fundamental concepts.",
    medium:
      "intermediate questions that test practical understanding. Include scenario-based questions and implementation details.",
    hard: "advanced questions that test deep expertise. Include system design, optimization, edge cases, and complex problem-solving.",
  };

  const topics = customTopic || topicsToFocus || "general topics for this role";

  return `You are a senior engineer conducting a technical interview.

Generate exactly ${numberOfQuestions} interview questions for the following profile:
- Role: ${role}
- Experience: ${experience} years
- Topics to focus on: ${topics}
- Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.medium}

Each question MUST be in MCQ (multiple choice) format with exactly 4 options.

Rules for each question:
1. Provide exactly 4 options labeled A, B, C, D
2. One option must be clearly correct
3. The "answer" field must explain WHY the correct option is right, using markdown:
   - Use **bold** for key terms
   - Use bullet points or numbered lists where appropriate
   - Add a short \`\`\`js ... \`\`\` code block when relevant (keep it under 10 lines)
   - Break the answer into short paragraphs — never one wall of text
4. Answers should be beginner-friendly but technically accurate.
5. Difficulty should match the ${difficulty} level described above.

Return ONLY a valid JSON array. No extra text, no markdown wrapper around the JSON.

[
  {
    "question": "What is ...?",
    "options": ["A) Option one", "B) Option two", "C) Option three", "D) Option four"],
    "correctOption": 0,
    "answer": "**Correct Answer: A) Option one**\\n\\n**Explanation:** ...\\n\\n**Key points:**\\n- Point 1\\n- Point 2"
  }
]`;
};

export const conceptExplainPrompt = (question) => {
  return `You are a senior developer explaining a concept to a junior developer.

Explain the following interview question in depth:
"${question}"

Structure your explanation like this:
1. Start with a **one-line definition** in bold.
2. Explain the concept in 2–3 short paragraphs.
3. Use bullet points for any list of features, pros/cons, or steps.
4. If relevant, include a small code example (under 10 lines) in a \`\`\`js block.
5. End with a **"Key Takeaway"** line summarizing the concept in one sentence.

Return ONLY a valid JSON object in this exact shape. No extra text outside the JSON:

{
  "title": "Short, clear concept title (5 words max)",
  "explanation": "**Definition:** ...\\n\\n Paragraph...\\n\\n**Key Takeaway:** ..."
}`;
};
