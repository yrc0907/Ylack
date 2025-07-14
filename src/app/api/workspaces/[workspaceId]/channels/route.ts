import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

async function isWorkspaceMember(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
  return member !== null;
}

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { workspaceId } = await params;

  if (!workspaceId || !(await isWorkspaceMember(userId, workspaceId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const channels = await prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });

    if (channels.length === 0) {
      const generalChannel = await prisma.channel.create({
        data: {
          name: 'general',
          workspaceId: workspaceId,
        },
      });
      return NextResponse.json([generalChannel]);
    }

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Failed to get channels:", error);
    return NextResponse.json({ error: "Error fetching channels" }, { status: 500 });
  }
}

const createChannelSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(20).regex(/^[a-z0-9_.-]+$/, "频道名称只能包含小写字母、数字和符号"),
  description: z.string().max(100).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { workspaceId } = await params;

  if (!workspaceId || !(await isWorkspaceMember(userId, workspaceId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = createChannelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 });
    }

    const { name, description } = result.data;

    const existingChannel = await prisma.channel.findFirst({
      where: { workspaceId, name },
    });

    if (existingChannel) {
      return NextResponse.json({ error: "该名称的频道已存在" }, { status: 409 });
    }

    const newChannel = await prisma.channel.create({
      data: {
        name,
        description,
        workspaceId,
      },
    });

    return NextResponse.json(newChannel, { status: 201 });
  } catch (error) {
    console.error("Failed to create channel:", error);
    return NextResponse.json({ error: "Error creating channel" }, { status: 500 });
  }
} 