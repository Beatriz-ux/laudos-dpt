"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { login } from "@/actions/auth/login";

export default function Form() {
  const router = useRouter();

  async function loginClient(formData: FormData) {
    const res = await login({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Login realizado com sucesso");

      // Redireciona para o dashboard apropriado baseado na role
      if (res.data?.role === "AGENT") {
        router.push("/agent/dashboard");
      } else if (res.data?.role === "OFFICER") {
        router.push("/officer/dashboard");
      } else {
        router.push("/");
      }
    }
  }

  return (
    <form action={loginClient} className="flex flex-col gap-1">
      <input
        type="email"
        placeholder="Your email"
        name="email"
        className="p-2 bg-transparent border-b-2 border-gray-700"
      />
      <input
        type="password"
        placeholder="Your password"
        name="password"
        className="p-2 bg-transparent border-b-2 border-gray-700"
      />
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-700 transition-all"
      >
        Login
      </button>
    </form>
  );
}
