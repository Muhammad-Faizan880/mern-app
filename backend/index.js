import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import OpenAI from "openai";
import { AI_CONFIG } from "./config/aiConfig.js";
import chatRoutes from "./routes/chatRoutes.js";

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

// Grok chat routes
app.use("/api", chatRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
