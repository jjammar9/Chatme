import { Router, Response } from "express"
import Notification from "../models/Notification"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()
router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 }).limit(20)
    const unread = await Notification.countDocuments({ userId: req.userId, read: false })
    res.json({ notifications, unread })
  } catch { res.status(500).json({ error: "Server error" }) }
})

router.put("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    )
    if (!notification) { res.status(404).json({ error: "Notification not found" }); return }
    res.json({ notification })
  } catch { res.status(500).json({ error: "Server error" }) }
})

router.put("/read-all", async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
    res.json({ message: "All notifications marked as read" })
  } catch { res.status(500).json({ error: "Server error" }) }
})

export default router
