import { useState, useEffect, useCallback, useRef } from "react"
import { ExternalLink, MessageCircle, Search, X, Loader, UserPlus, Users } from "lucide-react"
import Avatar from "../ui/Avatar"
import { conversations, users, contacts as contactsApi } from "../../lib/api"
import { getAvatarUrl } from "../../lib/utils"

import type { Conversation } from "../../types/conversation"

interface MessagePanelProps {
  selectedConversationId: string | null
  onSelectConversation: (conv: Conversation) => void
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    const h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, "0")
    return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`
  }
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getDisplayName(conv: Conversation): string {
  if (conv.isGroup) return conv.groupName || "Group"
  return conv.participantDetails?.[0]?.name || "Unknown"
}

function getAvatarSeed(conv: Conversation): string {
  if (conv.isGroup) return conv.groupName || "group"
  return conv.participantDetails?.[0]?.avatarSeed || conv.participantDetails?.[0]?.name || "user"
}

function ChatItem({ conv, selected, onSelect }: { conv: Conversation; selected: boolean; onSelect: (conv: Conversation) => void }) {
  const unread = conv.unreadCount || 0
  const otherUserOnline = !conv.isGroup && conv.participantDetails?.[0]?.online
  return (
    <div
      onClick={() => onSelect(conv)}
      className={`flex items-start gap-3 pl-5 pr-1 py-2.5 cursor-pointer transition-colors ${selected ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
    >
      <div className="relative shrink-0">
        <Avatar seed={getAvatarSeed(conv)} alt={getDisplayName(conv)} size="md" />
        {!conv.isGroup && <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-off-white ${otherUserOnline ? "bg-green" : "bg-gray"}`} />}
        {conv.isGroup && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-dark-purple rounded-full flex items-center justify-center ring-1 ring-off-white"><Users size="8" className="text-off-white" /></span>}
        {!conv.isGroup && unread > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red rounded-full ring-2 ring-off-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className={`text-sm truncate ${unread > 0 ? "font-extrabold text-dark-purple" : "font-bold text-dark-purple"}`}>
            {conv.isGroup && <Users size="12" className="inline mr-1 -mt-0.5 text-dark-purple/50" />}
            {getDisplayName(conv)}
          </span>
          <span className="text-xs text-dark-purple/40 shrink-0 ml-2">{formatTime(conv.lastMessageTime)}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className={`text-xs truncate ${unread > 0 ? "font-semibold text-dark-purple/70" : "text-dark-purple/50"}`}>{conv.lastMessage || "No messages yet"}</span>
          {unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-red text-off-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function NewMessageModal({ open, onClose, onSelectUser, onCreateGroup }: { open: boolean; onClose: () => void; onSelectUser: (userId: string) => void; onCreateGroup: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!open) return
    setQuery("")
    users.search("").then((data) => setResults(data.users || [])).catch(() => {})
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      users.search("").then((data) => setResults(data.users || [])).catch(() => {})
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await users.search(query.trim())
        setResults(data.users || [])
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="New message" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-off-white rounded-2xl w-96 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-light-gray">
          <h3 className="text-lg font-bold text-dark-purple">New Message</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-dark-purple/50" /></button>
        </div>
        <div className="p-4 border-b border-light-gray">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-purple/40" />
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 rounded-lg bg-light-gray pl-9 pr-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <div className="flex justify-center py-6"><Loader size="16" className="animate-spin text-dark-purple/40" /></div>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-dark-purple/40 text-center py-6">No users found</p>
          )}
          {!loading && !query.trim() && results.length > 0 && (
            <p className="text-xs font-semibold text-dark-purple/30 px-2 pb-1 uppercase tracking-wider">Suggestions</p>
          )}
          {results.map((u: any) => (
            <div
              key={u._id}
              onClick={() => { onSelectUser(u._id); onClose() }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-gray/50 cursor-pointer"
            >
              <Avatar seed={u.username || u.name} size="md" />
              <div>
                <p className="text-sm font-bold text-dark-purple">{u.name}</p>
                <p className="text-xs text-dark-purple/50">@{u.username}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-light-gray">
          <button
            onClick={() => { onClose(); onCreateGroup() }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-light-gray hover:bg-gray/30 text-sm font-bold text-dark-purple transition-colors"
          >
            <UserPlus size="14" />
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateGroupModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (conv: Conversation) => void }) {
  const [contacts, setContacts] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [creating, setCreating] = useState(false)
  const currentUserId = localStorage.getItem("userId") || ""

  useEffect(() => {
    if (!open) return
    setSelected([])
    setGroupName("")
    contactsApi.list().then((data) => setContacts(data.contacts || [])).catch(() => {})
  }, [open])

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleCreate = async () => {
    if (selected.length < 1 || !groupName.trim() || creating) return
    setCreating(true)
    try {
      const data = await conversations.create({ participants: selected, isGroup: true, groupName: groupName.trim() })
      if (data.conversation) {
        onCreated(data.conversation)
        onClose()
      }
    } catch { console.error("Failed to create group") }
    setCreating(false)
  }

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="Create group" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-off-white rounded-2xl w-96 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-light-gray">
          <h3 className="text-lg font-bold text-dark-purple">Create Group</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-dark-purple/50" /></button>
        </div>
        <div className="p-4 border-b border-light-gray">
          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
          />
        </div>
        <div className="p-2 border-b border-light-gray">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-2 pb-2">
              {contacts.filter((c) => selected.includes(c.linkedUserId)).map((c) => (
                <span key={c.linkedUserId} className="flex items-center gap-1 text-xs font-semibold text-dark-purple bg-light-gray rounded-lg px-2 py-1">
                  {c.name}
                  <button onClick={() => toggle(c.linkedUserId)} className="ml-0.5"><X size="12" /></button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs font-semibold text-dark-purple/40 px-2 pb-1 uppercase tracking-wider">
            Select contacts ({selected.length} selected)
          </p>
          <div className="max-h-48 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="text-sm text-dark-purple/40 text-center py-6">No contacts yet</p>
            ) : contacts.map((c) => (
              <div
                key={c.linkedUserId}
                onClick={() => toggle(c.linkedUserId)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selected.includes(c.linkedUserId) ? "bg-light-gray" : "hover:bg-light-gray/50"}`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected.includes(c.linkedUserId) ? "border-dark-purple bg-dark-purple" : "border-dark-purple/30"}`}>
                  {selected.includes(c.linkedUserId) && <span className="text-off-white text-[10px] font-bold">&#10003;</span>}
                </div>
                <Avatar seed={c.seed || c.name} size="sm" />
                <span className="text-sm font-bold text-dark-purple truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3">
          <button
            onClick={handleCreate}
            disabled={selected.length < 1 || !groupName.trim() || creating}
            className="w-full h-10 rounded-lg bg-dark-purple flex items-center justify-center gap-2 hover:bg-deep-purple transition-colors text-off-white text-sm font-bold disabled:opacity-40"
          >
            {creating ? <Loader size="14" className="animate-spin" /> : <UserPlus size="14" />}
            Create Group ({selected.length + 1} members)
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessagePanel({ selectedConversationId, onSelectConversation }: MessagePanelProps) {
  const [convList, setConvList] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const currentUserId = localStorage.getItem("userId") || ""

  const fetchConversations = useCallback(async () => {
    try {
      const data = await conversations.list()
      setConvList(data.conversations || [])
    } catch { setConvList([]) }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const handler = () => fetchConversations()
    window.addEventListener("conversation-fav-update", handler)
    return () => window.removeEventListener("conversation-fav-update", handler)
  }, [fetchConversations])

  const handleSelect = (conv: Conversation) => {
    const cleared = conv.unreadCount || 0
    setConvList((prev) => prev.map((c) => c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    if (cleared > 0) {
      window.dispatchEvent(new CustomEvent("unread-cleared", { detail: cleared }))
    }
    onSelectConversation(conv)
    setTimeout(fetchConversations, 500)
  }

  const handleNewConversation = async (userId: string) => {
    try {
      const data = await conversations.create({ participants: [userId] })
      if (data.conversation) {
        setConvList((prev) => [data.conversation, ...prev])
        handleSelect(data.conversation)
      }
    } catch (e) {
      console.error("Failed to create conversation", e)
    }
  }

  const handleGroupCreated = (conv: Conversation) => {
    setConvList((prev) => [conv, ...prev])
    handleSelect(conv)
  }

  const favourites = convList.filter((c) => c.isFavourite)
  const all = convList

  return (
    <>
      <NewMessageModal open={showNewMsg} onClose={() => setShowNewMsg(false)} onSelectUser={handleNewConversation} onCreateGroup={() => setShowCreateGroup(true)} />
      <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} />
      <div className="flex flex-col h-full bg-off-white">
        <div className="flex items-center justify-between pl-5 pr-1 py-6">
          <h2 className="text-lg font-bold text-dark-purple">Messages</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowCreateGroup(true)} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors cursor-pointer" aria-label="Create group">
              <UserPlus size="18" className="text-dark-purple" />
            </button>
            <button onClick={() => setShowNewMsg(true)} className="text-dark-purple hover:text-deep-purple transition-colors cursor-pointer" aria-label="New message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="0.5" y="0.5" width="23" height="23" rx="3" fill="#d2d2d2" />
                <path d="M12 7v10M7 12h10" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or start a message"
              className="w-full h-9 rounded-lg bg-light-gray pl-3 pr-9 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
              aria-label="Search messages"
            />
            <Search size="14" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader size="20" className="animate-spin text-dark-purple/30" /></div>
          ) : all.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <MessageCircle size="32" className="text-dark-purple/20 mb-3" />
              <p className="text-sm font-bold text-dark-purple/40">No messages yet</p>
              <p className="text-xs text-dark-purple/30 mt-1">Press + to start a new conversation</p>
            </div>
          ) : (
            <>
              {favourites.length > 0 && (
                <>
                  <div className="flex items-center pl-5 pr-1 pb-2">
                    <span className="text-xs font-extrabold text-dark-purple/40 uppercase tracking-widest">Favourites</span>
                  </div>
                  {favourites.map((conv) => (
                    <ChatItem key={conv._id} conv={conv} selected={selectedConversationId === conv._id} onSelect={handleSelect} />
                  ))}
                  <div className="my-3 mx-5 border-t border-light-gray" />
                </>
              )}
              <div className="flex items-center pl-5 pr-1 pb-2">
                <span className="text-lg font-bold text-dark-purple">All Chats</span>
                <ExternalLink size={16} className="ml-1.5 text-dark-purple" />
              </div>
              {all.map((conv) => (
                <ChatItem key={conv._id} conv={conv} selected={selectedConversationId === conv._id} onSelect={handleSelect} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}