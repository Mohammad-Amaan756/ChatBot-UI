import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New-chat"
    }
})