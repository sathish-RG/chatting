import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
  sendMessage,
  getUserMessages,
  getGroupMessages,
  deleteMessage,
  editMessage,
} from "../controllers/messageController.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.route("/").post(protect, upload.single("file"), sendMessage)
router.route("/user/:userId").get(protect, getUserMessages)
router.route("/group/:groupId").get(protect, getGroupMessages)
router.route("/:messageId").delete(protect, deleteMessage).put(protect, editMessage)

export default router

