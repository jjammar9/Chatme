import { Router, Response } from "express"
import CalendarEvent from "../models/CalendarEvent"
import Notification from "../models/Notification"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query
    const filter: Record<string, unknown> = { userId: req.userId }
    if (month) filter.month = parseInt(month as string)
    if (year) filter.year = parseInt(year as string)
    const events = await CalendarEvent.find(filter).sort({ date: 1, time: 1 })
    res.json({ events })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.create({ ...req.body, userId: req.userId })
    res.status(201).json({ event })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!event) { res.status(404).json({ error: "Event not found" }); return }
    res.json({ event })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!event) { res.status(404).json({ error: "Event not found" }); return }
    res.json({ message: "Event deleted" })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/meeting", async (req: AuthRequest, res: Response) => {
  try {
    const { contactId, title, date, month, year, time, duration, description, myEmail, theirEmail } = req.body
    const sender = await User.findById(req.userId).select("name username email").lean()
    if (!sender) { res.status(404).json({ error: "User not found" }); return }

    const contact = await User.findById(contactId).select("name username email").lean()
    if (!contact) { res.status(404).json({ error: "Contact not found" }); return }

    // Create event for current user
    const myEvent = await CalendarEvent.create({
      userId: req.userId,
      date, month, year, title, time,
      seed: contact.username || contact.name || "",
      status: "confirmed",
      location: description || "",
      description: description || "",
      attendees: [contactId],
      duration: duration || 30,
      isMeeting: true,
    })

    // Create event for participant
    const theirEvent = await CalendarEvent.create({
      userId: contactId,
      date, month, year, title, time,
      seed: sender.username || sender.name || "",
      status: "tentative",
      location: description || "",
      description: description || "",
      attendees: [req.userId!],
      duration: duration || 30,
      isMeeting: true,
    })

    // In-app notification
    await Notification.create({
      userId: contactId,
      type: "meeting",
      fromUserId: req.userId,
      message: `${sender.name} invited you to "${title}" on ${month}/${date}/${year} at ${time}`,
      relatedId: theirEvent._id.toString(),
    })

    res.status(201).json({
      event: myEvent,
      meetingDetails: {
        title,
        date: `${month}/${date}/${year}`,
        time,
        duration: duration || 30,
        fromName: sender.name || "Someone",
        toName: contact.name || contact.username || "there",
        myEmail,
        theirEmail,
      },
    })

    res.status(201).json({ event: myEvent })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
