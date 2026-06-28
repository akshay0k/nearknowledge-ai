import { LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const Navbar = ({ onMenuClick }) => {
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(`/library?search=${encodeURIComponent(trimmedQuery)}`);
      return;
    }

    if (location.pathname !== "/library") {
      navigate("/library");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const initial = user?.name?.[0]?.toUpperCase() || "A";

  return (
    <header className="flex min-h-20 items-center justify-between gap-3 border-b border-[#1F2937] bg-[#0F172A] px-4 py-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-300 hover:bg-[#1E293B] lg:hidden"
        title="Open navigation"
      >
        <Menu size={22} />
      </button>

      <form
        onSubmit={handleSearch}
        className="relative min-w-0 flex-1 sm:max-w-md"
      >
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your knowledge..."
          className="w-full rounded-lg border border-transparent bg-[#1E293B] py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500"
        />
      </form>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold">
            {user?.name || "Account"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {user?.email || "Signed in"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 font-semibold">
          {initial}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-300 hover:bg-[#1E293B] hover:text-white"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
