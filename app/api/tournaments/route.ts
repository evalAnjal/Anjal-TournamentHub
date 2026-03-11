import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const sql = neon(process.env.NEON_DB_URL!);

interface UserJwtPayload { id: number; email: string; name: string; }

async function getUser() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload; }
  catch { return null; }
}

export async function GET() {
  const user = await getUser();

  const tournaments = await sql/*sql*/`
    SELECT
      t.id, t.name, t.game, t.description, t.entry_fee, t.prize_pool,
      t.max_players, t.start_time, t.end_time, t.status,
      COUNT(tr.id)::int AS registered_count
    FROM tournaments t
    LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
    WHERE t.status != 'pending_approval'
    GROUP BY t.id
    ORDER BY t.start_time NULLS LAST, t.created_at DESC
  `;

  // Attach whether current user is registered
  let userRegistrations: number[] = [];
  if (user) {
    const rows = await sql`
      SELECT tournament_id FROM tournament_registrations WHERE user_id = ${user.id}
    `;
    userRegistrations = rows.map((r) => Number(r.tournament_id));
  }

  const result = tournaments.map((t) => ({
    ...t,
    is_registered: userRegistrations.includes(Number(t.id)),
  }));

  return NextResponse.json({ tournaments: result });
}
