import mongoose from "mongoose";

const connectdb=async()=>{
    const url= process.env.MONGO_URI;

    if(!url){
    throw new Error("monogo db is not defined in dotenv file bro 😒")
}
try{
  await mongoose.connect(url,{
    dbName:"ping",
  })
   console.log("connected to  mongodb");
}catch(err){
  console.error("failed to connect to mongodb",err);
  process.exit(1);
}
}
export default connectdb;
