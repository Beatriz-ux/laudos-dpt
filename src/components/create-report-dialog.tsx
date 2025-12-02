"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { createReport } from "@/actions/reports/create-report";
import type { Priority, User, VehicleSpecies, VehicleType } from "@/types";
import { PRIORITY_LABELS, VEHICLE_SPECIES_LABELS, VEHICLE_TYPE_LABELS } from "@/types";
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
  trigger?: React.ReactNode;
}

const STEPS = [
  { id: 1, title: "Dados Gerais" },
  { id: 2, title: "Requisição" },
  { id: 3, title: "Informações do Veículo" },
  { id: 4, title: "Perícia" },
  { id: 5, title: "Atribuição" },
];

export function CreateReportDialog({ officers, trigger }: CreateReportDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Etapa 1: Dados Gerais
    priority: "MEDIUM" as Priority,
    deadline: "",
    oficio: "",

    // Etapa 2: Requisição
    orgaoRequisitante: "",
    autoridadeRequisitante: "",
    guiaOficio: "",
    dataGuiaOficio: "",
    ocorrenciaPolicial: "",

    // Etapa 3: Informações do Veículo
    placaPortada: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleSpecies: "",
    vehicleType: "",
    vehicleColor: "",
    vidro: "",
    vehicleMotor: "",
    vehicleChassi: "",
    outrasNumeracoes: "",

    // Etapa 4: Perícia
    objetivoPericia: "",
    preambulo: "",

    // Etapa 5: Atribuição
    assignedTo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await createReport({
        priority: formData.priority,
        deadline: formData.deadline || undefined,
        oficio: formData.oficio,
        orgaoRequisitante: formData.orgaoRequisitante,
        autoridadeRequisitante: formData.autoridadeRequisitante,
        guiaOficio: formData.guiaOficio,
        dataGuiaOficio: formData.dataGuiaOficio || undefined,
        ocorrenciaPolicial: formData.ocorrenciaPolicial,
        objetivoPericia: formData.objetivoPericia,
        preambulo: formData.preambulo,
        placaPortada: formData.placaPortada,
        vehicleSpecies: formData.vehicleSpecies,
        vehicleType: formData.vehicleType,
        vidro: formData.vidro || undefined,
        outrasNumeracoes: formData.outrasNumeracoes || undefined,
        vehicle: {
          plate: formData.placaPortada.toUpperCase(),
          brand: formData.vehicleBrand,
          model: formData.vehicleModel,
          color: formData.vehicleColor,
          motor: formData.vehicleMotor || undefined,
          chassi: formData.vehicleChassi || undefined,
        },
        assignedTo: formData.assignedTo || undefined,
      });

      if (result.success) {
        setIsOpen(false);
        setCurrentStep(1);
        setFormData({
          priority: "MEDIUM",
          deadline: "",
          oficio: "",
          orgaoRequisitante: "",
          autoridadeRequisitante: "",
          guiaOficio: "",
          dataGuiaOficio: "",
          ocorrenciaPolicial: "",
          placaPortada: "",
          vehicleBrand: "",
          vehicleModel: "",
          vehicleSpecies: "",
          vehicleType: "",
          vehicleColor: "",
          vidro: "",
          vehicleMotor: "",
          vehicleChassi: "",
          outrasNumeracoes: "",
          objetivoPericia: "",
          preambulo: "",
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const fillDefaultData = () => {
    setFormData((prev) => ({
      ...prev,
      objetivoPericia: "Proceder a exame pericial de Identificação de Veículo, a fim de constatar sua originalidade",
      preambulo: "A signatária perita deste Departamento de Polícia Técnica, designada por sua coordenadora para atender à requisição da autoridade, apresenta o resultado de seus trabalhos",
    }));
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.priority && formData.oficio && formData.deadline;
      case 2:
        return formData.orgaoRequisitante && formData.autoridadeRequisitante &&
               formData.guiaOficio && formData.dataGuiaOficio && formData.ocorrenciaPolicial;
      case 3:
        return formData.placaPortada && formData.vehicleBrand && formData.vehicleModel &&
               formData.vehicleSpecies && formData.vehicleType && formData.vehicleColor;
      case 4:
        return formData.objetivoPericia && formData.preambulo;
      case 5:
        return true; // Atribuição é opcional
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setCurrentStep(1);
        setError("");
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Laudo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Laudo</DialogTitle>
          <DialogDescription>
            Etapa {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${step.id < currentStep ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Etapa 1: Dados Gerais */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="oficio" className="text-sm font-medium">
                  Ofício *
                </label>
                <input
                  id="oficio"
                  type="text"
                  value={formData.oficio}
                  onChange={(e) => handleInputChange("oficio", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Número do ofício"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">
                    Prazo para Concluir *
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2: Requisição */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="orgaoRequisitante" className="text-sm font-medium">
                  Órgão Requisitante *
                </label>
                <input
                  id="orgaoRequisitante"
                  type="text"
                  value={formData.orgaoRequisitante}
                  onChange={(e) => handleInputChange("orgaoRequisitante", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Ex: Delegacia de Polícia Civil"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="autoridadeRequisitante" className="text-sm font-medium">
                  Autoridade Requisitante *
                </label>
                <input
                  id="autoridadeRequisitante"
                  type="text"
                  value={formData.autoridadeRequisitante}
                  onChange={(e) => handleInputChange("autoridadeRequisitante", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Nome da autoridade"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="guiaOficio" className="text-sm font-medium">
                    Guia/Ofício *
                  </label>
                  <input
                    id="guiaOficio"
                    type="text"
                    value={formData.guiaOficio}
                    onChange={(e) => handleInputChange("guiaOficio", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Número da guia ou ofício"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dataGuiaOficio" className="text-sm font-medium">
                    Data Guia/Ofício *
                  </label>
                  <input
                    id="dataGuiaOficio"
                    type="date"
                    value={formData.dataGuiaOficio}
                    onChange={(e) => handleInputChange("dataGuiaOficio", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="ocorrenciaPolicial" className="text-sm font-medium">
                  Ocorrência Policial *
                </label>
                <input
                  id="ocorrenciaPolicial"
                  type="text"
                  value={formData.ocorrenciaPolicial}
                  onChange={(e) => handleInputChange("ocorrenciaPolicial", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Número da ocorrência policial"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Etapa 3: Informações do Veículo */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="placaPortada" className="text-sm font-medium">
                  Placa Portada *
                </label>
                <input
                  id="placaPortada"
                  type="text"
                  value={formData.placaPortada}
                  onChange={(e) => handleInputChange("placaPortada", e.target.value.toUpperCase())}
                  required
                  disabled={isSubmitting}
                  placeholder="ABC1234"
                  maxLength={7}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleSpecies" className="text-sm font-medium">
                    Espécie *
                  </label>
                  <Select
                    value={formData.vehicleSpecies}
                    onValueChange={(value) => handleInputChange("vehicleSpecies", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_SPECIES_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleType" className="text-sm font-medium">
                    Tipo *
                  </label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) => handleInputChange("vehicleType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleBrand" className="text-sm font-medium">
                    Marca *
                  </label>
                  <input
                    id="vehicleBrand"
                    type="text"
                    value={formData.vehicleBrand}
                    onChange={(e) => handleInputChange("vehicleBrand", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Ex: Toyota, Honda"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleModel" className="text-sm font-medium">
                    Modelo *
                  </label>
                  <input
                    id="vehicleModel"
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Ex: Corolla, Civic"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleColor" className="text-sm font-medium">
                    Cor *
                  </label>
                  <input
                    id="vehicleColor"
                    type="text"
                    value={formData.vehicleColor}
                    onChange={(e) => handleInputChange("vehicleColor", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Ex: Preto, Branco"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vidro" className="text-sm font-medium">
                    Vidro (Opcional)
                  </label>
                  <input
                    id="vidro"
                    type="text"
                    value={formData.vidro}
                    onChange={(e) => handleInputChange("vidro", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Informações do vidro"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleMotor" className="text-sm font-medium">
                    Numeração do Motor (Opcional)
                  </label>
                  <input
                    id="vehicleMotor"
                    type="text"
                    value={formData.vehicleMotor}
                    onChange={(e) => handleInputChange("vehicleMotor", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Número do motor"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleChassi" className="text-sm font-medium">
                    CHASSI (Opcional)
                  </label>
                  <input
                    id="vehicleChassi"
                    type="text"
                    value={formData.vehicleChassi}
                    onChange={(e) => handleInputChange("vehicleChassi", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Número do chassi"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="outrasNumeracoes" className="text-sm font-medium">
                  Outras Numerações (Opcional)
                </label>
                <textarea
                  id="outrasNumeracoes"
                  value={formData.outrasNumeracoes}
                  onChange={(e) => handleInputChange("outrasNumeracoes", e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Outras numerações relevantes"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Etapa 4: Perícia */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex justify-end mb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillDefaultData}
                  disabled={isSubmitting}
                  size="sm"
                >
                  Preencher com dados padrão
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="objetivoPericia" className="text-sm font-medium">
                  Objetivo da Perícia *
                </label>
                <textarea
                  id="objetivoPericia"
                  value={formData.objetivoPericia}
                  onChange={(e) => handleInputChange("objetivoPericia", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Descreva o objetivo da perícia"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="preambulo" className="text-sm font-medium">
                  Preâmbulo *
                </label>
                <textarea
                  id="preambulo"
                  value={formData.preambulo}
                  onChange={(e) => handleInputChange("preambulo", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Texto do preâmbulo"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Etapa 5: Atribuição */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="assignedTo" className="text-sm font-medium">
                  Atribuir a Policial (Opcional)
                </label>
                <Select
                  value={formData.assignedTo || undefined}
                  onValueChange={(value) => handleInputChange("assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um policial (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Resumo do Laudo</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Ofício:</strong> {formData.oficio}</p>
                  <p><strong>Prioridade:</strong> {PRIORITY_LABELS[formData.priority]}</p>
                  <p><strong>Órgão Requisitante:</strong> {formData.orgaoRequisitante}</p>
                  <p><strong>Placa:</strong> {formData.placaPortada}</p>
                  <p><strong>Veículo:</strong> {formData.vehicleBrand} {formData.vehicleModel}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!isStepValid() || isSubmitting}
            >
              {currentStep === STEPS.length ? (
                isSubmitting ? "Criando..." : "Criar Laudo"
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
