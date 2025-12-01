import { redirect } from "next/navigation"
import { getCurrentUser } from "@/modules/auth"
import LoginForm from "./form"

export default async function Login() {
	const user = await getCurrentUser()

	// Se já estiver logado, redireciona para o dashboard apropriado
	if (user) {
		if (user.role === "AGENT") {
			redirect("/agent/dashboard")
		} else if (user.role === "OFFICER") {
			redirect("/officer/dashboard")
		}
	}

	return <LoginForm />
}
