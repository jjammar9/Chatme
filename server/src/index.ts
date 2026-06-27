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
import seedRoutes from "./routes/seed"
import userRoutes from "./routes/users"
import friendRequestRoutes from "./routes/friendRequests"
import notificationRoutes from "./routes/notifications"
import uploadRoutes from "./routes/upload"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/calendar", calendarRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/seed", seedRoutes)
app.use("/api/users", userRoutes)
app.use("/api/friend-requests", friendRequestRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/uploads", express.static("uploads"))

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)

  socket.on("join:conversation", (conversationId: string) => {
    socket.join(conversationId)
  })

  socket.on("leave:conversation", (conversationId: string) => {
    socket.leave(conversationId)
  })

  socket.on("message:send", (data: { conversationId: string; message: Record<string, unknown> }) => {
    io.to(data.conversationId).emit("message:received", data.message)
  })

  socket.on("typing:start", (data: { conversationId: string; userId: string }) => {
    socket.to(data.conversationId).emit("typing:started", { userId: data.userId })
  })

  socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
    socket.to(data.conversationId).emit("typing:stopped", { userId: data.userId })
  })

  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id))
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
