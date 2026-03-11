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

export async function GET() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [wallet] = await sql/*sql*/`
    INSERT INTO wallets (user_id)
    VALUES (${user.id})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id, balance, currency, updated_at
  `;

  const transactions = await sql/*sql*/`
    SELECT id, amount, type, description, created_at
    FROM wallet_transactions
    WHERE wallet_id = ${wallet.id}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return NextResponse.json({ wallet, transactions });
}
