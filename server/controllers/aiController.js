import Chat from "../models/Chat.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateGeminiContent } from "../services/geminiGenerateService.js";

const CONTEXT_CHAR_LIMIT = Number(process.env.DOCUMENT_CONTEXT_LIMIT || 12000);
const ANSWER_MAX_OUTPUT_TOKENS = Number(
  process.env.GEMINI_ANSWER_MAX_OUTPUT_TOKENS || 1400,
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

const isCreationRequest = (question) =>
  /\b(create|make|write|draft|generate|prepare|build|compose|design)\b/i.test(
    question,
  );

const isChangeRequest = (question) =>
  /\b(change|rewrite|reword|improve|edit|modify|convert|translate|format|fix|update)\b/i.test(
    question,
  );

const referencesDocumentContext = (question) =>
  isOverviewQuestion(question) ||
  /\b(pdf|document|file|uploaded|this|that|it|above|text|content|page|chapter|section|according to|based on|from the)\b/i.test(
    question,
  );

const selectRelevantChunks = (question, chunks) => {
  const terms = getQuestionTerms(question);
  let selectedChunks = chunks;
  let hasMatchingChunks = false;

  if (!isOverviewQuestion(question) && terms.length > 0) {
    const rankedChunks = chunks
      .map((chunk) => ({
        chunk,
        score: scoreChunk(chunk.content, terms),
      }))
      .sort((a, b) => b.score - a.score);

    if (rankedChunks[0]?.score > 0) {
      hasMatchingChunks = true;
      selectedChunks = rankedChunks
        .filter((item) => item.score > 0)
        .slice(0, 8)
        .map((item) => item.chunk)
        .sort((a, b) => a.chunkIndex - b.chunkIndex);
    }
  }

  if (!referencesDocumentContext(question) && !hasMatchingChunks) {
    return "";
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

const getRequestedItemCount = (question) => {
  const match = question.match(
    /\b(\d{1,2})\s*(bullet|point|item|idea|step|section|part)s?\b/i,
  );
  const count = Number(match?.[1] || 3);

  return Math.min(Math.max(count, 1), 8);
};

const getRequestSubject = (question) =>
  question
    .replace(
      /^(please\s+)?(can you\s+|could you\s+|would you\s+)?(create|make|write|draft|generate|prepare|build|compose|design|change|rewrite|reword|improve|edit|modify|convert|translate|format|fix|update)\s+/i,
      "",
    )
    .trim()
    .replace(/[?.!]+$/, "");

const createStarterContent = (question, context) => {
  const itemCount = getRequestedItemCount(question);
  const subject = getRequestSubject(question) || "the requested content";
  const contextIdea = getReadableSentences(context)[0];
  const contextLine = contextIdea ? `\n\nPDF idea to use: ${contextIdea}` : "";
  const items = [
    `Goal: Create ${subject} with a clear purpose and audience.`,
    "Structure: Start with the most important information, then add supporting details.",
    "Content: Include specific examples, names, sections, or steps that make the result practical.",
    "Style: Keep it simple, polished, and easy to read.",
    "Finish: Review the result and adjust details to match the exact use case.",
    "Next step: Add visuals, links, or data if the final output needs to be presented.",
    "Quality check: Remove repeated points and make every line useful.",
    "Delivery: Put the final version in the format the user requested.",
  ];

  return `Created draft for ${subject}:${contextLine}\n\n${items
    .slice(0, itemCount)
    .map((item) => `- ${item}`)
    .join("\n")}`;
};

const createChangeFallbackContent = (question, context) => {
  const subject = getRequestSubject(question) || "the provided content";
  const excerpt = getReadableSentences(context).slice(0, 2).join(" ");

  return `Changed version for ${subject}:\n\n${
    excerpt || "Please paste the exact text you want changed, and I will rewrite it directly."
  }`;
};

const createLocalFallbackAnswer = (question, chunks) => {
  const context = selectRelevantChunks(question, chunks).trim();

  if (isCreationRequest(question)) {
    return createStarterContent(question, context);
  }

  if (isChangeRequest(question)) {
    return createChangeFallbackContent(question, context);
  }

  if (!context) {
    return "I could not complete that answer from the PDF context right now. Please send the question again with a little more detail.";
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

    const prompt = `
You are NearKnowledge AI, a general-purpose assistant inside a PDF workspace.

The uploaded PDF context is available below, but the user's request is the priority. Answer the request directly.

Rules:
1. If the user asks about the PDF, this document, "it", a summary, or details from the file, use the PDF context.
2. If the user asks a general question, answer normally using your knowledge. Do not refuse just because it is not in the PDF.
3. If the user asks you to create, write, draft, generate, prepare, build, compose, or design something, create the requested content immediately.
4. If the user asks you to change, rewrite, improve, edit, modify, convert, translate, format, fix, or update something, provide the changed version.
5. If the request should use the PDF, use it. If it does not need the PDF, ignore the PDF context.
6. Do not say "I couldn't find that information in the uploaded document" unless the user specifically asks whether exact information exists in the PDF.
7. Keep answers clear and practical. Use code blocks, lists, tables, or drafts when they fit the request.

Available PDF context:
${context}

User request:
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
