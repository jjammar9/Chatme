import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import { connectDB } from "./config/db"
import authRoutes from "./routes/auth"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id))
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
