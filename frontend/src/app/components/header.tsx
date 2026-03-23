import { Search, Bell, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

export function Header() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // Load user from localStorage or fetch
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      api.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          navigate('/');
        });
    }
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search interviews, knowledge..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-foreground" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.username || 'Loading...'}</div>
            <div className="text-xs text-muted-foreground">{user?.role || ''}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
            {user ? getInitials(user.username) : '?'}
          </div>
        </div>
      </div>
    </header>
  );
}