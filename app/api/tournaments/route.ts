import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const tournaments = await sql/*sql*/`
    SELECT id, name, game, entry_fee, prize_pool, status, start_time
    FROM tournaments
    ORDER BY start_time NULLS LAST, created_at DESC
  `;

  return NextResponse.json({ tournaments });
}
