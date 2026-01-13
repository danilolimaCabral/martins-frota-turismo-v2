import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  Settings,
} from "lucide-react";

export interface MenuItemType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

interface StandardMenuProps {
  menuItems: MenuItemType[];
  currentPage: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: {
    name?: string;
    email?: string;
  };
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function StandardMenu({
  menuItems,
  currentPage,
  onNavigate,
  onLogout,
  user,
  title = "Martins",
  subtitle = "Gestão de Frotas",
  searchPlaceholder = "Buscar...",
  onSearch,
}: StandardMenuProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src="/logo-martins.webp" alt="Martins" className="h-8 w-auto" />
            <h1 className="font-bold text-slate-900">{title}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-600 to-blue-700 text-white z-30 transform transition-transform duration-300
          lg:static lg:translate-x-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-500/30 hidden lg:block">
          <div className="flex items-center gap-3">
            <img src="/logo-martins.webp" alt="Martins" className="h-10 w-auto" />
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="text-xs text-blue-100">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-blue-500/30">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-200" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-blue-500/20 text-white placeholder-blue-200 border-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-500/30 text-white"
                    : "text-blue-100 hover:bg-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30 bg-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                <p className="text-xs text-blue-100 truncate">{user?.email || "user@martins.com"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-blue-100 hover:text-white hover:bg-blue-500/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
