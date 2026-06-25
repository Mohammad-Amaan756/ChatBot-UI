import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";
import Conversation from "./models/Conversation.js";
import Message from "../Chatbot-UI/src/components/Message.jsx";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

  // code for new chat
  app.post("/conversations", async (req, res) => {
  try {
    const conversation = await Conversation.create({
      title: "New Chat",
    });

    res.status(201).json({
      success: true,
      conversation: conversation,
    });
  } catch (error) {
    console.log("Error creating conversation:", error);

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

app.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      conversations: conversations,
    });
  } catch (error) {
    console.log("Error fetching conversations:", error);

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

app.get("/conversations/:id/chats", async (req, res) => {
  try {
    const { id } = req.params;

    const chats = await Chat.find({
      conversationId: id,
    }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      chats: chats,
    });
  } catch (error) {
    console.log("Error fetching chats:", error);

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

// Send message to Gemini and save chat
app.post("/api", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Save user message
    await Chat.create({
      user: "user",
      message: message.trim(),
    });

    // Get Gemini response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim(),
    });

    const botReply = response.text;

    // Save bot response
    await Chat.create({
      conversationId: conversationId,
      user: "bot",
      message: botReply,
    });

    await Conversation.findByIdAndUpdate(conversationId, {title: Message.slice(0, 20) + "..."});

    res.status(200).json({
      success: true,
      reply: botReply,
    });
  } catch (err) {
    console.log("AI Error:", err);

    // Gemini quota / rate-limit error
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        error:
          "Gemini API quota is exceeded. Please wait for a minute and try again.",
      });
    }

    // Invalid API key / authentication error
    if (err.status === 401 || err.status === 403) {
      return res.status(err.status).json({
        success: false,
        error: "Invalid Gemini API key. Check your .env file.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
});

// Get all saved chats
app.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log("Error fetching chats:", error.message);

    res.status(500).json({
      success: false,
      error: "Could not fetch chats",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});