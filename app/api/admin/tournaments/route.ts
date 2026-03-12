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
    try {
      // Check role from DB (works even if role column was just added)
      const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`;
      if (!rows[0] || rows[0].role !== "admin") return null;
    } catch {
      // If role column doesn't exist yet, fall back to JWT role
      if (user.role !== "admin") return null;
    }
    return user;
  } catch { return null; }
}

// GET /api/admin/tournaments — all tournaments with participant list
export async function GET() {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tournaments = await sql`
      SELECT
        t.id, t.name, t.game, t.description, t.entry_fee, t.prize_pool,
        t.max_players, t.start_time, t.end_time, t.status,
        t.room_id, t.room_password,
        COUNT(tr.id)::int AS registered_count
      FROM tournaments t
      LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    // For each tournament, get participants (fetch all, filter in JS)
    const ids = tournaments.map((t) => Number(t.id));
    let participants: { tournament_id: number; user_id: number; username: string; email: string; is_winner: boolean | null }[] = [];
    if (ids.length > 0) {
      const rows = await sql`
        SELECT
          tr.tournament_id::int,
          u.id AS user_id,
          u.full_name AS username,
          u.email,
          CASE
            WHEN res.placement = 1 THEN true
            WHEN res.placement IS NOT NULL THEN false
            ELSE NULL
          END AS is_winner
        FROM tournament_registrations tr
        JOIN users u ON u.id = tr.user_id
        LEFT JOIN tournament_results res
          ON res.user_id = tr.user_id AND res.tournament_id = tr.tournament_id
        ORDER BY tr.joined_at
      `;
      participants = rows as typeof participants;
    }

    const result = tournaments.map((t) => ({
      ...t,
      participants: participants.filter((p) => Number(p.tournament_id) === Number(t.id)),
    }));

    return NextResponse.json({ tournaments: result });
  } catch (err) {
    console.error("[admin/tournaments GET]", err);
    return NextResponse.json(
      { error: "Database error", detail: String(err) },
      { status: 500 }
    );
  }
}
