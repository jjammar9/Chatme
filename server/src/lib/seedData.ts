import Task from "../models/Task"
import CalendarEvent from "../models/CalendarEvent"
import Contact from "../models/Contact"
import FileItem from "../models/FileItem"

export async function seedUserData(userId: string) {
  const existing = await Task.countDocuments({ userId })
  if (existing > 0) return

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
  const day4 = new Date(today); day4.setDate(day4.getDate() + 4)
  const day6 = new Date(today); day6.setDate(day6.getDate() + 6)
  const day9 = new Date(today); day9.setDate(day9.getDate() + 9)
  const day13 = new Date(today); day13.setDate(day13.getDate() + 13)

  const nowHours = (h: number) => { const d = new Date(); d.setHours(h, 0, 0, 0); return d }

  await Task.insertMany([
    { userId, title: "Finalize Q3 roadmap presentation", description: "Compile all quarterly goals.", dueDate: today, priority: "urgent", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Work", subtasks: [{ title: "Collect team goals", done: true }, { title: "Design slides", done: false }], comments: [{ author: "Jordan Kim", text: "Let me know if you need the engineering timeline.", timestamp: nowHours(10) }] },
    { userId, title: "Review design system components", description: "Audit existing components in Figma.", dueDate: today, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [{ title: "Check button variants", done: true }, { title: "Review form inputs", done: false }], comments: [] },
    { userId, title: "Push API documentation update", description: "Update the API docs with new auth endpoints.", dueDate: tomorrow, priority: "medium", status: "todo", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [], comments: [] },
    { userId, title: "Prep sprint demo walkthrough", description: "Outline key features to demo.", dueDate: tomorrow, priority: "high", status: "todo", assignee: "Taylor Reed", seed: "Taylor", category: "Product", subtasks: [], comments: [] },
    { userId, title: "Update user onboarding flow", description: "Simplify onboarding steps.", dueDate: day3, priority: "medium", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Design", subtasks: [], comments: [] },
    { userId, title: "Backend performance audit", description: "Profile slow endpoints.", dueDate: day5, priority: "high", status: "todo", assignee: "Marcus Lee", seed: "Marcus", category: "Engineering", subtasks: [], comments: [] },
    { userId, title: "Write test cases for checkout", description: "Cover edge cases.", dueDate: day7, priority: "medium", status: "todo", assignee: "Priya Sharma", seed: "Priya", category: "QA", subtasks: [], comments: [] },
    { userId, title: "Plan team offsite activities", description: "Coordinate activities and transport.", dueDate: day10, priority: "low", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Events", subtasks: [], comments: [] },
    { userId, title: "Update employee handbook", description: "Add new remote work policies.", dueDate: day14, priority: "low", status: "todo", assignee: "Jordan Kim", seed: "Jordan", category: "HR", subtasks: [], comments: [] },
    { userId, title: "Migrate legacy database", description: "Move remaining customer data.", dueDate: today, priority: "urgent", status: "done", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [], comments: [] },
    { userId, title: "Redesign notifications panel", description: "Update notifications UI.", dueDate: yesterday, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [], comments: [] },
    { userId, title: "Fix login redirect bug", description: "Users not redirected after SSO login.", dueDate: lastWeek, priority: "urgent", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Engineering", subtasks: [], comments: [] },
  ])

  await CalendarEvent.insertMany([
    { userId, date: today.getDate(), month: today.getMonth(), year: today.getFullYear(), title: "Project Squad standup", time: "9:00 AM", seed: "Sarah", status: "confirmed", location: "Conference Room A", description: "Daily standup.", attendees: ["Jordan", "Alex", "Maya"] },
    { userId, date: today.getDate(), month: today.getMonth(), year: today.getFullYear(), title: "Design review w/ Jordan", time: "11:30 AM", seed: "Jordan", status: "confirmed", location: "Design Lab", description: "Review UI mockups.", attendees: ["Maya"] },
    { userId, date: tomorrow.getDate(), month: tomorrow.getMonth(), year: tomorrow.getFullYear(), title: "Lunch w/ Sarah", time: "12:00 PM", seed: "Sarah", status: "confirmed", location: "Blue Bottle Coffee", description: "Catch up over lunch.", attendees: [] },
    { userId, date: day3.getDate(), month: day3.getMonth(), year: day3.getFullYear(), title: "ML sprint review", time: "10:00 AM", seed: "Alex", status: "confirmed", location: "Meeting Room 2", description: "Review ML model performance.", attendees: ["Maya", "Emily"] },
    { userId, date: day4.getDate(), month: day4.getMonth(), year: day4.getFullYear(), title: "QA walkthrough", time: "1:00 PM", seed: "Priya", status: "confirmed", location: "Testing Lab", description: "Walkthrough of test suite.", attendees: ["Emily"] },
    { userId, date: day6.getDate(), month: day6.getMonth(), year: day6.getFullYear(), title: "Product roadmap session", time: "9:30 AM", seed: "Taylor", status: "confirmed", location: "Board Room", description: "Quarterly roadmap planning.", attendees: ["Sarah", "Jordan", "Maya"] },
    { userId, date: day9.getDate(), month: day9.getMonth(), year: day9.getFullYear(), title: "Sprint planning", time: "10:00 AM", seed: "Emily", status: "confirmed", location: "Conference Room A", description: "Plan next sprint.", attendees: ["Alex", "Maya", "Jordan"] },
    { userId, date: day13.getDate(), month: day13.getMonth(), year: day13.getFullYear(), title: "Team offsite", time: "All day", seed: "Jordan", status: "confirmed", location: "Lakeside Retreat Center", description: "Full-day team building.", attendees: ["Sarah", "Alex", "Maya", "Taylor", "Priya", "Emily", "Marcus"] },
  ])

  const contacts = [
    { name: "Sarah Johnson", seed: "Sarah", email: "sarah.j@design.co", role: "Lead Designer", online: true, favorite: true, phone: "+1 555-0101", address: "123 Design St, NYC", relationship: "close-friend", website: "https://sarahj.design", socialLinks: [{ platform: "Twitter", url: "https://x.com/sarahj" }, { platform: "Dribbble", url: "https://dribbble.com/sarahj" }] },
    { name: "Jordan Kim", seed: "Jordan", email: "jordan.k@dev.io", role: "Full-Stack Dev", online: false, favorite: true, phone: "+1 555-0102", relationship: "friend", socialLinks: [{ platform: "GitHub", url: "https://github.com/jordank" }] },
    { name: "Maya Patel", seed: "Maya", email: "maya.p@backend.dev", role: "Backend Engineer", online: true, favorite: true, phone: "+1 555-0103", address: "456 Oak Ave, SF", relationship: "family" },
    { name: "Taylor Reed", seed: "Taylor", email: "taylor.r@product.org", role: "Product Manager", online: true, favorite: true, phone: "+1 555-0104", relationship: "worker" },
    { name: "Alex Chen", seed: "Alex", email: "alex.c@ml.dev", role: "ML Engineer", online: false, favorite: true, phone: "+1 555-0105", relationship: "colleague" },
    { name: "Emily Davis", seed: "Emily", email: "emily.d@frontend.dev", role: "Frontend Dev", online: true, favorite: false, phone: "+1 555-0106", relationship: "friend" },
    { name: "Marcus Lee", seed: "Marcus", email: "marcus.l@data.dev", role: "Data Analyst", online: false, favorite: false, phone: "+1 555-0107", relationship: "worker" },
    { name: "Priya Sharma", seed: "Priya", email: "priya.s@qa.dev", role: "QA Lead", online: true, favorite: false, phone: "+1 555-0108", relationship: "colleague" },
    { name: "Liam O'Brien", seed: "Liam", email: "liam.o@mobile.dev", role: "iOS Developer", online: true, favorite: false, phone: "+1 555-0109", relationship: "friend" },
    { name: "Zoe Williams", seed: "Zoe", email: "zoe.w@creative.co", role: "UX Designer", online: false, favorite: false, phone: "+1 555-0110", relationship: "colleague" },
    { name: "Ethan Brown", seed: "Ethan", email: "ethan.b@sysadmin.io", role: "DevOps Engineer", online: true, favorite: false, phone: "+1 555-0111", relationship: "worker" },
    { name: "Chloe Garcia", seed: "Chloe", email: "chloe.g@marketing.co", role: "Marketing Lead", online: false, favorite: false, phone: "+1 555-0112", relationship: "close-friend" },
    { name: "Ryan Martinez", seed: "Ryan", email: "ryan.m@data.co", role: "Data Scientist", online: true, favorite: false, phone: "+1 555-0113", relationship: "colleague" },
    { name: "Ava Thompson", seed: "Ava", email: "ava.t@support.io", role: "Customer Success", online: false, favorite: false, phone: "+1 555-0114", relationship: "friend" },
    { name: "Noah White", seed: "Noah", email: "noah.w@security.dev", role: "Security Engineer", online: true, favorite: false, phone: "+1 555-0115", relationship: "worker" },
    { name: "Isabella King", seed: "Isabella", email: "isabella.k@legal.co", role: "Legal Counsel", online: false, favorite: false, phone: "+1 555-0116", relationship: "family" },
    { name: "Mason Clark", seed: "Mason", email: "mason.c@finance.io", role: "Finance Manager", online: true, favorite: false, phone: "+1 555-0117", relationship: "worker" },
    { name: "Sophia Hall", seed: "Sophia", email: "sophia.h@hr.co", role: "HR Director", online: false, favorite: false, phone: "+1 555-0118", relationship: "colleague" },
    { name: "Lucas Young", seed: "Lucas", email: "lucas.y@consulting.io", role: "Strategy Consultant", online: true, favorite: false, phone: "+1 555-0119", relationship: "friend" },
    { name: "Mia Turner", seed: "Mia", email: "mia.t@health.io", role: "Product Designer", online: false, favorite: false, phone: "+1 555-0120", relationship: "close-friend" },
  ].map((c) => ({ ...c, userId }))

  await Contact.insertMany(contacts)

  await FileItem.insertMany([
    { userId, name: "Q3 Brand Guidelines.pdf", type: "document", size: "2.4 MB", createdAt: nowHours(9), sender: "Jordan Kim", seed: "Jordan", preview: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", description: "Complete brand guidelines for Q3." },
    { userId, name: "Dashboard Mockup v2.png", type: "image", size: "4.1 MB", createdAt: nowHours(11), sender: "Maya Patel", seed: "Maya", preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", description: "Updated dashboard mockup." },
    { userId, name: "Sprint Demo Recording.mp4", type: "video", size: "28 MB", createdAt: nowHours(14), sender: "Alex Chen", seed: "Alex", preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", description: "Sprint demo recording." },
    { userId, name: "Product Roadmap Q4.pptx", type: "document", size: "5.7 MB", createdAt: yesterday, sender: "Taylor Reed", seed: "Taylor", description: "Quarterly product roadmap." },
    { userId, name: "Team Photo - Offsite.jpg", type: "image", size: "3.3 MB", createdAt: yesterday, sender: "Emily Davis", seed: "Emily", preview: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop", description: "Group photo from offsite." },
    { userId, name: "UI Animation.mov", type: "video", size: "15 MB", createdAt: day3, sender: "Jordan Kim", seed: "Jordan", preview: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop", description: "Onboarding animation prototype." },
    { userId, name: "Podcast Episode 12.mp3", type: "audio", size: "45 MB", createdAt: day5, sender: "Marcus Lee", seed: "Marcus", description: "Tech podcast on ML best practices." },
    { userId, name: "API Documentation.html", type: "link", size: "—", createdAt: day7, sender: "Alex Chen", seed: "Alex", description: "Link to internal API docs." },
    { userId, name: "Design System Specs.fig", type: "document", size: "6.2 MB", createdAt: day10, sender: "Maya Patel", seed: "Maya", description: "Figma design system file." },
    { userId, name: "Marketing Assets.zip", type: "document", size: "12 MB", createdAt: day14, sender: "Emily Davis", seed: "Emily", description: "All marketing materials." },
  ])
}
