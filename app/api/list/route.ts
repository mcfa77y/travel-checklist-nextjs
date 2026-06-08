import { List, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { CheckListFormInput } from "@app/check-list";

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<List[]>> {
  const lists = await prisma.list.findMany();
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const body = (await request.json());
  const code = body.name.toLocaleUpperCase().replace(/\s/g, "_");
  console.log("POST", JSON.stringify({ body, code }, null, 2));

  await prisma.list.create({
    data: {
      name: body.name,
      code: code,
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as CheckListFormInput;
  console.log("DELETE", JSON.stringify({ body }, null, 2));
  await prisma.item.delete({
    where: {
      id: body.itemId ?? "",
    },
  });

  return NextResponse.json({ success: true });
}
