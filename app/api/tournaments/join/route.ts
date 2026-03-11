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

  const { tournament_id } = await req.json();
  if (!tournament_id) return NextResponse.json({ error: "Missing tournament_id" }, { status: 400 });

  // Get tournament
  const [tournament] = await sql`
    SELECT id, entry_fee, status, max_players FROM tournaments WHERE id = ${tournament_id}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.status !== "upcoming")
    return NextResponse.json({ error: "Tournament is not open for registration" }, { status: 400 });

  // Check already registered
  const existing = await sql`
    SELECT id FROM tournament_registrations WHERE user_id = ${user.id} AND tournament_id = ${tournament_id}
  `;
  if (existing.length > 0) return NextResponse.json({ error: "Already registered" }, { status: 409 });

  // Check player cap
  if (tournament.max_players) {
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM tournament_registrations WHERE tournament_id = ${tournament_id}
    `;
    if (Number(count) >= tournament.max_players)
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
  }

  const entry_fee = Number(tournament.entry_fee);

  if (entry_fee > 0) {
    // Ensure wallet exists
    const [wallet] = await sql`
      INSERT INTO wallets (user_id) VALUES (${user.id})
      ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING id, balance
    `;
    if (Number(wallet.balance) < entry_fee)
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

    // Deduct entry fee
    await sql`UPDATE wallets SET balance = balance - ${entry_fee}, updated_at = NOW() WHERE id = ${wallet.id}`;
    await sql`
      INSERT INTO wallet_transactions (wallet_id, amount, type, description)
      VALUES (${wallet.id}, ${entry_fee}, 'entry_fee', ${"Entry fee for tournament #" + tournament_id})
    `;
  }

  // Register
  await sql`
    INSERT INTO tournament_registrations (user_id, tournament_id) VALUES (${user.id}, ${tournament_id})
  `;

  return NextResponse.json({ success: true });
}
