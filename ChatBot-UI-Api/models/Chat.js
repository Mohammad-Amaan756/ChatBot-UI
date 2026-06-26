import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Chat", chatSchema);