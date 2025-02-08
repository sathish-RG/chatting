import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { updateProfile, getAllUsers, updateUserStatus, getUserProfile } from "../controllers/userController.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.route("/profile").get(protect, getUserProfile).put(protect, upload.single("profilePhoto"), updateProfile)
router.route("/").get(protect, getAllUsers)
router.route("/status").put(protect, updateUserStatus)

export default router

