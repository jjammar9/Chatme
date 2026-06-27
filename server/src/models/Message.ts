import mongoose, { Document, Schema } from "mongoose"

export interface IMessage extends Document {
  conversationId: string
  senderId: string
  senderName: string
  senderSeed: string
  content: string
  type: "text" | "image" | "file" | "voice" | "system"
  readBy: string[]
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
  createdAt: Date
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderSeed: { type: String, default: "" },
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "file", "voice", "system"], default: "text" },
  readBy: [{ type: String }],
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  fileMimeType: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IMessage>("Message", messageSchema)
