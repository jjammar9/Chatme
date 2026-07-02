import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, Loader, Search, ArrowUp, ExternalLink, MessageCircle } from "lucide-react"
import { notifications as notificationsApi, friendRequests as friendRequestsApi, communities as communitiesApi, users as usersApi, conversations as conversationsApi } from "../../lib/api"
import Avatar from "../ui/Avatar"
import type { UserSearchResult } from "../../types"

interface Notification {
  _id: string
  type: "friend_request" | "friend_accepted" | "message" | "community_invite" | "community_join_request" | "request_accepted" | "request_declined" | "invite_accepted"
  fromUserId: string
  message: string
  relatedId: string | null
  read: boolean
  createdAt: string
}

function NotificationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const markAndRefresh = async (notifId: string) => {
    await notificationsApi.markRead(notifId).catch(() => {})
    const data = await notificationsApi.list()
    setNotifs(data.notifications || [])
  }

  useEffect(() => {
    if (!open) return
    setLoading(true)
    notificationsApi.list().then((data) => {
      setNotifs(data.notifications || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open])

  const handleAcceptFriend = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await friendRequestsApi.accept(n.relatedId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  const handleDeclineFriend = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await friendRequestsApi.decline(n.relatedId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  const handleAcceptInvite = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await communitiesApi.acceptInvite(n.relatedId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  const handleDeclineInvite = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await communitiesApi.declineInvite(n.relatedId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  const handleAcceptRequest = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await communitiesApi.acceptRequest(n.relatedId, n.fromUserId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  const handleDeclineRequest = async (n: Notification) => {
    if (!n.relatedId) return
    setActionLoading(true)
    try { await communitiesApi.declineRequest(n.relatedId, n.fromUserId); await markAndRefresh(n._id) } catch {}
    setActionLoading(false)
  }

  if (!open) return null

  const actionable = notifs.filter((n) => (n.type === "friend_request" || n.type === "community_invite" || n.type === "community_join_request") && !n.read)
  const others = notifs.filter((n) => !(n.type === "friend_request" || n.type === "community_invite" || n.type === "community_join_request") || n.read)

  return (
    <div role="dialog" aria-modal="true" aria-label="All notifications" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-off-white rounded-2xl w-[420px] shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-light-gray">
          <h3 className="text-lg font-bold text-dark-purple">Notifications</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-light-gray flex items-center justify-center transition-colors" aria-label="Close">
            <X size="16" className="text-dark-purple/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader size="20" className="animate-spin text-dark-purple/30" /></div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Bell size="28" className="text-dark-purple/20 mb-3" />
              <p className="text-sm font-bold text-dark-purple/40">No notifications</p>
            </div>
          ) : (
            <>
              {actionable.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-semibold text-dark-purple/40 px-3 py-2 uppercase tracking-wider">Pending</p>
                  {actionable.map((n) => (
                    <div key={n._id} className="px-3 py-2.5 mx-1 rounded-lg bg-red/5 border border-red/20 mb-1">
                      <div className="flex items-start gap-2.5">
                        <Avatar seed={n.fromUserId} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-dark-purple leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-dark-purple/40 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          {(n.type === "friend_request" || n.type === "community_invite" || n.type === "community_join_request") && (
                            <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => n.type === "friend_request" ? handleAcceptFriend(n) : n.type === "community_invite" ? handleAcceptInvite(n) : handleAcceptRequest(n)}
                                disabled={actionLoading}
                                className="flex items-center gap-1 text-[10px] font-semibold bg-dark-purple text-off-white px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-50"
                              >{actionLoading ? <Loader size="10" className="animate-spin" /> : <Check size="10" />} Accept</button>
                              <button
                                onClick={() => n.type === "friend_request" ? handleDeclineFriend(n) : n.type === "community_invite" ? handleDeclineInvite(n) : handleDeclineRequest(n)}
                                disabled={actionLoading}
                                className="flex items-center gap-1 text-[10px] font-semibold bg-light-gray text-dark-purple/60 px-2.5 py-1 rounded-lg hover:bg-gray/30 disabled:opacity-50"
                              ><X size="10" /> Decline</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {others.length > 0 && (
                <div>
                  {actionable.length > 0 && <div className="border-t border-light-gray my-1" />}
                  {others.map((n) => (
                    <div key={n._id} className="px-3 py-2.5 mx-1 rounded-lg hover:bg-light-gray transition-colors">
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SidebarBottom({ onNavChange, onViewProfile }: { onNavChange: (key: string) => void; onViewProfile: (id: string) => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [showAllModal, setShowAllModal] = useState(false)
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

    const handleCleared = () => {
      setTimeout(fetchNotifs, 600)
    }
    window.addEventListener("unread-cleared", handleCleared)
    return () => { clearInterval(id); window.removeEventListener("unread-cleared", handleCleared) }
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

  const markAndRefresh = async (notifId: string) => {
    await notificationsApi.markRead(notifId).catch(() => {})
    await fetchNotifs()
  }

  const handleAcceptFriend = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await friendRequestsApi.accept(notif.relatedId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const handleDeclineFriend = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await friendRequestsApi.decline(notif.relatedId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const handleAcceptInvite = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await communitiesApi.acceptInvite(notif.relatedId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const handleDeclineInvite = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await communitiesApi.declineInvite(notif.relatedId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const handleAcceptRequest = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await communitiesApi.acceptRequest(notif.relatedId, notif.fromUserId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const handleDeclineRequest = async (notif: Notification) => {
    if (!notif.relatedId) return
    setLoading(true)
    try { await communitiesApi.declineRequest(notif.relatedId, notif.fromUserId); await markAndRefresh(notif._id) } catch {}
    setLoading(false)
  }

  const actionableNotifs = notifs.filter((n) => (n.type === "friend_request" || n.type === "community_invite" || n.type === "community_join_request") && !n.read)
  const otherNotifs = notifs.filter((n) => !(n.type === "friend_request" || n.type === "community_invite" || n.type === "community_join_request") || n.read)
  const visibleOthers = otherNotifs.slice(0, 2)

  return (
    <>
      <NotificationsModal open={showAllModal} onClose={() => setShowAllModal(false)} />
      <div ref={ref} className="relative border-t border-off-white/10">
        <div className="flex items-center px-3 py-3">
          <button
            onClick={() => { setOpen(!open); setSearchQuery(""); setSearchResults([]) }}
            className="flex items-center gap-3 flex-1 min-w-0 hover:bg-off-white/5 rounded-xl px-3 py-2 transition-colors"
            aria-label="Open profile and notifications"
          >
            <div className="relative shrink-0">
              <Avatar seed={userData.username || userData.name || "user"} imageUrl={userData.avatarUrl} size="md" status="online" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red text-off-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-dark-purple">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <p className="text-sm font-bold truncate">{userData.name || "User"}</p>
              <p className="text-[11px] text-off-white/50 truncate shrink-0">@{userData.username || "user"}</p>
            </div>
            <Bell size="16" className={`shrink-0 transition-colors ${unread > 0 ? "text-red" : "text-off-white/40"}`} />
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

                  {actionableNotifs.length > 0 && (
                    <div className="px-2 mb-1">
                      <p className="text-[10px] font-semibold text-dark-purple/40 px-2 py-1 uppercase tracking-wider">Pending</p>
                      {actionableNotifs.map((n) => (
                        <div key={n._id} className="px-3 py-2.5 mx-1 rounded-lg bg-red/5 border border-red/20 mb-1">
                          <div className="flex items-start gap-2.5">
                            <Avatar seed={n.fromUserId} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-dark-purple leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-dark-purple/40 mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => n.type === "friend_request" ? handleAcceptFriend(n) : n.type === "community_invite" ? handleAcceptInvite(n) : handleAcceptRequest(n)}
                                  disabled={loading}
                                  className="flex items-center gap-1 text-[10px] font-semibold bg-dark-purple text-off-white px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-50"
                                >{loading ? <Loader size="10" className="animate-spin" /> : <Check size="10" />} Accept</button>
                                <button
                                  onClick={() => n.type === "friend_request" ? handleDeclineFriend(n) : n.type === "community_invite" ? handleDeclineInvite(n) : handleDeclineRequest(n)}
                                  disabled={loading}
                                  className="flex items-center gap-1 text-[10px] font-semibold bg-light-gray text-dark-purple/60 px-2.5 py-1 rounded-lg hover:bg-gray/30 disabled:opacity-50"
                                ><X size="10" /> Decline</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {visibleOthers.length > 0 && (
                    <div className="px-2 pb-1">
                      {visibleOthers.map((n) => (
                        <div key={n._id} className="px-3 py-2.5 rounded-lg hover:bg-light-gray transition-colors">
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
                  )}

                  {notifs.length > 2 && (
                    <button
                      onClick={() => { setShowAllModal(true) }}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-dark-purple/50 hover:text-dark-purple hover:bg-light-gray transition-colors"
                      aria-label="See all notifications"
                    >
                      <ExternalLink size="12" /> See all notifications
                    </button>
                  )}

                  {notifs.length === 0 && (
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
              >
                Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
