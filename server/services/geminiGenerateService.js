import ai from "./geminiService.js";

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseGeminiError = (error) => {
  if (!error?.message) {
    return {};
  }

  try {
    return JSON.parse(error.message);
  } catch {
    return {};
  }
};

const getErrorStatus = (error) => {
  const parsed = parseGeminiError(error);
  return Number(error?.status || error?.code || parsed?.error?.code);
};

const isTransientGeminiError = (error) => {
  const status = getErrorStatus(error);
  const message = error?.message || "";
  const parsedStatus = parseGeminiError(error)?.error?.status || "";

  return (
    TRANSIENT_STATUSES.has(status) ||
    parsedStatus === "UNAVAILABLE" ||
    parsedStatus === "RESOURCE_EXHAUSTED" ||
    message.includes("high demand")
  );
};

export const generateGeminiContent = async ({
  model = process.env.GEMINI_MODEL || "gemini-2.5-flash",
  attempts = 3,
  ...params
}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        ...params,
      });
    } catch (error) {
      lastError = error;

      if (!isTransientGeminiError(error) || attempt === attempts) {
        break;
      }

      await sleep(attempt * 1000);
    }
  }

  if (isTransientGeminiError(lastError)) {
    throw new Error(
      "The AI model is busy right now. Please try again in a moment.",
    );
  }

  throw lastError;
};
