// Types for Sistema de Laudos Policiais
// Based on Prisma schema and laudo-mobile types

import { AppRole, Department, ReportStatus, Priority } from "@prisma/client";

// ============================================
// USER & AUTH TYPES
// ============================================

export type { AppRole, Department, ReportStatus, Priority };

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  department: Department;
  badge: string;
  role: AppRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  newPassword?: string;
}

export interface Session {
  user: User;
  token?: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface VehicleData {
  plate?: string;
  chassi?: string;
  vin?: string;
  motor?: string;
  serieMotor?: string;
  color?: string;
  brand?: string;
  model?: string;
  year?: number;
  category?: string;
  isCloned?: boolean;
  isAdulterated?: boolean;
  licensedTo?: string;
  technicalCondition?: string;
}

export interface Analysis {
  isConclusive?: boolean;
  conclusion?: string;
  justification?: string;
  observations?: string;
}

export interface VehiclePhoto {
  id: string;
  reportId: string;
  category: string;
  subtype?: string;
  photoData: string; // Base64
  description?: string;
  createdAt: Date;
}

export interface AuditEntry {
  id: string;
  reportId: string;
  action: string;
  userId: string;
  userName: string;
  details?: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  number: string;
  status: ReportStatus;
  priority: Priority;
  createdBy: string;
  assignedTo?: string | null;
  assignedAt?: Date | null;
  deadline?: Date | null;

  // Campos do Agente
  oficio?: string;
  orgaoRequisitante?: string;
  autoridadeRequisitante?: string;
  guiaOficio?: string;
  dataGuiaOficio?: Date | null;
  ocorrenciaPolicial?: string;
  objetivoPericia?: string;
  preambulo?: string;
  historico?: string;
  placaPortada?: string;
  especieTipo?: string;
  vidro?: string;
  outrasNumeracoes?: string;

  // Location
  location?: Location;

  // Vehicle
  vehicle?: VehicleData;

  // Informações Adicionais do Policial
  glassInfo?: string;
  plateInfo?: string;
  motorInfo?: string;
  centralEletronicaInfo?: string;
  seriesAuxiliares?: string;

  // Analysis
  analysis?: Analysis;
  expertSignature?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated)
  creator?: User;
  assignee?: User | null;
  auditLogs?: AuditEntry[];
  photos?: VehiclePhoto[];
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateReportInput {
  priority: Priority;
  deadline?: string;

  // Campos do Agente
  oficio: string;
  orgaoRequisitante: string;
  autoridadeRequisitante: string;
  guiaOficio: string;
  dataGuiaOficio?: string;
  ocorrenciaPolicial: string;
  objetivoPericia: string;
  preambulo: string;
  historico: string;
  placaPortada: string;
  especieTipo: string;
  vidro: string;
  outrasNumeracoes: string;

  vehicle: {
    plate: string;
    brand: string;
    model: string;
    color: string;
    motor: string;
    chassi: string;
  };

  assignedTo?: string;
}

export interface UpdateReportInput {
  status?: ReportStatus;
  priority?: Priority;
  location?: Partial<Location>;
  vehicle?: Partial<VehicleData>;
  info?: {
    glassInfo?: string;
    plateInfo?: string;
    motorInfo?: string;
    centralEletronicaInfo?: string;
    seriesAuxiliares?: string;
  };
  analysis?: Partial<Analysis>;
  signature?: string;
  assignedTo?: string | null;
  photos?: Array<{
    id?: string;
    category: string;
    subtype?: string;
    photoData: string;
    description?: string;
  }>;
}

export interface CreateOfficerInput {
  username: string;
  email: string;
  name: string;
  department: Department;
  badge: string;
  role: AppRole;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface UpdateOfficerInput {
  username?: string;
  email?: string;
  name?: string;
  department?: Department;
  badge?: string;
  isActive?: boolean;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  receivedReports: number;
  inProgressReports: number;
  completedReports: number;
  cancelledReports: number;
  overdueReports: number;
  myReports?: number; // For officers
}

export interface ReportsByStatus {
  PENDING: number;
  RECEIVED: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface ReportsByPriority {
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  avgCompletionDays: number;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface ReportFilters {
  status?: ReportStatus | ReportStatus[];
  priority?: Priority | Priority[];
  assignedTo?: string;
  createdBy?: string;
  department?: Department;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface PhotoUploadInput {
  reportId: string;
  part: string;
  file: File;
}

export interface PhotoUploadResult {
  id: string;
  reportId: string;
  part: string;
  photoUrl: string;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Vehicle parts for photo upload
export const VEHICLE_PARTS = [
  "Placa",
  "Chassi",
  "Motor",
  "Vidros",
  "Etiquetas",
  "Painel",
  "Laterais",
  "Frente",
  "Traseira",
  "Rodas",
] as const;

export type VehiclePart = (typeof VEHICLE_PARTS)[number];

// Status labels in Portuguese
export const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pendente",
  RECEIVED: "Recebido",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

// Priority labels in Portuguese
export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

// Department labels in Portuguese
export const DEPARTMENT_LABELS: Record<Department, string> = {
  TRAFFIC: "Trânsito",
  CRIMINAL: "Criminal",
  ADMINISTRATIVE: "Administrativo",
};

// Role labels in Portuguese
export const ROLE_LABELS: Record<AppRole, string> = {
  AGENT: "Agente",
  OFFICER: "Policial",
};
