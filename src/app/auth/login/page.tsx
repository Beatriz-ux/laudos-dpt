import { redirect } from "next/navigation"
import { getCurrentUser } from "@/modules/auth"
import Form from "./form"

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

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center p-24">
			<h1 className="text-2xl font-bold">Login</h1>
			<Form />
		</main>
	)
}
