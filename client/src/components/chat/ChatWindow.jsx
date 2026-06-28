import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto pr-0 sm:pr-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Start Asking Questions
            </h2>

            <p className="px-2 text-sm text-slate-400">
              Your AI assistant is ready to answer questions about this
              document.
            </p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))
      )}

      <div ref={bottomRef}></div>
    </div>
  );
};

export default ChatWindow;
