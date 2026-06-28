import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  askAI,
  chatWithDocument,
  getChatHistory,
} from "../controllers/aiController.js";

const router = express.Router();

// General AI Chat
router.post("/chat", protect, askAI);

router.get("/history", protect, getChatHistory);

// Chat with uploaded document
router.post("/document-chat/:documentId", protect, chatWithDocument);

export default router;
