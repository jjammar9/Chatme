import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, Loader, Search, ArrowUp } from "lucide-react"
import { notifications as notificationsApi, friendRequests as friendRequestsApi, users as usersApi } from "../../lib/api"
import Avatar from "../ui/Avatar"
import type { UserSearchResult } from "../../types"

interface Notification {
  _id: string
  type: "friend_request" | "friend_accepted" | "message"
  fromUserId: string
  message: string
  relatedId: string | null
  read: boolean
  createdAt: string
}

export default function SidebarBottom({ onNavChange, onViewProfile }: { onNavChange: (key: string) => void; onViewProfile: (id: string) => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()
  const userData = JSON.parse(localStorage.getItem("user") || "{}")

  const fetchNotifs = async () => {
    try {
      const data = await notificationsApi.list()
      setNotifs(data.notifications)
      setUnread(data.unread)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    if (!searchQuery.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await usersApi.search(searchQuery)
        setSearchResults(data.users)
      } catch { setSearchResults([]) }
      setSearching(false)
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  const handleAccept = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try {
      await friendRequestsApi.accept(notif.relatedId)
      await notificationsApi.markRead(notif._id)
      await fetchNotifs()
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleDecline = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try {
      await friendRequestsApi.decline(notif.relatedId)
      await notificationsApi.markRead(notif._id)
      await fetchNotifs()
    } catch { /* ignore */ }
    setLoading(false)
  }

  const pendingFriendRequests = notifs.filter((n) => n.type === "friend_request" && !n.read)
  const otherNotifs = notifs.filter((n) => n.type !== "friend_request" || n.read)

  return (
    <div ref={ref} className="relative border-t border-off-white/10">
      <div className="flex items-center px-3 py-3">
        <button
          onClick={() => { setOpen(!open); setSearchQuery(""); setSearchResults([]) }}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-off-white/5 rounded-xl px-3 py-2 transition-colors"
          aria-label="Open profile and notifications"
        >
          <div className="relative shrink-0">
            <Avatar seed={userData.username || userData.name || "user"} size="md" status="online" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose text-off-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-dark-purple">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
            <p className="text-sm font-bold truncate">{userData.name || "User"}</p>
            <p className="text-[11px] text-off-white/50 truncate shrink-0">@{userData.username || "user"}</p>
          </div>
          <Bell size="16" className={`shrink-0 transition-colors ${unread > 0 ? "text-rose" : "text-off-white/40"}`} />
        </button>
      </div>

      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-off-white rounded-xl shadow-xl border border-gray/20 max-h-[70vh] flex flex-col z-50">
          <div className="px-4 pt-4 pb-2 border-b border-light-gray">
            <div className="relative">
              <Search size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-purple/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-light-gray text-dark-purple text-sm pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/10 placeholder:text-dark-purple/25"
                aria-label="Search users"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim() && (
              <div className="px-2 py-1">
                <p className="text-[10px] font-semibold text-dark-purple/40 px-2 py-1.5 uppercase tracking-wider">Users</p>
                {searching ? (
                  <div className="flex items-center justify-center py-4"><Loader size="16" className="text-dark-purple/30 animate-spin" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => { setOpen(false); onViewProfile(u._id) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-light-gray transition-colors text-left"
                    >
                      <Avatar seed={u.avatarSeed || u.username} size="sm" status={u.online ? "online" : undefined} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-purple truncate">{u.name}</p>
                        <p className="text-[11px] text-dark-purple/40">@{u.username}</p>
                      </div>
                      <ArrowUp size="14" className="text-dark-purple/20 shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-dark-purple/40 text-center py-3">No users found</p>
                )}
              </div>
            )}

            {!searchQuery.trim() && (
              <div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-dark-purple uppercase tracking-wider">Notifications</p>
                  {notifs.length > 0 && (
                    <button
                      onClick={async () => { await notificationsApi.markAllRead(); fetchNotifs() }}
                      className="text-[10px] font-semibold text-dark-purple/50 hover:text-dark-purple"
                      aria-label="Mark all as read"
                    >Mark all read</button>
                  )}
                </div>

                {pendingFriendRequests.length > 0 && (
                  <div className="px-2 mb-1">
                    <p className="text-[10px] font-semibold text-dark-purple/40 px-2 py-1 uppercase tracking-wider">Pending Requests</p>
                    {pendingFriendRequests.map((n) => (
                      <div key={n._id} onClick={() => { setOpen(false); onViewProfile(n.fromUserId) }} className="px-3 py-2.5 mx-1 rounded-lg bg-rose/5 border border-rose/20 mb-1 cursor-pointer hover:bg-rose/10 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <Avatar seed={n.fromUserId} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-dark-purple leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-dark-purple/40 mt-0.5">
                              {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleAccept(n)}
                                disabled={loading}
                                className="flex items-center gap-1 text-[10px] font-semibold bg-dark-purple text-off-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                aria-label="Accept friend request"
                              >{loading ? <Loader size="10" className="animate-spin" /> : <Check size="10" />} Accept</button>
                              <button
                                onClick={() => handleDecline(n)}
                                disabled={loading}
                                className="flex items-center gap-1 text-[10px] font-semibold bg-light-gray text-dark-purple/60 px-2.5 py-1 rounded-lg hover:bg-gray/30 transition-colors disabled:opacity-50"
                                aria-label="Decline friend request"
                              ><X size="10" /> Decline</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {otherNotifs.length > 0 ? (
                  <div className="px-2 pb-2">
                    {otherNotifs.map((n) => (
                      <div key={n._id} onClick={() => { setOpen(false); onViewProfile(n.fromUserId) }} className="px-3 py-2.5 rounded-lg hover:bg-light-gray transition-colors cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <Avatar seed={n.fromUserId} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-dark-purple leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-dark-purple/40 mt-0.5">
                              {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingFriendRequests.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Bell size="20" className="text-dark-purple/20 mx-auto mb-2" />
                    <p className="text-xs text-dark-purple/40">No notifications yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-light-gray">
            <button
              onClick={() => { setOpen(false); onNavChange("settings") }}
              className="w-full text-[11px] font-semibold text-dark-purple/50 hover:text-dark-purple text-center py-1.5 rounded-lg hover:bg-light-gray transition-colors"
            >Settings</button>
          </div>
        </div>
      )}
    </div>
  )
}
