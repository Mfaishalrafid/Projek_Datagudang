"use client";

import { LogIn } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export function LoginForm({
  action,
  error
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-logo-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-logo-img" src="/brand/indopaket_nobackground.svg" alt="INDOPAKET" />
          </div>
          <div>
            <div className="sb-name">BARKAS+</div>
            <div className="sb-version">Ex-Service & Barang Bekas Management</div>
          </div>
        </div>
        <div>
          <h1>Masuk ke BARKAS+</h1>
          <p>Gunakan akun pusat atau cabang untuk mengakses data sesuai kewenangan.</p>
        </div>
        <form action={action} className="login-form">
          <label>
            Email
            <input className="form-control" name="email" type="email" placeholder="nama@barkas.local" required />
          </label>
          <label>
            Password
            <PasswordInput name="password" placeholder="Password" required />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="btn btn-primary" type="submit">
            <LogIn size={15} />
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
