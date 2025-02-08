import asyncHandler from "express-async-handler"
import Message from "../models/messageModel.js"
import User from "../models/userModel.js"
import Chat from "../models/chatModel.js"

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body

  if (!content || !chatId) {
    res.status(400)
    throw new Error("Invalid data passed into request")
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  }

  if (req.file) {
    newMessage.fileUrl = `/uploads/${req.file.filename}`
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    })

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })

    res.json(message)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

export const getUserMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name pic email")
      .populate("receiver", "name pic email")
    res.json(messages)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

export const getGroupMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "name pic email")
      .populate("chat")
    res.json(messages)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

export const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId
  const userId = req.user._id

  const message = await Message.findById(messageId)

  if (!message) {
    res.status(404)
    throw new Error("Message not found")
  }

  const chat = await Chat.findById(message.chat)

  if (!chat) {
    res.status(404)
    throw new Error("Chat not found")
  }

  if (message.sender.toString() !== userId.toString() && chat.groupAdmin.toString() !== userId.toString()) {
    res.status(403)
    throw new Error("You don't have permission to delete this message")
  }

  await Message.findByIdAndDelete(messageId)

  res.json({ message: "Message deleted successfully" })
})

export const editMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId
  const { content } = req.body
  const userId = req.user._id

  const message = await Message.findById(messageId)

  if (!message) {
    res.status(404)
    throw new Error("Message not found")
  }

  const chat = await Chat.findById(message.chat)

  if (!chat) {
    res.status(404)
    throw new Error("Chat not found")
  }

  if (message.sender.toString() !== userId.toString() && chat.groupAdmin.toString() !== userId.toString()) {
    res.status(403)
    throw new Error("You don't have permission to edit this message")
  }

  message.content = content
  await message.save()

  res.json(message)
})

