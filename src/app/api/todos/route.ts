import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT id, text, done FROM todos ORDER BY id`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { text } = await req.json();
  const rows = await sql`INSERT INTO todos (text, done) VALUES (${text}, false) RETURNING id, text, done`;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  const rows = await sql`UPDATE todos SET done = ${done} WHERE id = ${id} RETURNING id, text, done`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql`DELETE FROM todos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
