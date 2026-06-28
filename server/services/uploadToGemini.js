import ai from "./geminiService.js";

export const uploadToGemini = async (filePath) => {
  const file = await ai.files.upload({
    file: filePath,
  });

  return file;
};