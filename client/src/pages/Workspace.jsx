import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText, Sparkles } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import { getDocument } from "../api/documentApi";

const Workspace = () => {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const data = await getDocument(id);
        setDocument(data.document);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this document.");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const fileSize = document?.fileSize
    ? `${(document.fileSize / 1024).toFixed(2)} KB`
    : "";

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-120px)] flex-col">

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-blue-300 mb-3">
              <Sparkles size={18} />
              <span className="text-sm font-semibold uppercase tracking-wide">
                PDF Assistant
              </span>
            </div>

            <h1 className="truncate text-2xl font-bold">
              {loading ? "Loading document..." : document?.title || "Document"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Ask questions and get answers from the extracted PDF text.
            </p>
          </div>

          {document && (
            <div className="flex shrink-0 items-center gap-3 rounded-lg border border-[#25314A] bg-[#141A26] px-4 py-3 sm:px-5 sm:py-4">
              <FileText size={22} className="text-blue-400" />

              <div>
                <p className="text-sm text-slate-400">
                  Extracted PDF
                </p>

                <p className="font-semibold">
                  {fileSize}
                </p>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error}
          </div>
        ) : (
          <>
            <ChatWindow messages={messages} />

            <ChatInput
              documentId={id}
              disabled={loading}
              setMessages={setMessages}
            />
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Workspace;
