import { useState, useEffect, useRef, useMemo } from "react"
import { Heart, Search, Video, Phone, Send, Smile, Paperclip, Image, Loader, FileText, X, Download, Mic, MicOff, Play, Pause, MessageCircle, File } from "lucide-react"
import Avatar from "../ui/Avatar"
import EmojiPicker from "./EmojiPicker"
import { conversations, upload as uploadApi } from "../../lib/api"
import type { Conversation, Message } from "../../types/conversation"
import { formatTime, playMessageSound } from "../../lib/utils"

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
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localFav, setLocalFav] = useState<boolean>(selectedConversation?.isFavourite || false)
  const [recording, setRecording] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTab, setSearchTab] = useState<"messages" | "files" | "media" | "voice">("messages")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [voiceProgress, setVoiceProgress] = useState<Record<string, number>>({})
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>>()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = localStorage.getItem("userId") || ""
  const currentUserData = JSON.parse(localStorage.getItem("user") || "{}")
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const convId = selectedConversation?._id || null

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { messages: [], files: [], media: [], voice: [] }
    const q = searchQuery.toLowerCase()
    const msgs = messages.filter((m) => m.type === "text" && m.content.toLowerCase().includes(q))
    const files = messages.filter((m) => m.type === "file" && (m.fileName || "").toLowerCase().includes(q))
    const media = messages.filter((m) => m.type === "image")
    const voice = messages.filter((m) => m.type === "voice")
    return { messages: msgs, files, media, voice }
  }, [messages, searchQuery])

  useEffect(() => {
    setLocalFav(selectedConversation?.isFavourite || false)
  }, [selectedConversation?._id, selectedConversation?.isFavourite])

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
        const newMsgs = (data.messages || [])
        setMessages((prev) => {
          const realPrev = prev.filter((m) => !m._id.startsWith("temp-"))
          const added = newMsgs.filter((m) => !realPrev.some((r) => r._id === m._id))
          if (added.length > 0) {
            const hasIncoming = added.some((m: Message) => m.senderId !== currentUserId)
            if (hasIncoming) playMessageSound()
          }
          return newMsgs
        })
      } catch {}
    }, 3000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [convId])

  useEffect(() => {
    if (!messagesEndRef.current) return
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!previewUrl) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewUrl(null) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [previewUrl])

  useEffect(() => {
    if (!showEmoji) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".emoji-picker-area")) setShowEmoji(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowEmoji(false) }
    setTimeout(() => { document.addEventListener("mousedown", handler); document.addEventListener("keydown", keyHandler) }, 0)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler) }
  }, [showEmoji])

  const handleSend = async () => {
    if (!text.trim() || !convId || sending) return
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: Message = {
      _id: tempId,
      conversationId: convId,
      senderId: currentUserId,
      senderName: currentUserData.name || "You",
      senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
      content: text.trim(),
      type: "text",
      readBy: [currentUserId],
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setText("")
    setShowEmoji(false)
    setSending(true)
    try {
      const data = await conversations.sendMessage(convId, {
        content: text.trim(),
        senderName: currentUserData.name || "You",
        senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
        type: "text",
      })
      if (data.message) {
        setMessages((prev) => {
          const hasTemp = prev.some((m) => m._id === tempId)
          if (hasTemp) return prev.map((m) => m._id === tempId ? data.message : m)
          const exists = prev.some((m) => m._id === data.message._id)
          return exists ? prev : [...prev, data.message]
        })
      }
    } catch (e) {
      console.error("Failed to send message", e)
      setMessages((prev) => prev.filter((m) => m._id !== tempId))
    }
    setSending(false)
  }

  const handleEmoji = (emoji: string) => {
    setText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !convId) return
    setUploading(true)
    try {
      const data = await uploadApi.file(file)
      await conversations.sendMessage(convId, {
        content: data.url,
        senderName: currentUserData.name || "You",
        senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
        type: "image",
        fileUrl: data.url,
        fileName: data.filename,
        fileSize: data.size,
        fileMimeType: data.mimetype,
      })
      const msgs = await conversations.messages(convId)
      setMessages(msgs.messages || [])
    } catch (e) {
      console.error("Failed to upload image", e)
    }
    setUploading(false)
    if (e.target) e.target.value = ""
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !convId) return
    setUploading(true)
    try {
      const data = await uploadApi.file(file)
      await conversations.sendMessage(convId, {
        content: data.url,
        senderName: currentUserData.name || "You",
        senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
        type: "file",
        fileUrl: data.url,
        fileName: data.filename,
        fileSize: data.size,
        fileMimeType: data.mimetype,
      })
      const msgs = await conversations.messages(convId)
      setMessages(msgs.messages || [])
    } catch (e) {
      console.error("Failed to upload file", e)
    }
    setUploading(false)
    if (e.target) e.target.value = ""
  }

  const handleToggleFav = async () => {
    if (!convId) return
    try {
      const data = await conversations.toggleFavourite(convId)
      setLocalFav(data.isFavourite)
      window.dispatchEvent(new CustomEvent("conversation-fav-update"))
    } catch {}
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch {}
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      recordedChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
        if (blob.size === 0 || !convId) return
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" })
        setUploading(true)
        try {
          const data = await uploadApi.file(file)
          await conversations.sendMessage(convId, {
            content: data.url,
            senderName: currentUserData.name || "You",
            senderSeed: currentUserData.avatarSeed || currentUserData.username || currentUserData.name || "user",
            type: "voice",
            fileUrl: data.url,
            fileName: data.filename,
            fileSize: data.size,
            fileMimeType: data.mimetype,
          })
          const msgs = await conversations.messages(convId)
          setMessages(msgs.messages || [])
        } catch {}
        setUploading(false)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setRecordingDuration(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1)
      }, 1000)
    } catch {}
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    setRecordingDuration(0)
  }

  const toggleVoicePlay = (url: string) => {
    if (playingVoice === url) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingVoice(null)
    } else {
      audioRef.current?.pause()
      const audio = new Audio(url)
      audio.ontimeupdate = () => {
        if (audio.duration) setVoiceProgress((prev) => ({ ...prev, [url]: audio.currentTime / audio.duration }))
      }
      audio.onended = () => { setPlayingVoice(null); setVoiceProgress((prev) => ({ ...prev, [url]: 0 })); audioRef.current = null }
      audio.play().catch(() => {})
      audioRef.current = audio
      setPlayingVoice(url)
      setVoiceProgress((prev) => ({ ...prev, [url]: 0 }))
    }
  }

  const handleEditStart = (msg: Message) => {
    setEditingMsgId(msg._id)
    setEditText(msg.content)
  }

  const handleEditCancel = () => {
    setEditingMsgId(null)
    setEditText("")
  }

  const handleEditSave = async (msgId: string) => {
    if (!editText.trim() || !convId) return
    try {
      const data = await conversations.editMessage(convId, msgId, editText.trim())
      if (data.message) {
        setMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m))
        handleEditCancel()
      }
    } catch (e) {
      console.error("Failed to edit message", e)
    }
  }

  const handleDelete = async (msgId: string, mode: "me" | "everyone") => {
    if (!convId) return
    try {
      const data = await conversations.deleteMessage(convId, msgId, mode)
      if (mode === "me" || data.mode === "me") {
        setMessages((prev) => prev.filter((m) => m._id !== msgId))
      } else if (data.message) {
        setMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m))
      }
    } catch (e) {
      console.error("Failed to delete message", e)
    }
    setDeleteMsgId(null)
  }

  const renderMessage = (msg: Message) => {
    const isMe = msg.senderId === currentUserId
    if (msg.type === "image") {
      return (
        <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
          {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
          <div className={`inline-block ${isMe ? "bg-dark-purple rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} p-1`}>
            <div className="relative group">
              <img
                src={msg.fileUrl || msg.content}
                alt="Shared image"
                className="max-w-[250px] max-h-[300px] rounded-xl object-cover cursor-pointer"
                onClick={() => setPreviewUrl(msg.fileUrl || msg.content)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPreviewUrl(msg.fileUrl || msg.content) } }}
                tabIndex={0}
                role="button"
              />
              <button
                onClick={() => handleDownload(msg.fileUrl || msg.content, msg.fileName || "image")}
                className="absolute top-1 right-1 w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                aria-label="Download image"
              >
                <Download size="14" className="text-white" />
              </button>
            </div>
            <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"} text-right block px-2 pb-1`}>
              {formatTime(new Date(msg.createdAt))}
            </span>
          </div>
        </div>
      )
    }
    if (msg.type === "file") {
      return (
        <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
          {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
          <div className={`inline-block ${isMe ? "bg-dark-purple rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} px-4 py-2.5`}>
            <div className={`flex items-center gap-2 ${isMe ? "text-off-white" : "text-dark-purple"}`}>
              <FileText size="20" />
              <div className="text-left flex-1">
                <p className={`text-sm font-medium ${isMe ? "text-off-white" : "text-dark-purple"}`}>{msg.fileName || "File"}</p>
                {msg.fileSize && <p className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"}`}>{(msg.fileSize / 1024).toFixed(1)} KB</p>}
              </div>
              <button
                onClick={() => handleDownload(msg.fileUrl || msg.content, msg.fileName || "file")}
                className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors shrink-0"
                aria-label="Download file"
              >
                <Download size="14" className={isMe ? "text-off-white/70" : "text-dark-purple/60"} />
              </button>
            </div>
            <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"} text-right block mt-1`}>
              {formatTime(new Date(msg.createdAt))}
            </span>
          </div>
        </div>
      )
    }
    if (msg.type === "voice") {
      const isPlaying = playingVoice === (msg.fileUrl || msg.content)
      const duration = msg.fileSize ? Math.round(msg.fileSize / 16000) : 0
      return (
        <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
          {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
          <div className={`inline-block ${isMe ? "bg-dark-purple rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} px-3 py-2`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleVoicePlay(msg.fileUrl || msg.content)}
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size="14" className={isMe ? "text-off-white" : "text-dark-purple"} /> : <Play size="14" className={isMe ? "text-off-white" : "text-dark-purple"} />}
              </button>
              <div className="w-24 h-1.5 rounded-full bg-black/10 relative overflow-hidden">
                <div className={`h-full rounded-full ${isMe ? "bg-off-white/50" : "bg-dark-purple/30"} transition-all`} style={{ width: `${(voiceProgress[msg.fileUrl || msg.content] || 0) * 100}%` }} />
              </div>
              <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"} min-w-[30px] tabular-nums`}>{isPlaying && voiceProgress[msg.fileUrl || msg.content] ? `${Math.round((voiceProgress[msg.fileUrl || msg.content] || 0) * (duration || 1))}s` : duration > 0 ? `${duration}s` : "..."}</span>
            </div>
            <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"} text-right block mt-1`}>
              {formatTime(new Date(msg.createdAt))}
            </span>
          </div>
        </div>
      )
    }

    if (msg.isDeleted) {
      return (
        <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
          {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
          <div className={`inline-block italic px-4 py-2.5 ${isMe ? "bg-dark-purple/30 rounded-2xl rounded-br-sm" : "bg-gray/30 rounded-2xl rounded-bl-sm"}`}>
            <p className={`text-sm ${isMe ? "text-off-white/40" : "text-dark-purple/30"}`}>This message was deleted</p>
          </div>
        </div>
      )
    }

    return (
      <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
        {!isMe && <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-left">{msg.senderName}</span>}
        {isMe && editingMsgId === msg._id ? (
          <div className={`inline-block text-left bg-off-white rounded-2xl rounded-br-sm border border-dark-purple/20 px-3 py-2`}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(msg._id) } if (e.key === "Escape") handleEditCancel() }}
              className="w-full bg-transparent text-sm text-dark-purple outline-none resize-none min-h-[40px]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-1">
              <button onClick={handleEditCancel} className="text-xs text-dark-purple/50 hover:text-dark-purple px-2 py-0.5 rounded">Cancel</button>
              <button onClick={() => handleEditSave(msg._id)} className="text-xs font-bold text-off-white bg-dark-purple px-3 py-0.5 rounded-lg hover:bg-deep-purple">Save</button>
            </div>
          </div>
        ) : (
          <div className={`inline-block relative group ${isMe ? "bg-dark-purple rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} px-4 py-2.5`}>
            <p className={`text-sm ${isMe ? "text-off-white" : "text-dark-purple"} whitespace-pre-wrap break-words`}>{msg.content}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              {isMe && editingMsgId !== msg._id && !msg.isDeleted && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => handleEditStart(msg)} className="w-5 h-5 rounded-md bg-dark-purple/50 flex items-center justify-center hover:bg-dark-purple/80 transition-colors" aria-label="Edit message">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button onClick={() => setDeleteMsgId(msg._id)} className="w-5 h-5 rounded-md bg-dark-purple/50 flex items-center justify-center hover:bg-red/70 transition-colors" aria-label="Delete message">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              )}
              {msg.editedAt && <span className={`text-[9px] ${isMe ? "text-off-white/40" : "text-dark-purple/30"}`}>edited</span>}
              <span className={`text-[10px] ${isMe ? "text-off-white/50" : "text-dark-purple/40"}`}>{formatTime(new Date(msg.createdAt))}</span>
            </div>
          </div>
        )}
      </div>
    )
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
          <button onClick={handleToggleFav} className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label={localFav ? "Unfavourite" : "Favourite"}>
            <Heart size={16} className={localFav ? "text-rose" : "text-off-white"} fill={localFav ? "currentColor" : "none"} />
          </button>
          <button onClick={() => { setShowSearch(true); setSearchQuery(""); setSearchTab("messages") }} className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Search">
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
                {renderMessage(msg)}
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
          <div className="relative emoji-picker-area">
            <button onClick={() => setShowEmoji(!showEmoji)} className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Add emoji">
              <Smile size="16" className="text-dark-purple" />
            </button>
            {showEmoji && <EmojiPicker onEmoji={handleEmoji} onClose={() => setShowEmoji(false)} />}
          </div>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors relative" aria-label="Attach file" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader size="16" className="animate-spin text-dark-purple" /> : <Paperclip size="16" className="text-dark-purple" />}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors relative" aria-label="Add image" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader size="16" className="animate-spin text-dark-purple" /> : <Image size="16" className="text-dark-purple" />}
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
        {recording ? (
          <div className="flex-1 flex items-center gap-3 bg-rose rounded-xl h-10 px-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-dark-purple">{recordingDuration}s</span>
            <div className="flex-1 flex items-center gap-0.5 h-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-dark-purple/40 animate-pulse"
                  style={{ height: `${40 + Math.sin(Date.now() * 0.01 + i) * 30}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <button
              onClick={stopRecording}
              className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
              aria-label="Stop recording"
            >
              <MicOff size="14" className="text-white" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 bg-light-gray rounded-xl h-10 px-3 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-dark-purple placeholder-dark-purple/40 outline-none"
                aria-label="Message input"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors shrink-0 disabled:opacity-40"
              aria-label="Send message"
            >
              {sending ? <Loader size="15" className="animate-spin text-off-white" /> : <Send size="16" className="text-off-white" />}
            </button>
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${recording ? "bg-red-500 hover:bg-red-600" : "bg-dark-purple hover:bg-deep-purple"}`}
              aria-label={recording ? "Stop recording" : "Record voice message"}
            >
              {uploading ? <Loader size="14" className="animate-spin text-off-white" /> : <Mic size="15" className="text-off-white" />}
            </button>
          </>
        )}
      </div>
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowSearch(false)}>
          <div className="bg-off-white rounded-2xl w-[520px] max-h-[80vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-light-gray">
              <h3 className="text-lg font-bold text-dark-purple">Search Chat</h3>
              <button onClick={() => setShowSearch(false)} aria-label="Close"><X size="18" className="text-dark-purple/50 hover:text-dark-purple transition-colors" /></button>
            </div>
            <div className="px-4 py-3 border-b border-light-gray">
              <div className="relative">
                <Search size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-purple/40" />
                <input
                  type="text"
                  placeholder="Search messages, files, media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded-lg bg-light-gray pl-9 pr-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-1.5 px-4 pt-3 pb-2 border-b border-light-gray">
              {(["messages", "media", "files", "voice"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${searchTab === tab ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple hover:bg-gray"}`}
                >
                  {tab === "messages" && <MessageCircle size="12" className="inline mr-1.5 -mt-0.5" />}
                  {tab === "media" && <Image size="12" className="inline mr-1.5 -mt-0.5" />}
                  {tab === "files" && <File size="12" className="inline mr-1.5 -mt-0.5" />}
                  {tab === "voice" && <Mic size="12" className="inline mr-1.5 -mt-0.5" />}
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {!searchQuery.trim() ? (
                <p className="text-sm text-dark-purple/40 text-center py-10">Type to search results</p>
              ) : searchResults[searchTab].length === 0 ? (
                <p className="text-sm text-dark-purple/40 text-center py-10">No {searchTab} found</p>
              ) : (
                <div className="space-y-1">
                  {searchResults[searchTab].map((msg: Message) => (
                    <div key={msg._id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-light-gray/50 transition-colors cursor-pointer" tabIndex={0} role="button" onClick={() => { setShowSearch(false) }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowSearch(false) } }}>
                      {searchTab === "media" && msg.type === "image" && (
                        <img src={msg.fileUrl || msg.content} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      {searchTab === "voice" && (
                        <div className="w-12 h-12 rounded-lg bg-light-gray flex items-center justify-center shrink-0">
                          <Mic size="18" className="text-dark-purple/50" />
                        </div>
                      )}
                      {searchTab === "files" && (
                        <div className="w-12 h-12 rounded-lg bg-light-gray flex items-center justify-center shrink-0">
                          <FileText size="18" className="text-dark-purple/50" />
                        </div>
                      )}
                      {searchTab === "messages" && (
                        <div className="w-12 h-12 rounded-lg bg-light-gray flex items-center justify-center shrink-0">
                          <MessageCircle size="18" className="text-dark-purple/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark-purple truncate">
                          {msg.senderName}
                        </p>
                        <p className="text-xs text-dark-purple/50 truncate mt-0.5">
                          {searchTab === "messages" && msg.content}
                          {searchTab === "files" && (msg.fileName || "File")}
                          {searchTab === "media" && "Shared image"}
                          {searchTab === "voice" && `Voice message`}
                        </p>
                        <span className="text-[10px] text-dark-purple/30">{formatTime(new Date(msg.createdAt))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative w-1/2 h-1/2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
            <button
              onClick={() => handleDownload(previewUrl, "image")}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors"
              aria-label="Download image"
            >
              <Download size="16" className="text-off-white" />
            </button>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors"
              aria-label="Close preview"
            >
              <X size="16" className="text-off-white" />
            </button>
          </div>
        </div>
      )}

      {deleteMsgId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setDeleteMsgId(null)}
        >
          <div className="bg-off-white rounded-2xl w-72 shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-dark-purple mb-2">Delete message?</h3>
            <div className="space-y-1.5 mt-4">
              <button
                onClick={() => handleDelete(deleteMsgId, "me")}
                className="w-full py-2.5 rounded-lg bg-light-gray hover:bg-gray/30 text-sm font-semibold text-dark-purple transition-colors"
              >
                Delete for me
              </button>
              <button
                onClick={() => handleDelete(deleteMsgId, "everyone")}
                className="w-full py-2.5 rounded-lg bg-red/10 hover:bg-red/20 text-sm font-semibold text-red transition-colors"
              >
                Delete for everyone
              </button>
            </div>
            <button
              onClick={() => setDeleteMsgId(null)}
              className="w-full mt-2 py-2 rounded-lg text-xs text-dark-purple/50 hover:text-dark-purple transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}