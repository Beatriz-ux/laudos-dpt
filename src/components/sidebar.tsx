"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { logout } from "@/actions/auth/logout";
import type { User as UserType } from "@/types";
import { DEPARTMENT_LABELS } from "@/types";

interface SidebarProps {
  user: UserType;
}

type Route = {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
};

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const agentNavigation: Route[] = [
    { name: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
    { name: "Laudos", href: "/agent/reports", icon: FileText },
    { name: "Policiais", href: "/agent/officers", icon: Users },
  ];

  const officerNavigation: Route[] = [
    { name: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { name: "Recebidos", href: "/officer/reports/received", icon: Inbox },
    {
      name: "Em Andamento",
      href: "/officer/reports/in-progress",
      icon: FileEdit,
    },
    {
      name: "Concluídos",
      href: "/officer/reports/completed",
      icon: CheckCircle,
    },
  ];

  const navigation =
    user.role === "AGENT" ? agentNavigation : officerNavigation;

  const profileHref = user.role === "AGENT" ? "/agent/profile" : "/officer/profile";

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={`flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Sistema Laudos
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.badge} • {DEPARTMENT_LABELS[user.department]}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                user.role === "AGENT"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {user.role === "AGENT" ? "Agente" : "Policial"}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed text-muted-foreground"
              >
                <Icon className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
                {!isCollapsed && item.name}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href={profileHref}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(profileHref)
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <User className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && "Perfil"}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-foreground hover:bg-destructive/10 hover:text-destructive ${
            isCollapsed && "justify-center"
          }`}
        >
          <LogOut className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && "Sair"}
        </button>
      </div>
    </div>
  );
}
