import { MessageSquare, Users, FileText, UserPlus, Send, Camera, MapPin, Calendar, ClipboardList } from "lucide-react"
import { dashboardStats } from "../../data/mock"

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

export default function Dashboard() {
  const stats = [
    { label: "Messages", value: "1,284", icon: MessageSquare, color: "bg-rose", change: "+12%", up: true },
    { label: "Active Chats", value: String(dashboardStats.onlineContacts), icon: Users, color: "bg-light-green", change: "+3", up: true },
    { label: "Tasks", value: String(dashboardStats.totalTasks), icon: ClipboardList, color: "bg-dark-purple/10", change: `${dashboardStats.unfinishedTasks} unfinished`, up: false },
    { label: "Contacts", value: String(dashboardStats.totalContacts), icon: FileText, color: "bg-green/20", change: String(dashboardStats.onlineContacts) + " online", up: true },
    { label: "Groups", value: String(dashboardStats.totalGroups), icon: UserPlus, color: "bg-rose/40", change: "+1", up: true },
  ]

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="px-8 py-6 bg-off-white border-b border-gray/30">
        <p className="text-xs font-semibold text-dark-purple/50 uppercase tracking-wider">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="text-2xl font-bold text-dark-purple mt-1">Good morning, Alex 👋</h1>
        <p className="text-sm text-dark-purple/60 mt-1">Here's what's happening with your chats today.</p>
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
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
                  <span className="w-7 h-7 rounded-md bg-dark-purple flex items-center justify-center">
                    <Send size={12} className="text-off-white" />
                  </span>
                  <span className="text-xs font-medium text-dark-purple">New Message</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
                  <span className="w-7 h-7 rounded-md bg-rose flex items-center justify-center">
                    <Camera size={12} className="text-dark-purple" />
                  </span>
                  <span className="text-xs font-medium text-dark-purple">Share Photo</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
                  <span className="w-7 h-7 rounded-md bg-light-green flex items-center justify-center">
                    <MapPin size={12} className="text-dark-purple" />
                  </span>
                  <span className="text-xs font-medium text-dark-purple">Send Location</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
                  <span className="w-7 h-7 rounded-md bg-dark-purple/10 flex items-center justify-center">
                    <Calendar size={12} className="text-dark-purple" />
                  </span>
                  <span className="text-xs font-medium text-dark-purple">Schedule Meet</span>
                </button>
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
    </div>
  )
}
