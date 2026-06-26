import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";
import Conversation from "./models/Conversation.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err.message));

/* ===========================
   Create New Conversation
=========================== */

app.post("/conversations", async (req, res) => {
  try {
    const conversation = await Conversation.create({
      title: "New Chat",
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: "Failed to create conversation",
    });
  }
});

/* ===========================
   Get All Conversations
=========================== */

app.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({
      updatedAt: -1,
    });

    res.json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
});

/* ===========================
   Get Messages of One Chat
=========================== */

app.get("/conversations/:id/chats", async (req, res) => {
  try {
    const chats = await Chat.find({
      conversationId: req.params.id,
    }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      chats,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch chats",
    });
  }
});

/* ===========================
   Send Message
=========================== */

app.post("/api", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({
        success: false,
        error: "Message and conversationId are required.",
      });
    }

    // Save User Message
    await Chat.create({
      conversationId,
      sender: "user",
      text: message.trim(),
    });

    // Generate Gemini Response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim(),
    });

    const botReply = response.text;

    // Save Bot Message
    await Chat.create({
      conversationId,
      sender: "bot",
      text: botReply,
    });

    // Update title only if first message
    const conversation = await Conversation.findById(conversationId);

    if (conversation && conversation.title === "New Chat") {
      conversation.title =
        message.length > 30
          ? message.substring(0, 30) + "..."
          : message;

      await conversation.save();
    }

    res.json({
      success: true,
      reply: botReply,
    });
  } catch (err) {
    console.log("Gemini Error:", err);

    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});