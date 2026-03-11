import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface UserJwtPayload {
  id: number;
  email: string;
  name: string;
}

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, description } = await req.json();
  const value = Number(amount);
  if (!value || value <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const [wallet] = await sql/*sql*/`
    INSERT INTO wallets (user_id)
    VALUES (${user.id})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id
  `;

  await sql/*sql*/`
    INSERT INTO wallet_transactions (wallet_id, amount, type, description)
    VALUES (${wallet.id}, ${value}, 'deposit', ${description || 'Deposit'})
  `;

  await sql/*sql*/`
    UPDATE wallets
    SET balance = balance + ${value}, updated_at = NOW()
    WHERE id = ${wallet.id}
  `;

  return NextResponse.json({ success: true });
}
