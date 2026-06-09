import { List, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<List[]>> {
  const lists = await prisma.list.findMany();
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const body = (await request.json());
  const code = body.name.toLocaleUpperCase().replace(/\s/g, "_");
  console.log("POST", JSON.stringify({ body, code }, null, 2));

  const list = await prisma.list.create({
    data: {
      name: body.name,
      code: code,
    }
  });

  return NextResponse.json(list);
}
