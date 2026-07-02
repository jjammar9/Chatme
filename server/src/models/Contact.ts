import mongoose, { Document, Schema } from "mongoose"

export interface IContact extends Document {
  userId: string
  linkedUserId?: string
  name: string
  seed: string
  avatarUrl?: string
  email: string
  role: string
  online: boolean
  favorite: boolean
  phone?: string
  address?: string
  relationship?: "friend" | "close-friend" | "family" | "worker" | "colleague" | "other"
  website?: string
  socialLinks?: { platform: string; url: string }[]
  createdAt: Date
}

const contactSchema = new Schema<IContact>({
  userId: { type: String, required: true, index: true },
  linkedUserId: { type: String, default: null },
  name: { type: String, required: true },
  seed: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  email: { type: String, default: "" },
  role: { type: String, default: "" },
  online: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  relationship: { type: String, enum: ["friend", "close-friend", "family", "worker", "colleague", "other"], default: "other" },
  website: { type: String, default: "" },
  socialLinks: [{ platform: String, url: String }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IContact>("Contact", contactSchema)
