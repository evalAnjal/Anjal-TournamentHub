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

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT
      t.id        AS id,
      t.status,
      t.start_time AS started_at,
      t.end_time   AS finished_at,
      t.id         AS tournament_id,
      t.name       AS tournament_name,
      t.game,
      t.prize_pool,
      res.prize_amount AS score,
      CASE WHEN res.placement = 1 THEN true
           WHEN t.status = 'completed' THEN false
           ELSE NULL END AS is_winner
    FROM tournament_registrations tr
    JOIN tournaments t ON t.id = tr.tournament_id
    LEFT JOIN tournament_results res
      ON res.user_id = tr.user_id AND res.tournament_id = tr.tournament_id
    WHERE tr.user_id = ${user.id}
    ORDER BY t.start_time DESC NULLS LAST
    LIMIT 30
  `;

  return NextResponse.json({ matches: rows });
}
