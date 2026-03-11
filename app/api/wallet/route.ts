import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DB_URL!);

interface UserJwtPayload {
  id: number;
  email: string;
  name: string;
}

async function getUser() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUser();
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
    LIMIT 20
  `;

  // Summary stats
  const [stats] = await sql/*sql*/`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'prize' THEN amount ELSE 0 END), 0) AS lifetime_winnings,
      COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) AS total_deposits,
      COALESCE(SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END), 0) AS total_payouts
    FROM wallet_transactions WHERE wallet_id = ${wallet.id}
  `;

  // Locked in tournaments (sum of entry_fees for ongoing tournaments)
  const [locked] = await sql/*sql*/`
    SELECT COALESCE(SUM(t.entry_fee), 0) AS locked
    FROM tournament_registrations tr
    JOIN tournaments t ON t.id = tr.tournament_id
    WHERE tr.user_id = ${user.id} AND t.status = 'ongoing'
  `;

  return NextResponse.json({ wallet, transactions, stats, locked: locked.locked });
}
