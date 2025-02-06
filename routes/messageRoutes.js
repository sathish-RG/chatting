import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { sendMessage, getMessages } from "../controllers/messageController.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.post("/", protect, upload.single("file"), sendMessage)
router.get("/:userId", protect, getMessages)

export default router

