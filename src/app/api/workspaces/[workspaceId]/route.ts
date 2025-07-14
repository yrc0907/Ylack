import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 获取单个工作区详情
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    const { workspaceId } = params;
    const userId = session.user.id as string;

    // 检查用户是否属于该工作区
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "工作区不存在或您无权访问" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: membership.workspace.id,
      name: membership.workspace.name,
      description: membership.workspace.description,
      role: membership.role,
    });
  } catch (error) {
    console.error("[WORKSPACE_GET]", error);
    return NextResponse.json(
      { error: "获取工作区详情失败" },
      { status: 500 }
    );
  }
}

// 更新工作区
export async function PATCH(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    const { workspaceId } = params;
    const userId = session.user.id as string;

    // 解析请求体
    const body = await req.json();
    const { name } = body;

    // 验证名称
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "工作区名称不能为空" },
        { status: 400 }
      );
    }

    // 检查用户是否有权限更新（只有OWNER和ADMIN可以更新工作区）
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "工作区不存在或您无权访问" },
        { status: 404 }
      );
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "您没有权限更新此工作区" },
        { status: 403 }
      );
    }

    // 更新工作区
    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("[WORKSPACE_UPDATE]", error);
    return NextResponse.json(
      { error: "更新工作区失败" },
      { status: 500 }
    );
  }
}

// 删除工作区
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    const { workspaceId } = params;
    const userId = session.user.id as string;

    // 检查用户是否是工作区所有者（只有OWNER可以删除工作区）
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "工作区不存在或您无权访问" },
        { status: 404 }
      );
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "只有工作区所有者可以删除工作区" },
        { status: 403 }
      );
    }

    // 删除工作区（会自动级联删除相关数据）
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKSPACE_DELETE]", error);
    return NextResponse.json(
      { error: "删除工作区失败" },
      { status: 500 }
    );
  }
} 