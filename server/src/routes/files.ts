import { Router, Response } from "express"
import FileItem from "../models/FileItem"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const files = await FileItem.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ files })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const file = await FileItem.create({ ...req.body, userId: req.userId })
    res.status(201).json({ file })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const file = await FileItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!file) { res.status(404).json({ error: "File not found" }); return }
    res.json({ file })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const file = await FileItem.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!file) { res.status(404).json({ error: "File not found" }); return }
    res.json({ message: "File deleted" })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
