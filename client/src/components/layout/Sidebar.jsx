import {
  History,
  LayoutDashboard,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menus = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Library",
    icon: Library,
    path: "/library",
  },
  {
    name: "AI Workspace",
    icon: Sparkles,
    path: "/workspace",
  },
  {
    name: "History",
    icon: History,
    path: "/history",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-[#1F2937] bg-[#111827]">
      <div className="p-6">
        <h1 className="text-2xl font-bold">NearKnowledge</h1>

        <p className="mt-2 text-sm text-slate-400">
          Knowledge, always within reach.
        </p>
      </div>

      <nav className="flex-1 px-3">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.name}
              to={menu.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{menu.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
