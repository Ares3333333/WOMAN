"use server";

import { cookies } from "next/headers";

const COOKIE = "sora_age_ok";

export async function confirmAgeGate(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function hasAgeConfirmation(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === "1";
}
