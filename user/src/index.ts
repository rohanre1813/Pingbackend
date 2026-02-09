import express from 'express'
import dotenv from 'dotenv'
import connectdb from './config/db.js';
import { createClient } from 'redis';
import userrouter from './routes/user.js';
import { connectrabbitmq } from './config/rabbitmq.js';
import cors from 'cors'
dotenv.config();
connectdb();
connectrabbitmq()

export const redisclient= createClient({
url: `${process.env.REDIS_URL}`,

});

 redisclient.connect().then(()=>{console.log("connected redis");}).catch(console.error)
const app=express();
app.use(express.json())
app.use(cors())
app.use("/api/v1",userrouter); 
const PORT=process.env.PORT ||5000;
app.listen(PORT,()=>{
   console.log(`server running on port ${PORT}`);
   
} )