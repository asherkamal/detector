import { cookies } from "next/headers";

export const SESSION_COOKIE = "kinetic_session";
export const APP_EMAIL = "dhruv@target.com";
export const APP_PASSWORD = "target";
export const SESSION_VALUE = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
