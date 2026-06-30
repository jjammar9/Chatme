import { useState, useEffect, useRef, useContext } from "react"
import { ArrowLeft, Send, Loader, Users, X, Pin, Trash2 } from "lucide-react"
import Avatar from "../ui/Avatar"
import { conversations as conversationsApi, communities as communitiesApi } from "../../lib/api"
import { formatTime } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { SocketContext } from "../../context/SocketContext"
import type { Message } from "../../types"
import type { Community } from "../../types"

interface Props {
  community: Community
  onBack: () => void
}

export default function CommunityDetail({ community, onBack }: Props) {
  const { toast } = useToast()
  const { socket } = useContext(SocketContext)
  const currentUserId = localStorage.getItem("userId") || ""
  const currentUserName = JSON.parse(localStorage.getItem("user") || "{}").name || "You"
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [members, setMembers] = useState(community.memberDetails || [])
  const [announcement, setAnnouncement] = useState(community.announcement || "")
  const [editingAnnouncement, setEditingAnnouncement] = useState(false)
  const [announceText, setAnnounceText] = useState(community.announcement || "")
  const [showKickConfirm, setShowKickConfirm] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isAdmin = community.admins?.includes(currentUserId)

  useEffect(() => {
    if (!community.conversationId) { setLoading(false); return }
    conversationsApi.messages(community.conversationId).then((data) => {
      setMessages(data.messages || [])
      setLoading(false)
    }).catch(() => { setLoading(false); toast("Failed to load messages", "error") })
  }, [community.conversationId])

  useEffect(() => {
    if (!socket || !community.conversationId) return
    socket.emit("join:conversation", community.conversationId)
    const handleReceived = (msg: Message) => {
      setMessages((prev) => {
        const tempIdx = prev.findIndex((m) => m._id.startsWith("temp-"))
        if (tempIdx >= 0) {
          const updated = [...prev]
          updated[tempIdx] = { ...updated[tempIdx], ...msg, _id: msg._id }
          return updated
        }
        if (prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }
    const handleUpdated = (msg: Message) => {
      setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, ...msg } : m))
    }
    const handleDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.map((m) => m._id === data.messageId ? { ...m, isDeleted: true, content: "" } : m))
    }
    socket.on("message:received", handleReceived)
    socket.on("message:updated", handleUpdated)
    socket.on("message:deleted", handleDeleted)
    return () => {
      socket.emit("leave:conversation", community.conversationId)
      socket.off("message:received", handleReceived)
      socket.off("message:updated", handleUpdated)
      socket.off("message:deleted", handleDeleted)
    }
  }, [socket, community.conversationId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending || !community.conversationId) return
    setSending(true)
    const content = text.trim()
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      _id: tempId, conversationId: community.conversationId, senderId: currentUserId,
      content, type: "text", senderName: currentUserName, senderSeed: currentUserName,
      createdAt: new Date().toISOString(), readBy: [], isDeleted: false,
    }
    setMessages((prev) => [...prev, optimistic])
    setText("")
    try {
      const data = await conversationsApi.sendMessage(community.conversationId, {
        content, senderName: currentUserName,
        senderSeed: currentUserName, type: "text",
      })
      if (data.message) {
        setMessages((prev) => prev.map((m) => m._id === tempId ? { ...m, _id: data.message._id } : m))
      }
    } catch { toast("Failed to send", "error"); setText(content) }
    setSending(false)
  }

  const handleKick = async (userId: string) => {
    try {
      await communitiesApi.update(community._id!, { kickUserId: userId })
      setMembers((prev) => prev.filter((m) => m.linkedUserId !== userId))
      toast("Member removed", "success")
    } catch { toast("Failed to remove member", "error") }
    setShowKickConfirm(null)
  }

  const handleSaveAnnouncement = async () => {
    try {
      await communitiesApi.update(community._id!, { announcement: announceText })
      setAnnouncement(announceText)
      setEditingAnnouncement(false)
      toast("Announcement saved", "success")
    } catch { toast("Failed to save announcement", "error") }
  }

  return (
    <div className="h-full flex flex-col bg-off-white">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray/20 shrink-0">
        <button onClick={onBack} aria-label="Back" className="hover:bg-light-gray rounded-lg p-1.5 transition-colors">
          <ArrowLeft size="18" className="text-dark-purple" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar seed={community.name} size="md" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-dark-purple truncate">{community.name}</h2>
            <p className="text-xs text-dark-purple/50">{community.memberCount} {community.memberCount === 1 ? "member" : "members"} · {community.onlineCount} online</p>
          </div>
        </div>
      </div>

      {announcement && !editingAnnouncement && (
        <div className="bg-rose/20 border-b border-rose/30 px-6 py-3 flex items-start gap-2">
          <Pin size="14" className="text-dark-purple/50 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-dark-purple/50 uppercase">Announcement</p>
            <p className="text-sm text-dark-purple mt-0.5">{announcement}</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditingAnnouncement(true); setAnnounceText(announcement) }} aria-label="Edit announcement" className="text-dark-purple/40 hover:text-dark-purple shrink-0">
              <span className="text-xs underline">Edit</span>
            </button>
          )}
        </div>
      )}

      {editingAnnouncement && (
        <div className="bg-rose/20 border-b border-rose/30 px-6 py-3">
          <p className="text-[10px] font-semibold text-dark-purple/50 uppercase mb-2">Set Announcement</p>
          <textarea value={announceText} onChange={(e) => setAnnounceText(e.target.value)} rows={2}
            className="w-full rounded-lg bg-off-white p-2 text-sm text-dark-purple outline-none resize-none" placeholder="Write an announcement..." />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleSaveAnnouncement} className="text-xs font-bold text-dark-purple bg-light-green px-3 py-1.5 rounded-lg hover:bg-light-green/70 transition-colors">Save</button>
            <button onClick={() => { setEditingAnnouncement(false); setAnnounceText(announcement) }} className="text-xs text-dark-purple/50 hover:text-dark-purple transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray/20">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader size="24" className="animate-spin text-dark-purple/30" /></div>
          ) : !community.conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Users size="40" className="text-dark-purple/20 mb-3" />
              <p className="text-sm font-semibold text-dark-purple/40">No chat available yet</p>
              <p className="text-xs text-dark-purple/30 mt-1">Chat will be available when members join</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <p className="text-sm font-semibold text-dark-purple/40">No messages yet</p>
              <p className="text-xs text-dark-purple/30 mt-1">Start the conversation!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isMe ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple"} rounded-2xl px-4 py-2.5`}
                      style={{ borderRadius: isMe ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem" }}>
                      {!isMe && <p className="text-[10px] font-semibold text-dark-purple/50 mb-0.5">{msg.senderName || "Unknown"}</p>}
                      {msg.isDeleted ? (
                        <p className="text-xs italic opacity-50">Message deleted</p>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      <p className={`text-[10px] text-right mt-1 ${isMe ? "text-off-white/60" : "text-dark-purple/40"}`}>
                        {formatTime(msg.createdAt)}
                        {msg.editedAt && <span className="ml-1 italic">edited</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}

          {community.conversationId && (
            <div className="border-t border-gray/20 px-6 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text" placeholder="Type a message..." value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  className="flex-1 h-10 rounded-xl bg-light-gray px-4 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                  aria-label="Message input"
                />
                <button onClick={handleSend} disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send message">
                  {sending ? <Loader size="16" className="animate-spin text-off-white" /> : <Send size="16" className="text-off-white" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-60 shrink-0 overflow-y-auto p-4 border-r border-gray/20">
          {isAdmin && (
            <button onClick={() => setEditingAnnouncement(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-light-gray hover:bg-gray/30 transition-colors text-left mb-4">
              <Pin size="14" className="text-dark-purple/60" />
              <span className="text-xs font-medium text-dark-purple">{announcement ? "Edit Announcement" : "Add Announcement"}</span>
            </button>
          )}
          <h3 className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider mb-3">Members ({members.length})</h3>
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-light-gray/50 transition-colors group relative">
              <Avatar seed={m.avatarSeed} size="sm" status={m.online ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-dark-purple truncate">{m.name}</p>
                {community.admins?.includes(m.linkedUserId || "") && (
                  <p className="text-[10px] text-dark-purple/40">Admin</p>
                )}
              </div>
              {isAdmin && m.linkedUserId !== currentUserId && (
                <button onClick={() => setShowKickConfirm(m.linkedUserId)} aria-label="Remove member"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red/20">
                  <X size="12" className="text-red" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="w-48 shrink-0 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider mb-3">Info</h3>
          <p className="text-xs text-dark-purple/70 mb-2 leading-relaxed">{community.description}</p>
          {community.tags && community.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {community.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-light-gray text-dark-purple/60 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showKickConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowKickConfirm(null)}>
          <div className="bg-off-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-purple mb-2">Remove member?</h3>
            <p className="text-sm text-dark-purple/60 mb-4">This will remove them from the community and conversation. They can rejoin if invited.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowKickConfirm(null)} className="flex-1 h-10 rounded-lg bg-light-gray text-dark-purple text-sm font-semibold hover:bg-gray/30 transition-colors">Cancel</button>
              <button onClick={() => handleKick(showKickConfirm)} className="flex-1 h-10 rounded-lg bg-red text-off-white text-sm font-semibold hover:bg-red/80 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}