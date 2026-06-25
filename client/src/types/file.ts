export interface FileItem {
  _id?: string
  id: string
  name: string
  type: "document" | "image" | "video" | "audio" | "link"
  size: string
  timestamp: Date
  sender: string
  seed: string
  preview?: string
  description?: string
}
