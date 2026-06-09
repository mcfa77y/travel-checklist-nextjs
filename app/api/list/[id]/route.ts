import { List, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<List | null>> {
  const { id } = await params;
  console.log(`GET list ${id} from ${request.url}`);
  const list = await prisma.list.findUnique({
    where: { id: id }
  });
  return NextResponse.json(list);
}
export async function PATCH(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { name: string };

  const code = body.name.toLocaleUpperCase().replace(/\s/g, "_");
  console.log("PATCH list", id, JSON.stringify({ body, code }, null, 2));

  await prisma.list.update({
    where: {
      id: id,
    },
    data: {
      name: body.name,
      code: code,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("DELETE", JSON.stringify({ id }, null, 2));
  await prisma.list.delete({
    where: {
      id
    },
  });

  return NextResponse.json({ success: true });
}
