import { useState, useEffect } from "react"
import { CheckCheck, Plus, X, Circle, CheckCircle, CalendarDays, Flag, Trash2, Edit3, ArrowLeft, ChevronDown, ListTodo, Search } from "lucide-react"
import type { Task } from "../../types"
import { formatTime, formatDate, isSameDay } from "../../lib/utils"
import { tasks as tasksApi } from "../../lib/api"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Modal from "../ui/Modal"

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

const categories = ["All", "Work", "Design", "Engineering", "Product", "QA", "Events", "HR"]
const priorityConfig = {
  urgent: { label: "Urgent", color: "text-dark-purple", bg: "bg-rose", dot: "bg-rose" },
  high: { label: "High", color: "text-dark-purple", bg: "bg-dark-purple/15", dot: "bg-dark-purple" },
  medium: { label: "Medium", color: "text-dark-purple", bg: "bg-light-green", dot: "bg-light-green" },
  low: { label: "Low", color: "text-dark-purple/60", bg: "bg-light-gray", dot: "bg-gray" },
}

const filterPills = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "important", label: "Important" },
  { key: "completed", label: "Completed" },
]

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
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

  useEffect(() => {
    tasksApi.list().then((data) => { setTasks(data.tasks.map((t: Record<string, string>) => ({ ...t, dueDate: new Date(t.dueDate) }))); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const refresh = () => tasksApi.list().then((data) => setTasks(data.tasks.map((t: Record<string, string>) => ({ ...t, dueDate: new Date(t.dueDate) }))))

  const toggleDone = (id: string) => {
    const t = tasks.find((task) => task.id === id)
    if (!t) return
    const newStatus = t.status === "done" ? "todo" : "done"
    tasksApi.update(id, { status: newStatus }).then(() => {
      setTasks((prev) => prev.map((task) => task.id === id ? { ...task, status: newStatus } : task))
      setSelectedTask((prev) => prev && prev.id === id ? { ...prev, status: newStatus } : prev)
    })
  }

  const toggleSubtask = (taskId: string, idx: number) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, subtasks: t.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) } : t))
    setSelectedTask((prev) => prev && prev.id === taskId ? { ...prev, subtasks: prev.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) } : prev)
  }

  const addTask = () => {
    if (!addTitle.trim()) return
    const seed = addAssignee.split(" ")[0]
    const newTask = {
      title: addTitle.trim(), description: addDesc.trim(),
      dueDate: selectedTask?.dueDate ?? today, priority: addPriority,
      assignee: addAssignee, seed, category: addCategory,
    }
    tasksApi.create(newTask as unknown as Record<string, unknown>).then(() => {
      refresh(); setAddTitle(""); setAddDesc(""); setShowAdd(false)
    })
  }

  const deleteTask = (id: string) => {
    tasksApi.remove(id).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      if (selectedTask?.id === id) setSelectedTask(null)
    })
  }

  const filtered = tasks.filter((t) => {
    const matchSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
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
        <div className="flex items-center justify-between mb-4">
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
            <Button size="sm" onClick={() => { setEditingId(null); setAddTitle(""); setAddDesc(""); setAddPriority("medium"); setShowAdd(true) }}><Plus size={14} /> Add Task</Button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none focus:ring-2 focus:ring-dark-purple/10" aria-label="Search tasks" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {filterPills.map((p) => (
            <button key={p.key} onClick={() => { setFilter(p.key); setSelectedTask(null) }} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${filter === p.key ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple hover:bg-gray/20"}`}>
              {p.label}
              {p.key !== "all" && p.key !== "completed" && (
                <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded-full bg-off-white/20">{filtered.filter((t) => t.status === "todo").length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
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
                  <span className={`w-2 h-2 rounded-full ${group.label === "Overdue" ? "bg-rose" : group.label === "Today" ? "bg-dark-purple" : group.label === "Completed" ? "bg-green" : "bg-dark-purple/20"}`} />
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
                        <button onClick={(e) => { e.stopPropagation(); toggleDone(t.id) }} className="shrink-0" aria-label={t.status === "done" ? "Mark incomplete" : "Mark complete"}>
                          {t.status === "done" ? (
                            <CheckCircle size={18} className="text-green" />
                          ) : (
                            <Circle size={18} className="text-dark-purple/30 group-hover:text-dark-purple/50 transition-colors" />
                          )}
                        </button>
                        <div className={`flex-1 min-w-0 ${t.status === "done" ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold truncate ${t.status === "done" ? "text-dark-purple/50 line-through" : "text-dark-purple"}`}>{t.title}</p>
                            <Badge variant={t.priority === "urgent" ? "warning" : t.priority === "high" ? "info" : t.priority === "medium" ? "success" : "default"} size="sm">{pc.label}</Badge>
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
                        <Avatar seed={t.seed} size="sm" className="ring-2 ring-off-white" />
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
                  <button onClick={() => toggleDone(preview.id)} className="mt-0.5 shrink-0" aria-label={preview.status === "done" ? "Mark incomplete" : "Mark complete"}>
                    {preview.status === "done" ? <CheckCircle size={20} className="text-green" /> : <Circle size={20} className="text-dark-purple/30 hover:text-dark-purple/50 transition-colors" />}
                  </button>
                  <div>
                    <h2 className={`text-base font-bold text-dark-purple leading-snug ${preview.status === "done" ? "line-through text-dark-purple/50" : ""}`}>{preview.title}</h2>
                    <Badge variant={preview.priority === "urgent" ? "warning" : preview.priority === "high" ? "info" : preview.priority === "medium" ? "success" : "default"} size="sm" className="mt-1.5">{priorityConfig[preview.priority].label}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-light-gray transition-colors" aria-label="Edit task"><Edit3 size={14} className="text-dark-purple/40" /></button>
                  <button onClick={() => deleteTask(preview.id)} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors" aria-label="Delete task"><Trash2 size={14} className="text-dark-purple/50" /></button>
                </div>
              </div>

              <div className="bg-light-gray rounded-2xl p-4 space-y-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <Avatar seed={preview.seed} size="md" className="ring-2 ring-off-white" />
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
                        <Avatar seed={c.author.split(" ")[0]} size="sm" className="ring-2 ring-off-white" />
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editingId ? "Edit Task" : "New Task"}>
        <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Task title" className="w-full bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-dark-purple/20" aria-label="Task title" />
        <textarea value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-dark-purple/20 resize-none" aria-label="Task description" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <select value={addPriority} onChange={(e) => setAddPriority(e.target.value as typeof addPriority)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20" aria-label="Priority">
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={addAssignee} onChange={(e) => setAddAssignee(e.target.value)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20" aria-label="Assignee">
            {["Sarah Johnson", "Jordan Kim", "Maya Patel", "Taylor Reed", "Alex Chen", "Emily Davis", "Marcus Lee", "Priya Sharma"].map((n) => <option key={n}>{n}</option>)}
          </select>
          <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20" aria-label="Category">
            {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={selectedTask?.dueDate.toISOString().split("T")[0] ?? today.toISOString().split("T")[0]} className="bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20" aria-label="Due date" />
        </div>
        <Button fullWidth onClick={addTask}>{editingId ? "Save Changes" : "Add Task"}</Button>
      </Modal>
    </div>
  )
}
