import { FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDocuments } from "../api/documentApi";

const WorkspaceHome = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data.documents || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load your documents.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3 text-blue-300">
          <Sparkles size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">
            AI Workspace
          </span>
        </div>

        <h1 className="text-3xl font-bold">
          Choose a PDF to discuss
        </h1>

        <p className="mt-2 max-w-2xl text-slate-400">
          Open any uploaded document and ask questions about its extracted text.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-center text-slate-400">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <button
          type="button"
          onClick={() => navigate("/library")}
          className="w-full rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-left text-slate-300 hover:border-blue-500"
        >
          No PDFs are ready yet. Open the library to upload one.
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <button
              type="button"
              key={doc._id}
              onClick={() => navigate(`/workspace/${doc._id}`)}
              className="rounded-lg border border-[#25314A] bg-[#141A26] p-5 text-left hover:border-blue-500"
            >
              <FileText size={30} className="mb-4 text-blue-400" />
              <h2 className="truncate font-semibold">{doc.title}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {(doc.fileSize / 1024).toFixed(2)} KB
              </p>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkspaceHome;
