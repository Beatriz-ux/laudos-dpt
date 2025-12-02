"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { updateReport } from "@/actions/reports/update-report";
import { updateReportStatus } from "@/actions/reports/update-report";
import type { User, Report } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS, DEPARTMENT_LABELS } from "@/types";
import { Button } from "@/components/ui/button";

interface OfficerReportDetailClientProps {
  user: User;
  report: Report;
}

interface PhotoUpload {
  id: string;
  category: string;
  subtype?: string;
  photoData: string;
  description?: string;
}

const PHOTO_CATEGORIES = [
  { value: "vehicle", label: "Fotos do Veículo" },
  { value: "plate", label: "Fotos da Placa" },
  { value: "glass", label: "Fotos dos Vidros" },
  { value: "chassi", label: "Fotos do Chassi" },
  { value: "motor", label: "Fotos do Motor" },
  { value: "tag", label: "Fotos das Etiquetas" },
  { value: "year_plate", label: "Fotos da Plaqueta do Ano" },
  { value: "central", label: "Fotos da Central Eletrônica" },
  { value: "auxiliary", label: "Fotos das Séries Auxiliares" },
];

const EVIDENCE_TYPES = [
  { value: "chassi_adulterated", label: "Chassi Adulterado" },
  { value: "motor_adulterated", label: "Motor Adulterado" },
  { value: "glass_adulterated", label: "Vidros Adulterados" },
  { value: "plate_adulterated", label: "Placas Adulteradas" },
  { value: "tag_adulterated", label: "Etiquetas Adulteradas" },
  { value: "year_plate_adulterated", label: "Plaqueta do Ano Adulterada" },
  { value: "central_adulterated", label: "Central Eletrônica Adulterada" },
  { value: "auxiliary_adulterated", label: "Séries Auxiliares Adulteradas" },
];

