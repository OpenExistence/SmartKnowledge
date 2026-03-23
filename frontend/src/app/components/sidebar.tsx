import { useState } from "react";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Mic, 
  MessageSquare, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/interviews", icon: Mic, label: "Interviews" },
  { path: "/knowledge", icon: MessageSquare, label: "Knowledge Base" },
  { path: "/admin/users", icon: Users, label: "User Management" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-sidebar-foreground">SmartKnowledge</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Collapse</span>
          </div>
        )}
      </button>
    </aside>
  );
}
