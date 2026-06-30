import mongoose, { Document, Schema } from "mongoose"

export interface IReaction {
  userId: string
  emoji: string
}

export interface IReplyTo {
  messageId: string
  content: string
  senderName: string
}

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
  editedAt?: Date
  isDeleted: boolean
  createdAt: Date
  reactions: IReaction[]
  replyTo?: IReplyTo
}

const reactionSchema = new Schema<IReaction>({
  userId: { type: String, required: true },
  emoji: { type: String, required: true },
}, { _id: false })

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
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  reactions: { type: [reactionSchema], default: [] },
  replyTo: { type: Schema.Types.Mixed, default: null },
})

export default mongoose.model<IMessage>("Message", messageSchema)
