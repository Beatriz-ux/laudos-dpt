"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search, X } from "lucide-react";
import { createOfficer } from "@/actions/officers/create-officer";
import type { User } from "@/types";
import { DEPARTMENT_LABELS } from "@/types";
import type { Department } from "@prisma/client";

interface AgentOfficersClientProps {
  user: User;
  officers: User[];
}

export function AgentOfficersClient({
  user,
  officers,
}: AgentOfficersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    department: "TRAFFIC" as Department,
    badge: "",
    password: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createOfficer(formData);

      if (result.success) {
        setIsModalOpen(false);
        setFormData({
          username: "",
          email: "",
          name: "",
          department: "TRAFFIC",
          badge: "",
          password: "",
        });
        router.refresh();
        alert("Policial cadastrado com sucesso!");
      } else {
        setError(result.error || "Erro ao cadastrar policial");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar policial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
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

      {/* Modal de Criar Policial */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Cadastrar Novo Policial</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha os dados do novo policial
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Digite o nome completo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Username e Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Usuário *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="usuario.nome"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="email@dpt.ba.gov.br"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Departamento e Matrícula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Departamento *
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="TRAFFIC">Trânsito</option>
                    <option value="CRIMINAL">Criminal</option>
                    <option value="ADMINISTRATIVE">Administrativo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="badge" className="text-sm font-medium">
                    Matrícula *
                  </label>
                  <input
                    id="badge"
                    type="text"
                    value={formData.badge}
                    onChange={(e) => handleInputChange("badge", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="POL-001"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha Temporária *
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  O policial será obrigado a alterar a senha no primeiro acesso
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Policial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
