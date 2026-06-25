import { Router, Response } from "express"
import { authMiddleware, AuthRequest } from "../middleware/auth"
import { seedUserData } from "../lib/seedData"

const router = Router()

router.use(authMiddleware)

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    await seedUserData(req.userId!)
    res.json({ message: "Seed data inserted successfully" })
  } catch (err) {
    console.error("Seed error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
