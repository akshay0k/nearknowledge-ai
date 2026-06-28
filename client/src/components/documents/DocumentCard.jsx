import { FileText, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-5 transition-all hover:border-blue-500">
      <FileText size={36} className="mb-4 text-blue-400" />

      <h2 className="truncate text-lg font-semibold">
        {document.title}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {(document.fileSize / 1024).toFixed(2)} KB
      </p>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/workspace/${document._id}`)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <ArrowRight size={16} />
          Open
        </button>

        <button
          onClick={() => onDelete?.(document._id)}
          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          title="Delete document"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
