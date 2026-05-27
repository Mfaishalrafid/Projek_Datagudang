import { describe, expect, it } from "vitest";
import { createSessionToken, parseSessionToken } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations";
import type { SessionUser } from "@/lib/access-control";

const user: SessionUser = {
  id: "user-1",
  name: "Admin Pusat",
  email: "admin@barkas.local",
  role: "ADMIN_PUSAT",
  branchId: null
};

describe("auth validation and session helpers", () => {
  it("normalizes login email and requires password", () => {
    expect(loginSchema.parse({ email: " ADMIN@BARKAS.LOCAL ", password: "secret" }).email).toBe("admin@barkas.local");
    expect(loginSchema.safeParse({ email: "admin@barkas.local", password: "" }).success).toBe(false);
  });

  it("stores passwords as verifiable hashes, not plaintext", () => {
    const hash = hashPassword("Secret123!");

    expect(hash).not.toBe("Secret123!");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(verifyPassword("Secret123!", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("signs and parses session tokens", () => {
    const token = createSessionToken(user, Date.parse("2026-05-23T00:00:00.000Z"));

    expect(parseSessionToken(token, Date.parse("2026-05-23T01:00:00.000Z"))).toMatchObject({
      id: "user-1",
      role: "ADMIN_PUSAT"
    });
    expect(parseSessionToken(`${token}tampered`, Date.parse("2026-05-23T01:00:00.000Z"))).toBeNull();
    expect(parseSessionToken(token, Date.parse("2026-05-24T00:00:00.000Z"))).toBeNull();
  });
});
