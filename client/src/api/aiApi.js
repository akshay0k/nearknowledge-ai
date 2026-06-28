import api from "./axios";

export const chatWithDocument = async (documentId, question) => {
  const response = await api.post(
    `/ai/document-chat/${documentId}`,
    { question }
  );

  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get("/ai/history");

  return response.data;
};
