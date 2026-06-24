import { useState, useEffect } from "react"
import { MessageSquare, Users, FileText, UserPlus, Send, Camera, MapPin, Calendar, ClipboardList, Search, Clock, Sparkles, X, Bot, SendHorizonal } from "lucide-react"
import { dashboardStats, mockTasks, mockContacts, mockCommunities } from "../../data/mock"
import { useToast } from "../../context/ToastContext"

const activities = [
  { user: "Sarah Johnson", action: "reacted 👍 to your message", time: "2 min ago", seed: "Sarah" },
  { user: "Maya Patel", action: "sent a photo in Project Squad", time: "15 min ago", seed: "Maya" },
  { user: "Jordan Kim", action: "uploaded design-mockup.png", time: "1h ago", seed: "Jordan" },
  { user: "Taylor Reed", action: "mentioned you in the group", time: "2h ago", seed: "Taylor" },
  { user: "Alex Chen", action: "shared a file sprint-plan.pdf", time: "3h ago", seed: "Alex" },
]

const frequent = [
  { name: "Sarah", seed: "Sarah", online: true },
  { name: "Maya", seed: "Maya", online: true },
  { name: "Jordan", seed: "Jordan", online: false },
  { name: "Taylor", seed: "Taylor", online: true },
  { name: "Alex", seed: "Alex", online: false },
  { name: "Emily", seed: "Emily", online: true },
]

const allSearchData = [
  ...mockTasks.map((t) => ({ label: t.title, category: "Task", seed: t.seed })),
  ...mockContacts.map((c) => ({ label: c.name, category: "Contact", seed: c.seed })),
  ...mockCommunities.map((c) => ({ label: c.name, category: "Group", seed: c.seeds[0] })),
]

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

const aiResponses: Record<string, string> = {
  hello: "Hi there! How can I help you today?",
  tasks: "You have 12 tasks total — 11 still to do and 1 completed. The most urgent one is 'Finalize Q3 roadmap presentation'.",
  "what's due today": "You have 2 tasks due today: 'Finalize Q3 roadmap presentation' (urgent) and 'Review design system components' (high priority).",
  contacts: "You have 8 contacts. 4 are currently online: Sarah Johnson, Alex Chen, Jordan Kim, and Taylor Reed.",
  groups: "You're in 12 groups. The most active one is 'Design Talks' with 7 members online.",
  files: "You've shared 15 files. The most recent is 'sprint-plan.pdf' shared by Sarah Johnson.",
  messages: "You have 1,284 messages across your chats.",
}

