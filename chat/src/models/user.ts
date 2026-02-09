import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  blocked: string[];
}
const schema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  blocked: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,

})

export const User = mongoose.model<IUser>("user", schema, "users")
