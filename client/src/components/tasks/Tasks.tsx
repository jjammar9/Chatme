import { useState } from "react"
import { CheckCheck, Plus, X, Circle, CheckCircle, Clock, AlertCircle, Flag, User, CalendarDays, MessageSquare, Paperclip, Trash2, Edit3, ArrowLeft, ChevronDown, ListTodo } from "lucide-react"

interface Subtask {
  title: string
  done: boolean
}

interface Comment {
  author: string
  text: string
  timestamp: Date
}

interface Task {
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

function h(hour: number, min = 0) { const d = new Date(); d.setHours(hour, min, 0, 0); return d }

const initialTasks: Task[] = [
  { id: "1", title: "Finalize Q3 roadmap presentation", description: "Compile all quarterly goals, milestones, and resource allocation for the Q3 roadmap deck.", dueDate: today, priority: "urgent", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Work", subtasks: [{ title: "Collect team goals", done: true }, { title: "Design slides", done: false }, { title: "Review with stakeholders", done: false }], comments: [{ author: "Jordan Kim", text: "Let me know if you need the engineering timeline.", timestamp: h(10) }] },
  { id: "2", title: "Review design system components", description: "Audit existing components in Figma and flag inconsistencies before the sprint.", dueDate: today, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [{ title: "Check button variants", done: true }, { title: "Review form inputs", done: false }], comments: [] },
  { id: "3", title: "Push API documentation update", description: "Update the API docs with the new authentication endpoints.", dueDate: tomorrow, priority: "medium", status: "todo", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [], comments: [{ author: "Maya Patel", text: "I can review the docs once you push them.", timestamp: h(14) }] },
  { id: "4", title: "Prep sprint demo walkthrough", description: "Outline the key features to demo and assign speaking parts.", dueDate: tomorrow, priority: "high", status: "todo", assignee: "Taylor Reed", seed: "Taylor", category: "Product", subtasks: [{ title: "Write script outline", done: true }, { title: "Assign speakers", done: false }], comments: [] },
  { id: "5", title: "Update user onboarding flow", description: "Simplify the onboarding steps based on user feedback from last month.", dueDate: day3, priority: "medium", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Design", subtasks: [{ title: "Wireframe new flow", done: false }, { title: "User test", done: false }], comments: [] },
  { id: "6", title: "Backend performance audit", description: "Profile slow endpoints and optimize database queries.", dueDate: day5, priority: "high", status: "todo", assignee: "Marcus Lee", seed: "Marcus", category: "Engineering", subtasks: [], comments: [] },
  { id: "7", title: "Write test cases for checkout", description: "Cover edge cases for the new checkout flow.", dueDate: day7, priority: "medium", status: "todo", assignee: "Priya Sharma", seed: "Priya", category: "QA", subtasks: [{ title: "Happy path tests", done: true }, { title: "Error state tests", done: false }], comments: [] },
  { id: "8", title: "Plan team offsite activities", description: "Coordinate activities, catering, and transport for the offsite.", dueDate: day10, priority: "low", status: "todo", assignee: "Sarah Johnson", seed: "Sarah", category: "Events", subtasks: [], comments: [{ author: "Taylor Reed", text: "I can help with the catering list.", timestamp: h(9) }] },
  { id: "9", title: "Update employee handbook", description: "Add new remote work policies and benefits section.", dueDate: day14, priority: "low", status: "todo", assignee: "Jordan Kim", seed: "Jordan", category: "HR", subtasks: [], comments: [] },
  { id: "10", title: "Migrate legacy database", description: "Move remaining customer data from the old schema.", dueDate: today, priority: "urgent", status: "done", assignee: "Alex Chen", seed: "Alex", category: "Engineering", subtasks: [{ title: "Backup data", done: true }, { title: "Run migration script", done: true }, { title: "Verify integrity", done: true }], comments: [] },
  { id: "11", title: "Redesign notifications panel", description: "Update the notifications UI to support grouping and read state.", dueDate: yesterday, priority: "high", status: "todo", assignee: "Maya Patel", seed: "Maya", category: "Design", subtasks: [{ title: "Mocks", done: true }, { title: "Handoff to dev", done: false }], comments: [] },
  { id: "12", title: "Fix login redirect bug", description: "Users are not being redirected after SSO login on mobile.", dueDate: lastWeek, priority: "urgent", status: "todo", assignee: "Emily Davis", seed: "Emily", category: "Engineering", subtasks: [], comments: [] },
]

const categories = ["All", "Work", "Design", "Engineering", "Product", "QA", "Events", "HR"]
const priorityConfig = {
  urgent: { label: "Urgent", color: "text-rose-600", bg: "bg-rose-100", dot: "bg-rose-500" },
  high: { label: "High", color: "text-amber-600", bg: "bg-amber-100", dot: "bg-amber-500" },
  medium: { label: "Medium", color: "text-blue-600", bg: "bg-blue-100", dot: "bg-blue-500" },
  low: { label: "Low", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
}

const filterPills = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "important", label: "Important" },
  { key: "completed", label: "Completed" },
]

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${m} ${ampm}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayLabel(date: Date): string {
  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, tomorrow)) return "Tomorrow"
  return formatDate(date)
}

