import { useState, useEffect, useRef, type ReactNode } from "react"
import { MessageSquare, Users, FileText, UserPlus, Send, Camera, MapPin, Calendar, ClipboardList, Search, Clock, Sparkles, X, Bot, SendHorizonal, Loader, ArrowRight } from "lucide-react"

import { tasks as tasksApi, contacts as contactsApi, users as usersApi, conversations as conversationsApi, upload as uploadApi, calendar as calendarApi, activity as activityApi } from "../../lib/api"
import { useToast } from "../../context/ToastContext"
import Avatar from "../ui/Avatar"
import { formatTime } from "../../lib/utils"
import type { Task, UserSearchResult, Contact } from "../../types"

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
    return `You can browse and join communities from the Communities tab. Create your own to bring people together!`
  }

  if (q.includes("file") || q.includes("document") || q.includes("upload")) {
    return `Files are in the Files tab. You can filter by Documents, Images, Videos, Audio, or Links.`
  }

  const taskMatch = tasks.find((t) => t.title.toLowerCase().includes(q))
  if (taskMatch) return `Found task "${taskMatch.title}" — ${taskMatch.status === "done" ? "completed" : taskMatch.priority + " priority"}`
  const contactMatch = contacts.find((c) => c.name.toLowerCase().includes(q))
  if (contactMatch) return `Found contact "${contactMatch.name}" — ${contactMatch.online ? "online" : "offline"}, ${contactMatch.role}`

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
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [userResults, setUserResults] = useState<UserSearchResult[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [newMsgContact, setNewMsgContact] = useState<Contact | null>(null)
  const [newMsgText, setNewMsgText] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [showSharePhoto, setShowSharePhoto] = useState(false)
  const [sharePhotoContact, setSharePhotoContact] = useState<Contact | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showSendLocation, setShowSendLocation] = useState(false)
  const [sendLocationContact, setSendLocationContact] = useState<Contact | null>(null)
  const [locationText, setLocationText] = useState("")
  const [sendingLocation, setSendingLocation] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleContact, setScheduleContact] = useState<Contact | null>(null)
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleStartTime, setScheduleStartTime] = useState("")
  const [scheduleEndTime, setScheduleEndTime] = useState("")
  const [scheduleMyEmail, setScheduleMyEmail] = useState("")
  const [scheduleTheirEmail, setScheduleTheirEmail] = useState("")
  const [scheduling, setScheduling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<{ type: string; text: string; time: string; id: string }[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<{ _id?: string; title: string; date: number; month: number; year: number; time: string }[]>([])

  useEffect(() => {
    let failed = false
    let mounted = true
    const fetchData = () => {
      Promise.all([
        tasksApi.list().then((data) => { if (mounted) setTasks(data.tasks.map((t: Record<string, string>) => ({ ...t, dueDate: new Date(t.dueDate) }))) }).catch(() => { failed = true; return null }),
        contactsApi.list().then((data) => { if (mounted) setContacts(data.contacts) }).catch(() => { failed = true; return null }),
        conversationsApi.list().then((data) => {
          if (mounted) {
            const convs = data.conversations || []
            setTotalUnread(convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0))
            setGroupCount(convs.filter((c: any) => c.isGroup).length)
          }
        }).catch(() => { failed = true; return null }),
        activityApi.list().then((data) => { if (mounted) setActivities(data.activities || []) }).catch(() => {}),
        calendarApi.list().then((data) => {
          if (mounted && data.events) {
            const now = new Date()
            const upcoming = data.events
              .filter((e: any) => new Date(e.year, e.month - 1, e.date) >= now)
              .sort((a: any, b: any) => new Date(a.year, a.month - 1, a.date).getTime() - new Date(b.year, b.month - 1, b.date).getTime())
              .slice(0, 3)
            setUpcomingEvents(upcoming)
          }
        }).catch(() => {}),
      ]).finally(() => { if (mounted) { setLoading(false); if (failed) toast("Some dashboard data failed to load", "error") } })
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  // Re-fetch total unread on custom event
  useEffect(() => {
    const handler = () => {
      conversationsApi.list().then((data) => {
        const convs = data.conversations || []
        setTotalUnread(convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0))
      }).catch(() => {})
    }
    window.addEventListener("unread-cleared", handler)
    return () => window.removeEventListener("unread-cleared", handler)
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
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  const allSearchData = [
    ...tasks.map((t) => ({ label: t.title, category: "Task", seed: t.seed })),
    ...contacts.map((c) => ({ label: c.name, category: "Contact", seed: c.seed })),
  ]

  const filteredSearch = searchQuery.trim()
    ? allSearchData.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const getTrend = (current: number, label: string) => {
    const prev = JSON.parse(localStorage.getItem("dashboardPrevStats") || "{}")
    const prevVal = prev[label] ?? -1
    return prevVal >= 0 && current !== prevVal
      ? current > prevVal ? { icon: "↑", color: "text-green" } : { icon: "↓", color: "text-red" }
      : null
  }

  const stats = [
    { label: "Unread", value: String(totalUnread), icon: MessageSquare, color: "bg-rose", change: totalUnread > 0 ? `${totalUnread} unread` : "All clear", trend: getTrend(totalUnread, "Unread") },
    { label: "Contacts", value: String(contacts.length), icon: Users, color: "bg-light-green", change: contacts.length > 0 ? `${contacts.length} total` : "No contacts yet", trend: getTrend(contacts.length, "Contacts") },
    { label: "Tasks", value: String(tasks.length), icon: ClipboardList, color: "bg-dark-purple/10", change: tasks.length > 0 ? `${tasks.filter((t) => t.status === "todo").length} unfinished` : "No tasks yet", trend: getTrend(tasks.length, "Tasks") },
    { label: "Favourites", value: String(contacts.filter((c) => c.favorite).length), icon: FileText, color: "bg-green/20", change: contacts.filter((c) => c.favorite).length > 0 ? "favourite contacts" : "No favourites yet", trend: null },
    { label: "Groups", value: String(groupCount), icon: UserPlus, color: "bg-gray/40", change: groupCount > 0 ? `${groupCount} total` : "No groups yet", trend: getTrend(groupCount, "Groups") },
  ]

  useEffect(() => {
    const current = { "Unread": totalUnread, "Contacts": contacts.length, "Tasks": tasks.length, "Groups": groupCount }
    localStorage.setItem("dashboardPrevStats", JSON.stringify(current))
  }, [totalUnread, contacts.length, tasks.length, groupCount])

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

  const handleNewMessageSend = async () => {
    if (!newMsgContact?.linkedUserId || !newMsgText.trim() || sendingMsg) return
    setSendingMsg(true)
    try {
      const data = await conversationsApi.create({ participants: [newMsgContact.linkedUserId] })
      if (data.conversation) {
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}")
        await conversationsApi.sendMessage(data.conversation._id, {
          content: newMsgText.trim(),
          senderName: currentUserData.name || "You",
          senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
          type: "text",
        })
        toast(`Message sent to ${newMsgContact.name}`, "success")
      }
    } catch {
      toast("Failed to send message", "error")
    }
    setSendingMsg(false)
    setShowNewMsg(false)
    setNewMsgContact(null)
    setNewMsgText("")
  }

  const handleSharePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !sharePhotoContact?.linkedUserId || uploadingPhoto) return
    setUploadingPhoto(true)
    try {
      const data = await uploadApi.file(file)
      const conv = await conversationsApi.create({ participants: [sharePhotoContact.linkedUserId] })
      if (conv.conversation) {
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}")
        await conversationsApi.sendMessage(conv.conversation._id, {
          content: data.url,
          senderName: currentUserData.name || "You",
          senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
          type: "image",
          fileUrl: data.url,
          fileName: data.filename,
          fileSize: data.size,
          fileMimeType: data.mimetype,
        })
        toast(`Photo sent to ${sharePhotoContact.name}`, "success")
      }
    } catch { toast("Failed to share photo", "error") }
    setUploadingPhoto(false)
    setShowSharePhoto(false)
    setSharePhotoContact(null)
    if (e.target) e.target.value = ""
  }

  const handleSendLocation = async () => {
    if (!sendLocationContact?.linkedUserId || !locationText.trim() || sendingLocation) return
    setSendingLocation(true)
    try {
      const conv = await conversationsApi.create({ participants: [sendLocationContact.linkedUserId] })
      if (conv.conversation) {
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}")
        await conversationsApi.sendMessage(conv.conversation._id, {
          content: `📍 ${locationText.trim()}`,
          senderName: currentUserData.name || "You",
          senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
          type: "text",
        })
        toast(`Location sent to ${sendLocationContact.name}`, "success")
      }
    } catch { toast("Failed to send location", "error") }
    setSendingLocation(false)
    setShowSendLocation(false)
    setSendLocationContact(null)
    setLocationText("")
  }

  const handleSchedule = async () => {
    if (!scheduleContact?.linkedUserId || !scheduleTitle.trim() || !scheduleDate || !scheduleStartTime || !scheduleEndTime || !scheduleMyEmail.trim() || !scheduleTheirEmail.trim() || scheduling) return
    setScheduling(true)
    try {
      const [y, m, d] = scheduleDate.split("-").map(Number)
      const [sh, sm] = scheduleStartTime.split(":").map(Number)
      const [eh, em] = scheduleEndTime.split(":").map(Number)
      const duration = (eh * 60 + em) - (sh * 60 + sm)
      if (duration <= 0) { toast("End time must be after start time", "error"); setScheduling(false); return }
      const result = await calendarApi.createMeeting({
        contactId: scheduleContact.linkedUserId,
        title: scheduleTitle.trim(),
        date: d,
        month: m,
        year: y,
        time: scheduleStartTime,
        duration,
        description: `Meeting with ${scheduleContact.name}`,
        myEmail: scheduleMyEmail.trim(),
        theirEmail: scheduleTheirEmail.trim(),
      })
      const md = result?.meetingDetails
      if (md?.myEmail && md?.theirEmail) {
        const text = `${md.fromName} invited you to a meeting:\n\nTitle: ${md.title}\nDate: ${md.date}\nTime: ${md.time}\nDuration: ${md.duration} min\n\n---\nSent via Chatme`
        const subject = encodeURIComponent(`Meeting Invitation: ${md.title}`)
        const body = encodeURIComponent(text)
        navigator.clipboard.writeText(text).catch(() => {})
        window.open(`mailto:${md.theirEmail}?cc=${md.myEmail}&subject=${subject}&body=${body}`)
        toast("Meeting details copied — paste & send in your email", "info")
      }
      toast(`Meeting scheduled with ${scheduleContact.name}`, "success")
    } catch { toast("Failed to schedule meeting", "error") }
    setScheduling(false)
    setShowSchedule(false)
    setScheduleContact(null)
    setScheduleTitle("")
    setScheduleDate("")
    setScheduleStartTime("")
    setScheduleEndTime("")
    setScheduleMyEmail("")
    setScheduleTheirEmail("")
  }

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" })
  }, [chatHistory])

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
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Search users, tasks, contacts..."
            className="w-full bg-light-gray text-dark-purple text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/10 focus:bg-off-white transition-all placeholder:text-dark-purple/25"
          />
          {showResults && (searchQuery.trim() || userResults.length > 0) && (
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="24" className="animate-spin text-dark-purple/30" />
          </div>
        ) : (<>
        <div className="grid grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-off-white rounded-xl p-4 border border-gray/20 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${s.color}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-dark-purple leading-none">{s.value}</p>
                  <p className="text-xs text-dark-purple/50 mt-2">{s.label}</p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {s.trend && <span className={`text-sm font-bold ${s.trend.color}`}>{s.trend.icon}</span>}
                  <span className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                    <s.icon size={18} className="text-dark-purple" />
                  </span>
                </div>
              </div>
              <p className={`text-[10px] font-semibold mt-3 ${s.change === "All clear" ? "text-green" : "text-dark-purple/40"}`}>{s.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2 bg-off-white rounded-xl p-5 border border-gray/20 max-h-[400px] flex flex-col">
            <h2 className="text-sm font-bold text-dark-purple mb-4 shrink-0">Activity</h2>
            <div className="flex-1 overflow-y-auto space-y-0">
              {activities.length > 0 ? (
                activities.slice(0, 10).map((a, i) => {
                  const icons: Record<string, ReactNode> = {
                    message: <Send size={12} className="text-rose" />,
                    notification: <Users size={12} className="text-light-green" />,
                    task: <ClipboardList size={12} className="text-dark-purple/60" />,
                    event: <Calendar size={12} className="text-dark-purple/40" />,
                  }
                  const ago = Math.floor((Date.now() - new Date(a.time).getTime()) / 60000)
                  const timeStr = ago < 1 ? "just now" : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`
                  return (
                    <div key={a.id || i} className="flex items-start gap-3 py-2.5 border-b border-light-gray last:border-0">
                      <span className="w-6 h-6 rounded-full bg-light-gray flex items-center justify-center shrink-0 mt-0.5">
                        {icons[a.type] || <div className="w-2 h-2 rounded-full bg-dark-purple" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-dark-purple leading-relaxed">{a.text}</p>
                        <p className="text-[10px] text-dark-purple/30 mt-0.5">{timeStr}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-dark-purple/40">No recent activity</p>
                  <p className="text-xs text-dark-purple/30 mt-1">Start using Chatme to see activity here</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 bg-off-white rounded-xl p-5 border border-gray/20">
            <h2 className="text-sm font-bold text-dark-purple mb-3">Upcoming</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((e, i) => (
                  <div key={e._id || i} className="flex items-start gap-2">
                    <div className="text-center w-10 shrink-0">
                      <p className="text-lg font-bold text-dark-purple leading-none">{e.date}</p>
                      <p className="text-[10px] text-dark-purple/40 uppercase">
                        {new Date(e.year, e.month - 1, e.date).toLocaleString("default", { month: "short" })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark-purple truncate">{e.title}</p>
                      <p className="text-[10px] text-dark-purple/40">{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Calendar size={20} className="text-dark-purple/20 mx-auto mb-1" />
                <p className="text-xs text-dark-purple/40">No upcoming events</p>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-4">
            <div className="bg-off-white rounded-xl p-5 border border-gray/20">
              <h2 className="text-sm font-bold text-dark-purple mb-4">Continue Tasks</h2>
              {continueTasks.length > 0 ? (
                <div className="space-y-0">
                  {continueTasks.map((t) => (
                    <div key={t._id} className="flex items-center gap-3 py-3 border-b border-light-gray last:border-0">
                      <Avatar seed={t.seed || t.title} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-purple truncate">{t.title}</p>
                        <p className="text-[11px] text-dark-purple/50">
                          {t.priority && <span className="font-medium capitalize">{t.priority}</span>}
                          {t.dueDate && <span> · Due {formatTime(t.dueDate)}</span>}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${t.priority === "urgent" ? "bg-red/20 text-dark-purple" : "bg-light-gray text-dark-purple/60"}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-dark-purple/40">All tasks completed</p>
                  <p className="text-xs text-dark-purple/30 mt-1">Great work!</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-off-white rounded-xl p-5 border border-gray/20">
                <h2 className="text-sm font-bold text-dark-purple mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { icon: Send, color: "bg-dark-purple", label: "New Message" },
                    { icon: Camera, color: "bg-rose", label: "Share Photo" },
                    { icon: MapPin, color: "bg-light-green", label: "Send Location" },
                    { icon: Calendar, color: "bg-dark-purple/10", label: "Schedule Meeting" },
                  ].map((action, i) => {
                    const AIcon = action.icon
                    return (
                      <button key={i} onClick={action.label === "New Message" ? () => setShowNewMsg(true) : action.label === "Share Photo" ? () => setShowSharePhoto(true) : action.label === "Send Location" ? () => setShowSendLocation(true) : action.label === "Schedule Meeting" ? () => setShowSchedule(true) : undefined} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left">
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
                <h2 className="text-sm font-bold text-dark-purple mb-3">Frequent</h2>
                <div className="space-y-2">
                  {contacts.slice(0, 4).map((c) => (
                    <div key={c.seed} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors cursor-pointer">
                      <Avatar seed={c.seed} size="md" status={c.online ? "online" : undefined} />
                      <span className="text-xs font-medium text-dark-purple flex-1">{c.name}</span>
                      {c.online && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </>)}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-off-white rounded-2xl shadow-2xl border border-gray/20 flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray/20 bg-dark-purple">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-off-white" />
              <span className="text-sm font-semibold text-off-white">Chatme AI</span>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close AI chat"><X size={16} className="text-off-white/60 hover:text-off-white" /></button>
          </div>
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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

      {showNewMsg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => { setShowNewMsg(false); setNewMsgContact(null); setNewMsgText("") }}>
          <div className="bg-off-white rounded-2xl w-[50vw] max-w-2xl shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-light-gray">
              <h3 className="text-lg font-bold text-dark-purple">New Message</h3>
              <button onClick={() => { setShowNewMsg(false); setNewMsgContact(null); setNewMsgText("") }} aria-label="Close"><X size="18" className="text-dark-purple/50" /></button>
            </div>
            <div className="p-5 border-b border-light-gray">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">Select Contact</p>
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {contacts.length === 0 ? (
                  <p className="text-sm text-dark-purple/40 py-6 text-center">No contacts yet</p>
                ) : contacts.map((c) => (
                  <div
                    key={c._id || c.linkedUserId}
                    onClick={() => setNewMsgContact(c)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${newMsgContact?._id === c._id ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
                  >
                    <Avatar seed={c.seed || c.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-purple truncate">{c.name}</p>
                    </div>
                    {c.online && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">
                Message {newMsgContact ? `to ${newMsgContact.name}` : ""}
              </p>
              <textarea
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full rounded-lg bg-light-gray p-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none resize-none"
              />
              <button
                onClick={handleNewMessageSend}
                disabled={!newMsgContact || !newMsgText.trim() || sendingMsg}
                className="w-full mt-4 h-10 rounded-lg bg-dark-purple flex items-center justify-center gap-2 hover:bg-deep-purple transition-colors text-off-white text-sm font-bold disabled:opacity-40"
              >
                {sendingMsg ? <Loader size="14" className="animate-spin" /> : <Send size="14" />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showSharePhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => { setShowSharePhoto(false); setSharePhotoContact(null) }}>
          <div className="bg-off-white rounded-2xl w-[50vw] max-w-2xl shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-light-gray">
              <h3 className="text-lg font-bold text-dark-purple">Share Photo</h3>
              <button onClick={() => { setShowSharePhoto(false); setSharePhotoContact(null) }} aria-label="Close"><X size="18" className="text-dark-purple/50" /></button>
            </div>
            <div className="p-5 border-b border-light-gray">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">Send to</p>
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {contacts.length === 0 ? (
                  <p className="text-sm text-dark-purple/40 py-6 text-center">No contacts yet</p>
                ) : contacts.map((c) => (
                  <div
                    key={c._id || c.linkedUserId}
                    onClick={() => setSharePhotoContact(c)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${sharePhotoContact?._id === c._id ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
                  >
                    <Avatar seed={c.seed || c.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-purple truncate">{c.name}</p>
                    </div>
                    {c.online && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">
                {sharePhotoContact ? `Photo to ${sharePhotoContact.name}` : "Select a contact first"}
              </p>
              <label className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-gray p-8 cursor-pointer hover:border-dark-purple/30 transition-colors ${!sharePhotoContact ? "opacity-40 pointer-events-none" : ""}`}>
                <Camera size="28" className="text-dark-purple/30 mb-2" />
                <span className="text-sm text-dark-purple/50">Click to choose a photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleSharePhoto} disabled={!sharePhotoContact || uploadingPhoto} />
              </label>
              {uploadingPhoto && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Loader size="14" className="animate-spin text-dark-purple" />
                  <span className="text-sm text-dark-purple/60">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSendLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => { setShowSendLocation(false); setSendLocationContact(null); setLocationText("") }}>
          <div className="bg-off-white rounded-2xl w-[50vw] max-w-2xl shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-light-gray">
              <h3 className="text-lg font-bold text-dark-purple">Send Location</h3>
              <button onClick={() => { setShowSendLocation(false); setSendLocationContact(null); setLocationText("") }} aria-label="Close"><X size="18" className="text-dark-purple/50" /></button>
            </div>
            <div className="p-5 border-b border-light-gray">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">Send to</p>
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {contacts.length === 0 ? (
                  <p className="text-sm text-dark-purple/40 py-6 text-center">No contacts yet</p>
                ) : contacts.map((c) => (
                  <div
                    key={c._id || c.linkedUserId}
                    onClick={() => setSendLocationContact(c)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${sendLocationContact?._id === c._id ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
                  >
                    <Avatar seed={c.seed || c.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-purple truncate">{c.name}</p>
                    </div>
                    {c.online && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">
                {sendLocationContact ? `Location to ${sendLocationContact.name}` : "Select a contact first"}
              </p>
              <div className="rounded-lg bg-light-gray p-4 mb-3 flex items-center justify-center">
                <MapPin size="32" className="text-dark-purple/30" />
                <span className="text-sm text-dark-purple/40 ml-2">📍 Share a place or address</span>
              </div>
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Enter location name or address..."
                className="w-full rounded-lg bg-light-gray p-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                disabled={!sendLocationContact}
              />
              <button
                onClick={handleSendLocation}
                disabled={!sendLocationContact || !locationText.trim() || sendingLocation}
                className="w-full mt-4 h-10 rounded-lg bg-dark-purple flex items-center justify-center gap-2 hover:bg-deep-purple transition-colors text-off-white text-sm font-bold disabled:opacity-40"
              >
                {sendingLocation ? <Loader size="14" className="animate-spin" /> : <MapPin size="14" />}
                Send Location
              </button>
            </div>
          </div>
        </div>
      )}

      {showSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => { setShowSchedule(false); setScheduleContact(null); setScheduleTitle(""); setScheduleDate(""); setScheduleStartTime(""); setScheduleEndTime(""); setScheduleMyEmail(""); setScheduleTheirEmail("") }}>
          <div className="bg-off-white rounded-2xl w-[50vw] max-w-2xl shadow-xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-light-gray shrink-0">
              <h3 className="text-lg font-bold text-dark-purple">Schedule Meeting</h3>
              <button onClick={() => { setShowSchedule(false); setScheduleContact(null); setScheduleTitle(""); setScheduleDate(""); setScheduleStartTime(""); setScheduleEndTime(""); setScheduleMyEmail(""); setScheduleTheirEmail("") }} aria-label="Close"><X size="18" className="text-dark-purple/50" /></button>
            </div>
            <div className="p-5 border-b border-light-gray">
              <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-3">With</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {contacts.length === 0 ? (
                  <p className="text-sm text-dark-purple/40 py-6 text-center">No contacts yet</p>
                ) : contacts.map((c) => (
                  <div
                    key={c._id || c.linkedUserId}
                    onClick={() => { setScheduleContact(c); if (!scheduleTitle.trim()) setScheduleTitle(`Meeting with ${c.name}`) }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${scheduleContact?._id === c._id ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
                  >
                    <Avatar seed={c.seed || c.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-purple truncate">{c.name}</p>
                    </div>
                    {c.online && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
            {scheduleContact && (
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center gap-2 text-sm text-dark-purple bg-light-gray rounded-lg px-4 py-2.5">
                  <Avatar seed={currentUser.username || currentUser.name || "user"} size="sm" />
                  <span className="font-semibold">{currentUser.name || "You"}</span>
                  <ArrowRight size="14" className="text-dark-purple/40 mx-1" />
                  <Avatar seed={scheduleContact.seed || scheduleContact.name} size="sm" />
                  <span className="font-semibold">{scheduleContact.name}</span>
                </div>
              </div>
            )}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">Title</p>
                <input
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="Meeting title..."
                  className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">Date</p>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple outline-none"
                  />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">Start Time</p>
                  <select
                    value={scheduleStartTime}
                    onChange={(e) => { setScheduleStartTime(e.target.value); if (!scheduleEndTime || scheduleEndTime <= e.target.value) setScheduleEndTime(e.target.value) }}
                    className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select start</option>
                    {Array.from({ length: 48 }, (_, i) => {
                      const h = String(Math.floor(i / 2)).padStart(2, "0")
                      const m = i % 2 === 0 ? "00" : "30"
                      const label = `${Math.floor(i / 2) > 12 ? Math.floor(i / 2) - 12 : Math.floor(i / 2) === 0 ? 12 : Math.floor(i / 2)}:${m} ${Math.floor(i / 2) < 12 ? "AM" : "PM"}`
                      return <option key={i} value={`${h}:${m}`}>{label}</option>
                    })}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">End Time</p>
                  <select
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select end</option>
                    {Array.from({ length: 48 }, (_, i) => {
                      const h = String(Math.floor(i / 2)).padStart(2, "0")
                      const m = i % 2 === 0 ? "00" : "30"
                      const val = `${h}:${m}`
                      const disabled = scheduleStartTime && val <= scheduleStartTime
                      const label = `${Math.floor(i / 2) > 12 ? Math.floor(i / 2) - 12 : Math.floor(i / 2) === 0 ? 12 : Math.floor(i / 2)}:${m} ${Math.floor(i / 2) < 12 ? "AM" : "PM"}`
                      return <option key={i} value={val} disabled={!!disabled}>{label}</option>
                    })}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">Your Email</p>
                  <input
                    type="email"
                    value={scheduleMyEmail}
                    onChange={(e) => setScheduleMyEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-purple/40 uppercase tracking-wider mb-2">Their Email</p>
                  <input
                    type="email"
                    value={scheduleTheirEmail}
                    onChange={(e) => setScheduleTheirEmail(e.target.value)}
                    placeholder="participant@example.com"
                    className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSchedule}
                disabled={!scheduleContact || !scheduleTitle.trim() || !scheduleDate || !scheduleStartTime || !scheduleEndTime || !scheduleMyEmail.trim() || !scheduleTheirEmail.trim() || scheduling}
                className="w-full mt-1 h-10 rounded-lg bg-dark-purple flex items-center justify-center gap-2 hover:bg-deep-purple transition-colors text-off-white text-sm font-bold disabled:opacity-40"
              >
                {scheduling ? <Loader size="14" className="animate-spin" /> : <Calendar size="14" />}
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-dark-purple shadow-lg shadow-dark-purple/30 flex items-center justify-center transition-all z-40 hover:scale-105 ${chatOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        <Sparkles size={20} className="text-off-white" />
      </button>
    </div>
  )
}
