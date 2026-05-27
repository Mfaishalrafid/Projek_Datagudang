import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/LoginForm";

describe("LoginForm", () => {
  it("renders login fields and error message", () => {
    render(<LoginForm action={vi.fn()} error="Email atau password tidak sesuai." />);

    expect(screen.getByRole("heading", { name: "Masuk ke BARKAS+" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Email atau password tidak sesuai.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/ })).toBeInTheDocument();
  });
});
