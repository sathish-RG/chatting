import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import fs from "fs"
import path from "path"

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.username = req.body.username || user.username
    user.bio = req.body.bio || user.bio
    if (req.body.password) {
      user.password = req.body.password
    }
    if (req.file) {
      // Remove old profile photo if it exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(process.cwd(), user.profilePhoto)
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }
      user.profilePhoto = `/uploads/${req.file.filename}`
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePhoto: updatedUser.profilePhoto,
      bio: updatedUser.bio,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password")
  res.json(users)
})

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const user = await User.findById(req.user._id)

  if (user) {
    user.status = status
    await user.save()
    res.json({ message: "Status updated successfully" })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

