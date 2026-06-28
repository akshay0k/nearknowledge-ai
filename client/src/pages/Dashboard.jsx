import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Hero from "../components/dashboard/Hero";
import Stats from "../components/dashboard/Stats";
import UploadCard from "../components/dashboard/UploadCard";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import { getChatHistory } from "../api/aiApi";
import { getDocuments } from "../api/documentApi";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [documentsData, chatData] = await Promise.all([
          getDocuments(),
          getChatHistory(),
        ]);

        setDocuments(documentsData.documents || []);
        setChats(chatData.chats || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load dashboard data.",
        );
      }
    };

    loadDashboard();
  }, []);

  return (
    <DashboardLayout>
      <Hero />

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <Stats documents={documents} chats={chats} />
      <UploadCard />
      <RecentDocuments documents={documents} />
    </DashboardLayout>
  );
};

export default Dashboard;
