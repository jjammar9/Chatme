import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Send, Loader, Users } from "lucide-react"
import Avatar from "../ui/Avatar"
import { conversations as conversationsApi } from "../../lib/api"
import { formatTime } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import type { Message } from "../../types"
import type { Community } from "../../types"

interface Props {
  community: Community
  onBack: () => void
}

export default function CommunityDetail({ community, onBack }: Props) {
  const { toast } = useToast()
  const currentUserId = localStorage.getItem("userId") || ""
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!community.conversationId) { setLoading(false); return }
    conversationsApi.messages(community.conversationId).then((data) => {
      setMessages(data.messages || [])
      setLoading(false)
    }).catch(() => { setLoading(false); toast("Failed to load messages", "error") })
  }, [community.conversationId])

  useEffect(() => { bottomRef.current?.scrollIntoView() }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending || !community.conversationId) return
    setSending(true)
    const content = text.trim()
    setText("")
    try {
      const data = await conversationsApi.sendMessage(community.conversationId, content)
      if (data.message) setMessages((prev) => [...prev, data.message])
    } catch { toast("Failed to send", "error"); setText(content) }
    setSending(false)
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

        <div className="w-60 shrink-0 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider mb-3">Members</h3>
          {community.memberDetails.map((m, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-light-gray/50 transition-colors">
              <Avatar seed={m.avatarSeed} size="sm" status={m.online ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-dark-purple truncate">{m.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}