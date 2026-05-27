"use client";

import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className = "form-control", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? EyeOff : Eye;

  return (
    <div className="password-input-wrap">
      <input {...props} className={clsx(className, "password-input-control")} type={showPassword ? "text" : "password"} />
      <button
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        className="password-toggle"
        type="button"
        onClick={() => setShowPassword((value) => !value)}
      >
        <Icon size={16} />
      </button>
    </div>
  );
}
