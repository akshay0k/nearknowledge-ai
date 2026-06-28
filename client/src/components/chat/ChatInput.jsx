import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../ui/Button";
import { chatWithDocument } from "../../api/aiApi";

const ChatInput = ({ documentId, disabled = false, setMessages }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim() || loading || disabled) return;

    const userQuestion = question;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const data = await chatWithDocument(documentId, userQuestion);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-[#25314A] pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Ask anything about this document..."
          disabled={disabled || loading}
          className="min-w-0 flex-1 rounded-lg border border-[#25314A] bg-[#141A26] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 sm:px-5 sm:py-4"
        />

        <Button
          onClick={handleSend}
          disabled={loading || disabled}
          className="flex items-center justify-center"
        >
          {loading ? "Thinking..." : <Send size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
