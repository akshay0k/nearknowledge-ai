import ai from "./geminiService.js";

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getModelCandidates = ({ model, models }) => {
  const configuredModels =
    models ||
    model ||
    process.env.GEMINI_MODELS ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash,gemini-2.0-flash";

  const candidates = Array.isArray(configuredModels)
    ? configuredModels
    : configuredModels.split(",");

  return [...new Set(candidates.map((item) => item.trim()).filter(Boolean))];
};

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

const isModelUnavailableError = (error) => {
  const status = getErrorStatus(error);
  const message = (error?.message || "").toLowerCase();

  return (
    status === 404 ||
    (message.includes("model") &&
      (message.includes("not found") || message.includes("not supported")))
  );
};

export const generateGeminiContent = async ({
  model,
  models,
  attempts = 1,
  ...params
}) => {
  let lastError;
  const modelCandidates = getModelCandidates({ model, models });

  for (const modelName of modelCandidates) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await ai.models.generateContent({
          model: modelName,
          ...params,
        });
      } catch (error) {
        lastError = error;

        if (!isTransientGeminiError(error) && !isModelUnavailableError(error)) {
          throw error;
        }

        if (isTransientGeminiError(error) && attempt < attempts) {
          await sleep(300 * attempt);
        }
      }
    }
  }

  if (isTransientGeminiError(lastError)) {
    throw new Error(
      "The AI service is temporarily unavailable. Please try again.",
    );
  }

  throw lastError;
};
