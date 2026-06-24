import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" })
      return
    }
    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400).json({ error: "Email already in use" })
      return
    }
    const hashed = await bcrypt.hash(password, 10)
    const avatarSeed = name.split(" ")[0]
    const user = await User.create({ name, email, password: hashed, avatarSeed })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", { expiresIn: "7d" })
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarSeed: user.avatarSeed, role: user.role },
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
      user: { id: user._id, name: user.name, email: user.email, avatarSeed: user.avatarSeed, role: user.role },
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
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatarSeed: user.avatarSeed, role: user.role, online: user.online } })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
