import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import Chat from "../models/Chat.js";
import fs from "fs";
import { extractTextFromPDF } from "../services/pdfService.js";
import { extractTextWithGemini } from "../services/geminiFileService.js";
import { createChunks } from "../services/chunkService.js";

const deleteLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Upload Document
export const uploadDocument = async (req, res) => {
  let document = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF",
      });
    }

    let extractedText = await extractTextFromPDF(req.file.path);
    let geminiFileUri = "";
    let geminiFileName = "";

    if (!extractedText.trim()) {
      const geminiExtraction = await extractTextWithGemini(
        req.file.path,
        req.file.originalname,
      );

      extractedText = geminiExtraction.text;
      geminiFileUri = geminiExtraction.fileUri;
      geminiFileName = geminiExtraction.fileName;
    }

    if (!extractedText.trim()) {
      deleteLocalFile(req.file.path);

      return res.status(422).json({
        success: false,
        message: "No readable text could be extracted from this PDF.",
      });
    }

    // Save document
    document = await Document.create({
      user: req.user._id,
      title: req.file.originalname,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      geminiFileUri,
      geminiFileName,
    });

    // Create chunks
    const chunks = createChunks(extractedText);

    // Save chunks
    const chunkDocs = chunks.map((chunk, index) => ({
      document: document._id,
      user: req.user._id,
      chunkIndex: index,
      content: chunk,
    }));

    await DocumentChunk.insertMany(chunkDocs);

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
      chunks: chunkDocs.length,
    });

  } catch (error) {
    console.error(error);

    if (document) {
      await DocumentChunk.deleteMany({
        document: document._id,
        user: req.user._id,
      });
      await document.deleteOne();
    }

    deleteLocalFile(req.file?.path);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get All Documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Document
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const uploadPath = req.file?.path || `uploads/${document.fileName}`;

    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }

    await DocumentChunk.deleteMany({
      document: document._id,
      user: req.user._id,
    });
    await Chat.deleteMany({
      document: document._id,
      user: req.user._id,
    });
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
