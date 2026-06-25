import { useState, useEffect, useRef } from "react"
import { MessageSquare, Users, FileText, UserPlus, Send, Camera, MapPin, Calendar, ClipboardList, Search, Clock, Sparkles, X, Bot, SendHorizonal } from "lucide-react"
import { mockCommunities } from "../../data/mock"
import { tasks as tasksApi, contacts as contactsApi, users as usersApi } from "../../lib/api"
import { useToast } from "../../context/ToastContext"
import Avatar from "../ui/Avatar"
import { getAvatarUrl, formatTime } from "../../lib/utils"
import type { Task, UserSearchResult } from "../../types"

const activities: { user: string; action: string; time: string; seed: string }[] = []

function answerQuery(msg: string, tasks: Task[], contacts: { name: string; online: boolean; favorite: boolean; role: string; seed: string }[]): string {
  const q = msg.toLowerCase()

  if (q.includes("hello") || q.includes("hi ") || q === "hi" || q.includes("hey")) {
    return "Hi there! I can look up your tasks, contacts, groups, and files. Try asking me something!"
  }

  if (q.includes("task") || q.includes("todo") || q.includes("to do") || q.includes("due")) {
    const d = new Date()
    const todayStr = d.toDateString()
    const dueToday = tasks.filter((t) => new Date(t.dueDate).toDateString() === todayStr && t.status === "todo")
    const totalTodo = tasks.filter((t) => t.status === "todo").length
    const done = tasks.filter((t) => t.status === "done").length
    if (dueToday.length > 0) {
      const list = dueToday.map((t) => `• ${t.title} (${t.priority})`).join("\n")
      return `You have ${totalTodo} unfinished tasks (${done} done). ${dueToday.length} due today:\n${list}`
    }
    if (q.includes("all") || q.includes("everything")) {
      const urgent = tasks.filter((t) => t.priority === "urgent" && t.status === "todo")
      return `All tasks: ${tasks.length} total, ${totalTodo} to do, ${done} done. ${urgent.length > 0 ? `Urgent: ${urgent.map((t) => t.title).join(", ")}` : ""}`
    }
    return `You have ${totalTodo} unfinished tasks and ${done} completed. Try "what's due today?" for more detail.`
  }

  if (q.includes("contact") || q.includes("people") || q.includes("who")) {
    const online = contacts.filter((c) => c.online)
    const favs = contacts.filter((c) => c.favorite)
    return `You have ${contacts.length} contacts. ${online.length} currently online: ${online.map((c) => c.name).join(", ")}. Favorites: ${favs.map((c) => c.name).join(", ")}.`
  }

  if (q.includes("group") || q.includes("community") || q.includes("channel")) {
    const mocks = mockCommunities
    const mostActive = mocks.reduce((a, b) => (a.online > b.online ? a : b))
    return `You're in ${mocks.length} groups. Most active: "${mostActive.name}" (${mostActive.online}/${mostActive.members} online). Total members: ${mocks.reduce((s, c) => s + c.members, 0)}.`
  }

  if (q.includes("file") || q.includes("document") || q.includes("upload")) {
    return `Files are in the Files tab. You can filter by Documents, Images, Videos, Audio, or Links.`
  }

  const taskMatch = tasks.find((t) => t.title.toLowerCase().includes(q))
  if (taskMatch) return `Found task "${taskMatch.title}" — ${taskMatch.status === "done" ? "completed" : taskMatch.priority + " priority"}`
  const contactMatch = contacts.find((c) => c.name.toLowerCase().includes(q))
  if (contactMatch) return `Found contact "${contactMatch.name}" — ${contactMatch.online ? "online" : "offline"}, ${contactMatch.role}`
  const groupMatch = mockCommunities.find((c) => c.name.toLowerCase().includes(q))
  if (groupMatch) return `Found group "${groupMatch.name}" — ${groupMatch.online}/${groupMatch.members} online, tags: ${groupMatch.tags.join(", ")}`

  return `I can answer questions about your workspace. Try:
• "What's due today?" — tasks due now
• "Show my contacts" — people & online status
• "My groups" — community overview
• "Search [name]" — find something specific`
}

