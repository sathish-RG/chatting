import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { createGroup, getGroups, updateGroup } from "../controllers/groupController.js"

const router = express.Router()

router.route("/").post(protect, createGroup).get(protect, getGroups)
router.route("/:id").put(protect, updateGroup)

export default router

