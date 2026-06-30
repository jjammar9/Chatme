import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import { connectDB } from "./config/db"
import authRoutes from "./routes/auth"
import taskRoutes from "./routes/tasks"
import calendarRoutes from "./routes/calendar"
import contactRoutes from "./routes/contacts"
import fileRoutes from "./routes/files"
import conversationRoutes from "./routes/conversations"
import communityRoutes from "./routes/communities"
import seedRoutes from "./routes/seed"
import userRoutes from "./routes/users"
import friendRequestRoutes from "./routes/friendRequests"
import notificationRoutes from "./routes/notifications"
import uploadRoutes from "./routes/upload"
import activityRoutes from "./routes/activity"
import { setupSocket } from "./socket"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

app.set("io", io)

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/calendar", calendarRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/communities", communityRoutes)
app.use("/api/seed", seedRoutes)
app.use("/api/users", userRoutes)
app.use("/api/friend-requests", friendRequestRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/activity", activityRoutes)
app.use("/uploads", express.static("uploads"))

setupSocket(io)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
