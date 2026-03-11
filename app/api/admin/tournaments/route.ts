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

// GET /api/admin/tournaments — all tournaments with participant list
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournaments = await sql`
    SELECT
      t.id, t.name, t.game, t.description, t.entry_fee, t.prize_pool,
      t.max_players, t.start_time, t.end_time, t.status,
      COUNT(tr.id)::int AS registered_count
    FROM tournaments t
    LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  // For each tournament, get participants
  const ids = tournaments.map((t) => Number(t.id));
  let participants: { tournament_id: number; user_id: number; username: string; email: string; is_winner: boolean | null }[] = [];
  if (ids.length > 0) {
    const rows = await sql`
      SELECT
        tr.tournament_id,
        u.id AS user_id,
        u.full_name AS username,
        u.email,
        tr2.is_winner
      FROM tournament_registrations tr
      JOIN users u ON u.id = tr.user_id
      LEFT JOIN tournament_results tr2
        ON tr2.user_id = tr.user_id AND tr2.tournament_id = tr.tournament_id
      WHERE tr.tournament_id = ANY(${ids})
      ORDER BY tr.joined_at
    `;
    participants = rows as typeof participants;
  }

  const result = tournaments.map((t) => ({
    ...t,
    participants: participants.filter((p) => p.tournament_id === Number(t.id)),
  }));

  return NextResponse.json({ tournaments: result });
}
