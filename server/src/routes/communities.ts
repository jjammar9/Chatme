import { Router, Response } from "express"
import Community from "../models/Community"
import User from "../models/User"
import Notification from "../models/Notification"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.use(authMiddleware)

async function enrichCommunity(community: any, userId: string) {
  const allIds = [...new Set<string>([...community.members, ...community.admins])]
  const users = await User.find({ _id: { $in: allIds } }).select("name avatarSeed online").lean()
  const userMap: Record<string, any> = {}
  for (const u of users) userMap[u._id.toString()] = { name: u.name || "Unknown", avatarSeed: u.avatarSeed || u.name || u.username || "", online: u.online || false }
  const pendingReq = (community.joinRequests || []).find((r: any) => r.userId === userId && r.status === "pending")
  return {
    ...community,
    memberCount: community.members.length,
    onlineCount: community.members.filter((m: string) => userMap[m]?.online).length,
    memberDetails: community.members.map((m: string) => userMap[m] || { name: "Unknown", avatarSeed: m, online: false }),
    isMember: community.members.includes(userId),
    isAdmin: community.admins.includes(userId),
    pendingRequest: pendingReq ? pendingReq.status : null,
  }
}

// List all communities
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 }).lean()
    const enriched = await Promise.all(communities.map((c) => enrichCommunity(c, req.userId!)))
    res.json({ communities: enriched })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// Create community
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, tags, avatarSeed } = req.body
    if (!name || !name.trim()) { res.status(400).json({ error: "Name is required" }); return }
    const community = await Community.create({
      name: name.trim(),
      description: description?.trim() || "",
      tags: tags || [],
      avatarSeed: avatarSeed || name.trim(),
      members: [req.userId!],
      admins: [req.userId!],
      createdBy: req.userId!,
    })
    const enriched = await enrichCommunity(community.toObject(), req.userId!)
    res.status(201).json({ community: enriched })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// Get single community
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id).lean()
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    const enriched = await enrichCommunity(community, req.userId!)
    res.json({ community: enriched })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Update community
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.admins.includes(req.userId!)) { res.status(403).json({ error: "Not authorized" }); return }
    const { name, description, tags, avatarSeed } = req.body
    if (name) community.name = name.trim()
    if (description !== undefined) community.description = description.trim()
    if (tags) community.tags = tags
    if (avatarSeed) community.avatarSeed = avatarSeed
    await community.save()
    res.json({ community })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Delete community
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.admins.includes(req.userId!)) { res.status(403).json({ error: "Not authorized" }); return }
    await Community.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Request to join community
router.post("/:id/request-join", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (community.members.includes(req.userId!)) { res.status(400).json({ error: "Already a member" }); return }
    const existing = (community.joinRequests || []).find((r) => r.userId === req.userId && r.status === "pending")
    if (existing) { res.status(400).json({ error: "Request already pending" }); return }
    community.joinRequests.push({ userId: req.userId!, status: "pending", createdAt: new Date() })
    await community.save()
    const requester = await User.findById(req.userId).select("name").lean()
    // Notify all admins
    for (const adminId of community.admins) {
      if (adminId !== req.userId) {
        await Notification.create({
          userId: adminId,
          type: "community_join_request",
          fromUserId: req.userId!,
          message: `${requester?.name || "Someone"} wants to join "${community.name}"`,
          relatedId: community._id.toString(),
        })
      }
    }
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Admin accepts join request
router.post("/:id/accept-request/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.admins.includes(req.userId!)) { res.status(403).json({ error: "Not authorized" }); return }
    const request = (community.joinRequests || []).find((r) => r.userId === req.params.userId && r.status === "pending")
    if (!request) { res.status(400).json({ error: "No pending request" }); return }
    request.status = "accepted"
    if (!community.members.includes(req.params.userId)) community.members.push(req.params.userId)
    await community.save()
    await Notification.create({
      userId: req.params.userId,
      type: "request_accepted",
      fromUserId: req.userId!,
      message: `Your request to join "${community.name}" was accepted`,
      relatedId: community._id.toString(),
    })
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Admin declines join request
router.post("/:id/decline-request/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.admins.includes(req.userId!)) { res.status(403).json({ error: "Not authorized" }); return }
    const request = (community.joinRequests || []).find((r) => r.userId === req.params.userId && r.status === "pending")
    if (!request) { res.status(400).json({ error: "No pending request" }); return }
    request.status = "declined"
    await community.save()
    const admin = await User.findById(req.userId).select("name").lean()
    await Notification.create({
      userId: req.params.userId,
      type: "request_declined",
      fromUserId: req.userId!,
      message: `Your request to join "${community.name}" was declined by ${admin?.name || "an admin"}`,
      relatedId: community._id.toString(),
    })
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// Admin invites a user to join
router.post("/:id/invite", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.admins.includes(req.userId!)) { res.status(403).json({ error: "Not authorized" }); return }
    const { userId: targetUserId } = req.body
    if (!targetUserId) { res.status(400).json({ error: "userId required" }); return }
    if (community.members.includes(targetUserId)) { res.status(400).json({ error: "Already a member" }); return }
    const admin = await User.findById(req.userId).select("name").lean()
    await Notification.create({
      userId: targetUserId,
      type: "community_invite",
      fromUserId: req.userId!,
      message: `${admin?.name || "An admin"} invited you to join "${community.name}"`,
      relatedId: community._id.toString(),
    })
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// User accepts community invite
router.post("/:id/accept-invite", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (community.members.includes(req.userId!)) { res.status(400).json({ error: "Already a member" }); return }
    community.members.push(req.userId!)
    await community.save()
    const user = await User.findById(req.userId).select("name").lean()
    // Notify admins
    for (const adminId of community.admins) {
      if (adminId !== req.userId) {
        await Notification.create({
          userId: adminId,
          type: "invite_accepted",
          fromUserId: req.userId!,
          message: `${user?.name || "Someone"} accepted your invitation to join "${community.name}"`,
          relatedId: community._id.toString(),
        })
      }
    }
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

// User declines community invite
router.post("/:id/decline-invite", async (_req: AuthRequest, res: Response) => {
  // Nothing to do — notification will be marked read client-side
  res.json({ ok: true })
})

// Leave community
router.post("/:id/leave", async (req: AuthRequest, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) { res.status(404).json({ error: "Community not found" }); return }
    if (!community.members.includes(req.userId!)) { res.status(400).json({ error: "Not a member" }); return }
    community.members = community.members.filter((m) => m !== req.userId)
    await community.save()
    res.json({ ok: true })
  } catch { res.status(500).json({ error: "Server error" }) }
})

export default router
