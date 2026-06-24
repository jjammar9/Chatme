export interface FileItem {
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
