import mongoose, { Document, Schema } from "mongoose"

export interface INotification extends Document {
  userId: string
  type: "friend_request" | "friend_accepted" | "message" | "community_invite" | "community_join_request" | "request_accepted" | "request_declined" | "invite_accepted"
  fromUserId: string
  message: string
  relatedId?: string
  read: boolean
  createdAt: Date
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ["friend_request", "friend_accepted", "message", "community_invite", "community_join_request", "request_accepted", "request_declined", "invite_accepted"] },
  fromUserId: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<INotification>("Notification", notificationSchema)
