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
    const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0] || rows[0].role !== "admin") return null;
    return user;
  } catch { return null; }
}

// GET /api/admin/disputes  — all disputes with tournament + user info
export async function GET() {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT
      d.id,
      d.reason,
      d.status,
      d.admin_note,
      d.created_at,
      d.updated_at,
      u.id   AS user_id,
      u.full_name AS username,
      u.email,
      t.id   AS tournament_id,
      t.name AS tournament_name,
      t.game
    FROM tournament_disputes d
    JOIN users u ON u.id = d.user_id
    JOIN tournaments t ON t.id = d.tournament_id
    ORDER BY d.created_at DESC
  `;

  return NextResponse.json({ disputes: rows });
}

// POST /api/admin/disputes  { id, status, admin_note }
export async function POST(req: Request) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, admin_note } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  if (!["open", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await sql`
    UPDATE tournament_disputes
    SET status = ${status}, admin_note = ${admin_note ?? null}, updated_at = NOW()
    WHERE id = ${Number(id)}
  `;

  return NextResponse.json({ success: true });
}
