import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ToastContainer } from "react-toastify"

import "./globals.css"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: {
		default: "Sistema de Laudos Policiais",
		template: "%s | Sistema de Laudos Policiais",
	},
	description: "Sistema de gerenciamento de laudos periciais do Departamento de Polícia Técnica",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR">
			<body className={inter.className}>
				<ToastContainer />
				{children}
			</body>
		</html>
	)
}
