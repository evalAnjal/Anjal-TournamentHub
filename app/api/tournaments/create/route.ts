import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DB_URL!);

interface UserJwtPayload { id: number; email: string; name: string; role?: string; }

async function getUser() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload; }
  catch { return null; }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, game, description, entry_fee, prize_pool, max_players, start_time, room_id, room_password } = body;

  if (!name || !game) {
    return NextResponse.json({ error: "Name and game are required" }, { status: 400 });
  }

  const [tournament] = await sql`
    INSERT INTO tournaments (name, game, description, entry_fee, prize_pool, max_players, start_time, status, created_by, room_id, room_password)
    VALUES (
      ${name},
      ${game},
      ${description || null},
      ${Number(entry_fee) || 0},
      ${Number(prize_pool) || 0},
      ${Number(max_players) || null},
      ${start_time || null},
      'pending_approval',
      ${user.id},
      ${room_id || null},
      ${room_password || null}
    )
    RETURNING id, name, game, status
  `;

  return NextResponse.json({ success: true, tournament });
}
