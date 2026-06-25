import mongoose, { Document, Schema } from "mongoose"

export interface IFriendRequest extends Document {
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "declined"
  createdAt: Date
}

const friendRequestSchema = new Schema<IFriendRequest>({
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
})

friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true })

export default mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema)
