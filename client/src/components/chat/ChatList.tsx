import { useState, useEffect, useRef } from "react"
import { Heart, Search, Video, Phone, Users, Send, Smile, Paperclip, Image, Camera, Mic, MapPin, Loader } from "lucide-react"
import Avatar from "../ui/Avatar"
import { conversations } from "../../lib/api"
import type { Conversation, Message } from "../../types/conversation"
import { getAvatarUrl, formatTime } from "../../lib/utils"

interface ChatListProps {
  selectedConversation: Conversation | null
}

function getDisplayName(conv?: Conversation | null): string {
  if (!conv) return ""
  if (conv.isGroup) return conv.groupName || "Group"
  return conv.participantDetails?.[0]?.name || "Unknown"
}

function getAvatarSeed(conv?: Conversation | null): string {
  if (!conv) return ""
  if (conv.isGroup) return conv.groupName || "group"
  return conv.participantDetails?.[0]?.avatarSeed || conv.participantDetails?.[0]?.name || "user"
}

export default function ChatList({ selectedConversation }: ChatListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = localStorage.getItem("userId") || ""
  const currentUserData = JSON.parse(localStorage.getItem("user") || "{}")
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const convId = selectedConversation?._id || null

  useEffect(() => {
    if (!convId) return
    setLoading(true)

    // Mark messages as read when opening conversation
    conversations.markRead(convId).catch(() => {})

    conversations.messages(convId).then((data) => {
      setMessages(data.messages || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const data = await conversations.messages(convId)
        setMessages(data.messages || [])
      } catch {}
    }, 3000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [convId])

  useEffect(() => {
    if (!messagesEndRef.current) return
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !convId || sending) return
    setSending(true)
    try {
      const data = await conversations.sendMessage(convId, {
        content: text.trim(),
        senderName: currentUserData.name || "You",
        senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
        type: "text",
      })
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        setText("")
      }
    } catch (e) {
      console.error("Failed to send message", e)
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!convId) {
    return (
      <div className="h-full bg-off-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-light-gray flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-dark-purple/40">Select a conversation</p>
        <p className="text-xs text-dark-purple/30 mt-1">Choose a chat or start a new message</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-light-gray flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-off-white border-b border-light-gray">
        <div className="flex items-center gap-3">
          <Avatar seed={getAvatarSeed(selectedConversation)} alt={getDisplayName(selectedConversation)} size="md" />
          <div>
            <p className="text-sm font-bold text-dark-purple">{getDisplayName(selectedConversation)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Favourite">
            <Heart size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Search">
            <Search size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Video call">
            <Video size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Phone call">
            <Phone size={16} className="text-off-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader size="20" className="animate-spin text-dark-purple/30" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1" className="text-dark-purple/20 mb-3">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-bold text-dark-purple/40">No messages yet</p>
            <p className="text-xs text-dark-purple/30 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 px-8`}>
                {!isMe && (
                  <div className="shrink-0">
                    <Avatar seed={msg.senderSeed || msg.senderName} size="sm" />
                  </div>
                )}
                <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
                  {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
                  <div className={`inline-block ${isMe ? "bg-dark-purple rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} px-4 py-2.5`}>
                    <p className={`text-sm ${isMe ? "text-off-white" : "text-dark-purple"} whitespace-pre-wrap break-words`}>{msg.content}</p>
                    <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"} text-right block mt-1`}>
                      {formatTime(new Date(msg.createdAt))}
                    </span>
                  </div>
                </div>
                {isMe && (
                  <div className="shrink-0">
                    <Avatar seed={currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user"} size="sm" />
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 bg-off-white border-t border-light-gray">
        <div className="flex items-center gap-1 h-10">
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Add emoji">
            <Smile size="16" className="text-dark-purple" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Attach file">
            <Paperclip size="16" className="text-dark-purple" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Add image">
            <Image size="16" className="text-dark-purple" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Record video">
            <Camera size="16" className="text-dark-purple" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Record audio">
            <Mic size="16" className="text-dark-purple" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Share location">
            <MapPin size="16" className="text-dark-purple" />
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-light-gray rounded-xl h-10 px-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-dark-purple placeholder-dark-purple/40 outline-none"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors shrink-0 disabled:opacity-40"
            aria-label="Send message"
          >
            {sending ? <Loader size="16" className="animate-spin text-off-white" /> : <Send size="16" className="text-off-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}