"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import { login } from "@/actions/auth/login"

export default function LoginForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
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
      const res = await login({
        email: formData.email,
        password: formData.password,
        newPassword: mustChangePassword ? formData.newPassword : undefined,
      })

      if (res.success && res.data) {
        toast.success("Login realizado com sucesso")

        // Redireciona para o dashboard apropriado baseado na role
        if (res.data.role === "AGENT") {
          router.push("/agent/dashboard")
        } else if (res.data.role === "OFFICER") {
          router.push("/officer/dashboard")
        } else {
          router.push("/")
        }
      } else if (res.error) {
        if (res.error === "MUST_CHANGE_PASSWORD") {
          setMustChangePassword(true)
          setError("É necessário alterar sua senha no primeiro acesso")
        } else {
          setError(res.error)
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
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
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6 space-y-1">
            <h2 className="text-xl font-semibold text-center">
              {mustChangePassword ? "Alterar Senha" : "Fazer Login"}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {mustChangePassword
                ? "Por segurança, altere sua senha no primeiro acesso"
                : "Entre com suas credenciais para continuar"}
            </p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  {mustChangePassword ? "Senha Atual" : "Senha"}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password (if must change) */}
              {mustChangePassword && (
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isSubmitting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting
                  ? "Entrando..."
                  : mustChangePassword
                  ? "Alterar Senha"
                  : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
