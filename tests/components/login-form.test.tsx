import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("toggles password visibility without submitting the login form", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<LoginForm action={action} />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Tampilkan password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(action).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Sembunyikan password" }));
    expect(password).toHaveAttribute("type", "password");
    expect(action).not.toHaveBeenCalled();
  });
});
