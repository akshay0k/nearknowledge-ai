import DocumentCard from "./DocumentCard";

const DocumentGrid = ({ documents, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="mt-16 rounded-lg border border-[#25314A] bg-[#141A26] p-8 text-center text-slate-400">
        No documents uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc._id}
          document={doc}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;
