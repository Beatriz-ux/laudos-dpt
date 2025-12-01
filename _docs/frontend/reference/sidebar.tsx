import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Inbox,
  FileEdit,
  CheckCircle,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types";

interface SidebarProps {
  user: UserType;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const agentNavigation = [
    { name: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
    { name: "Laudos", href: "/agent/reports", icon: FileText },
    { name: "Policiais", href: "/agent/officers", icon: Users },
  ];

  const officerNavigation = [
    { name: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { name: "Recebidos", href: "/officer/reports/received", icon: Inbox },
    {
      name: "Rascunhos",
      href: "/officer/reports/draft",
      icon: FileEdit,
      disabled: true,
    },
    {
      name: "Concluídos",
      href: "/officer/reports/completed",
      icon: CheckCircle,
      disabled: true,
    },
  ];

  const navigation =
    user.role === "AGENT" ? agentNavigation : officerNavigation;

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">
              Sistema Laudos
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.badge} • {user.department}
                </p>
              </div>
            </div>
            <Badge
              variant={user.role === "AGENT" ? "default" : "secondary"}
              className="w-fit"
            >
              {user.role === "AGENT" ? "Agente" : "Policial"}
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                (item as any).disabled &&
                  "opacity-50 cursor-not-allowed pointer-events-none",
                !isActive &&
                  !(item as any).disabled &&
                  "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )
          }
        >
          <User className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Perfil"}
        </NavLink>

        <Button
          onClick={onLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "px-3"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sair"}
        </Button>
      </div>
    </div>
  );
}
