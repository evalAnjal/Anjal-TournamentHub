import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DB_URL!);

interface UserJwtPayload { id: number; email: string; name: string; role?: string; }

async function getAdmin() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
    // Always check role from DB so existing JWTs without role still work
    const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0] || rows[0].role !== "admin") return null;
    return user;
  } catch { return null; }
}

// POST /api/admin/tournaments/[id]/winner  { winner_user_id: number }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournamentId = Number(id);
  const { winner_user_id } = await req.json();

  if (!winner_user_id) return NextResponse.json({ error: "winner_user_id is required" }, { status: 400 });

  // Get tournament prize pool
  const [tournament] = await sql`
    SELECT id, prize_pool, status FROM tournaments WHERE id = ${tournamentId}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.status === "cancelled") return NextResponse.json({ error: "Tournament is cancelled" }, { status: 400 });

  const prize = Number(tournament.prize_pool);

  // Upsert tournament_results — clear old winner first, set new winner
  await sql`
    INSERT INTO tournament_results (user_id, tournament_id, placement, prize_amount)
    VALUES (${winner_user_id}, ${tournamentId}, 1, ${prize})
    ON CONFLICT (user_id, tournament_id)
    DO UPDATE SET placement = 1, prize_amount = ${prize}
  `;

  // Credit prize to winner's wallet
  const [wallet] = await sql`
    INSERT INTO wallets (user_id) VALUES (${winner_user_id})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id
  `;
  await sql`
    INSERT INTO wallet_transactions (wallet_id, amount, type, description)
    VALUES (${wallet.id}, ${prize}, 'prize', ${"Prize for winning tournament #" + tournamentId})
  `;
  await sql`
    UPDATE wallets SET balance = balance + ${prize}, updated_at = NOW()
    WHERE id = ${wallet.id}
  `;

  // Mark tournament as completed
  await sql`
    UPDATE tournaments SET status = 'completed', end_time = NOW() WHERE id = ${tournamentId}
  `;

  return NextResponse.json({ success: true, prize_awarded: prize });
}
