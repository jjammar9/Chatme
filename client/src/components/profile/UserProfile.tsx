import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Calendar, UserPlus, UserCheck, Clock, Check, X, MessageCircle, Loader } from "lucide-react"
import { users as usersApi, friendRequests as friendRequestsApi } from "../../lib/api"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import type { UserSearchResult } from "../../types"

type ReqStatus = "none" | "pending-sent" | "pending-received" | "friends"

export default function UserProfile({ userId, onBack, onChat }: { userId: string; onBack: () => void; onChat?: () => void }) {
  const [user, setUser] = useState<UserSearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [reqStatus, setReqStatus] = useState<ReqStatus>("none")
  const [reqId, setReqId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id

  useEffect(() => {
    setLoading(true)
    usersApi.byId(userId).then((data) => {
      setUser(data.user)
      setLoading(false)
    }).catch(() => setLoading(false))

    friendRequestsApi.list().then((data) => {
      const req = data.requests.find(
        (r: { senderId: string; receiverId: string; status: string; _id: string }) =>
          (r.senderId === currentUserId && r.receiverId === userId) ||
          (r.senderId === userId && r.receiverId === currentUserId)
      )
      if (req) {
        setReqId(req._id)
        if (req.status === "accepted") setReqStatus("friends")
        else if (req.status === "pending" && req.senderId === currentUserId) setReqStatus("pending-sent")
        else if (req.status === "pending" && req.receiverId === currentUserId) setReqStatus("pending-received")
        else setReqStatus("none")
      }
    }).catch(() => {})
  }, [userId, currentUserId])

  const sendRequest = async () => {
    setSending(true)
    try {
      const data = await friendRequestsApi.send(userId)
      setReqId(data.request._id)
    } catch { /* request already exists or other error */ }
    setReqStatus("pending-sent")
    setSending(false)
  }

  const handleAccept = async () => {
    if (!reqId) return
    try {
      await friendRequestsApi.accept(reqId)
      setReqStatus("friends")
    } catch { /* ignore */ }
  }

  const handleDecline = async () => {
    if (!reqId) return
    try {
      await friendRequestsApi.decline(reqId)
      setReqStatus("none")
      setReqId(null)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="h-full bg-light-gray flex items-center justify-center">
        <Loader size="24" className="text-dark-purple/40 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full bg-light-gray flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-dark-purple/50">User not found</p>
        <Button variant="secondary" onClick={onBack}><ArrowLeft size="16" /> Back</Button>
      </div>
    )
  }

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="bg-off-white px-8 py-5 border-b border-gray/30">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-dark-purple/50 hover:text-dark-purple transition-colors" aria-label="Back">
          <ArrowLeft size="16" /> Back
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center px-8 py-10">
        <div className="w-full max-w-lg bg-off-white rounded-2xl border border-gray/20 p-8">
          <div className="flex flex-col items-center mb-6">
            <Avatar seed={user.avatarSeed || user.username} imageUrl={user.avatarUrl} size="xl" status={user.online ? "online" : undefined} />
            <h1 className="text-2xl font-bold text-dark-purple mt-4">{user.name}</h1>
            <p className="text-sm text-dark-purple/50">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info" size="sm">{user.role}</Badge>
              {user.online && <span className="flex items-center gap-1 text-xs font-medium text-green"><span className="w-1.5 h-1.5 rounded-full bg-green" />Online</span>}
            </div>
          </div>

          <div className="space-y-3 bg-light-gray rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
              <Mail size="14" className="text-dark-purple/30 shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
              <Calendar size="14" className="text-dark-purple/30 shrink-0" />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <div className="space-y-3">
            {reqStatus === "friends" ? (
              <Button fullWidth variant="secondary" disabled>
                <UserCheck size="16" /> Friends
              </Button>
            ) : reqStatus === "pending-sent" ? (
              <Button fullWidth variant="secondary" disabled>
                <Clock size="16" /> Friend Request Sent
              </Button>
            ) : reqStatus === "pending-received" ? (
              <div className="flex gap-2">
                <Button fullWidth onClick={handleAccept}>
                  <Check size="16" /> Accept
                </Button>
                <Button fullWidth variant="secondary" onClick={handleDecline}>
                  <X size="16" /> Decline
                </Button>
              </div>
            ) : (
              <Button fullWidth onClick={sendRequest} disabled={sending}>
                {sending ? <Loader size="16" className="animate-spin" /> : <UserPlus size="16" />}
                {sending ? "Sending..." : "Send Friend Request"}
              </Button>
            )}
            {onChat && (
              <Button fullWidth variant="secondary" onClick={onChat}>
                <MessageCircle size="16" /> Send Message
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
