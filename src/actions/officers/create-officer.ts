"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import bcrypt from "bcrypt"
import type { ActionResponse, User } from "@/types"
import type { Department } from "@prisma/client"

interface CreateOfficerData {
  username: string
  email: string
  name: string
  department: Department
  badge: string
  password: string
}

export async function createOfficer(data: CreateOfficerData): Promise<ActionResponse<User>> {
  try {
    const currentUser = await requireAuth()

    // Apenas AGENTs podem criar policiais
    if (currentUser.role !== "AGENT") {
      return { success: false, error: "Acesso negado" }
    }

    // Validar campos obrigatórios
    if (!data.username || !data.email || !data.name || !data.department || !data.badge || !data.password) {
      return { success: false, error: "Todos os campos são obrigatórios" }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Email inválido" }
    }

    // Verificar se username já existe
    const existingUsername = await prisma.profile.findUnique({
      where: { username: data.username },
    })

    if (existingUsername) {
      return { success: false, error: "Usuário já existe" }
    }

    // Verificar se email já existe
    const existingEmail = await prisma.profile.findUnique({
      where: { email: data.email },
    })

    if (existingEmail) {
      return { success: false, error: "Email já cadastrado" }
    }

    // Verificar se badge já existe
    const existingBadge = await prisma.profile.findUnique({
      where: { badge: data.badge },
    })

    if (existingBadge) {
      return { success: false, error: "Matrícula já cadastrada" }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Criar profile
    const profile = await prisma.profile.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        department: data.department,
        badge: data.badge,
        isActive: true,
        mustChangePassword: true,
      },
      include: {
        roles: true,
      },
    })

    // Criar role OFFICER
    await prisma.userRole.create({
      data: {
        userId: profile.id,
        role: "OFFICER",
      },
    })

    const officer: User = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      department: profile.department,
      badge: profile.badge,
      role: "OFFICER",
      isActive: profile.isActive,
      mustChangePassword: profile.mustChangePassword,
      lastLogin: profile.lastLogin,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    return { success: true, data: officer }
  } catch (error: any) {
    console.error("Create officer error:", error)
    return { success: false, error: error.message || "Erro ao criar policial" }
  }
}
