import { createPartFromUri } from "@google/genai";
import ai from "./geminiService.js";
import { generateGeminiContent } from "./geminiGenerateService.js";

const waitForActiveFile = async (file, maxAttempts = 20) => {
  if (!file?.name || file.state === "ACTIVE" || !file.state) {
    return file;
  }

  let currentFile = file;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (currentFile.state === "ACTIVE") {
      return currentFile;
    }

    if (currentFile.state === "FAILED") {
      throw new Error("Gemini could not process this PDF file.");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    currentFile = await ai.files.get({ name: file.name });
  }

  throw new Error("Gemini PDF processing timed out. Please try again.");
};

export const extractTextWithGemini = async (filePath, displayName) => {
  const uploadedFile = await ai.files.upload({
    file: filePath,
    config: {
      mimeType: "application/pdf",
      displayName,
    },
  });

  const file = await waitForActiveFile(uploadedFile);

  if (!file?.uri) {
    throw new Error("Gemini did not return a file URI for this PDF.");
  }

  const response = await generateGeminiContent({
    contents: [
      createPartFromUri(file.uri, file.mimeType || "application/pdf"),
      `Extract all readable text from this PDF.
Preserve the document order as much as possible.
Return only the extracted text, without summaries, markdown, or commentary.`,
    ],
  });

  return {
    text: response.text?.trim() || "",
    fileUri: file.uri,
    fileName: file.name || "",
  };
};
