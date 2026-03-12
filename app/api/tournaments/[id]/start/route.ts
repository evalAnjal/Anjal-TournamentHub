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

// POST /api/tournaments/[id]/start  { room_id?: string, room_password?: string }
// Only the tournament creator can call this, and only when status = 'upcoming'
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournamentId = Number(id);
  const { room_id, room_password } = await req.json();

  const [tournament] = await sql`
    SELECT id, status, created_by FROM tournaments WHERE id = ${tournamentId}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (Number(tournament.created_by) !== user.id)
    return NextResponse.json({ error: "Only the tournament creator can start it" }, { status: 403 });
  if (tournament.status !== "upcoming")
    return NextResponse.json({ error: "Tournament must be approved (upcoming) before it can be started" }, { status: 400 });

  await sql`
    UPDATE tournaments
    SET
      status = 'ongoing',
      start_time = COALESCE(start_time, NOW()),
      room_id = COALESCE(${room_id ?? null}, room_id),
      room_password = COALESCE(${room_password ?? null}, room_password)
    WHERE id = ${tournamentId}
  `;

  return NextResponse.json({ success: true, status: "ongoing" });
}
