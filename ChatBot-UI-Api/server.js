import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai";

const app = express();
dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
app.use(cors());
app.use(express.json());
app.post("/api", async(req,res) => {
    // res.send("Backend server is running")
    try{
        const {message} = req.body
        if(!message){
            return res.status(204).json({
                success:false, 
                error:"try Again"
            });

        }
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents:message,
        })
        res.json({
            success: true,
            reply: response.text
        });
    }catch(err){
        console.log("Ai Error", err);

        res.status(500).json({
            success :false,
            error:"Server error",

        });

    }
});

app.listen(process.env.PORT, () =>{
    console.log(`server is runnnig on ${process.env.PORT}`);
    
})

