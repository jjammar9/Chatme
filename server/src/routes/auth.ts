import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, username, email, password } = req.body
    if (!name || !username || !email || !password) {
      res.status(400).json({ error: "Name, username, email, and password are required" })
      return
    }
    const existing = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] })
    if (existing) {
      res.status(400).json({ error: "Email or username already in use" })
      return
    }
    const hashed = await bcrypt.hash(password, 10)
    const avatarSeed = username.split(" ")[0]
    const user = await User.create({ name, username: username.toLowerCase(), email, password: hashed, avatarSeed })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", { expiresIn: "7d" })
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarSeed: user.avatarSeed, avatarUrl: user.avatarUrl, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }
    const user = await User.findOne({ email })
    if (!user) {
      res.status(400).json({ error: "Invalid email or password" })
      return
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(400).json({ error: "Invalid email or password" })
      return
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", { expiresIn: "7d" })
    res.json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarSeed: user.avatarSeed, avatarUrl: user.avatarUrl, role: user.role },
    })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }
    res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarSeed: user.avatarSeed, avatarUrl: user.avatarUrl, role: user.role, online: user.online } })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatarUrl } = req.body
    const update: Record<string, string> = {}
    if (name) update.name = name
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password")
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }
    res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarSeed: user.avatarSeed, avatarUrl: user.avatarUrl, role: user.role, online: user.online } })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
