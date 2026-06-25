import { Router, Response } from "express"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/search", async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim()
    if (!q) {
      // Return recent users as suggestions when no query
      const users = await User.find({ _id: { $ne: req.userId } })
        .select("name username email avatarSeed role online createdAt").sort({ createdAt: -1 }).limit(10).lean()
      res.json({ users }); return
    }
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("name username email avatarSeed role online createdAt").limit(10).lean()
    res.json({ users })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/by-id/:id", async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("name username email avatarSeed role online createdAt")
    if (!user) { res.status(404).json({ error: "User not found" }); return }
    res.json({ user })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/batch", async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) { res.json({ users: [] }); return }
    const users = await User.find({ _id: { $in: ids } })
      .select("name username avatarSeed role online createdAt").lean()
    res.json({ users })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
