import mongoose, { Document, Schema } from "mongoose"

export interface ITask extends Document {
  userId: string
  title: string
  description: string
  dueDate: Date
  priority: "urgent" | "high" | "medium" | "low"
  status: "todo" | "done"
  assignee: string
  seed: string
  category: string
  subtasks: { title: string; done: boolean }[]
  comments: { author: string; text: string; timestamp: Date }[]
  createdAt: Date
}

const taskSchema = new Schema<ITask>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["urgent", "high", "medium", "low"], default: "medium" },
  status: { type: String, enum: ["todo", "done"], default: "todo" },
  assignee: { type: String, default: "" },
  seed: { type: String, default: "" },
  category: { type: String, default: "General" },
  subtasks: [{ title: String, done: Boolean }],
  comments: [{ author: String, text: String, timestamp: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<ITask>("Task", taskSchema)
