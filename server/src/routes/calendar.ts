import { Router, Response } from "express"
import CalendarEvent from "../models/CalendarEvent"
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

export default router
