import mongoose, { Document, Schema } from "mongoose"

export interface IJoinRequest {
  userId: string
  status: "pending" | "accepted" | "declined"
  createdAt: Date
}

export interface ICommunity extends Document {
  name: string
  description: string
  avatarSeed: string
  tags: string[]
  members: string[]
  admins: string[]
  joinRequests: IJoinRequest[]
  createdBy: string
  createdAt: Date
}

const joinRequestSchema = new Schema<IJoinRequest>({
  userId: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
})

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  avatarSeed: { type: String, default: "" },
  tags: [{ type: String }],
  members: [{ type: String }],
  admins: [{ type: String }],
  joinRequests: [joinRequestSchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<ICommunity>("Community", communitySchema)
