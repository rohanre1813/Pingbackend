import { getreceiversocketid, io } from "../config/socket.js";
import trycatch from "../config/trycatch.js";
import type { authenticatedrequest } from "../middlewares/isauth.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";
import { User } from "../models/user.js";
import axios from "axios";
import dotenv from 'dotenv'
dotenv.config()
export const createnewchat = trycatch(async (req: authenticatedrequest, res) => {
  const userId = req.user?._id
  const { otherUserId } = req.body
  console.log(otherUserId, req.body);

  if (!otherUserId) {
    res.status(400).json({
      message: "other user id is required"
    })
    return;
  }

  const sender = await User.findById(userId);
  const receiver = await User.findById(otherUserId);

  if (sender?.blocked?.some((id: any) => id.toString() === otherUserId.toString())) {
    res.status(403).json({
      message: "You have blocked this user"
    })
    return;
  }
  if (receiver?.blocked?.some((id: any) => id.toString() === userId?.toString())) {
    res.status(403).json({
      message: "You have been blocked by this user"
    })
    return;
  }

  const existingchat = await Chat.findOne({
    users: { $all: [userId, otherUserId], $size: 2 },
  })

  if (existingchat) {
    res.json({
      message: "chat already exists",
      chatId: existingchat._id,
    })
    return;
  }
  const newchat = await Chat.create({
    users: [userId, otherUserId],
  })
  res.status(201).json({
    message: "new chat created",
    chatId: newchat._id
  })
})

export const getallchats = trycatch(async (req: authenticatedrequest, res) => {
  const userId = req.user?._id
  if (!userId) {
    res.status(400).json({
      message: "userId missing"
    })
    return;
  }
  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
  const chatwithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find(id => id !== userId);
      const unseencount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      })
      try {
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`)
        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseencount
          }
        }
      } catch (error) {
        console.log("error", error);

        return {
          user: { _id: otherUserId, name: "unknown user" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseencount
          }
        }
      }
    })
  )
  res.json({
    chats: chatwithUserData
  })
})

export const sendmessage = trycatch(async (req: authenticatedrequest, res) => {
  const senderId = req.user?._id
  const { chatId, text } = req.body
  const imageFile = req.file

  if (!senderId) {
    res.status(401).json({
      message: "unauthorized"
    })
    return;
  }
  if (!chatId) {
    res.status(400).json({
      message: "chatid required"
    })
    return;
  }
  if (!text && !imageFile) {
    res.status(400).json({
      message: "either text or image is required"
    })
    return;
  }
  const chat = await Chat.findById(chatId)
  if (!chat) {
    res.status(404).json({
      message: "chat not found"
    })
    return;
  }
  const isuserinchat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  )
  if (!isuserinchat) {
    res.status(403).json({
      message: "user is not in chat"
    })
    return;
  }
  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  )
  if (!otherUserId) {
    res.status(401).json({
      message: "no other user"
    })
    return;
  }

  const sender = await User.findById(senderId);
  const receiver = await User.findById(otherUserId);

  if (sender?.blocked?.some(id => id.toString() === otherUserId.toString())) {
    res.status(403).json({
      message: "You have blocked this user"
    })
    return;
  }
  if (receiver?.blocked?.some(id => id.toString() === senderId.toString())) {
    res.status(403).json({
      message: "You have been blocked by this user"
    })
    return;
  }
  //socket setup
  const receiversocketid = getreceiversocketid(otherUserId.toString())
  let isreceiverinchatroom = false
  if (receiversocketid) {
    const receiversocket = io.sockets.sockets.get(receiversocketid)
    if (receiversocket && receiversocket.rooms.has(chatId)) {
      isreceiverinchatroom = true;
    }
  }
  let messageData: any = {
    chatId,
    sender: senderId,
    seen: isreceiverinchatroom,
    seenAt: isreceiverinchatroom ? new Date() : undefined
  }
  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,

    }
    messageData.messageType = 'image';
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }
  const message = new Messages(messageData);
  const savedmessage = await message.save();

  const latestmessagetext = imageFile ? "📸 image" : text

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: {
      text: latestmessagetext,
      sender: senderId
    },
    updatedAt: new Date(),

  }, { new: true })

  //emit to sockets
  io.to(chatId).emit("newmessage", savedmessage)
  if (receiversocketid) {
    io.to(receiversocketid).emit("newmessage", savedmessage);
  }
  const sendersocketid = getreceiversocketid(senderId.toString())
  if (sendersocketid) {
    io.to(sendersocketid).emit("newmessage", savedmessage)
  }
  if (isreceiverinchatroom && sendersocketid) {
    io.to(sendersocketid).emit("messageseen", {
      chatId: chatId,
      seenby: otherUserId,
      messageids: [savedmessage._id]
    })
  }
  res.status(201).json({
    message: savedmessage,
    sender: senderId
  })
})

export const getmessagesbychat = trycatch(async (req: authenticatedrequest, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).json({
      message: "chat required"
    })
    return;
  }
  if (!userId) {
    res.status(401).json({
      message: "unauthorized"
    })
    return;
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404).json({
      message: "chat not found"
    })
    return;
  }
  const isuserinchat = chat.users.some(
    (userId) => userId.toString() === userId.toString()
  )
  if (!isuserinchat) {
    res.status(403).json({
      message: "you are not participant of this chat"
    })
    return;
  }
  const messagestomarkseen = await Messages.find({
    chatId: chatId,
    sender: { $ne: userId },
    seen: false,

  })
  await Messages.updateMany({
    chatId: chatId,
    sender: { $ne: userId },
    seen: false,

  }, {
    seen: true,
    seenAt: new Date()
  })
  const messages = await Messages.find({ chatId }).sort({
    createdAt: 1
  })
  const otherUserId = chat.users.find((id) => id !== userId)

  try {
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`)
    console.log({ data });

    if (!otherUserId) {
      res.status(400).json({
        message: "you are no user",
      })
      return;
    }
    //socket work
    if (messagestomarkseen.length > 0) {
      const otherusersocketid = getreceiversocketid(otherUserId.toString())
      if (otherusersocketid) {
        io.to(otherusersocketid).emit("messageseen", {
          chatId: chatId,
          seenby: userId,
          messageids: messagestomarkseen.map(msg => msg._id)
        })
      }
    }
    res.json({
      messages,
      user: data
    })
  } catch (error) {
    console.log(error, "this is the error");
    res.json({
      messages,
      user: { _id: otherUserId, name: "unknown user" }
    })
  }
})