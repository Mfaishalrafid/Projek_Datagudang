import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Branch, User } from "@prisma/client";
import type { SessionUser } from "@/lib/access-control";

export const sessionCookieName = "barkas_session";
const sessionTtlSeconds = 60 * 60 * 8;

function getSecret() {
  return process.env.AUTH_SECRET || "barkas-local-development-secret-change-me";
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function toSessionUser(user: User & { branch?: Branch | null }): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
    branchName: user.branch?.name || null,
    branchCode: user.branch?.code || null
  };
}

export function createSessionToken(user: SessionUser, now = Date.now()) {
  const payload = {
    user,
    exp: now + sessionTtlSeconds * 1000
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string, now = Date.now()): SessionUser | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      user?: SessionUser;
      exp?: number;
    };

    if (!parsed.user || !parsed.exp || parsed.exp < now) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

export function getSessionUser() {
  const token = cookies().get(sessionCookieName)?.value;
  return token ? parseSessionToken(token) : null;
}

export function requirePageUser() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export function requireActionUser() {
  const user = getSessionUser();
  if (!user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }
  return user;
}

export function setSessionCookie(user: SessionUser) {
  cookies().set(sessionCookieName, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionTtlSeconds,
    path: "/"
  });
}

export function clearSessionCookie() {
  cookies().delete(sessionCookieName);
}
