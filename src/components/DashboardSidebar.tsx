import { NavLink as RouterNavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Bot, Activity, Settings, MessageSquare, Zap,
  ChevronLeft, ChevronRight, LogOut, LogIn, MessagesSquare,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Agenci", path: "/agents", icon: Bot },
  { title: "Konwersacje", path: "/conversations", icon: MessageSquare },
  { title: "Czat AI", path: "/chat", icon: MessagesSquare },
  { title: "Aktywność", path: "/activity", icon: Activity },
  { title: "Integracje", path: "/integrations", icon: Zap },
  { title: "Ustawienia", path: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sidebar-accent-foreground text-lg tracking-tight">
            Agent<span className="text-primary">AI</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn("nav-item", isActive && "nav-item-active")}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* User / Auth */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {user ? (
          <>
            {!collapsed && (
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={signOut}
              className="nav-item w-full text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Wyloguj</span>}
            </button>
          </>
        ) : (
          <Link to="/auth" className="nav-item">
            <LogIn className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Zaloguj się</span>}
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
