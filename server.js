import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { WebSocketServer } from "ws"
import path from "path"
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import groupRoutes from "./routes/groupRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const wss = new WebSocketServer({ server: httpServer })

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/groups", groupRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected")
  let userData

  socket.on("setup", (data) => {
    userData = data
    socket.join(userData._id)
    socket.emit("connected")
  })

  socket.on("join chat", (room) => {
    socket.join(room)
    console.log("User joined room: " + room)
  })

  socket.on("typing", (room) => socket.in(room).emit("typing"))
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat

    if (!chat.users) return console.log("chat.users not defined")

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return

      socket.in(user._id).emit("message received", newMessageReceived)
    })
  })

  socket.off("setup", () => {
    console.log("USER DISCONNECTED")
    socket.leave(userData._id)
  })
})

// WebSocket for status updates
wss.on("connection", (ws) => {
  console.log("WebSocket client connected")

  ws.on("message", (message) => {
    const data = JSON.parse(message)
    if (data.type === "statusUpdate") {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data))
        }
      })
    }
  })
})

