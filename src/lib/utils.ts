import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR")
}

/**
 * Format datetime to Brazilian format (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format date to relative time (e.g., "há 2 dias")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "agora"
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? "s" : ""}`
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`

  return formatDate(d)
}

/**
 * Check if a report is overdue (more than 3 days since assignment)
 */
export function isReportOverdue(
  assignedAt: Date | string | null,
  status: string
): boolean {
  if (!assignedAt || status === "COMPLETED" || status === "CANCELLED") {
    return false
  }

  const assigned = new Date(assignedAt)
  const now = new Date()
  const diffMs = now.getTime() - assigned.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays > 3
}

/**
 * Generate report number (YYYYMMDD-DEPT-0001)
 */
export function generateReportNumber(
  department: string,
  sequence: number
): string {
  const date = new Date()
  const dateStr = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")
  const seqStr = String(sequence).padStart(4, "0")
  return `${dateStr}-${department}-${seqStr}`
}

/**
 * Validate Brazilian license plate (old and Mercosul formats)
 */
export function validatePlate(plate: string): boolean {
  const platePattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/
  return platePattern.test(plate.toUpperCase())
}

/**
 * Format license plate (uppercase)
 */
export function formatPlate(plate: string): string {
  return plate.toUpperCase().trim()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Parse coordinates from string
 */
export function parseCoordinates(
  coordStr: string | null
): { lat: number; lng: number } | null {
  if (!coordStr) return null
  try {
    const coords = JSON.parse(coordStr)
    if (typeof coords.lat === "number" && typeof coords.lng === "number") {
      return coords
    }
    return null
  } catch {
    return null
  }
}

/**
 * Stringify coordinates
 */
export function stringifyCoordinates(coords: {
  lat: number
  lng: number
}): string {
  return JSON.stringify(coords)
}
