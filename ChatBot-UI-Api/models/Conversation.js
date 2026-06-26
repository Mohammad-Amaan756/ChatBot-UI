import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Conversation", conversationSchema);