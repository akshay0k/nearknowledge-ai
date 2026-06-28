import { MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { getChatHistory } from "../api/aiApi";

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getChatHistory();
        setChats(data.chats || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load chat history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3 text-blue-300">
          <MessageSquare size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">
            History
          </span>
        </div>

        <h1 className="text-3xl font-bold">
          Recent AI conversations
        </h1>

        <p className="mt-2 max-w-2xl text-slate-400">
          Review questions you asked about your uploaded PDFs.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-center text-slate-400">
          Loading history...
        </div>
      ) : chats.length === 0 ? (
        <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-center text-slate-400">
          No chat history yet.
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <button
              type="button"
              key={chat._id}
              onClick={() =>
                chat.document?._id && navigate(`/workspace/${chat.document._id}`)
              }
              className="w-full rounded-lg border border-[#25314A] bg-[#141A26] p-5 text-left transition-all hover:border-blue-500"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2 text-blue-300">
                  <Sparkles size={16} />
                  <span className="truncate text-sm font-semibold">
                    {chat.document?.title || "Deleted document"}
                  </span>
                </div>

                <span className="text-xs text-slate-500">
                  {new Date(chat.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="line-clamp-2 font-medium">
                {chat.question}
              </p>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                {chat.answer}
              </p>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default History;
