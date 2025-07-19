import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Server as IOServer } from "socket.io";

// 获取Socket.IO实例
const getIOInstance = async () => {
  try {
    // 确保Socket.IO服务器已初始化
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`, {
      method: 'GET',
      cache: 'no-store',
    });
    
    // 此时Socket.IO服务器应该已经初始化
    return true;
  } catch (error) {
    console.error("初始化Socket.IO服务器失败:", error);
    return false;
  }
};

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  const { workspaceId, channelId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  const { workspaceId, channelId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        channelId,
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // 确保Socket.IO服务器已初始化
    await getIOInstance();

    // 注意: Socket.IO广播由客户端处理，这是设计决策
    // 客户端在收到API响应后将自己广播消息，这样可以确保消息先保存到数据库

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 