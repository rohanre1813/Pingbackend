import {Socket,Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app=express()
const server=http.createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*",
    methods: ['GET','POST']

  }
})

const usersocketmap:Record<string,string>={}
 export const getreceiversocketid=(receiverid:string):string  | undefined=>{
return usersocketmap[receiverid];
 }
io.on('connection',(socket:Socket)=>{
  console.log('user connected',socket.id);
  const userId=socket.handshake.query.userId as string |undefined
  if(userId && userId!=="undefined"){
    usersocketmap[userId]=socket.id
    console.log(`user ${userId} mapped to socket ${socket.id}`);
    
  }
  io.emit('getonlineuser',Object.keys(usersocketmap));
  if(userId){
    socket.join(userId)
  }
  socket.on("typing",(data)=>{
    console.log(`${userId} is typing`,);
    socket.to(data.chatId).emit("usertyping",{
      chatId:data.chatId,
      userId:data.userId
    })
    
  })
  socket.on("stoptyping",(data)=>{
    console.log(` ${userId} user stopped typing `);
    socket.to(data.chatId).emit("userstoppedtyping",{
       chatId:data.chatId,
      userId:data.userId
    })
    
  })
  socket.on("joinchat",(chatId)=>{
    socket.join(chatId);
    console.log(`${userId} joined chat ${chatId}`);
    
  })
  socket.on("leavechat",(chatId)=>{
     socket.leave(chatId);
     console.log(`${userId} left the chat ${chatId}`);
     
  })
  socket.on('disconnect',()=>{
    console.log('user disconnected',socket.id);
    if(userId){
      delete usersocketmap[userId]
      console.log(`user ${userId} removed from online users`);
      io.emit("getonlineuser",Object.keys(usersocketmap))
      
    }
  })
  socket.on('connection_error',(error)=>{
    console.log('socket connection error',error);
    
  })
})

export {app,server,io}