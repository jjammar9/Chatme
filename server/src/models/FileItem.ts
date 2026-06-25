import mongoose, { Document, Schema } from "mongoose"

export interface IFileItem extends Document {
  userId: string
  name: string
  type: "document" | "image" | "video" | "audio" | "link"
  size: string
  sender: string
  seed: string
  preview?: string
  description?: string
  createdAt: Date
}

const fileItemSchema = new Schema<IFileItem>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["document", "image", "video", "audio", "link"], default: "document" },
  size: { type: String, default: "" },
  sender: { type: String, default: "" },
  seed: { type: String, default: "" },
  preview: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IFileItem>("FileItem", fileItemSchema)
