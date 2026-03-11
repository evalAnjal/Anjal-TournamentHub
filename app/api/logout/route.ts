import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Clear auth/session cookie
  cookieStore.set("session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
  });

  return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
}
