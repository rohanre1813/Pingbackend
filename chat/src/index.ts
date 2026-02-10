import express from 'express'
import dotenv from 'dotenv'
import connectdb from './config/db.js';
import Chatroutes from './routes/chat.js'
import cors from 'cors'
import { app,server } from './config/socket.js';
dotenv.config();
connectdb();
app.use(express.json())
app.use(cors())
app.use('/api/v1',Chatroutes)

const PORT = Number(process.env.PORT) || 5002;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});