import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { updateProfile, getAllUsers, updateUserStatus } from "../controllers/userController.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.route("/profile").put(protect, upload.single("profilePhoto"), updateProfile)
router.route("/").get(protect, getAllUsers)
router.route("/status").put(protect, updateUserStatus)

export default router

