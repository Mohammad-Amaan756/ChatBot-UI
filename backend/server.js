import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pdf from "pdf-parse-fork";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";
import connectDB from "./config/db.js";
import Conversation from "./models/Conversations.js";
import path from "path";
import fs from "fs";
import mime from "mime-types";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =======================
// Create Conversation
// =======================
app.post("/conversation", async (req, res) => {
  try {
    const conversation = await Conversation.create({
      title: "New Chat",
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =======================
// Get All Conversations
// =======================
app.get("/conversation", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =======================
// Chat Route
// =======================
app.post("/home", upload.single("file"), async (req, res) => {
  try {
    const { chatId, message } = req.body;

    // chatId is always required
if (!chatId) {
  return res.status(400).json({
    success: false,
    error: "chatId is required",
  });
}

// User must provide either a message or a file
if ((!message || message.trim() === "") && !req.file) {
  return res.status(400).json({
    success: false,
    error: "Please provide a message or upload a file.",
  });
}

    const conversation = await Conversation.findById(chatId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Extract document text
    let documentText = "";

    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        documentText = data.text;
      }

      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        documentText = result.value;
      }

      else if (req.file.mimetype.startsWith("text/")) {
        documentText = req.file.buffer.toString();
      }

      else {
        return res.status(400).json({
          success: false,
          error: "Unsupported file type",
        });
      }
    }

    // Save user message
    conversation.messages.push({
      role: "user",
      text: message,
    });

    // Build prompt
    const prompt = documentText
      ? `
User Message:
${message}

Attached Document:
${documentText}
`
      : message;

    // Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response.text;

    // Save AI reply
    conversation.messages.push({
      role: "assistant",
      text: reply,
    });

    // Rename chat if first message
    if (
      conversation.title === "New Chat" &&
      conversation.messages.length === 2
    ) {
      conversation.title =
        message.length > 40
          ? message.substring(0, 40) + "..."
          : message;
    }

    await conversation.save();

    res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =======================
// Get One Conversation
// =======================
app.get("/conversation/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// Rename Conversation
// =======================
app.put("/chat/:id", async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// Delete Conversation
// =======================
app.delete("/chat/:id", async (req, res) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(
      req.params.id
    );

    if (!deletedConversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});