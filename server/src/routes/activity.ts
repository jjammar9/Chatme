import { Router, Response } from "express"
import Message from "../models/Message"
import Notification from "../models/Notification"
import CalendarEvent from "../models/CalendarEvent"
import Task from "../models/Task"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const activities: { type: string; text: string; time: Date; id: string }[] = []

    const messages = await Message.find({ senderId: userId }).sort({ createdAt: -1 }).limit(10).lean()
    for (const m of messages) {
      const preview = m.content?.length > 60 ? m.content.slice(0, 60) + "..." : m.content || ""
      activities.push({ type: "message", text: `Sent a message: "${preview}"`, time: m.createdAt, id: m._id.toString() })
    }

    const notifications = await Notification.find({ userId, type: { $nin: ["message"] } }).sort({ createdAt: -1 }).limit(10).lean()
    for (const n of notifications) {
      let label = n.type.replace(/_/g, " ")
      if (n.type === "friend_request" && n.read) label = "accepted friend request"
      if (n.type === "request_accepted") label = "join request accepted"
      if (n.type === "invite_accepted") label = "invite accepted"
      activities.push({ type: "notification", text: n.message || label, time: n.createdAt, id: n._id.toString() })
    }

    const tasks = await Task.find({ userId, status: "done" }).sort({ createdAt: -1 }).limit(10).lean()
    for (const t of tasks) {
      activities.push({ type: "task", text: `Completed task: ${t.title}`, time: t.createdAt, id: t._id.toString() })
    }

    const events = await CalendarEvent.find({ $or: [{ userId }, { attendees: userId }] }).sort({ createdAt: -1 }).limit(10).lean()
    for (const e of events) {
      activities.push({ type: "event", text: `Event: ${e.title}`, time: e.createdAt, id: e._id.toString() })
    }

    activities.sort((a, b) => b.time.getTime() - a.time.getTime())
    res.json({ activities: activities.slice(0, 20) })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router