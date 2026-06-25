import { Router, Response } from "express"
import FriendRequest from "../models/FriendRequest"
import Notification from "../models/Notification"
import Contact from "../models/Contact"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()
router.use(authMiddleware)

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body
    if (!receiverId) { res.status(400).json({ error: "Receiver ID is required" }); return }
    if (receiverId === req.userId) { res.status(400).json({ error: "Cannot send request to yourself" }); return }

    const existing = await FriendRequest.findOne({
      $or: [
        { senderId: req.userId, receiverId },
        { senderId: receiverId, receiverId: req.userId },
      ],
    })
    if (existing) {
      if (existing.status === "accepted") { res.status(400).json({ error: "Already friends" }); return }
      if (existing.status === "pending") { res.status(400).json({ error: "Friend request already sent" }); return }
      if (existing.status === "declined") {
        existing.status = "pending"
        await existing.save()
        const sender = await User.findById(req.userId).select("name username avatarSeed")
        await Notification.create({
          userId: receiverId, type: "friend_request",
          fromUserId: req.userId,
          message: `${sender?.name || "Someone"} sent you a friend request`,
          relatedId: existing._id.toString(),
        })
        res.json({ request: existing })
        return
      }
    }

    const request = await FriendRequest.create({ senderId: req.userId, receiverId })
    const sender = await User.findById(req.userId).select("name username avatarSeed")
    await Notification.create({
      userId: receiverId, type: "friend_request",
      fromUserId: req.userId,
      message: `${sender?.name || "Someone"} sent you a friend request`,
      relatedId: request._id.toString(),
    })
    res.status(201).json({ request })
  } catch { res.status(500).json({ error: "Server error" }) }
})

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const requests = await FriendRequest.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }],
    }).sort({ createdAt: -1 })
    res.json({ requests })
  } catch { res.status(500).json({ error: "Server error" }) }
})

router.put("/:id/accept", async (req: AuthRequest, res: Response) => {
  try {
    const request = await FriendRequest.findById(req.params.id)
    if (!request) { res.status(404).json({ error: "Request not found" }); return }
    if (request.receiverId !== req.userId) { res.status(403).json({ error: "Not your request to accept" }); return }
    if (request.status !== "pending") { res.status(400).json({ error: "Request already handled" }); return }

    request.status = "accepted"
    await request.save()

    const sender = await User.findById(request.senderId).select("name username email avatarSeed role online")
    const receiver = await User.findById(request.receiverId).select("name username email avatarSeed role online")

    if (sender) {
      await Contact.create({
        userId: request.receiverId, linkedUserId: request.senderId,
        name: sender.name, seed: sender.username || sender.name,
        email: sender.email, role: sender.role || "User",
        online: sender.online, favorite: false,
      })
    }
    if (receiver) {
      await Contact.create({
        userId: request.senderId, linkedUserId: request.receiverId,
        name: receiver.name, seed: receiver.username || receiver.name,
        email: receiver.email, role: receiver.role || "User",
        online: receiver.online, favorite: false,
      })
    }

    await Notification.create({
      userId: request.senderId, type: "friend_accepted",
      fromUserId: req.userId,
      message: `${receiver?.name || "Someone"} accepted your friend request`,
      relatedId: request._id.toString(),
    })

    res.json({ request })
  } catch { res.status(500).json({ error: "Server error" }) }
})

router.put("/:id/decline", async (req: AuthRequest, res: Response) => {
  try {
    const request = await FriendRequest.findById(req.params.id)
    if (!request) { res.status(404).json({ error: "Request not found" }); return }
    if (request.receiverId !== req.userId) { res.status(403).json({ error: "Not your request to decline" }); return }
    if (request.status !== "pending") { res.status(400).json({ error: "Request already handled" }); return }

    request.status = "declined"
    await request.save()
    res.json({ request })
  } catch { res.status(500).json({ error: "Server error" }) }
})

export default router
