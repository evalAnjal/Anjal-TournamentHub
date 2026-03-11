import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DB_URL!);

interface UserJwtPayload { id: number; email: string; name: string; }

async function getUser() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload; }
  catch { return null; }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, description } = await req.json();
  const value = Number(amount);
  if (!value || value <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const [wallet] = await sql`
    SELECT id, balance FROM wallets WHERE user_id = ${user.id}
  `;
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  if (Number(wallet.balance) < value)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  await sql`
    INSERT INTO wallet_transactions (wallet_id, amount, type, description)
    VALUES (${wallet.id}, ${value}, 'withdraw', ${description || "Withdrawal"})
  `;

  const [updated] = await sql`
    UPDATE wallets SET balance = balance - ${value}, updated_at = NOW()
    WHERE id = ${wallet.id}
    RETURNING balance
  `;

  return NextResponse.json({ success: true, balance: updated.balance });
}
