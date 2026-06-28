import Chat from "../models/Chat.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateGeminiContent } from "../services/geminiGenerateService.js";

// General AI Chat
export const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const response = await generateGeminiContent({
      contents: question,
    });

    res.status(200).json({
      success: true,
      answer: response.text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Chat with Uploaded Document
export const chatWithDocument = async (req, res) => {
  try {
    const { question } = req.body;
    const { documentId } = req.params;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Get all chunks of the document
    const chunks = await DocumentChunk.find({
      document: documentId,
      user: req.user._id,
    }).sort({ chunkIndex: 1 });

    if (chunks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No document content found.",
      });
    }

    // Combine all chunk text
    const context = chunks.map((chunk) => chunk.content).join("\n");

    // Create prompt
    const prompt = `
You are an AI Knowledge Assistant.

Answer ONLY using the document below.

If the answer is not available in the document, reply:

"I couldn't find that information in the uploaded document."

Document:
${context}

Question:
${question}
`;

    // Ask Gemini
    const response = await generateGeminiContent({
      contents: prompt,
    });

    const answer = response.text;

    // Save chat history
    await Chat.create({
      user: req.user._id,
      document: documentId,
      question,
      answer,
    });

    res.status(200).json({
      success: true,
      answer,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user._id,
    })
      .populate("document", "title originalName fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
