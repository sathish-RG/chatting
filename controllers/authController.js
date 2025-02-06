import asyncHandler from "express-async-handler"
import generateToken from "../utils/generateToken.js"
import User from "../models/userModel.js"

export const signup = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body

  if (!name || !email || !username || !password) {
    res.status(400)
    throw new Error("Please provide all required fields")
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] })

  if (userExists) {
    res.status(400)
    throw new Error("User with this email or username already exists")
  }

  try {
    const user = await User.create({
      name,
      email,
      username,
      password,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error("Invalid user data")
    }
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

export const login = asyncHandler(async (req, res) => {
  const { login, password } = req.body

  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid email/username or password")
  }
})

