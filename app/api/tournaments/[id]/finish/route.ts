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

// POST /api/tournaments/[id]/finish  { winner_user_id: number }
// Only the tournament creator can call this, and only when status = 'ongoing'
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournamentId = Number(id);
  const { winner_user_id } = await req.json();

  if (!winner_user_id) return NextResponse.json({ error: "winner_user_id is required" }, { status: 400 });

  // Verify this tournament exists, is ongoing, and belongs to the caller
  const [tournament] = await sql`
    SELECT id, prize_pool, status, created_by FROM tournaments WHERE id = ${tournamentId}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (Number(tournament.created_by) !== user.id)
    return NextResponse.json({ error: "Only the tournament creator can finish it" }, { status: 403 });
  if (tournament.status !== "ongoing")
    return NextResponse.json({ error: "Tournament must be ongoing to finish" }, { status: 400 });

  // Verify winner is actually registered
  const [reg] = await sql`
    SELECT id FROM tournament_registrations
    WHERE tournament_id = ${tournamentId} AND user_id = ${Number(winner_user_id)}
  `;
  if (!reg) return NextResponse.json({ error: "Selected player is not registered in this tournament" }, { status: 400 });

  const prize = Number(tournament.prize_pool);

  // Upsert tournament_results
  await sql`
    INSERT INTO tournament_results (user_id, tournament_id, placement, prize_amount)
    VALUES (${Number(winner_user_id)}, ${tournamentId}, 1, ${prize})
    ON CONFLICT (user_id, tournament_id)
    DO UPDATE SET placement = 1, prize_amount = ${prize}
  `;

  // Credit prize to winner's wallet
  const [wallet] = await sql`
    INSERT INTO wallets (user_id) VALUES (${Number(winner_user_id)})
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
