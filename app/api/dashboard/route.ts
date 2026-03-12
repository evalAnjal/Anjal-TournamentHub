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

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Wallet balance
  const [wallet] = await sql`
    INSERT INTO wallets (user_id) VALUES (${user.id})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING balance, currency
  `;

  // Recent matches (tournament history)
  const matches = await sql`
    SELECT
      t.id AS id,
      t.status,
      t.start_time AS started_at,
      t.name AS tournament_name,
      t.game,
      CASE WHEN res.placement = 1 THEN true
           WHEN t.status = 'completed' THEN false
           ELSE NULL END AS is_winner
    FROM tournament_registrations tr
    JOIN tournaments t ON t.id = tr.tournament_id
    LEFT JOIN tournament_results res
      ON res.user_id = tr.user_id AND res.tournament_id = tr.tournament_id
    WHERE tr.user_id = ${user.id}
    ORDER BY t.start_time DESC NULLS LAST
    LIMIT 5
  `;

  // Upcoming joined tournaments
  const upcoming = await sql`
    SELECT t.id, t.name, t.game, t.entry_fee, t.prize_pool, t.start_time, t.status
    FROM tournament_registrations tr
    JOIN tournaments t ON t.id = tr.tournament_id
    WHERE tr.user_id = ${user.id} AND t.status IN ('upcoming', 'ongoing')
    ORDER BY t.start_time NULLS LAST
    LIMIT 3
  `;

  // Stats
  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT tr.tournament_id) AS tournaments_joined,
      COUNT(DISTINCT CASE WHEN res.placement = 1 THEN res.tournament_id END) AS matches_won,
      COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN tr.tournament_id END) AS matches_played
    FROM users u
    LEFT JOIN tournament_registrations tr ON tr.user_id = u.id
    LEFT JOIN tournaments t ON t.id = tr.tournament_id
    LEFT JOIN tournament_results res ON res.user_id = u.id AND res.tournament_id = tr.tournament_id
    WHERE u.id = ${user.id}
  `;

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    wallet,
    matches,
    upcoming_tournaments: upcoming,
    stats,
  });
}
