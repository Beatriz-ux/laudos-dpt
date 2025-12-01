"use client";

import { useState, useMemo } from "react";
import { UserPlus, Search } from "lucide-react";
import type { User } from "@/types";
import { DEPARTMENT_LABELS } from "@/types";

interface AgentOfficersClientProps {
  user: User;
  officers: User[];
}

export function AgentOfficersClient({
  user,
  officers,
}: AgentOfficersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOfficers = useMemo(() => {
    if (!searchTerm) return officers;

    const query = searchTerm.toLowerCase();
    return officers.filter(
      (officer) =>
        officer.name.toLowerCase().includes(query) ||
        officer.badge.toLowerCase().includes(query) ||
        officer.email.toLowerCase().includes(query) ||
        officer.department.toLowerCase().includes(query)
    );
  }, [officers, searchTerm]);

  const activeOfficers = officers.filter((o) => o.isActive).length;
  const trafficOfficers = officers.filter(
    (o) => o.department === "TRAFFIC"
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Policiais</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os policiais do sistema
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Policial
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total de Policiais
          </h3>
          <div className="text-2xl font-bold">{officers.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Policiais Ativos
          </h3>
          <div className="text-2xl font-bold text-green-600">
            {activeOfficers}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Departamento Trânsito
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {trafficOfficers}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
      </div>

      {/* Officers Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="p-4">Matrícula</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Departamento</th>
                <th className="p-4">Status</th>
                <th className="p-4">Cadastrado em</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Nenhum policial encontrado
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{officer.badge}</td>
                    <td className="p-4">{officer.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {officer.email}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {DEPARTMENT_LABELS[officer.department]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          officer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {officer.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(officer.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
