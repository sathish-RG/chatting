import asyncHandler from "express-async-handler"
import Message from "../models/messageModel.js"

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, receiverId } = req.body
  const senderId = req.user._id

  let fileUrl = null
  if (req.file) {
    fileUrl = `http://localhost:5000/uploads/${req.file.filename}`
  }

  const newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
    fileUrl,
  })

  res.status(201).json(newMessage)
})

export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const currentUserId = req.user._id

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  }).sort({ createdAt: 1 })

  res.json(messages)
})

