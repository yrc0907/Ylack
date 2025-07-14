import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

// 创建 Prisma 客户端实例
const prisma = new PrismaClient();

// 获取用户的所有工作区
export async function GET() {
  try {
    const session = await auth();

    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // 获取用户所属的所有工作区
    const workspaces = await prisma.workspaceMember.findMany({
      where: {
        userId
      },
      include: {
        workspace: true,
      },
    });

    // 将数据格式化为前端需要的格式
    const formattedWorkspaces = workspaces.map((member) => ({
      id: member.workspace.id,
      name: member.workspace.name,
      description: member.workspace.description,
      role: member.role,
    }));

    return NextResponse.json(formattedWorkspaces);
  } catch (error) {
    console.error("[WORKSPACES_GET]", error);
    return NextResponse.json(
      { error: "获取工作区列表失败" },
      { status: 500 }
    );
  }
}

// 创建新工作区
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    // 解析请求体
    const { name, description } = await req.json();

    // 验证数据
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "工作区名称不能为空" },
        { status: 400 }
      );
    }

    const userId = session.user.id as string;

    // 创建工作区
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        members: {
          create: {
            userId,
            role: "OWNER",
          }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("[WORKSPACE_CREATE]", error);
    return NextResponse.json(
      { error: "创建工作区时发生错误" },
      { status: 500 }
    );
  }
} 