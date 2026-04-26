"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_EMAIL, APP_PASSWORD, SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const emailOk = typeof email === "string" && email.trim().toLowerCase() === APP_EMAIL;
  const passOk = typeof password === "string" && password === APP_PASSWORD;
  if (!emailOk || !passOk) {
    return { error: "Invalid credentials. Operator denied." };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
