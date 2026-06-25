import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, Loader } from "lucide-react"
import { notifications as notificationsApi, friendRequests as friendRequestsApi } from "../../lib/api"
import Avatar from "../ui/Avatar"

interface Notification {
  _id: string
  type: "friend_request" | "friend_accepted" | "message"
  fromUserId: string
  message: string
  relatedId: string | null
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={ref} className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-off-white/10 transition-colors w-full flex items-center gap-2"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
      >
        <Bell size="18" className="text-off-white/60" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose text-off-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <span className="text-xs text-off-white/50">Notifications</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-off-white rounded-xl shadow-xl border border-gray/20 max-h-80 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-gray">
            <p className="text-sm font-bold text-dark-purple">Notifications</p>
            {notifs.length > 0 && (
              <button
                onClick={async () => { await notificationsApi.markAllRead(); fetchNotifs() }}
                className="text-[10px] font-semibold text-dark-purple/50 hover:text-dark-purple"
                aria-label="Mark all as read"
              >Mark all read</button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size="20" className="text-dark-purple/20 mx-auto mb-2" />
              <p className="text-xs text-dark-purple/40">No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              {notifs.map((n) => (
                <div key={n._id} className={`px-4 py-2.5 border-b border-light-gray last:border-0 ${!n.read ? "bg-rose/5" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <Avatar seed={n.fromUserId} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark-purple leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-dark-purple/40 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                      {n.type === "friend_request" && n.relatedId && (
                        <div className="flex items-center gap-1.5 mt-2">
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
