import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

// Helper to check if the user is a member of the workspace
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
  const { workspaceId } = params;

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
  }

  if (!(await isWorkspaceMember(userId, workspaceId))) {
    return NextResponse.json(
      { error: "Forbidden: You are not a member of this workspace." },
      { status: 403 }
    );
  }

  try {
    // Find a valid, existing invite code
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // If a valid code exists, return it
    if (existingInvite) {
      return NextResponse.json({ code: existingInvite.code }, { status: 200 });
    }

    // If no valid code exists, create a new one
    const code = nanoid(8); // Generate an 8-character code
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // Expires in 7 days

    const newInvite = await prisma.workspaceInvite.create({
      data: {
        code,
        workspaceId,
        expiresAt,
      },
    });

    return NextResponse.json({ code: newInvite.code }, { status: 201 });
  } catch (error) {
    console.error("Failed to get or create invite code:", error);
    return NextResponse.json(
      { error: "An error occurred while managing the invite code." },
      { status: 500 }
    );
  }
} 