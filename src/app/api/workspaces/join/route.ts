import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const joinWorkspaceSchema = z.object({
  code: z.string().min(1, { message: '邀请码不能为空' }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未经授权' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const result = joinWorkspaceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '无效的输入', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { code } = result.data;

    // Find the invite code
    const invite = await prisma.workspaceInvite.findUnique({
      where: { code },
    });

    if (!invite || new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: '无效或已过期的邀请码' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invite.workspaceId,
        userId: userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: '您已经是该工作区的成员' },
        { status: 409 }
      );
    }

    // Add user to workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: userId,
        workspaceId: invite.workspaceId,
        role: 'MEMBER', // Default role
      },
      include: {
        workspace: true, // Include workspace details in the response
      },
    });

    return NextResponse.json(
      {
        message: '成功加入工作区',
        workspace: newMember.workspace,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('加入工作区错误:', error);
    return NextResponse.json(
      { error: '加入工作区时发生错误' },
      { status: 500 }
    );
  }
} 