import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DocumentGrid from "../components/documents/DocumentGrid";
import UploadModal from "../components/documents/UploadModal";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "../api/documentApi";

const Library = () => {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get("search") || "";

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return documents;

    return documents.filter((doc) =>
      doc.title?.toLowerCase().includes(normalizedSearch),
    );
  }, [documents, search]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      setStatus(
        error.response?.data?.message || "Could not load your documents.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setStatus("Reading PDF and building assistant...");
      const formData = new FormData();
      formData.append("document", file);

      const data = await uploadDocument(formData);
      await loadDocuments();

      if (data.document?._id) {
        navigate(`/workspace/${data.document._id}`);
      }
    } catch (error) {
      setStatus(
        error.response?.data?.message || "Could not upload this PDF.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      setStatus("Document deleted.");
    } catch (error) {
      setStatus(
        error.response?.data?.message || "Could not delete this document.",
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Knowledge Library
          </h1>

          <p className="mt-2 text-slate-400">
            Upload PDFs, extract their text, and open an AI assistant for each
            document.
          </p>
        </div>

        <UploadModal onUpload={handleUpload} uploading={uploading} />
      </div>

      {search && (
        <div className="mb-5 rounded-lg border border-[#25314A] bg-[#141A26] px-4 py-3 text-sm text-slate-300">
          Showing results for "{search}".
        </div>
      )}

      {status && (
        <div className="mb-5 rounded-lg border border-[#25314A] bg-[#141A26] px-4 py-3 text-sm text-slate-300">
          {status}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-center text-slate-400">
          Loading documents...
        </div>
      ) : (
        <DocumentGrid documents={filteredDocuments} onDelete={handleDelete} />
      )}
    </DashboardLayout>
  );
};

export default Library;
