import { OpenAI } from "openai";
import dotenv from "dotenv";
import { Messages } from "../models/messages.js";
import { io } from "../config/socket.js";

dotenv.config();

// Initialize OpenAI client with Hugging Face router
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_KEY,
});

export const askAI = async (req: any, res: any) => {
  try {
    const { chatId, prompt } = req.body;
  if(!chatId || !prompt){
    return;
  }
    // Call the chat model
    const chatCompletion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.1-8B-Instruct:cerebras",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const aiText =  chatCompletion.choices[0]?.message?.content || "No Response ";

    // Save AI message to database
    const aiMessage = await Messages.create({
      chatId,
      sender: "AI",
      text: aiText,
      messageType: "text",
      seen: true,
    });

    // Emit to socket
    io.to(chatId).emit("newmessage", aiMessage);

    res.json({ success: true });

  } catch (err: any) {
    console.log("FULL AI ERROR 👉", err.response?.data || err);
    res.status(500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
};
