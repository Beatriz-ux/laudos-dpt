# Guia de Implementação - Sistema de Laudos Policiais Next.js

## 📚 Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [O Que Já Foi Implementado](#o-que-já-foi-implementado)
3. [Server Actions - Como Implementar](#server-actions---como-implementar)
4. [Componentes UI - Shadcn](#componentes-ui---shadcn)
5. [Componentes Police - Como Implementar](#componentes-police---como-implementar)
6. [Páginas - Como Implementar](#páginas---como-implementar)
7. [Passos para Completar o Projeto](#passos-para-completar-o-projeto)
8. [Comandos Úteis](#comandos-úteis)

---

## Estrutura do Projeto

```
laudos-dpt/
├── prisma/
│   └── schema.prisma ✅ COMPLETO
├── src/
│   ├── actions/
│   │   ├── auth/
│   │   │   ├── login.ts ✅ COMPLETO
│   │   │   ├── logout.ts ✅ COMPLETO
│   │   │   └── get-current-user.ts ✅ COMPLETO
│   │   ├── reports/
│   │   │   ├── get-reports.ts ✅ EXEMPLO
│   │   │   ├── create-report.ts ✅ EXEMPLO
│   │   │   ├── update-report.ts ⏳ IMPLEMENTAR
│   │   │   ├── assign-report.ts ⏳ IMPLEMENTAR
│   │   │   └── cancel-report.ts ⏳ IMPLEMENTAR
│   │   ├── officers/
│   │   │   ├── get-officers.ts ⏳ IMPLEMENTAR
│   │   │   ├── create-officer.ts ⏳ IMPLEMENTAR
│   │   │   └── update-officer.ts ⏳ IMPLEMENTAR
│   │   └── dashboard/
│   │       └── get-stats.ts ⏳ IMPLEMENTAR
│   ├── app/
│   │   ├── globals.css ✅ COMPLETO
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx ⏳ IMPLEMENTAR
│   │   ├── (agent)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx ⏳ IMPLEMENTAR
│   │   │   ├── laudos/
│   │   │   │   └── page.tsx ⏳ IMPLEMENTAR
│   │   │   └── policiais/
│   │   │       └── page.tsx ⏳ IMPLEMENTAR
│   │   └── (officer)/
│   │       ├── dashboard/
│   │       │   └── page.tsx ⏳ IMPLEMENTAR
│   │       └── laudos/
│   │           └── recebidos/
│   │               └── page.tsx ⏳ IMPLEMENTAR
│   ├── components/
│   │   ├── ui/ ⏳ SHADCN - INSTALAR
│   │   └── police/
│   │       ├── dashboard-layout.tsx ⏳ IMPLEMENTAR
│   │       ├── sidebar.tsx ⏳ IMPLEMENTAR
│   │       ├── metric-card.tsx ⏳ IMPLEMENTAR
│   │       └── status-badge.tsx ⏳ IMPLEMENTAR
│   ├── lib/
│   │   ├── utils.ts ✅ COMPLETO
│   │   └── prisma.ts ✅ COMPLETO
│   ├── modules/
│   │   ├── auth.ts ✅ COMPLETO
│   │   └── db.ts ✅ EXISTENTE
│   ├── types/
│   │   └── index.ts ✅ COMPLETO
│   └── middleware.ts ⏳ IMPLEMENTAR
├── tailwind.config.ts ✅ COMPLETO
└── package.json ⏳ ATUALIZAR DEPS
```

---

## O Que Já Foi Implementado

### ✅ COMPLETO

1. **Schema do Prisma** (`prisma/schema.prisma`)
   - Todos os models (Profile, UserRole, Report, ReportAuditLog, VehiclePhoto)
   - Todos os enums (AppRole, Department, ReportStatus, Priority)
   - Relacionamentos configurados

2. **Tipos TypeScript** (`src/types/index.ts`)
   - Todos os tipos do sistema
   - Constantes e labels em português

3. **Utilitários** (`src/lib/utils.ts`, `src/lib/prisma.ts`)
   - Funções de formatação
   - Validações
   - Cliente do Prisma

4. **Autenticação** (`src/modules/auth.ts`)
   - Funções de sessão (JWT)
   - Helpers de autorização

5. **Server Actions - Auth** (`src/actions/auth/`)
   - login.ts - Login com troca de senha obrigatória
   - logout.ts - Logout
   - get-current-user.ts - Buscar usuário atual

6. **Server Actions - Reports (Exemplos)** (`src/actions/reports/`)
   - get-reports.ts - Listar laudos com RLS
   - create-report.ts - Criar laudo com auditoria

7. **CSS/Tailwind**
   - Tema dark policial completo
   - Cores customizadas
   - Componentes utilitários CSS

---

## Server Actions - Como Implementar

### Padrão de Server Action

Todas as server actions seguem este padrão:

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/modules/auth"
import type { ActionResponse, TipoRetorno } from "@/types"

export async function nomeDaAction(
  parametros: TipoParametros
): Promise<ActionResponse<TipoRetorno>> {
  try {
    // 1. Autenticação/Autorização
    const currentUser = await requireAuth() // ou requireRole("AGENT")

    // 2. Validações de negócio
    if (algumaCondicao) {
      return { success: false, error: "Mensagem de erro" }
    }

    // 3. Operações no banco de dados
    const resultado = await prisma.model.operation(...)

    // 4. Auditoria (se aplicável)
    await prisma.reportAuditLog.create(...)

    // 5. Retornar sucesso
    return { success: true, data: resultado }
  } catch (error: any) {
    console.error("Erro:", error)
    return { success: false, error: error.message || "Erro genérico" }
  }
}
```

### Server Actions Faltantes

#### `src/actions/reports/update-report.ts`

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, UpdateReportInput, Report } from "@/types"

export async function updateReport(
  reportId: string,
  input: UpdateReportInput
): Promise<ActionResponse<Report>> {
  try {
    const currentUser = await requireAuth()

    // Buscar o laudo
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!existingReport) {
      return { success: false, error: "Laudo não encontrado" }
    }

    // Verificar permissão
    // AGENT pode editar qualquer laudo
    // OFFICER só pode editar laudos atribuídos a ele
    if (
      currentUser.role === "OFFICER" &&
      existingReport.assignedTo !== currentUser.id
    ) {
      return { success: false, error: "Acesso negado" }
    }

    // Montar dados para update
    const updateData: any = {}

    if (input.status) updateData.status = input.status
    if (input.priority) updateData.priority = input.priority
    if (input.location) {
      if (input.location.address) updateData.locationAddress = input.location.address
      if (input.location.city) updateData.locationCity = input.location.city
      if (input.location.state) updateData.locationState = input.location.state
    }
    if (input.vehicle) {
      if (input.vehicle.plate) updateData.vehiclePlate = input.vehicle.plate
      if (input.vehicle.chassi) updateData.vehicleChassi = input.vehicle.chassi
      if (input.vehicle.motor) updateData.vehicleMotor = input.vehicle.motor
      if (input.vehicle.color) updateData.vehicleColor = input.vehicle.color
      if (input.vehicle.brand) updateData.vehicleBrand = input.vehicle.brand
      if (input.vehicle.model) updateData.vehicleModel = input.vehicle.model
      if (input.vehicle.year) updateData.vehicleYear = input.vehicle.year
      if (input.vehicle.isCloned !== undefined) updateData.vehicleIsCloned = input.vehicle.isCloned
    }
    if (input.analysis) {
      if (input.analysis.isConclusive !== undefined)
        updateData.analysisIsConclusive = input.analysis.isConclusive
      if (input.analysis.justification)
        updateData.analysisJustification = input.analysis.justification
      if (input.analysis.observations)
        updateData.analysisObservations = input.analysis.observations
    }

    // Atualizar laudo
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId: reportId,
        action: "UPDATED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: "Laudo atualizado",
      },
    })

    return { success: true, data: updatedReport as any }
  } catch (error: any) {
    console.error("Update report error:", error)
    return { success: false, error: error.message || "Erro ao atualizar laudo" }
  }
}
```

#### `src/actions/reports/assign-report.ts`

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/modules/auth"
import type { ActionResponse, Report } from "@/types"

export async function assignReport(
  reportId: string,
  officerId: string
): Promise<ActionResponse<Report>> {
  try {
    const currentUser = await requireRole("AGENT")

    // Buscar laudo e policial
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    const officer = await prisma.profile.findUnique({ where: { id: officerId } })

    if (!report) {
      return { success: false, error: "Laudo não encontrado" }
    }
    if (!officer) {
      return { success: false, error: "Policial não encontrado" }
    }

    // Atualizar laudo
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedTo: officerId,
        assignedAt: new Date(),
        status: "RECEIVED",
      },
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId: reportId,
        action: "ASSIGNED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: `Laudo atribuído para ${officer.name}`,
      },
    })

    return { success: true, data: updatedReport as any }
  } catch (error: any) {
    console.error("Assign report error:", error)
    return { success: false, error: error.message || "Erro ao atribuir laudo" }
  }
}
```

#### `src/actions/officers/get-officers.ts`

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, User } from "@/types"

export async function getOfficers(): Promise<ActionResponse<User[]>> {
  try {
    await requireAuth()

    const officers = await prisma.profile.findMany({
      where: {
        roles: {
          some: {
            role: "OFFICER",
          },
        },
        isActive: true,
      },
      include: {
        roles: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    const mappedOfficers: User[] = officers.map((o) => ({
      id: o.id,
      username: o.username,
      email: o.email,
      name: o.name,
      department: o.department,
      badge: o.badge,
      role: o.roles[0]?.role || "OFFICER",
      isActive: o.isActive,
      mustChangePassword: o.mustChangePassword,
      lastLogin: o.lastLogin,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }))

    return { success: true, data: mappedOfficers }
  } catch (error: any) {
    console.error("Get officers error:", error)
    return { success: false, error: error.message || "Erro ao buscar policiais" }
  }
}
```

#### `src/actions/officers/create-officer.ts`

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/modules/auth"
import type { ActionResponse, CreateOfficerInput, User } from "@/types"
import bcrypt from "bcryptjs"

export async function createOfficer(
  input: CreateOfficerInput
): Promise<ActionResponse<User>> {
  try {
    await requireRole("AGENT")

    // Check if username or email already exists
    const existing = await prisma.profile.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }],
      },
    })

    if (existing) {
      return {
        success: false,
        error: "Usuário ou email já existe",
      }
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash("senha123", 10)

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        department: input.department,
        badge: input.badge,
        isActive: input.isActive !== undefined ? input.isActive : true,
        mustChangePassword:
          input.mustChangePassword !== undefined ? input.mustChangePassword : true,
      },
    })

    // Create role
    await prisma.userRole.create({
      data: {
        userId: profile.id,
        role: input.role,
      },
    })

    const user: User = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      department: profile.department,
      badge: profile.badge,
      role: input.role,
      isActive: profile.isActive,
      mustChangePassword: profile.mustChangePassword,
      lastLogin: null,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    return { success: true, data: user }
  } catch (error: any) {
    console.error("Create officer error:", error)
    return { success: false, error: error.message || "Erro ao criar policial" }
  }
}
```

#### `src/actions/dashboard/get-stats.ts`

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, DashboardStats } from "@/types"

export async function getStats(userId?: string): Promise<ActionResponse<DashboardStats>> {
  try {
    const currentUser = await requireAuth()

    const where: any = {}

    // If OFFICER, only show their reports
    if (currentUser.role === "OFFICER") {
      where.assignedTo = currentUser.id
    } else if (userId) {
      where.assignedTo = userId
    }

    const [
      total,
      pending,
      received,
      inProgress,
      completed,
      cancelled,
    ] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.count({ where: { ...where, status: "PENDING" } }),
      prisma.report.count({ where: { ...where, status: "RECEIVED" } }),
      prisma.report.count({ where: { ...where, status: "IN_PROGRESS" } }),
      prisma.report.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.report.count({ where: { ...where, status: "CANCELLED" } }),
    ])

    // Calculate overdue (> 3 days since assigned and not completed)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const overdue = await prisma.report.count({
      where: {
        ...where,
        assignedAt: {
          lt: threeDaysAgo,
        },
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    })

    const stats: DashboardStats = {
      totalReports: total,
      pendingReports: pending,
      receivedReports: received,
      inProgressReports: inProgress,
      completedReports: completed,
      cancelledReports: cancelled,
      overdueReports: overdue,
    }

    if (userId || currentUser.role === "OFFICER") {
      stats.myReports = total
    }

    return { success: true, data: stats }
  } catch (error: any) {
    console.error("Get stats error:", error)
    return { success: false, error: error.message || "Erro ao buscar estatísticas" }
  }
}
```