export function OfficerReportDetailClient({
  user,
  report,
}: OfficerReportDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"vehicle" | "photos" | "evidence" | "analysis">("vehicle");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoCategory, setCurrentPhotoCategory] = useState("");
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

  const [formData, setFormData] = useState({
    vehicle: {
      chassi: report.vehicle?.chassi || "",
      vin: report.vehicle?.vin || "",
      brand: report.vehicle?.brand || "",
      model: report.vehicle?.model || "",
      year: report.vehicle?.year?.toString() || "",
      category: report.vehicle?.category || "",
      color: report.vehicle?.color || "",
      serieMotor: report.vehicle?.serieMotor || "",
      licensedTo: report.vehicle?.licensedTo || "",
      technicalCondition: report.vehicle?.technicalCondition || "",
      isAdulterated: report.vehicle?.isAdulterated || false,
    },
    info: {
      glassInfo: report.glassInfo || "",
      plateInfo: report.plateInfo || "",
      motorInfo: report.motorInfo || "",
      centralEletronicaInfo: report.centralEletronicaInfo || "",
      seriesAuxiliares: report.seriesAuxiliares || "",
    },
    analysis: {
      conclusion: report.analysis?.conclusion || "",
      justification: report.analysis?.justification || "",
      observations: report.analysis?.observations || "",
      isConclusive: report.analysis?.isConclusive,
    },
    signature: report.expertSignature || "",
  });

  const canEdit = report.status === "IN_PROGRESS" || report.status === "RECEIVED";
  const isCompleted = report.status === "COMPLETED";

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
    if (error) setError("");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: string, subtype?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Verificar se é uma imagem
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Verificar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newPhoto: PhotoUpload = {
        id: Math.random().toString(36).substr(2, 9),
        category,
        subtype,
        photoData: base64,
      };
      setPhotos((prev) => [...prev, newPhoto]);
      setSuccess("Foto adicionada com sucesso!");
      setTimeout(() => setSuccess(""), 2000);
    };
    reader.readAsDataURL(file);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const result = await updateReport(report.id, {
        vehicle: {
          chassi: formData.vehicle.chassi,
          vin: formData.vehicle.vin,
          brand: formData.vehicle.brand,
          model: formData.vehicle.model,
          year: formData.vehicle.year ? parseInt(formData.vehicle.year) : undefined,
          category: formData.vehicle.category,
          color: formData.vehicle.color,
          serieMotor: formData.vehicle.serieMotor,
          licensedTo: formData.vehicle.licensedTo,
          technicalCondition: formData.vehicle.technicalCondition,
          isAdulterated: formData.vehicle.isAdulterated,
        },
        info: {
          glassInfo: formData.info.glassInfo,
          plateInfo: formData.info.plateInfo,
          motorInfo: formData.info.motorInfo,
          centralEletronicaInfo: formData.info.centralEletronicaInfo,
          seriesAuxiliares: formData.info.seriesAuxiliares,
        },
        analysis: {
          conclusion: formData.analysis.conclusion,
          justification: formData.analysis.justification,
          observations: formData.analysis.observations,
        },
        photos,
      });

      if (result.success) {
        setSuccess("Laudo salvo com sucesso!");
        setTimeout(() => setSuccess(""), 3000);
        router.refresh();
      } else {
        setError(result.error || "Erro ao salvar laudo");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar laudo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!formData.analysis.conclusion || formData.analysis.isConclusive === undefined) {
      setError("A conclusão e o tipo (conclusivo/inconclusivo) são obrigatórios para finalizar");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      // First save current data
      await updateReport(report.id, {
        vehicle: {
          chassi: formData.vehicle.chassi,
          vin: formData.vehicle.vin,
          brand: formData.vehicle.brand,
          model: formData.vehicle.model,
          year: formData.vehicle.year ? parseInt(formData.vehicle.year) : undefined,
          category: formData.vehicle.category,
          color: formData.vehicle.color,
          serieMotor: formData.vehicle.serieMotor,
          licensedTo: formData.vehicle.licensedTo,
          technicalCondition: formData.vehicle.technicalCondition,
          isAdulterated: formData.vehicle.isAdulterated,
        },
        info: {
          glassInfo: formData.info.glassInfo,
          plateInfo: formData.info.plateInfo,
          motorInfo: formData.info.motorInfo,
          centralEletronicaInfo: formData.info.centralEletronicaInfo,
          seriesAuxiliares: formData.info.seriesAuxiliares,
        },
        analysis: {
          conclusion: formData.analysis.conclusion,
          justification: formData.analysis.justification,
          observations: formData.analysis.observations,
          isConclusive: formData.analysis.isConclusive,
        },
        signature: formData.signature,
        photos,
      });

      // Then update status to completed
      const result = await updateReportStatus(
        report.id,
        "COMPLETED",
        "Laudo finalizado pelo policial"
      );

      if (result.success) {
        router.push("/officer/reports/completed");
      } else {
        setError(result.error || "Erro ao finalizar laudo");
        setIsSaving(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao finalizar laudo");
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "RECEIVED":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Laudo {report.number}
            </h1>
            <p className="text-muted-foreground">
              {isCompleted ? "Visualizar laudo" : "Preencher dados do laudo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              report.status
            )}`}
          >
            {STATUS_LABELS[report.status]}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
              report.priority
            )}`}
          >
            {PRIORITY_LABELS[report.priority]}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("vehicle")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "vehicle"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dados do Veículo
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "photos"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Fotos ({photos.length})
          </button>
          {formData.vehicle.isAdulterated && (
            <button
              onClick={() => setActiveTab("evidence")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === "evidence"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Evidências de Adulteração
            </button>
          )}
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "analysis"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Análise e Conclusão
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Vehicle Tab */}
        {activeTab === "vehicle" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Identificação do Veículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placa *</label>
                  <input
                    type="text"
                    value={report.vehicle?.plate || ""}
                    disabled
                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CHASSI</label>
                  <input
                    type="text"
                    value={formData.vehicle.chassi}
                    onChange={(e) => handleInputChange("vehicle", "chassi", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Número do chassi"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">VIN</label>
                  <input
                    type="text"
                    value={formData.vehicle.vin}
                    onChange={(e) => handleInputChange("vehicle", "vin", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Número VIN"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Marca</label>
                  <input
                    type="text"
                    value={formData.vehicle.brand}
                    onChange={(e) => handleInputChange("vehicle", "brand", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Toyota, Honda"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <input
                    type="text"
                    value={formData.vehicle.model}
                    onChange={(e) => handleInputChange("vehicle", "model", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Corolla, Civic"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <input
                    type="text"
                    value={formData.vehicle.category}
                    onChange={(e) => handleInputChange("vehicle", "category", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Passeio, Carga"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano de Fabricação</label>
                  <input
                    type="text"
                    value={formData.vehicle.year}
                    onChange={(e) => handleInputChange("vehicle", "year", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: 2020"
                    maxLength={4}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor</label>
                  <input
                    type="text"
                    value={formData.vehicle.color}
                    onChange={(e) => handleInputChange("vehicle", "color", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Preto, Branco"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Série do Motor</label>
                  <input
                    type="text"
                    value={formData.vehicle.serieMotor}
                    onChange={(e) => handleInputChange("vehicle", "serieMotor", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Série do motor"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Licenciado em Nome de</label>
                  <input
                    type="text"
                    value={formData.vehicle.licensedTo}
                    onChange={(e) => handleInputChange("vehicle", "licensedTo", e.target.value)}
                    disabled={!canEdit || isSaving}
                    placeholder="Nome do proprietário"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="isAdulterated"
                  type="checkbox"
                  checked={formData.vehicle.isAdulterated}
                  onChange={(e) => handleInputChange("vehicle", "isAdulterated", e.target.checked)}
                  disabled={!canEdit || isSaving}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="isAdulterated" className="text-sm font-medium">
                  Veículo com adulterações detectadas
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Condições Técnicas do Veículo</label>
                <textarea
                  value={formData.vehicle.technicalCondition}
                  onChange={(e) => handleInputChange("vehicle", "technicalCondition", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Descreva as condições técnicas observadas"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Informações Adicionais</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Informações dos Vidros</label>
                <textarea
                  value={formData.info.glassInfo}
                  onChange={(e) => handleInputChange("info", "glassInfo", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Informações sobre os vidros do veículo"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Informações das Placas</label>
                <textarea
                  value={formData.info.plateInfo}
                  onChange={(e) => handleInputChange("info", "plateInfo", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Informações sobre as placas"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Informações do Motor</label>
                <textarea
                  value={formData.info.motorInfo}
                  onChange={(e) => handleInputChange("info", "motorInfo", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Informações sobre o motor"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Central Eletrônica</label>
                <textarea
                  value={formData.info.centralEletronicaInfo}
                  onChange={(e) => handleInputChange("info", "centralEletronicaInfo", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Informações da central eletrônica"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Séries Auxiliares</label>
                <textarea
                  value={formData.info.seriesAuxiliares}
                  onChange={(e) => handleInputChange("info", "seriesAuxiliares", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Informações das séries auxiliares"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, currentPhotoCategory)}
              className="hidden"
            />

            {PHOTO_CATEGORIES.map((cat) => (
              <div key={cat.value} className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{cat.label}</h3>
                  {canEdit && (
                    <Button
                      onClick={() => {
                        setCurrentPhotoCategory(cat.value);
                        fileInputRef.current?.click();
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Adicionar Foto
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos
                    .filter((p) => p.category === cat.value && !p.subtype)
                    .map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.photoData}
                          alt={cat.label}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {canEdit && (
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                {photos.filter((p) => p.category === cat.value && !p.subtype).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma foto adicionada</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === "evidence" && formData.vehicle.isAdulterated && (
          <div className="space-y-6">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  Veículo com Adulterações Detectadas
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Documente todas as evidências de adulteração encontradas no veículo.
                </p>
              </div>
            </div>

            {EVIDENCE_TYPES.map((evidence) => (
              <div key={evidence.value} className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{evidence.label}</h3>
                  {canEdit && (
                    <Button
                      onClick={() => {
                        setCurrentPhotoCategory("evidence");
                        fileInputRef.current?.click();
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Adicionar Evidência
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos
                    .filter((p) => p.category === "evidence" && p.subtype === evidence.value)
                    .map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.photoData}
                          alt={evidence.label}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {canEdit && (
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                {photos.filter((p) => p.category === "evidence" && p.subtype === evidence.value).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma evidência documentada</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Análise Técnica e Conclusão</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conclusão *</label>
                <textarea
                  value={formData.analysis.conclusion}
                  onChange={(e) => handleInputChange("analysis", "conclusion", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Escreva a conclusão do laudo pericial"
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Campo obrigatório para finalizar o laudo
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Conclusão *</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isConclusive"
                      checked={formData.analysis.isConclusive === true}
                      onChange={() => handleInputChange("analysis", "isConclusive", true)}
                      disabled={!canEdit || isSaving}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Conclusivo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isConclusive"
                      checked={formData.analysis.isConclusive === false}
                      onChange={() => handleInputChange("analysis", "isConclusive", false)}
                      disabled={!canEdit || isSaving}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Inconclusivo</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Justificativa</label>
                <textarea
                  value={formData.analysis.justification}
                  onChange={(e) => handleInputChange("analysis", "justification", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Justifique a conclusão (opcional)"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  value={formData.analysis.observations}
                  onChange={(e) => handleInputChange("analysis", "observations", e.target.value)}
                  disabled={!canEdit || isSaving}
                  placeholder="Observações adicionais (opcional)"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {canEdit && (
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Assinatura do Perito</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Digite seu nome completo para assinar o laudo
                  </p>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => setFormData((prev) => ({ ...prev, signature: e.target.value }))}
                    disabled={!canEdit || isSaving}
                    placeholder="Nome completo do perito"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex gap-3 sticky bottom-6 bg-background p-4 rounded-lg border shadow-lg">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="outline"
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Rascunho"}
          </Button>
          <Button
            onClick={() => setShowFinalizeDialog(true)}
            disabled={isSaving || !formData.analysis.conclusion || formData.analysis.isConclusive === undefined}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Laudo
          </Button>
        </div>
      )}

      {/* Finalize Dialog */}
      {showFinalizeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Finalizar Laudo</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Você está prestes a finalizar este laudo. Após a finalização, não será possível fazer mais alterações.
              Confirma que deseja prosseguir?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFinalizeDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowFinalizeDialog(false);
                  handleFinalize();
                }}
                className="flex-1"
              >
                Confirmar Finalização
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
