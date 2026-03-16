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
// Safe to call multiple times — claws back old winner's prize before awarding new one.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournamentId = Number(id);
  const { winner_user_id } = await req.json();

  if (!winner_user_id) return NextResponse.json({ error: "winner_user_id is required" }, { status: 400 });

  // Get tournament
  const [tournament] = await sql`
    SELECT id, prize_pool, status FROM tournaments WHERE id = ${tournamentId}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.status === "cancelled") return NextResponse.json({ error: "Tournament is cancelled" }, { status: 400 });

  // Verify new winner is registered
  const [reg] = await sql`
    SELECT id FROM tournament_registrations
    WHERE tournament_id = ${tournamentId} AND user_id = ${Number(winner_user_id)}
  `;
  if (!reg) return NextResponse.json({ error: "Selected player is not registered in this tournament" }, { status: 400 });

  const prize = Number(tournament.prize_pool);

  // ── Clawback: find existing winner (if different) and reverse their prize ──
  const [prevResult] = await sql`
    SELECT user_id, prize_amount FROM tournament_results
    WHERE tournament_id = ${tournamentId} AND placement = 1
  `;
  if (prevResult && Number(prevResult.user_id) !== Number(winner_user_id)) {
    const prevPrize = Number(prevResult.prize_amount);
    // Deduct from old winner's wallet
    const [prevWallet] = await sql`
      SELECT id FROM wallets WHERE user_id = ${Number(prevResult.user_id)}
    `;
    if (prevWallet) {
      await sql`
        UPDATE wallets
        SET balance = GREATEST(balance - ${prevPrize}, 0), updated_at = NOW()
        WHERE id = ${prevWallet.id}
      `;
      await sql`
        INSERT INTO wallet_transactions (wallet_id, amount, type, description)
        VALUES (${prevWallet.id}, ${prevPrize}, 'adjustment',
          ${"Prize clawback — winner changed for tournament #" + tournamentId})
      `;
    }
    // Remove old winner result
    await sql`
      DELETE FROM tournament_results
      WHERE tournament_id = ${tournamentId} AND placement = 1
    `;
  }

  // ── Award new winner ──
  await sql`
    INSERT INTO tournament_results (user_id, tournament_id, placement, prize_amount)
    VALUES (${Number(winner_user_id)}, ${tournamentId}, 1, ${prize})
    ON CONFLICT (user_id, tournament_id)
    DO UPDATE SET placement = 1, prize_amount = ${prize}
  `;

  const [wallet] = await sql`
    INSERT INTO wallets (user_id) VALUES (${Number(winner_user_id)})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id
  `;
  await sql`
    INSERT INTO wallet_transactions (wallet_id, amount, type, description)
    VALUES (${wallet.id}, ${prize}, 'prize',
      ${"Prize for winning tournament #" + tournamentId})
  `;
  await sql`
    UPDATE wallets SET balance = balance + ${prize}, updated_at = NOW()
    WHERE id = ${wallet.id}
  `;

  // Ensure tournament is marked completed
  await sql`
    UPDATE tournaments
    SET status = 'completed', end_time = COALESCE(end_time, NOW())
    WHERE id = ${tournamentId}
  `;

  return NextResponse.json({ success: true, prize_awarded: prize });
}
