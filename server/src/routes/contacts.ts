import { Router, Response } from "express"
import Contact from "../models/Contact"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await Contact.find({ userId: req.userId }).sort({ name: 1 })
    res.json({ contacts })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const contact = await Contact.create({ ...req.body, userId: req.userId })
    res.status(201).json({ contact })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!contact) { res.status(404).json({ error: "Contact not found" }); return }
    res.json({ contact })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!contact) { res.status(404).json({ error: "Contact not found" }); return }
    res.json({ message: "Contact deleted" })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