---

## Componentes UI - Shadcn

### Instalar Shadcn/UI

```bash
npx shadcn-ui@latest init
```

Quando perguntar as configurações, use:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.ts
- Components directory: src/components
- Utils: src/lib/utils.ts

### Instalar Componentes Necessários

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sonner
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add tabs
```

---

## Componentes Police - Como Implementar

Os componentes específicos do sistema policial devem ser criados em `src/components/police/`.

### Exemplo: `src/components/police/status-badge.tsx`

```typescript
import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, ReportStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: ReportStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = {
    PENDING: "bg-badge-pending text-warning-foreground",
    RECEIVED: "bg-badge-received text-info-foreground",
    IN_PROGRESS: "bg-badge-progress text-accent-foreground",
    COMPLETED: "bg-badge-completed text-success-foreground",
    CANCELLED: "bg-badge-cancelled text-destructive-foreground",
  }[status]

  return (
    <Badge className={cn("font-medium", colorClass)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
```

### Exemplo: `src/components/police/metric-card.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="metric-value">{value}</div>
        {trend && (
          <p
            className={cn(
              "text-xs",
              trend.isPositive ? "metric-trend-up" : "metric-trend-down"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}% vs. mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### Copiar Componentes do laudo-mobile

Os componentes principais já estão implementados no projeto original:

- `sidebar.tsx` - Copiar de `/laudo-mobile/src/components/police/sidebar.tsx`
- `dashboard-layout.tsx` - Copiar de `/laudo-mobile/src/components/police/dashboard-layout.tsx`
- `data-table.tsx` - Copiar de `/laudo-mobile/src/components/police/data-table.tsx`

**Importante**: Ao copiar, ajustar os imports:
- React Router → Next.js (useRouter, Link)
- Contextos → Server actions

---

## Páginas - Como Implementar

### Estrutura de Grupos de Rotas

Next.js App Router usa grupos de rotas com `()`:

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (agent)/
│   ├── layout.tsx (DashboardLayout com Sidebar)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── laudos/
│   │   └── page.tsx
│   └── policiais/
│       └── page.tsx
└── (officer)/
    ├── layout.tsx (DashboardLayout com Sidebar)
    └── dashboard/
        └── page.tsx
```

### Exemplo: `src/app/(auth)/login/page.tsx`

Copiar de `/laudo-mobile/src/pages/Login.tsx` e adaptar:

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/actions/auth/login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    newPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        newPassword: mustChangePassword ? formData.newPassword : undefined,
      })

      if (!result.success) {
        if (result.error === "MUST_CHANGE_PASSWORD") {
          setMustChangePassword(true)
          setError("É necessário alterar sua senha no primeiro acesso")
        } else {
          setError(result.error || "Erro ao fazer login")
        }
        return
      }

      // Redirect based on role
      if (result.data?.role === "AGENT") {
        router.push("/agent/dashboard")
      } else {
        router.push("/officer/dashboard")
      }
    } catch (err: any) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sistema de Laudos</h1>
          <p className="text-muted-foreground">Polícia Civil - Acesso Restrito</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mustChangePassword ? "Alterar Senha" : "Fazer Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {mustChangePassword
                ? "Por segurança, altere sua senha no primeiro acesso"
                : "Entre com suas credenciais para continuar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mustChangePassword ? "Senha Atual" : "Senha"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              {mustChangePassword && (
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      required
                      disabled={isSubmitting}
                      minLength={8}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Entrando..."
                  : mustChangePassword
                  ? "Alterar Senha"
                  : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Exemplo: `src/app/(agent)/layout.tsx`

```typescript
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/modules/auth"
import { DashboardLayout } from "@/components/police/dashboard-layout"
import { logout } from "@/actions/auth/logout"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard")
  }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      {children}
    </DashboardLayout>
  )
}
```

### Exemplo: `src/app/(agent)/dashboard/page.tsx`

```typescript
import { getStats } from "@/actions/dashboard/get-stats"
import { MetricCard } from "@/components/police/metric-card"
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export default async function AgentDashboardPage() {
  const result = await getStats()

  if (!result.success || !result.data) {
    return <div>Erro ao carregar estatísticas</div>
  }

  const stats = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de laudos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Laudos"
          value={stats.totalReports}
          icon={FileText}
        />
        <MetricCard
          title="Pendentes"
          value={stats.pendingReports}
          icon={Clock}
        />
        <MetricCard
          title="Em Andamento"
          value={stats.inProgressReports}
          icon={Clock}
        />
        <MetricCard
          title="Concluídos"
          value={stats.completedReports}
          icon={CheckCircle}
        />
        <MetricCard
          title="Atrasados"
          value={stats.overdueReports}
          icon={AlertTriangle}
        />
      </div>
    </div>
  )
}
```

---

## Passos para Completar o Projeto

### 1. Instalar Dependências Necessárias

```bash
npm install bcryptjs clsx tailwind-merge date-fns lucide-react
npm install -D @types/bcryptjs
npm install @prisma/client
npm install tailwindcss-animate
```

### 2. Configurar Prisma

```bash
npx prisma generate
npx prisma db push
```

### 3. Instalar Shadcn/UI

```bash
npx shadcn-ui@latest init
# Instalar componentes (ver seção acima)
```

### 4. Implementar Server Actions Restantes

- Seguir os exemplos fornecidos
- Implementar todas as actions em:
  - `src/actions/reports/`
  - `src/actions/officers/`
  - `src/actions/dashboard/`

### 5. Copiar e Adaptar Componentes

- Copiar componentes de `/laudo-mobile/src/components/police/`
- Adaptar imports (React Router → Next.js)
- Adaptar chamadas de API (Supabase → Server Actions)

### 6. Implementar Páginas

- Copiar páginas de `/laudo-mobile/src/pages/`
- Adaptar para Next.js App Router
- Usar Server Actions em vez de hooks do Supabase

### 7. Implementar Middleware

`src/middleware.ts`:

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/modules/auth"

export async function middleware(request: NextRequest) {
  const session = await getSession()

  // Public routes
  if (request.nextUrl.pathname.startsWith("/login")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### 8. Criar Seed para Banco de Dados

`prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create AGENT
  const hashedPassword = await bcrypt.hash("senha123", 10)

  const agent = await prisma.profile.create({
    data: {
      username: "agent.traffic",
      email: "agent.traffic@policia.ba.gov.br",
      password: hashedPassword,
      name: "Carlos Silva Santos",
      department: "TRAFFIC",
      badge: "AGENT-TRA-001",
      isActive: true,
      mustChangePassword: true,
    },
  })

  await prisma.userRole.create({
    data: {
      userId: agent.id,
      role: "AGENT",
    },
  })

  // Create OFFICER
  const officer = await prisma.profile.create({
    data: {
      username: "officer.traffic1",
      email: "officer.traffic1@policia.ba.gov.br",
      password: hashedPassword,
      name: "Roberto Ferreira Lima",
      department: "TRAFFIC",
      badge: "OFF-TRA-101",
      isActive: true,
      mustChangePassword: true,
    },
  })

  await prisma.userRole.create({
    data: {
      userId: officer.id,
      role: "OFFICER",
    },
  })

  console.log("Seed completed!")
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
```

Executar:

```bash
npx prisma db seed
```

### 9. Testar o Sistema

```bash
npm run dev
```

Acessar: `http://localhost:3000/login`

Credenciais de teste:
- Agente: `agent.traffic` / `senha123`
- Policial: `officer.traffic1` / `senha123`

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Gerar Prisma Client
npx prisma generate

# Sincronizar banco (dev)
npx prisma db push

# Migrations (produção)
npx prisma migrate dev

# Abrir Prisma Studio
npx prisma studio

# Build para produção
npm run build

# Lint
npm run lint
```

---

## Observações Finais

1. **Autenticação**: Todo o sistema de autenticação está completo e funcional
2. **Server Actions**: Use sempre `"use server"` no topo dos arquivos de actions
3. **Autorização**: Use `requireAuth()` e `requireRole()` para proteger actions
4. **Auditoria**: Sempre criar logs de auditoria para ações importantes
5. **Visual**: Mantenha o tema dark policial configurado no globals.css
6. **Tipos**: Todos os tipos estão em `@/types`

---

## Próximos Passos Recomendados

1. Implementar todas as server actions seguindo os exemplos
2. Instalar e configurar Shadcn/UI
3. Copiar e adaptar componentes do laudo-mobile
4. Implementar as páginas principais
5. Criar seed do banco de dados
6. Testar fluxo completo do sistema
7. Implementar upload de fotos (opcional)

**Lembre-se**: O projeto laudo-mobile contém TODOS os componentes e páginas prontos. Basta copiar e adaptar para Next.js!
