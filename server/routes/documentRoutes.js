import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/documentController.js";
const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single("document")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

router.post("/upload", protect, handleUpload, uploadDocument);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocument);
router.delete("/:id", protect, deleteDocument);

export default router;
