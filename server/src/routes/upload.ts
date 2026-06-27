import { Router, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const uploadDir = path.join(__dirname, "..", "..", "uploads")
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|avi|pdf|doc|docx|txt|zip|webm|wav|mp3|ogg)$/i
    if (allowed.test(path.extname(file.originalname))) cb(null, true)
    else cb(new Error("File type not allowed"))
  },
})

const router = Router()
router.use(authMiddleware)

router.post("/", upload.single("file"), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return }
    const url = `/uploads/${req.file.filename}`
    res.json({ url, filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype })
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Upload failed" })
  }
})

export default router
