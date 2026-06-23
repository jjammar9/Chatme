const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
const day3 = new Date(today); day3.setDate(day3.getDate() + 3)
const day5 = new Date(today); day5.setDate(day5.getDate() + 5)
const day7 = new Date(today); day7.setDate(day7.getDate() + 7)
const day10 = new Date(today); day10.setDate(day10.getDate() + 10)
const day14 = new Date(today); day14.setDate(day14.getDate() + 14)
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7)

export interface MockTask {
  id: string; title: string; description: string; dueDate: Date
  priority: "urgent" | "high" | "medium" | "low"
  status: "todo" | "done"; assignee: string; seed: string; category: string
  subtasks: { title: string; done: boolean }[]
  comments: { author: string; text: string; timestamp: Date }[]
}

export const mockTasks: MockTask[] = [
  { id: "1", title: "Finalize Q3 roadmap presentation", description: "", dueDate: today, priority: "urgent", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Work", subtasks: [{ title: "Collect team goals", done: true }, { title: "Design slides", done: false }, { title: "Review with stakeholders", done: false }], comments: [] },
  { id: "2", title: "Review design system components", description: "", dueDate: today, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [{ title: "Check button variants", done: true }, { title: "Review form inputs", done: false }], comments: [] },
  { id: "3", title: "Push API documentation update", description: "", dueDate: tomorrow, priority: "medium", status: "todo", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [], comments: [] },
  { id: "4", title: "Prep sprint demo walkthrough", description: "", dueDate: tomorrow, priority: "high", status: "todo", assignee: "Taylor Reed", seed: "Taylor", category: "Product", subtasks: [], comments: [] },
  { id: "5", title: "Update user onboarding flow", description: "", dueDate: day3, priority: "medium", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Design", subtasks: [], comments: [] },
  { id: "6", title: "Backend performance audit", description: "", dueDate: day5, priority: "high", status: "todo", assignee: "Marcus Lee", seed: "Marcus", category: "Engineering", subtasks: [], comments: [] },
  { id: "7", title: "Write test cases for checkout", description: "", dueDate: day7, priority: "medium", status: "todo", assignee: "Priya Sharma", seed: "Priya", category: "QA", subtasks: [], comments: [] },
  { id: "8", title: "Plan team offsite activities", description: "", dueDate: day10, priority: "low", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Events", subtasks: [], comments: [] },
  { id: "9", title: "Update employee handbook", description: "", dueDate: day14, priority: "low", status: "todo", assignee: "Jordan Kim", seed: "Jordan", category: "HR", subtasks: [], comments: [] },
  { id: "10", title: "Migrate legacy database", description: "", dueDate: today, priority: "urgent", status: "done", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [], comments: [] },
  { id: "11", title: "Redesign notifications panel", description: "", dueDate: yesterday, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [], comments: [] },
  { id: "12", title: "Fix login redirect bug", description: "", dueDate: lastWeek, priority: "urgent", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Engineering", subtasks: [], comments: [] },
]

export const taskCounts = {
  total: mockTasks.length,
  completed: mockTasks.filter((t) => t.status === "done").length,
  unfinished: mockTasks.filter((t) => t.status === "todo").length,
}

export const mockCommunities = [
  { name: "Project Squad", members: 8, online: 3, tags: ["Design", "Dev"], seeds: ["Sarah", "Alex", "Maya"] },
  { name: "Design Talks", members: 24, online: 7, tags: ["Design"], seeds: ["Jordan", "Taylor", "Maya"] },
  { name: "Weekend Hikers", members: 15, online: 2, tags: ["Social"], seeds: ["Taylor", "Sarah", "Alex"] },
  { name: "Book Club", members: 12, online: 4, tags: ["Social"], seeds: ["Maya", "Jordan", "Taylor"] },
  { name: "Music Lovers", members: 6, online: 1, tags: ["Social"], seeds: ["Emily", "Sarah"] },
  { name: "Startup Talk", members: 34, online: 11, tags: ["Tech"], seeds: ["Alex", "Jordan", "Marcus"] },
  { name: "Photography", members: 19, online: 5, tags: ["Creative"], seeds: ["Taylor", "Maya"] },
  { name: "Gaming Squad", members: 11, online: 3, tags: ["Social"], seeds: ["Alex", "Marcus", "Emily"] },
  { name: "Fitness Freaks", members: 22, online: 8, tags: ["Health"], seeds: ["Sarah", "Taylor", "Priya"] },
  { name: "Cooking Corner", members: 14, online: 2, tags: ["Lifestyle"], seeds: ["Maya", "Jordan"] },
  { name: "Career Growth", members: 28, online: 9, tags: ["Career"], seeds: ["Alex", "Priya", "Emily"] },
  { name: "Indie Hackers", members: 9, online: 4, tags: ["Tech", "Startup"], seeds: ["Marcus", "Jordan"] },
]

export const mockContacts = [
  { name: "Sarah Johnson", seed: "Sarah", email: "sarah@chatme.io", role: "Product Designer", online: true, favorite: true },
  { name: "Alex Chen", seed: "Alex", email: "alex@chatme.io", role: "Full-Stack Developer", online: true, favorite: true },
  { name: "Maya Patel", seed: "Maya", email: "maya@chatme.io", role: "UI/UX Designer", online: false, favorite: true },
  { name: "Jordan Kim", seed: "Jordan", email: "jordan@chatme.io", role: "Frontend Developer", online: true, favorite: false },
  { name: "Taylor Reed", seed: "Taylor", email: "taylor@chatme.io", role: "Product Manager", online: true, favorite: false },
  { name: "Emily Davis", seed: "Emily", email: "emily@chatme.io", role: "Backend Developer", online: false, favorite: false },
  { name: "Marcus Lee", seed: "Marcus", email: "marcus@chatme.io", role: "DevOps Engineer", online: false, favorite: false },
  { name: "Priya Sharma", seed: "Priya", email: "priya@chatme.io", role: "QA Lead", online: true, favorite: false },
]

export const dashboardStats = {
  totalTasks: taskCounts.total,
  unfinishedTasks: taskCounts.unfinished,
  totalGroups: mockCommunities.length,
  totalContacts: mockContacts.length,
  onlineContacts: mockContacts.filter((c) => c.online).length,
}
