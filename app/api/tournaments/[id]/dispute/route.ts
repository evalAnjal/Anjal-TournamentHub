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

// POST /api/tournaments/[id]/dispute  { reason: string }
// Any registered player (or creator) can raise a dispute for a completed tournament
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournamentId = Number(id);
  const { reason } = await req.json();

  if (!reason || !String(reason).trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  // Tournament must exist and be completed
  const [tournament] = await sql`
    SELECT id, status FROM tournaments WHERE id = ${tournamentId}
  `;
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.status !== "completed") {
    return NextResponse.json({ error: "Disputes can only be raised for completed tournaments" }, { status: 400 });
  }

  // User must be a registered participant (or the creator)
  const [reg] = await sql`
    SELECT id FROM tournament_registrations
    WHERE tournament_id = ${tournamentId} AND user_id = ${user.id}
  `;
  const [created] = await sql`
    SELECT id FROM tournaments WHERE id = ${tournamentId} AND created_by = ${user.id}
  `;
  if (!reg && !created) {
    return NextResponse.json({ error: "You are not a participant of this tournament" }, { status: 403 });
  }

  // Upsert — one dispute per user per tournament
  await sql`
    INSERT INTO tournament_disputes (tournament_id, user_id, reason)
    VALUES (${tournamentId}, ${user.id}, ${String(reason).trim()})
    ON CONFLICT (user_id, tournament_id)
    DO UPDATE SET reason = EXCLUDED.reason, status = 'open', updated_at = NOW()
  `;

  return NextResponse.json({ success: true });
}
