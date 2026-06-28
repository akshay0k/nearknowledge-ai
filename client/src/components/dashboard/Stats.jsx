import { Brain, FileText, HardDrive, MessageSquare } from "lucide-react";

const formatSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Stats = ({ documents = [], chats = [] }) => {
  const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  const stats = [
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
    },
    {
      title: "AI Chats",
      value: chats.length,
      icon: MessageSquare,
    },
    {
      title: "Storage",
      value: formatSize(totalSize),
      icon: HardDrive,
    },
    {
      title: "Knowledge Ready",
      value: documents.length > 0 ? "Ready" : "Empty",
      icon: Brain,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-lg border border-[#25314A] bg-[#141A26] p-5"
          >
            <Icon className="mb-5 text-blue-400" />

            <h2 className="text-2xl font-bold">
              {item.value}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
