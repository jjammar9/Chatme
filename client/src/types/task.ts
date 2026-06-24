export interface Subtask {
  title: string
  done: boolean
}

export interface Comment {
  author: string
  text: string
  timestamp: Date
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: "urgent" | "high" | "medium" | "low"
  status: "todo" | "done"
  assignee: string
  seed: string
  category: string
  subtasks: Subtask[]
  comments: Comment[]
}
