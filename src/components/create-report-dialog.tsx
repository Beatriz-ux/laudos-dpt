"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createReport } from "@/actions/reports/create-report";
import type { Priority, User } from "@/types";
import { PRIORITY_LABELS } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CreateReportDialogProps {
  officers: User[];
}

export function CreateReportDialog({ officers }: CreateReportDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    priority: "MEDIUM" as Priority,
    location: {
      address: "",
      city: "",
      state: "",
    },
    vehicle: {
      plate: "",
      isCloned: false,
    },
    assignedTo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createReport({
        priority: formData.priority,
        location: {
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
        },
        vehicle: {
          plate: formData.vehicle.plate.toUpperCase(),
          isCloned: formData.vehicle.isCloned,
        },
        assignedTo: formData.assignedTo || undefined,
      });

      if (result.success) {
        setIsOpen(false);
        setFormData({
          priority: "MEDIUM",
          location: { address: "", city: "", state: "" },
          vehicle: { plate: "", isCloned: false },
          assignedTo: "",
        });
        router.refresh();
        alert("Laudo criado com sucesso!");
      } else {
        setError(result.error || "Erro ao criar laudo");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar laudo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (error) setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Laudo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Laudo</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos do laudo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prioridade */}
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Prioridade *
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Endereço Completo *
            </label>
            <input
              id="address"
              type="text"
              value={formData.location.address}
              onChange={(e) =>
                handleInputChange("location.address", e.target.value)
              }
              required
              disabled={isSubmitting}
              placeholder="Rua, número, bairro"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                Cidade *
              </label>
              <input
                id="city"
                type="text"
                value={formData.location.city}
                onChange={(e) =>
                  handleInputChange("location.city", e.target.value)
                }
                required
                disabled={isSubmitting}
                placeholder="Salvador"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">
                Estado (UF) *
              </label>
              <input
                id="state"
                type="text"
                value={formData.location.state}
                onChange={(e) =>
                  handleInputChange("location.state", e.target.value)
                }
                required
                disabled={isSubmitting}
                placeholder="BA"
                maxLength={2}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Placa */}
          <div className="space-y-2">
            <label htmlFor="plate" className="text-sm font-medium">
              Placa do Veículo *
            </label>
            <input
              id="plate"
              type="text"
              value={formData.vehicle.plate}
              onChange={(e) =>
                handleInputChange(
                  "vehicle.plate",
                  e.target.value.toUpperCase()
                )
              }
              required
              disabled={isSubmitting}
              placeholder="ABC1234"
              maxLength={7}
              pattern="[A-Z]{3}[0-9][A-Z0-9][0-9]{2}"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Formato: ABC1234 ou ABC1D23 (Mercosul)
            </p>
          </div>

          {/* Veículo Clonado */}
          <div className="flex items-center space-x-2">
            <input
              id="isCloned"
              type="checkbox"
              checked={formData.vehicle.isCloned}
              onChange={(e) =>
                handleInputChange("vehicle.isCloned", e.target.checked)
              }
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="isCloned" className="text-sm font-medium">
              Veículo com suspeita de clonagem
            </label>
          </div>

          {/* Atribuir a Policial (Opcional) */}
          <div className="space-y-2">
            <label htmlFor="assignedTo" className="text-sm font-medium">
              Atribuir a Policial (Opcional)
            </label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => handleInputChange("assignedTo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um policial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Não atribuir agora</SelectItem>
                {officers.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.name} - {officer.badge}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Você pode atribuir o laudo a um policial depois
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Criando..." : "Criar Laudo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
