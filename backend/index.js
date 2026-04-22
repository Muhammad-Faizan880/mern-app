import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import OpenAI from "openai";
import { AI_CONFIG } from "./config/aiConfig.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// MongoDB connect
connectDB(process.env.MONGO_URI);

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/products for CRUD operations");
});

// Product routes
app.use("/api/products", productRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// 🔥 Groq config (OpenAI SDK ke through)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, token } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // 🔥 decode user from token
    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        user = null;
      }
    }

    // 👇 system prompt (now dynamic user name works)
    const systemPrompt = `
You are a helpful AI assistant.
User name: ${user?.name || "Guest"}
`;

    const modelsToTry = [AI_CONFIG.models.primary, AI_CONFIG.models.fallback];

    let response;

    // 🔁 fallback loop (unchanged)
    for (const model of modelsToTry) {
      try {
        response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message,
            },
          ],
        });

        break;
      } catch (err) {
        console.log(`Model failed: ${model}`);
      }
    }

    if (!response) {
      return res.status(500).json({
        error: "All AI models failed",
      });
    }

    const reply = response.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
