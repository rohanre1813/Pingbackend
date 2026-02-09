import express from 'express'
import dotenv from 'dotenv'
import { sendotpconumer } from './consumer.js';

dotenv.config()
sendotpconumer()
const app=express();
const PORT=process.env.PORT||5001
app.listen(PORT,()=>{
   console.log(`server running at ${PORT}`);
   
})