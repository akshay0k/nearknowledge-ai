import { LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/useAuth";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3 text-blue-300">
          <SettingsIcon size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Settings
          </span>
        </div>

        <h1 className="text-3xl font-bold">
          Account settings
        </h1>

        <p className="mt-2 max-w-2xl text-slate-400">
          Manage your workspace session.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-[#25314A] bg-[#141A26] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600">
              <User size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {user?.name || "Account"}
              </h2>

              <p className="truncate text-sm text-slate-400">
                {user?.email || "Signed in"}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Log out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
