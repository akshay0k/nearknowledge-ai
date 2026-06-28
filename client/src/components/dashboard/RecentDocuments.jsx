import { ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const RecentDocuments = ({ documents = [] }) => {
  const navigate = useNavigate();
  const recentDocuments = documents.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Recent Knowledge
        </h2>

        <button
          type="button"
          onClick={() => navigate("/library")}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      {recentDocuments.length === 0 ? (
        <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-6 text-slate-400">
          No documents yet. Upload a PDF to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentDocuments.map((doc) => (
            <button
              type="button"
              key={doc._id}
              onClick={() => navigate(`/workspace/${doc._id}`)}
              className="rounded-lg border border-[#25314A] bg-[#141A26] p-5 text-left transition-all hover:border-blue-500"
            >
              <FileText size={30} className="mb-4 text-blue-400" />

              <h3 className="truncate font-semibold">
                {doc.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {(doc.fileSize / 1024).toFixed(2)} KB
              </p>
            </button>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default RecentDocuments;
