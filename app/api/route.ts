import { Item, List, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { CheckListFormInput } from "../checkList";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: any
): Promise<NextResponse<{ lists: List[]; items: Item[] }>> {
  const lists = await prisma.list.findMany();
  const items = await prisma.item.findMany();
  return NextResponse.json({ lists, items });
}
export async function POST(request: Request) {
  const body = (await request.json()) as CheckListFormInput;
  const code = body.name.toLocaleUpperCase().replace(/\s/g, "_");
  console.log("POST", JSON.stringify({ body, code }, null, 2));

  await prisma.item.upsert({
    where: {
      id: body.itemId ?? "",
    },
    create: {
      name: body.name,
      code: code,
      listId: body.listId,
    },
    update: {
      name: body.name,
      code: code,
    },
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
