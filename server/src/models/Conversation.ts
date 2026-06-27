import mongoose, { Document, Schema } from "mongoose"

export interface IConversation extends Document {
  participants: string[]
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
  lastMessage?: string
  lastMessageTime?: Date
  isFavourite: string[]
  createdAt: Date
}

const conversationSchema = new Schema<IConversation>({
  participants: [{ type: String, required: true }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String, default: "" },
  groupAvatar: { type: String, default: "" },
  lastMessage: { type: String, default: "" },
  lastMessageTime: { type: Date },
  isFavourite: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IConversation>("Conversation", conversationSchema)
