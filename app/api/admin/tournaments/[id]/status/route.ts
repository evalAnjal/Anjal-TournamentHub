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
    // Always check role from DB so existing JWTs without role still work
    const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0] || rows[0].role !== "admin") return null;
    return user;
  } catch { return null; }
}

// POST /api/admin/tournaments/[id]/status  { action: "approve" | "start" | "end" | "cancel" }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const statusMap: Record<string, string> = {
    approve: "upcoming",
    start: "ongoing",
    end: "completed",
    cancel: "cancelled",
  };

  const newStatus = statusMap[action];
  if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const extraFields = action === "end"
    ? sql`end_time = NOW(),`
    : action === "start"
    ? sql`start_time = COALESCE(start_time, NOW()),`
    : sql``;

  await sql`
    UPDATE tournaments
    SET ${extraFields} status = ${newStatus}
    WHERE id = ${Number(id)}
  `;

  return NextResponse.json({ success: true, status: newStatus });
}
