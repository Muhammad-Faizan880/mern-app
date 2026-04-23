import OpenAI from "openai";
import { AI_CONFIG } from "../config/aiConfig.js";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateAIResponse = async ({ message, user }) => {
  const systemPrompt = `
You are a helpful AI assistant.
User name: ${user?.name || "Guest"}
`;

  const modelsToTry = [
    AI_CONFIG.models.primary,
    AI_CONFIG.models.fallback,
  ];

  let response;

  for (const model of modelsToTry) {
    try {
      response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });
      break;
    } catch (err) {
      console.log(`Model failed: ${model}`);
    }
  }

  if (!response) {
    throw new Error("All AI models failed");
  }

  return response.choices[0].message.content;
};