function getGroupKey(date: Date): { label: string; order: number } {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const td = today.getTime()
  const diff = Math.round((d.getTime() - td) / 86400000)
  if (diff < 0) return { label: "Overdue", order: 0 }
  if (diff === 0) return { label: "Today", order: 1 }
  if (diff === 1) return { label: "Tomorrow", order: 2 }
  if (diff <= 7) return { label: "This Week", order: 3 }
  return { label: "Later", order: 4 }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [addTitle, setAddTitle] = useState("")
  const [addDesc, setAddDesc] = useState("")
  const [addPriority, setAddPriority] = useState<"medium" | "high" | "urgent" | "low">("medium")
  const [addAssignee, setAddAssignee] = useState("Jordan Kim")
  const [addCategory, setAddCategory] = useState("Work")
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))
    setSelectedTask((prev) => prev && prev.id === id ? { ...prev, status: prev.status === "done" ? "todo" : "done" } : prev)
  }

  const toggleSubtask = (taskId: string, idx: number) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, subtasks: t.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) } : t))
    setSelectedTask((prev) => prev && prev.id === taskId ? { ...prev, subtasks: prev.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) } : prev)
  }

  const addTask = () => {
    if (!addTitle.trim()) return
    const seed = addAssignee.split(" ")[0]
    const newTask: Task = {
      id: String(Date.now()), title: addTitle.trim(), description: addDesc.trim(),
      dueDate: selectedTask?.dueDate ?? today, priority: addPriority, status: "todo",
      assignee: addAssignee, seed, category: addCategory, subtasks: [], comments: [],
    }
    setTasks((prev) => [...prev, newTask])
    setAddTitle(""); setAddDesc(""); setShowAdd(false)
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (selectedTask?.id === id) setSelectedTask(null)
  }

  const filtered = tasks.filter((t) => {
    const matchCompleted = filter !== "completed" || t.status === "done"
    const matchOpen = filter !== "completed" || filter === "all" || t.status === "todo"
    if (filter === "all" && !matchCompleted) return false
    if (filter === "completed") return matchCompleted
    if (filter === "important") return (t.priority === "urgent" || t.priority === "high") && t.status === "todo"
    if (filter === "today") return isSameDay(t.dueDate, today) && t.status === "todo"
    if (filter === "week") {
      const diff = Math.round((t.dueDate.getTime() - today.getTime()) / 86400000)
      return diff >= 0 && diff <= 7 && t.status === "todo"
    }
    if (filter === "all" && t.status === "done") return true
    return true
  }).filter((t) => categoryFilter === "All" || t.category === categoryFilter)

  const todoTasks = filtered.filter((t) => t.status === "todo")
  const doneTasks = filtered.filter((t) => t.status === "done")

  const groups = [
    { label: "Overdue", tasks: todoTasks.filter((t) => { const d = new Date(t.dueDate.getFullYear(), t.dueDate.getMonth(), t.dueDate.getDate()); return d.getTime() < today.getTime() }) },
    { label: "Today", tasks: todoTasks.filter((t) => isSameDay(t.dueDate, today)) },
    { label: "Tomorrow", tasks: todoTasks.filter((t) => isSameDay(t.dueDate, tomorrow)) },
    { label: "This Week", tasks: todoTasks.filter((t) => { const diff = Math.round((t.dueDate.getTime() - today.getTime()) / 86400000); return diff > 1 && diff <= 7 }) },
    { label: "Later", tasks: todoTasks.filter((t) => Math.round((t.dueDate.getTime() - today.getTime()) / 86400000) > 7) },
    ...(doneTasks.length > 0 ? [{ label: "Completed", tasks: doneTasks }] : []),
  ].filter((g) => g.tasks.length > 0)

  const preview = selectedTask ?? (filtered.length > 0 ? filtered[0] : null)

  const total = tasks.filter((t) => filter === "all" && categoryFilter === "All" ? true : filtered.includes(t)).length
  const completed = tasks.filter((t) => t.status === "done").length

  return (
    <div className="h-full bg-light-gray flex flex-col">
      <div className="bg-off-white border-b border-gray/20 px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-dark-purple flex items-center justify-center shadow-sm">
              <ListTodo size={17} className="text-off-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-purple">Tasks</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-dark-purple/40">{completed}/{total} completed</span>
                <div className="w-24 h-1.5 rounded-full bg-light-gray overflow-hidden">
                  <div className="h-full rounded-full bg-green transition-all" style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${categoryFilter === c ? "bg-dark-purple/15 text-dark-purple" : "text-dark-purple/40 hover:text-dark-purple"}`}>{c}</button>
              ))}
            </div>
            <button onClick={() => { setEditingId(null); setAddTitle(""); setAddDesc(""); setAddPriority("medium"); setShowAdd(true) }} className="flex items-center gap-1.5 bg-dark-purple text-off-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={14} /> Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-off-white border-b border-gray/20 px-7 py-3 flex items-center gap-1.5 overflow-x-auto">
            {filterPills.map((p) => (
              <button key={p.key} onClick={() => { setFilter(p.key); setSelectedTask(null) }} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${filter === p.key ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple hover:bg-gray/20"}`}>
                {p.label}
                {p.key !== "all" && p.key !== "completed" && (
                  <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded-full bg-off-white/20">{filtered.filter((t) => t.status === "todo").length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="px-7 py-5 space-y-5">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <CheckCheck size={48} className="text-dark-purple/10 mb-4" />
                <p className="text-sm font-medium text-dark-purple/30">All clear!</p>
                <p className="text-xs text-dark-purple/20 mt-1">No tasks match this view</p>
              </div>
            ) : groups.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className={`w-2 h-2 rounded-full ${group.label === "Overdue" ? "bg-rose-400" : group.label === "Today" ? "bg-amber-400" : group.label === "Completed" ? "bg-green" : "bg-dark-purple/20"}`} />
                  <span className="text-[11px] font-semibold text-dark-purple/40 uppercase tracking-wider">{group.label}</span>
                  <span className="text-[10px] text-dark-purple/20">· {group.tasks.length}</span>
                </div>
                <div className="bg-off-white rounded-2xl border border-gray/10 overflow-hidden shadow-sm">
                  {group.tasks.map((t) => {
                    const pc = priorityConfig[t.priority]
                    const isSel = preview?.id === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`group w-full flex items-center gap-3.5 px-5 py-3.5 border-b border-light-gray last:border-0 transition-all text-left ${isSel ? "bg-dark-purple/5" : "hover:bg-light-gray/50"}`}
                      >
                        <button onClick={(e) => { e.stopPropagation(); toggleDone(t.id) }} className="shrink-0">
                          {t.status === "done" ? (
                            <CheckCircle size={18} className="text-green" />
                          ) : (
                            <Circle size={18} className="text-dark-purple/30 group-hover:text-dark-purple/50 transition-colors" />
                          )}
                        </button>
                        <div className={`flex-1 min-w-0 ${t.status === "done" ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold truncate ${t.status === "done" ? "text-dark-purple/50 line-through" : "text-dark-purple"}`}>{t.title}</p>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${pc.bg} ${pc.color}`}>{pc.label}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-dark-purple/50 flex items-center gap-1">
                              <CalendarDays size={11} className="shrink-0" />
                              {dayLabel(t.dueDate)}
                            </span>
                            {t.subtasks.length > 0 && (
                              <span className="text-xs text-dark-purple/30">{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-2 ring-off-white">
                          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${t.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[360px] shrink-0 border-l border-gray/20 bg-off-white overflow-y-auto">
          {preview ? (
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleDone(preview.id)} className="mt-0.5 shrink-0">
                    {preview.status === "done" ? <CheckCircle size={20} className="text-green" /> : <Circle size={20} className="text-dark-purple/30 hover:text-dark-purple/50 transition-colors" />}
                  </button>
                  <div>
                    <h2 className={`text-base font-bold text-dark-purple leading-snug ${preview.status === "done" ? "line-through text-dark-purple/50" : ""}`}>{preview.title}</h2>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${priorityConfig[preview.priority].bg} ${priorityConfig[preview.priority].color}`}>{priorityConfig[preview.priority].label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-light-gray transition-colors"><Edit3 size={14} className="text-dark-purple/40" /></button>
                  <button onClick={() => deleteTask(preview.id)} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors"><Trash2 size={14} className="text-rose-500" /></button>
                </div>
              </div>

              <div className="bg-light-gray rounded-2xl p-4 space-y-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-off-white">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${preview.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark-purple">{preview.assignee}</p>
                    <p className="text-[10px] text-dark-purple/40">Assignee</p>
                  </div>
                </div>
                <div className="h-px bg-gray/20" />
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={14} className="text-dark-purple/30 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-dark-purple">{formatDate(preview.dueDate)}</p>
                    <p className="text-[10px] text-dark-purple/40">Due date</p>
                  </div>
                </div>
                <div className="h-px bg-gray/20" />
                <div className="flex items-center gap-2.5">
                  <Flag size={14} className="text-dark-purple/30 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-dark-purple">{preview.category}</p>
                    <p className="text-[10px] text-dark-purple/40">Category</p>
                  </div>
                </div>
              </div>

              {preview.description && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-semibold text-dark-purple/40 uppercase tracking-wider mb-1.5">Description</h3>
                  <p className="text-sm text-dark-purple/70 leading-relaxed">{preview.description}</p>
                </div>
              )}

              {preview.subtasks.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-semibold text-dark-purple/40 uppercase tracking-wider">Subtasks ({preview.subtasks.filter((s) => s.done).length}/{preview.subtasks.length})</h3>
                  </div>
                  <div className="space-y-1.5">
                    {preview.subtasks.map((s, i) => (
                      <button key={i} onClick={() => toggleSubtask(preview.id, i)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-light-gray transition-colors text-left">
                        {s.done ? <CheckCircle size={14} className="text-green shrink-0" /> : <Circle size={14} className="text-dark-purple/30 shrink-0" />}
                        <span className={`text-sm ${s.done ? "text-dark-purple/40 line-through" : "text-dark-purple"}`}>{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {preview.comments.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-dark-purple/40 uppercase tracking-wider mb-2.5">Activity ({preview.comments.length})</h3>
                  <div className="space-y-3">
                    {preview.comments.map((c, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-2 ring-off-white">
                          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${c.author.split(" ")[0]}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-dark-purple">{c.author}</span>
                            <span className="text-[9px] text-dark-purple/30">{formatTime(c.timestamp)}</span>
                          </div>
                          <p className="text-xs text-dark-purple/60 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6">
                <ListTodo size={44} className="text-dark-purple/10 mx-auto mb-3" />
                <p className="text-sm font-medium text-dark-purple/30">Select a task</p>
                <p className="text-xs text-dark-purple/20 mt-1">Choose a task from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="bg-off-white rounded-2xl p-6 w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-dark-purple">{editingId ? "Edit Task" : "New Task"}</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-dark-purple/50" /></button>
            </div>
            <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Task title" className="w-full bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-dark-purple/20" />
            <textarea value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-dark-purple/20 resize-none" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <select value={addPriority} onChange={(e) => setAddPriority(e.target.value as typeof addPriority)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20">
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={addAssignee} onChange={(e) => setAddAssignee(e.target.value)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20">
                {["Sarah Johnson", "Jordan Kim", "Maya Patel", "Taylor Reed", "Alex Chen", "Emily Davis", "Marcus Lee", "Priya Sharma"].map((n) => <option key={n}>{n}</option>)}
              </select>
              <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20">
                {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={selectedTask?.dueDate.toISOString().split("T")[0] ?? today.toISOString().split("T")[0]} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20" />
            </div>
            <button onClick={addTask} className="w-full bg-dark-purple text-off-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm">{editingId ? "Save Changes" : "Add Task"}</button>
          </div>
        </div>
      )}
    </div>
  )
}
