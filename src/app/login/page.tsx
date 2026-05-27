import { loginAction } from "@/app/actions";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  if (getSessionUser()) redirect("/dashboard");

  const message =
    searchParams?.error === "branch"
      ? "Akun cabang belum memiliki cabang aktif."
      : searchParams?.error
        ? "Email atau password tidak sesuai."
        : "";

  return <LoginForm action={loginAction} error={message} />;
}
