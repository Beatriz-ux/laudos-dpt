import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Department } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReportNumber(
  department: Department,
  sequence: number
): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const seq = String(sequence).padStart(4, "0")
  return `${date}-${department}-${seq}`
}

export function stringifyCoordinates(coords: {
  lat: number
  lng: number
}): string {
  return JSON.stringify(coords)
}
