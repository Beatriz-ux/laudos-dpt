"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/modules/auth";
import type { LoginCredentials, ActionResponse, User } from "@/types";
import bcrypt from "bcryptjs";

export async function login(
  credentials: LoginCredentials
): Promise<ActionResponse<User>> {
  try {
    const { email, password, newPassword } = credentials;

    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!profile) {
      return { success: false, error: "Credenciais inválidas" };
    }

    if (!profile.isActive) {
      return {
        success: false,
        error: "Usuário inativo. Contate o administrador.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, profile.password);
    if (!isPasswordValid) {
      return { success: false, error: "Credenciais inválidas" };
    }

    if (profile.mustChangePassword && !newPassword) {
      return { success: false, error: "MUST_CHANGE_PASSWORD" };
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.profile.update({
        where: { id: profile.id },
        data: { password: hashedPassword, mustChangePassword: false },
      });
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: { lastLogin: new Date() },
    });

    const userRole = profile.roles[0]?.role;
    if (!userRole) {
      return { success: false, error: "Usuário sem papel definido" };
    }

    const user: User = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      department: profile.department,
      badge: profile.badge,
      role: userRole,
      isActive: profile.isActive,
      mustChangePassword: newPassword ? false : profile.mustChangePassword,
      lastLogin: new Date(),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    await createSession(user);

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "Erro ao fazer login. Tente novamente." };
  }
}
