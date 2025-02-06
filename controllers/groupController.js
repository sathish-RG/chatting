import asyncHandler from "express-async-handler"
import Group from "../models/groupModel.js"

export const createGroup = asyncHandler(async (req, res) => {
  const { name, members } = req.body

  const group = await Group.create({
    name,
    members: [...members, req.user._id],
    admin: req.user._id,
  })

  const populatedGroup = await Group.findById(group._id).populate("members", "name username profilePhoto")

  res.status(201).json(populatedGroup)
})

export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate("members", "name username profilePhoto")
  res.json(groups)
})

export const updateGroup = asyncHandler(async (req, res) => {
  const { name, addMembers, removeMembers } = req.body
  const group = await Group.findById(req.params.id)

  if (!group) {
    res.status(404)
    throw new Error("Group not found")
  }

  if (group.admin.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to update this group")
  }

  group.name = name || group.name

  if (addMembers && addMembers.length > 0) {
    group.members = [...new Set([...group.members, ...addMembers])]
  }

  if (removeMembers && removeMembers.length > 0) {
    group.members = group.members.filter((member) => !removeMembers.includes(member.toString()))
  }

  const updatedGroup = await group.save()
  const populatedGroup = await Group.findById(updatedGroup._id).populate("members", "name username profilePhoto")

  res.json(populatedGroup)
})