export default function Dashboard() {
  const { toast } = useToast()
  const [now, setNow] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([])

  useEffect(() => { toast("Welcome to Chatme", "success") }, [])
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const filteredSearch = searchQuery.trim()
    ? allSearchData.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const stats = [
    { label: "Messages", value: "1,284", icon: MessageSquare, color: "bg-rose", change: "+12%", up: true },
    { label: "Active Chats", value: String(dashboardStats.onlineContacts), icon: Users, color: "bg-light-green", change: "+3", up: true },
    { label: "Tasks", value: String(dashboardStats.totalTasks), icon: ClipboardList, color: "bg-dark-purple/10", change: `${dashboardStats.unfinishedTasks} unfinished`, up: false },
    { label: "Contacts", value: String(dashboardStats.totalContacts), icon: FileText, color: "bg-green/20", change: String(dashboardStats.onlineContacts) + " online", up: true },
    { label: "Groups", value: String(dashboardStats.totalGroups), icon: UserPlus, color: "bg-rose/40", change: "+1", up: true },
  ]

  const handleChatSend = () => {
    if (!chatMsg.trim()) return
    const userMsg = chatMsg.trim().toLowerCase()
    setChatHistory((prev) => [...prev, { role: "user", text: chatMsg.trim() }])
    setChatMsg("")
    setTimeout(() => {
      const match = Object.entries(aiResponses).find(([key]) => userMsg.includes(key))
      setChatHistory((prev) => [...prev, { role: "bot", text: match ? match[1] : "I can help you find tasks, contacts, groups, files, or messages. Try asking something like 'what's due today?' or 'show my contacts'." }])
    }, 400)
  }

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="px-8 py-5 bg-off-white border-b border-gray/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-dark-purple/50 uppercase tracking-wider">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="text-2xl font-bold text-dark-purple mt-1">{greeting}, Alex 👋</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-light-gray rounded-xl px-3.5 py-2">
              <Clock size={14} className="text-dark-purple/40" />
              <span className="text-sm font-semibold text-dark-purple tabular-nums">{formatTime(now)}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/30" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search tasks, contacts, groups..."
            className="w-full bg-light-gray text-dark-purple text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/10 focus:bg-off-white transition-all placeholder:text-dark-purple/25"
          />
          {showResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-off-white rounded-xl shadow-lg border border-gray/20 py-1.5 z-10 max-h-60 overflow-y-auto">
              {filteredSearch.length === 0 ? (
                <p className="text-xs text-dark-purple/40 px-4 py-3">No results found</p>
              ) : (
                filteredSearch.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2 hover:bg-light-gray transition-colors cursor-pointer">
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-light-gray shrink-0">
                      <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${item.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-purple truncate">{item.label}</p>
                    </div>
                    <span className="text-[10px] font-medium text-dark-purple/40 bg-light-gray px-2 py-0.5 rounded-full">{item.category}</span>
                  </div>
                ))
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
                <span className={`text-[11px] font-semibold ${s.up ? "text-green" : "text-dark-purple/50"}`}>{s.change}</span>
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
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-light-gray last:border-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-light-gray shrink-0">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${a.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-purple">
                      <span className="font-semibold">{a.user}</span>{" "}
                      <span className="text-dark-purple/70">{a.action}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-dark-purple/40 shrink-0">{a.time}</span>
                </div>
              ))}
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
                {frequent.slice(0, 4).map((f) => (
                  <div key={f.seed} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-light-gray">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${f.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                      </div>
                      {f.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green ring-2 ring-off-white" />}
                    </div>
                    <span className="text-[10px] text-dark-purple/70 font-medium">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-off-white rounded-xl p-5 border border-gray/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-dark-purple">Continue Tasks</h2>
            <span className="text-[10px] text-dark-purple/50">{dashboardStats.unfinishedTasks} unfinished</span>
          </div>
          <div className="space-y-1">
            {[
              { task: "Review design mockups", priority: "High", tag: "Design" },
              { task: "Update API documentation", priority: "Medium", tag: "Dev" },
              { task: "Prepare sprint presentation", priority: "High", tag: "Work" },
              { task: "Reply to Sarah's message", priority: "Low", tag: "Chat" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-light-gray transition-colors cursor-pointer">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${i === 0 ? "border-rose bg-rose/20" : "border-dark-purple/30"}`}>
                  {i === 0 && <div className="w-2 h-2 rounded-sm bg-rose" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${i === 0 ? "text-dark-purple font-medium" : "text-dark-purple/60"}`}>{t.task}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  t.priority === "High" ? "bg-rose/40 text-dark-purple" :
                  t.priority === "Medium" ? "bg-light-green text-dark-purple" :
                  "bg-light-gray text-dark-purple/60"
                }`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-off-white rounded-2xl shadow-2xl border border-gray/20 flex flex-col z-50 overflow-hidden" style={{ animation: "fade-in 0.2s ease-out" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray/20 bg-dark-purple">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-off-white" />
              <span className="text-sm font-semibold text-off-white">Chatme AI</span>
            </div>
            <button onClick={() => setChatOpen(false)}><X size={16} className="text-off-white/60 hover:text-off-white" /></button>
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
              <button onClick={handleChatSend} className="p-1 rounded-lg hover:bg-dark-purple/10 transition-colors">
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