export default function Dashboard({ onViewProfile }: { onViewProfile?: (id: string) => void }) {
  const { toast } = useToast()
  const [now, setNow] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [contacts, setContacts] = useState<{ name: string; online: boolean; favorite: boolean; role: string; seed: string }[]>([])
  const [userResults, setUserResults] = useState<UserSearchResult[]>([])

  useEffect(() => {
    tasksApi.list().then((data) => setTasks(data.tasks.map((t: Record<string, string>) => ({ ...t, dueDate: new Date(t.dueDate) })))).catch(() => {})
    contactsApi.list().then((data) => setContacts(data.contacts)).catch(() => {})
  }, [])

  const welcomeShown = useRef(false)
  useEffect(() => { if (!welcomeShown.current) { welcomeShown.current = true; toast("Welcome to Chatme", "success") } }, [])
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    clearTimeout(searchTimeout.current)
    if (!searchQuery.trim()) { setUserResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await usersApi.search(searchQuery)
        setUserResults(data.users)
      } catch { setUserResults([]) }
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const userName = JSON.parse(localStorage.getItem("user") || "{}").name || "User"

  const allSearchData = [
    ...tasks.map((t) => ({ label: t.title, category: "Task", seed: t.seed })),
    ...contacts.map((c) => ({ label: c.name, category: "Contact", seed: c.seed })),
    ...mockCommunities.map((c) => ({ label: c.name, category: "Group", seed: c.seeds[0] })),
  ]

  const filteredSearch = searchQuery.trim()
    ? allSearchData.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const stats = [
    { label: "Messages", value: "0", icon: MessageSquare, color: "bg-rose", change: "No messages yet" },
    { label: "Online", value: String(contacts.filter((c) => c.online).length), icon: Users, color: "bg-light-green", change: "contacts online" },
    { label: "Tasks", value: String(tasks.length), icon: ClipboardList, color: "bg-dark-purple/10", change: tasks.length > 0 ? `${tasks.filter((t) => t.status === "todo").length} unfinished` : "No tasks yet" },
    { label: "Contacts", value: String(contacts.length), icon: FileText, color: "bg-green/20", change: contacts.length > 0 ? String(contacts.filter((c) => c.online).length) + " online" : "No contacts yet" },
    { label: "Groups", value: "0", icon: UserPlus, color: "bg-rose/40", change: "No groups yet" },
  ]

  const continueTasks = tasks.filter((t) => t.status === "todo").slice(0, 4)

  const addUserAsContact = async (user: UserSearchResult) => {
    try {
      await contactsApi.create({
        name: user.name, seed: user.avatarSeed || user.username,
        email: user.email, role: "User", online: user.online, favorite: false,
        linkedUserId: user._id,
      })
      toast(`Added ${user.name} to contacts`, "success")
      setUserResults([])
      setSearchQuery("")
    } catch { toast("Failed to add contact", "error") }
  }

  const handleChatSend = () => {
    if (!chatMsg.trim()) return
    const userMsg = chatMsg.trim()
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }])
    setChatMsg("")
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { role: "bot", text: answerQuery(userMsg, tasks, contacts) }])
    }, 400)
  }

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="px-8 py-5 bg-off-white border-b border-gray/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-dark-purple/50 uppercase tracking-wider">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              <h1 className="text-2xl font-bold text-dark-purple mt-1">{greeting}, {userName} 👋</h1>
            </div>
            <div className="flex items-center gap-2 bg-light-gray rounded-xl px-3.5 py-2 self-end">
              <Clock size={14} className="text-dark-purple/40" />
              <span className="text-sm font-semibold text-dark-purple tabular-nums">{formatTime(now)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/jjammar9/Chatme" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="X / Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="Dribbble">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-gray transition-colors text-dark-purple/40 hover:text-dark-purple" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/30" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search users, tasks, contacts..."
            className="w-full bg-light-gray text-dark-purple text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/10 focus:bg-off-white transition-all placeholder:text-dark-purple/25"
          />
          {showResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-off-white rounded-xl shadow-lg border border-gray/20 py-1.5 z-10 max-h-72 overflow-y-auto">
              {userResults.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-dark-purple/40 px-4 py-1.5 uppercase tracking-wider">Users</p>
                  {userResults.map((u) => (
                    <div key={u._id} onClick={() => onViewProfile?.(u._id)} className="flex items-center gap-2.5 px-4 py-2 hover:bg-light-gray transition-colors cursor-pointer">
                      <Avatar seed={u.avatarSeed || u.username} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-purple truncate">{u.name}</p>
                        <p className="text-[11px] text-dark-purple/40">@{u.username}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); addUserAsContact(u) }}
                        className="text-[10px] font-semibold text-nowrap bg-dark-purple text-off-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
                        aria-label={`Add ${u.name} as contact`}
                      >+ Add</button>
                    </div>
                  ))}
                </>
              )}
              {filteredSearch.length > 0 && (
                <>
                  {userResults.length > 0 && <div className="border-t border-light-gray my-1" />}
                  <p className="text-[10px] font-semibold text-dark-purple/40 px-4 py-1.5 uppercase tracking-wider">Local</p>
                  {filteredSearch.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-2 hover:bg-light-gray transition-colors cursor-pointer">
                      <Avatar seed={item.seed} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-purple truncate">{item.label}</p>
                      </div>
                      <span className="text-[10px] font-medium text-dark-purple/40 bg-light-gray px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                  ))}
                </>
              )}
              {userResults.length === 0 && filteredSearch.length === 0 && (
                <p className="text-xs text-dark-purple/40 px-4 py-3">No results found</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-off-white rounded-xl p-4 border border-gray/20">
              <div className="flex items-center justify-between mb-3">
                <span className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon size={16} className="text-dark-purple" />
                </span>
                <span className="text-[11px] font-semibold text-dark-purple/50">{s.change}</span>
              </div>
              <p className="text-2xl font-bold text-dark-purple">{s.value}</p>
              <p className="text-xs text-dark-purple/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-off-white rounded-xl p-5 border border-gray/20">
            <h2 className="text-sm font-bold text-dark-purple mb-4">Recent Activity</h2>
            <div className="space-y-0">
              {activities.length > 0 ? activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-light-gray last:border-0">
                  <Avatar seed={a.seed} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-purple">
                      <span className="font-semibold">{a.user}</span>{" "}
                      <span className="text-dark-purple/70">{a.action}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-dark-purple/40 shrink-0">{a.time}</span>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-dark-purple/40">No recent activity</p>
                  <p className="text-xs text-dark-purple/30 mt-1">Your activity will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-off-white rounded-xl p-5 border border-gray/20">
              <h2 className="text-sm font-bold text-dark-purple mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: Send, color: "bg-dark-purple", label: "New Message" },
                  { icon: Camera, color: "bg-rose", label: "Share Photo" },
                  { icon: MapPin, color: "bg-light-green", label: "Send Location" },
                  { icon: Calendar, color: "bg-dark-purple/10", label: "Schedule Meet" },
                ].map((action, i) => {
                  const AIcon = action.icon
                  return (
                    <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
                      <span className={`w-7 h-7 rounded-md ${action.color} flex items-center justify-center`}>
                        <AIcon size={12} className={action.color === "bg-dark-purple" ? "text-off-white" : "text-dark-purple"} />
                      </span>
                      <span className="text-xs font-medium text-dark-purple">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-off-white rounded-xl p-5 border border-gray/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-dark-purple">Frequent</h2>
                <span className="text-[10px] text-dark-purple/50">See all</span>
              </div>
              <div className="flex gap-3">
                {contacts.slice(0, 4).map((c) => (
                  <div key={c.seed} className="flex flex-col items-center gap-1 cursor-pointer">
                    <Avatar seed={c.seed} size="md" status={c.online ? "online" : undefined} />
                    <span className="text-[10px] text-dark-purple/70 font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-off-white rounded-xl p-5 border border-gray/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-dark-purple">Continue Tasks</h2>
            <span className="text-[10px] text-dark-purple/50">{tasks.filter((t) => t.status === "todo").length} unfinished</span>
          </div>
          <div className="space-y-1">
            {continueTasks.length === 0 ? (
              <p className="text-sm text-dark-purple/30 text-center py-4">All tasks completed!</p>
            ) : continueTasks.map((t, i) => (
              <div key={t._id || i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-light-gray transition-colors cursor-pointer">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${i === 0 ? "border-rose bg-rose/20" : "border-dark-purple/30"}`}>
                  {i === 0 && <div className="w-2 h-2 rounded-sm bg-rose" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${i === 0 ? "text-dark-purple font-medium" : "text-dark-purple/60"}`}>{t.title}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  t.priority === "urgent" ? "bg-rose/40 text-dark-purple" :
                  t.priority === "high" ? "bg-light-green text-dark-purple" :
                  "bg-light-gray text-dark-purple/60"
                }`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-off-white rounded-2xl shadow-2xl border border-gray/20 flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray/20 bg-dark-purple">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-off-white" />
              <span className="text-sm font-semibold text-off-white">Chatme AI</span>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close AI chat"><X size={16} className="text-off-white/60 hover:text-off-white" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center py-6">
                <Bot size={28} className="text-dark-purple/20 mx-auto mb-2" />
                <p className="text-xs text-dark-purple/40">Ask me about your tasks, contacts, files, or anything in Chatme.</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-dark-purple text-off-white rounded-br-sm" : "bg-light-gray text-dark-purple rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-gray/20">
            <div className="flex items-center gap-2 bg-light-gray rounded-xl px-3 py-2">
              <input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm text-dark-purple outline-none placeholder:text-dark-purple/30"
              />
              <button onClick={handleChatSend} aria-label="Send message" className="p-1 rounded-lg hover:bg-dark-purple/10 transition-colors">
                <SendHorizonal size={16} className="text-dark-purple/60" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-dark-purple shadow-lg shadow-dark-purple/30 flex items-center justify-center transition-all z-40 hover:scale-105 ${chatOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        <Sparkles size={20} className="text-off-white" />
      </button>
    </div>
  )
}
