import { Bot, User } from "lucide-react";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 sm:max-w-3xl sm:px-5 sm:py-4 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-[#141A26] border border-[#25314A] text-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isUser ? (
            <>
              <User size={16} />
              <span className="text-sm font-semibold">You</span>
            </>
          ) : (
            <>
              <Bot size={16} />
              <span className="text-sm font-semibold">NearKnowledge AI</span>
            </>
          )}
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
