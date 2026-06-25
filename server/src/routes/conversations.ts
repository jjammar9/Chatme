import { Router, Response } from "express"
import Conversation from "../models/Conversation"
import Message from "../models/Message"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    }).sort({ lastMessageTime: -1, createdAt: -1 })
    res.json({ conversations })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { participants, isGroup, groupName, groupAvatar } = req.body
    if (!participants.includes(req.userId)) participants.push(req.userId)
    const conversation = await Conversation.create({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || "",
      groupAvatar: groupAvatar || "",
    })
    res.status(201).json({ conversation })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/:id/messages", async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return }
    if (!conversation.participants.includes(req.userId!)) {
      res.status(403).json({ error: "Not a participant" }); return
    }
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 })
    res.json({ messages })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/:id/messages", async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return }
    if (!conversation.participants.includes(req.userId!)) {
      res.status(403).json({ error: "Not a participant" }); return
    }
    const { senderName, senderSeed, content, type } = req.body
    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.userId,
      senderName: senderName || "",
      senderSeed: senderSeed || "",
      content,
      type: type || "text",
      readBy: [req.userId],
    })
    conversation.lastMessage = content
    conversation.lastMessageTime = message.createdAt
    await conversation.save()
    res.status(201).json({ message })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
