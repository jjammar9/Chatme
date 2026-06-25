import mongoose, { Document, Schema } from "mongoose"

export interface IMessage extends Document {
  conversationId: string
  senderId: string
  senderName: string
  senderSeed: string
  content: string
  type: "text" | "image" | "file" | "system"
  readBy: string[]
  createdAt: Date
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderSeed: { type: String, default: "" },
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "file", "system"], default: "text" },
  readBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IMessage>("Message", messageSchema)
