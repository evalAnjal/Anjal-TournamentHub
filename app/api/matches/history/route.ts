import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

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

  const rows = await sql/*sql*/`
    SELECT m.id, m.tournament_id, m.started_at, m.finished_at, m.status,
           mp.score, mp.is_winner
    FROM match_participants mp
    JOIN matches m ON m.id = mp.match_id
    WHERE mp.user_id = ${user.id}
    ORDER BY m.started_at DESC NULLS LAST, m.created_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ matches: rows });
}
