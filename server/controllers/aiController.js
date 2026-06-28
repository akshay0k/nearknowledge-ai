import Chat from "../models/Chat.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateGeminiContent } from "../services/geminiGenerateService.js";

const CONTEXT_CHAR_LIMIT = Number(process.env.DOCUMENT_CONTEXT_LIMIT || 12000);
const ANSWER_MAX_OUTPUT_TOKENS = Number(
  process.env.GEMINI_ANSWER_MAX_OUTPUT_TOKENS || 900,
);
const ANSWER_GENERATION_CONFIG = {
  temperature: 0.3,
  maxOutputTokens: ANSWER_MAX_OUTPUT_TOKENS,
};
const QUESTION_STOP_WORDS = new Set([
  "about",
  "also",
  "and",
  "any",
  "anything",
  "are",
  "can",
  "could",
  "did",
  "does",
  "explain",
  "for",
  "from",
  "give",
  "have",
  "how",
  "into",
  "pdf",
  "please",
  "tell",
  "that",
  "the",
  "this",
  "was",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "would",
  "you",
]);

const getQuestionTerms = (question) =>
  [
    ...new Set(
      question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !QUESTION_STOP_WORDS.has(word)),
    ),
  ];

const scoreChunk = (content, terms) => {
  const lowerContent = content.toLowerCase();

  return terms.reduce((score, term) => {
    return lowerContent.includes(term) ? score + 1 : score;
  }, 0);
};

const isOverviewQuestion = (question) =>
  /summary|summarize|overview|main point|main idea|explain this|what is this (pdf|document)|about this (pdf|document)/i.test(
    question,
  );

const selectRelevantChunks = (question, chunks) => {
  const terms = getQuestionTerms(question);
  let selectedChunks = chunks;

  if (!isOverviewQuestion(question) && terms.length > 0) {
    const rankedChunks = chunks
      .map((chunk) => ({
        chunk,
        score: scoreChunk(chunk.content, terms),
      }))
      .sort((a, b) => b.score - a.score);

    if (rankedChunks[0]?.score > 0) {
      selectedChunks = rankedChunks
        .filter((item) => item.score > 0)
        .slice(0, 8)
        .map((item) => item.chunk)
        .sort((a, b) => a.chunkIndex - b.chunkIndex);
    }
  }

  const selectedContent = [];
  let totalLength = 0;

  for (const chunk of selectedChunks) {
    if (totalLength >= CONTEXT_CHAR_LIMIT) break;

    const remaining = CONTEXT_CHAR_LIMIT - totalLength;
    const content = chunk.content.slice(0, remaining);

    selectedContent.push(content);
    totalLength += content.length;
  }

  return selectedContent.join("\n\n");
};

const getReadableSentences = (text) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40);

const createLocalFallbackAnswer = (question, chunks) => {
  const context = selectRelevantChunks(question, chunks).trim();

  if (!context) {
    return "I can see the PDF is uploaded, but I could not read enough text from it to answer this question.";
  }

  const sentences = getReadableSentences(context);
  const excerpt =
    sentences.slice(0, isOverviewQuestion(question) ? 5 : 3).join(" ") ||
    context.slice(0, 1600);

  if (isOverviewQuestion(question)) {
    return `Summary from the PDF:\n\n${excerpt}`;
  }

  return `From the PDF, the most relevant information is:\n\n${excerpt}`;
};

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
      config: ANSWER_GENERATION_CONFIG,
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
    })
      .select("content chunkIndex")
      .sort({ chunkIndex: 1 })
      .lean();

    if (chunks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No document content found.",
      });
    }

    const context = selectRelevantChunks(question, chunks);

    // Create prompt
    const prompt = `
You are NearKnowledge AI, a helpful assistant for uploaded PDFs.

Use the PDF context as your primary source. The user may ask for direct facts, summaries, explanations, examples, related concepts, or general questions inspired by the PDF.

Rules:
1. If the answer is in the PDF context, answer directly from it.
2. If the user asks for explanation or related background, use the PDF context plus your general knowledge to explain clearly.
3. If the question is not directly answered by the PDF, still answer helpfully. Briefly say when something is not directly stated in the PDF instead of refusing.
4. Do not reply with "I couldn't find that information in the uploaded document" unless the user specifically asks whether exact information exists in the PDF.
5. Keep the answer clear, useful, and concise.

PDF context:
${context}

Question:
${question}
`;

    let answer;

    try {
      const response = await generateGeminiContent({
        contents: prompt,
        config: ANSWER_GENERATION_CONFIG,
      });

      answer = response.text?.trim() || createLocalFallbackAnswer(question, chunks);
    } catch (error) {
      console.warn(
        `Gemini document chat fallback used. Status: ${
          error.status || error.code || "unknown"
        }`,
      );
      answer = createLocalFallbackAnswer(question, chunks);
    }

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
