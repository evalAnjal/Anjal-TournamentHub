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
      t.room_id, t.room_password, t.created_by,
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

  // Get participants for creator's active tournaments (upcoming/ongoing)
  let creatorParticipants: { tournament_id: number; user_id: number; username: string }[] = [];
  if (user) {
    const creatorActive = tournaments.filter(
      (t) => Number(t.created_by) === user.id && (t.status === "ongoing" || t.status === "upcoming")
    );
    if (creatorActive.length > 0) {
      const rows = await sql`
        SELECT tr.tournament_id::int, u.id AS user_id, u.full_name AS username
        FROM tournament_registrations tr
        JOIN users u ON u.id = tr.user_id
        ORDER BY tr.joined_at
      `;
      creatorParticipants = rows as typeof creatorParticipants;
    }
  }

  // Fetch user's existing disputes so the UI can show "Already raised"
  let userDisputeTournamentIds: number[] = [];
  if (user) {
    const rows = await sql`
      SELECT tournament_id FROM tournament_disputes WHERE user_id = ${user.id}
    `;
    userDisputeTournamentIds = rows.map((r) => Number(r.tournament_id));
  }

  const result = tournaments.map((t) => {
    const isRegistered = userRegistrations.includes(Number(t.id));
    const isCreator = user ? Number(t.created_by) === user.id : false;
    const participants = isCreator
      ? creatorParticipants.filter((p) => Number(p.tournament_id) === Number(t.id))
      : [];
    const hasDispute = userDisputeTournamentIds.includes(Number(t.id));
    return {
      ...t,
      is_registered: isRegistered,
      is_creator: isCreator,
      has_dispute: hasDispute,
      participants,
      // Expose room details to registered players AND the creator
      room_id: (isRegistered || isCreator) ? t.room_id : null,
      room_password: (isRegistered || isCreator) ? t.room_password : null,
    };
  });

  return NextResponse.json({ tournaments: result });
}
