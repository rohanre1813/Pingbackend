import mongoose, { Schema } from "mongoose";

export interface Ichat extends Document{
  users:string[];
  latestMessage :{
    text:string;
    sender:string;
  };
  createdAt:Date;
  updatedAt:Date;
}

const schema: Schema<Ichat> = new Schema({
  users: [{ type: String, required: true }],
  latestMessage: {
    text: { type: String },
    sender: { type: String },
  },
}, { timestamps: true });

export const Chat=mongoose.model<Ichat>('Chat',schema)