import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";

dotenv.config();

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

mongoose
  .connect(`mongodb://dbuser:Amaan1234@ac-kuvqzrl-shard-00-00.qesocla.mongodb.net:27017,ac-kuvqzrl-shard-00-01.qesocla.mongodb.net:27017,ac-kuvqzrl-shard-00-02.qesocla.mongodb.net:27017/ChatHist?ssl=true&replicaSet=atlas-gqqu92-shard-0&authSource=admin&appName=Cluster0`,{})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

app.use(cors());
app.use(express.json());

app.post("/api", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Save user message in MongoDB
    await Chat.create({
      user: "user",
      message: message,
    });

    // Get AI response from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    const botReply = response.text;

    // Save bot reply in MongoDB
    await Chat.create({
      user: "bot",
      message: botReply,
    });

    res.json({
      success: true,
      reply: botReply,
    });
  } catch (err) {
    console.log("AI Error:", err);

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

app.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });

    res.json({
      success: true,
      chats: chats,
    });
  } catch (error) {
    console.log("Error fetching chats:", error);

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});