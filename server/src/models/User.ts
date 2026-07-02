import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  username: string
  email: string
  password: string
  avatarSeed: string
  avatarUrl?: string
  role: string
  online: boolean
  createdAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatarSeed: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  role: { type: String, default: "User" },
  online: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IUser>("User", userSchema)
