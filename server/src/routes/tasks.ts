import { Router, Response } from "express"
import Task from "../models/Task"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ tasks })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.userId })
    res.status(201).json({ task })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!task) { res.status(404).json({ error: "Task not found" }); return }
    res.json({ task })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!task) { res.status(404).json({ error: "Task not found" }); return }
    res.json({ message: "Task deleted" })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
