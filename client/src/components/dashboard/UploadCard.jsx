import { ArrowRight, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadCard = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/library")}
      className="w-full rounded-lg border-2 border-dashed border-[#334155] bg-[#141A26] p-6 text-left transition-all hover:border-blue-500 sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
            <UploadCloud size={28} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Upload a PDF
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Add a document to extract text, create searchable chunks, and ask
              the AI assistant questions about the PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-blue-300">
          Open Library
          <ArrowRight size={18} />
        </div>
      </div>
    </button>
  );
};

export default UploadCard;
