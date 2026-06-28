import { Router, Response } from "express"
import Conversation from "../models/Conversation"
import Message from "../models/Message"
import Notification from "../models/Notification"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
      lastMessage: { $exists: true, $ne: "" },
    }).sort({ lastMessageTime: -1, createdAt: -1 }).lean()

    // Collect unique participant IDs excluding current user
    const allIds = new Set<string>()
    for (const c of conversations) {
      for (const p of c.participants) {
        if (p !== req.userId) allIds.add(p)
      }
    }

    // Fetch user details for all participants in one query
    const users = await User.find({ _id: { $in: Array.from(allIds) } })
      .select("name username avatarSeed online").lean()

    const userMap: Record<string, { name: string; username: string; avatarSeed: string; online: boolean }> = {}
    for (const u of users) {
      userMap[u._id.toString()] = { name: u.name || "Unknown", username: u.username || "", avatarSeed: u.avatarSeed || u.name || u.username || "", online: u.online || false }
    }

    // Fetch unread counts for all conversations
    const convIds = conversations.map((c) => c._id.toString())
    const unreadCounts = await Message.aggregate([
      { $match: { conversationId: { $in: convIds }, senderId: { $ne: req.userId } } },
      { $group: { _id: "$conversationId", count: { $sum: { $cond: [{ $in: [req.userId, "$readBy"] }, 0, 1] } } } },
    ])
    const unreadMap: Record<string, number> = {}
    for (const u of unreadCounts) unreadMap[u._id] = u.count

    const enriched = conversations.map((c) => ({
      ...c,
      participantDetails: c.participants
        .filter((p) => p !== req.userId)
        .map((p) => userMap[p] || { name: "Unknown", username: "", avatarSeed: p }),
      unreadCount: unreadMap[c._id.toString()] || 0,
      isFavourite: (c.isFavourite || []).includes(req.userId!),
    }))

    res.json({ conversations: enriched })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { participants: rawParticipants, isGroup, groupName, groupAvatar } = req.body
    let participants = rawParticipants
    if (!participants.includes(req.userId)) participants.push(req.userId)
    participants = [...new Set(participants)]

    // Check if a DM conversation already exists between these exact participants
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false,
      }).lean()
      if (existing) {
        const otherUsers = await User.find({ _id: { $in: participants.filter((p: string) => p !== req.userId) } })
          .select("name username avatarSeed").lean()
        const userMap: Record<string, any> = {}
        for (const u of otherUsers) userMap[u._id.toString()] = { name: u.name, username: u.username, avatarSeed: u.avatarSeed || u.name || u.username || "" }
        res.json({ conversation: { ...existing, participantDetails: participants.filter((p: string) => p !== req.userId).map((p: string) => userMap[p] || { name: "Unknown", username: "", avatarSeed: p }), isFavourite: (existing.isFavourite || []).includes(req.userId!) } })
        return
      }
    }

    const conversation = await Conversation.create({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || "",
      groupAvatar: groupAvatar || "",
    })

    // Enrich response with participant details
    const otherUserIds = participants.filter((p: string) => p !== req.userId)
    const otherUsers = await User.find({ _id: { $in: otherUserIds } })
      .select("name username avatarSeed").lean()
    const userMap: Record<string, any> = {}
    for (const u of otherUsers) userMap[u._id.toString()] = { name: u.name, username: u.username, avatarSeed: u.avatarSeed || u.name || u.username || "" }
    const enriched = {
      ...conversation.toObject(),
      participantDetails: otherUserIds.map((p: string) => userMap[p] || { name: "Unknown", username: "", avatarSeed: p }),
      isFavourite: (conversation.isFavourite || []).includes(req.userId!),
    }

    res.status(201).json({ conversation: enriched })
  } catch (e) {
    console.error(e)
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

router.put("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return }
    if (!conversation.participants.includes(req.userId!)) {
      res.status(403).json({ error: "Not a participant" }); return
    }
    await Message.updateMany(
      { conversationId: req.params.id, senderId: { $ne: req.userId }, readBy: { $ne: req.userId } },
      { $push: { readBy: req.userId } }
    )
    // Mark related notifications as read
    await Notification.updateMany(
      { relatedId: req.params.id, userId: req.userId, type: "message", read: false },
      { $set: { read: true } }
    )
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id/favourite", async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return }
    if (!conversation.participants.includes(req.userId!)) {
      res.status(403).json({ error: "Not a participant" }); return
    }
    const idx = conversation.isFavourite.indexOf(req.userId!)
    if (idx > -1) conversation.isFavourite.splice(idx, 1)
    else conversation.isFavourite.push(req.userId!)
    await conversation.save()
    res.json({ isFavourite: conversation.isFavourite.includes(req.userId!) })
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
    const { senderName, senderSeed, content, type, fileUrl, fileName, fileSize, fileMimeType } = req.body
    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.userId,
      senderName: senderName || "",
      senderSeed: senderSeed || "",
      content,
      type: type || "text",
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      readBy: [req.userId],
    })
    conversation.lastMessage = content
    conversation.lastMessageTime = message.createdAt
    await conversation.save()

    // Notify other participants
    const sender = await User.findById(req.userId).select("name username").lean()
    for (const pid of conversation.participants) {
      if (pid !== req.userId) {
        await Notification.create({
          userId: pid,
          type: "message",
          fromUserId: req.userId,
          message: `${sender?.name || "Someone"} sent you a message${type === "image" ? " 📷" : type === "file" ? " 📎" : ""}: ${type === "text" ? (content.length > 50 ? content.slice(0, 50) + "..." : content) : ""}`,
          relatedId: req.params.id,
        })
      }
    }

    res.status(201).json({ message })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
