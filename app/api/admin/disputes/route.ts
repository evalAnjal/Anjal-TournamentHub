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
    const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0] || rows[0].role !== "admin") return null;
    return user;
  } catch { return null; }
}

// GET /api/admin/disputes — all disputes with tournament + user info + participants
export async function GET() {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT
      d.id,
      d.reason,
      d.status,
      d.admin_note,
      d.created_at,
      d.updated_at,
      u.id        AS user_id,
      u.full_name AS username,
      u.email,
      t.id        AS tournament_id,
      t.name      AS tournament_name,
      t.game,
      t.prize_pool
    FROM tournament_disputes d
    JOIN users u ON u.id = d.user_id
    JOIN tournaments t ON t.id = d.tournament_id
    ORDER BY d.created_at DESC
  `;

  // For each unique tournament in the disputes list, fetch participants + current winner
  const tournamentIds = [...new Set(rows.map((r) => Number(r.tournament_id)))];
  let participants: { tournament_id: number; user_id: number; username: string; is_winner: boolean }[] = [];
  if (tournamentIds.length > 0) {
    const pRows = await sql`
      SELECT
        tr.tournament_id::int,
        u.id   AS user_id,
        u.full_name AS username,
        CASE WHEN res.placement = 1 THEN true ELSE false END AS is_winner
      FROM tournament_registrations tr
      JOIN users u ON u.id = tr.user_id
      LEFT JOIN tournament_results res
        ON res.user_id = tr.user_id AND res.tournament_id = tr.tournament_id
      ORDER BY tr.joined_at
    `;
    participants = pRows as typeof participants;
  }

  const disputes = rows.map((d) => ({
    ...d,
    participants: participants.filter((p) => Number(p.tournament_id) === Number(d.tournament_id)),
  }));

  return NextResponse.json({ disputes });
}

// POST /api/admin/disputes  { id, status, admin_note, new_winner_user_id? }
// If new_winner_user_id is provided, re-awards the prize to the new winner (clawback handled by /api/admin/tournaments/[id]/winner)
export async function POST(req: Request) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, admin_note, new_winner_user_id } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  if (!["open", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // If resolving with a winner change — delegate to the winner route logic inline
  if (status === "resolved" && new_winner_user_id) {
    // Get the tournament_id for this dispute
    const [dispute] = await sql`
      SELECT tournament_id FROM tournament_disputes WHERE id = ${Number(id)}
    `;
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

    const tournamentId = Number(dispute.tournament_id);
    const newWinnerId = Number(new_winner_user_id);

    // Get tournament
    const [tournament] = await sql`
      SELECT id, prize_pool FROM tournaments WHERE id = ${tournamentId}
    `;
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

    const prize = Number(tournament.prize_pool);

    // Clawback old winner
    const [prevResult] = await sql`
      SELECT user_id, prize_amount FROM tournament_results
      WHERE tournament_id = ${tournamentId} AND placement = 1
    `;
    if (prevResult && Number(prevResult.user_id) !== newWinnerId) {
      const prevPrize = Number(prevResult.prize_amount);
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
            ${"Prize clawback — winner changed via dispute resolution for tournament #" + tournamentId})
        `;
      }
      await sql`
        DELETE FROM tournament_results
        WHERE tournament_id = ${tournamentId} AND placement = 1
      `;
    }

    // Award new winner
    await sql`
      INSERT INTO tournament_results (user_id, tournament_id, placement, prize_amount)
      VALUES (${newWinnerId}, ${tournamentId}, 1, ${prize})
      ON CONFLICT (user_id, tournament_id)
      DO UPDATE SET placement = 1, prize_amount = ${prize}
    `;
    const [wallet] = await sql`
      INSERT INTO wallets (user_id) VALUES (${newWinnerId})
      ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING id
    `;
    await sql`
      INSERT INTO wallet_transactions (wallet_id, amount, type, description)
      VALUES (${wallet.id}, ${prize}, 'prize',
        ${"Prize awarded via dispute resolution for tournament #" + tournamentId})
    `;
    await sql`
      UPDATE wallets SET balance = balance + ${prize}, updated_at = NOW()
      WHERE id = ${wallet.id}
    `;
  }

  // Update the dispute record
  await sql`
    UPDATE tournament_disputes
    SET status = ${status}, admin_note = ${admin_note ?? null}, updated_at = NOW()
    WHERE id = ${Number(id)}
  `;

  return NextResponse.json({ success: true });
}

