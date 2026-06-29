import { Server, Socket } from "socket.io"
import jwt from "jsonwebtoken"
import User from "../models/User"

export function setupSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      if (!token) return next(new Error("Authentication required"))
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || "") as { userId: string }
      ;(socket as any).userId = decoded.userId
      next()
    } catch {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId
    console.log("Socket connected:", userId)

    await User.findByIdAndUpdate(userId, { online: true })
    socket.broadcast.emit("user:online", userId)

    socket.on("join:conversation", (conversationId: string) => {
      socket.join(conversationId)
    })

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(conversationId)
    })

    socket.on("typing:start", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("typing:started", { userId, conversationId: data.conversationId })
    })

    socket.on("typing:stop", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("typing:stopped", { userId, conversationId: data.conversationId })
    })

    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", userId)
      await User.findByIdAndUpdate(userId, { online: false })
      socket.broadcast.emit("user:offline", userId)
    })
  })
}
