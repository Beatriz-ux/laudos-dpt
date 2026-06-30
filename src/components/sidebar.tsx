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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const closeMobileMenu = () => setIsMobileOpen(false);

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen && (
        <button
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-card transition-transform duration-300 md:relative md:z-auto md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-16" : "md:w-64"}`}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={`flex items-center space-x-2 ${isCollapsed ? "md:hidden" : ""}`}>
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Sistema Laudos
            </span>
        </div>
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              closeMobileMenu();
              return;
            }

            setIsCollapsed(!isCollapsed);
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9"
          aria-label={isMobileOpen ? "Fechar menu" : "Alternar menu"}
        >
          {isCollapsed && !isMobileOpen ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
          <div className={`space-y-2 ${isCollapsed ? "md:hidden" : ""}`}>
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
        {isCollapsed && (
          <div className="hidden justify-center md:flex">
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
                <Icon className={`h-5 w-5 mr-3 ${isCollapsed ? "md:mr-0" : ""}`} />
                <span className={isCollapsed ? "md:hidden" : ""}>{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isCollapsed ? "md:mr-0" : ""}`} />
              <span className={isCollapsed ? "md:hidden" : ""}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href={profileHref}
          onClick={closeMobileMenu}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(profileHref)
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <User className={`h-5 w-5 mr-3 ${isCollapsed ? "md:mr-0" : ""}`} />
          <span className={isCollapsed ? "md:hidden" : ""}>Perfil</span>
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-foreground hover:bg-destructive/10 hover:text-destructive ${
            isCollapsed && "md:justify-center"
          }`}
        >
          <LogOut className={`h-5 w-5 mr-3 ${isCollapsed ? "md:mr-0" : ""}`} />
          <span className={isCollapsed ? "md:hidden" : ""}>Sair</span>
        </button>
      </div>
      </aside>
    </>
  );
}
