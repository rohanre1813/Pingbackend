import express from 'express'
import dotenv from 'dotenv'
import { sendOtpConsumer } from './consumer.js';

dotenv.config()
sendOtpConsumer()
const app=express();
const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});