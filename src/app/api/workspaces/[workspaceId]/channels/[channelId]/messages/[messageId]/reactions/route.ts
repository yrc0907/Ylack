import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 添加表情反应（允许重复添加）
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { workspaceId, channelId, messageId } = params;

    // 验证用户是否为工作区成员
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "无权访问此工作区" }, { status: 403 });
    }

    // 验证消息是否存在且属于指定频道
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        channelId,
        workspaceId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "消息不存在" }, { status: 404 });
    }

    const { emoji } = await req.json();
    if (!emoji) {
      return NextResponse.json({ error: "缺少表情参数" }, { status: 400 });
    }

    // 直接创建新的反应记录，而不检查是否存在
    const reaction = await prisma.messageReaction.create({
      data: {
        emoji,
        messageId,
        userId: session.user.id,
      },
    });

    // 获取所有同一表情的反应计数和用户
    const totalReactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      }
    });

    // 获取当前用户添加此表情的次数
    const userReactionCount = await prisma.messageReaction.count({
      where: {
        messageId,
        emoji,
        userId: session.user.id
      }
    });

    // 格式化结果
    const result = {
      emoji,
      count: totalReactions.length,
      userCount: userReactionCount,
      users: totalReactions.map(r => ({
        id: r.user.id,
        name: r.user.name || r.user.username,
        image: r.user.image
      })),
      action: "added"
    };

    // 使用Socket.IO广播更新 (这里保持不变，依靠前端处理)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`, {
        method: 'GET',
        cache: 'no-store',
      });
    } catch (error) {
      console.error("初始化Socket.IO服务器失败:", error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("处理表情反应错误:", error);
    return NextResponse.json(
      { error: "处理表情反应失败" },
      { status: 500 }
    );
  }
}

// 删除表情反应（只删除一个实例）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { workspaceId, channelId, messageId } = params;

    // 从URL查询参数获取emoji
    const searchParams = req.nextUrl.searchParams;
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: "缺少表情参数" }, { status: 400 });
    }

    // 验证用户是否为工作区成员
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "无权访问此工作区" }, { status: 403 });
    }

    // 查找用户的一个表情实例并删除它（而不是所有的）
    const userReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji,
      },
    });

    if (userReaction) {
      await prisma.messageReaction.delete({
        where: {
          id: userReaction.id,
        },
      });
    }

    // 获取剩余同一表情的反应计数和用户
    const totalReactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      }
    });

    // 获取当前用户剩余的此表情的次数
    const userReactionCount = await prisma.messageReaction.count({
      where: {
        messageId,
        emoji,
        userId: session.user.id
      }
    });

    // 使用Socket.IO广播更新
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`, {
        method: 'GET',
        cache: 'no-store',
      });
    } catch (error) {
      console.error("初始化Socket.IO服务器失败:", error);
    }

    return NextResponse.json({
      emoji,
      count: totalReactions.length,
      userCount: userReactionCount,
      users: totalReactions.map(r => ({
        id: r.user.id,
        name: r.user.name || r.user.username,
        image: r.user.image
      })),
      removed: userReaction ? true : false,
    });
  } catch (error) {
    console.error("删除表情反应错误:", error);
    return NextResponse.json(
      { error: "删除表情反应失败" },
      { status: 500 }
    );
  }
}

// 获取消息的所有表情反应
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { workspaceId, channelId, messageId } = params;

    // 验证用户是否为工作区成员
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "无权访问此工作区" }, { status: 403 });
    }

    // 验证消息是否存在
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        channelId,
        workspaceId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "消息不存在" }, { status: 404 });
    }

    // 获取消息的所有表情反应，按emoji分组
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
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

    // 如果没有反应，返回空数组
    if (reactions.length === 0) {
      return NextResponse.json([]);
    }

    // 按emoji分组，但同时保持每个用户的计数
    const groupedReactions = reactions.reduce((groups: Record<string, any>, reaction) => {
      const emoji = reaction.emoji;
      if (!groups[emoji]) {
        groups[emoji] = {
          emoji,
          count: 0,
          users: [],
          userCounts: {} as Record<string, number>,
        };
      }

      groups[emoji].count += 1;

      // 添加用户，如果用户已存在则跳过（避免用户列表中重复）
      const userId = reaction.user.id;
      if (!groups[emoji].userCounts[userId]) {
        groups[emoji].users.push({
          id: userId,
          name: reaction.user.name || reaction.user.username,
          image: reaction.user.image,
        });
        groups[emoji].userCounts[userId] = 1;
      } else {
        groups[emoji].userCounts[userId] += 1;
      }

      return groups;
    }, {});

    // 计算当前用户对每个表情的反应次数
    const currentUserId = session.user.id;
    Object.values(groupedReactions).forEach((group: any) => {
      group.userCount = group.userCounts[currentUserId] || 0;
      delete group.userCounts; // 移除临时对象
    });

    return NextResponse.json(Object.values(groupedReactions));
  } catch (error) {
    console.error("获取表情反应错误:", error);
    return NextResponse.json(
      { error: "获取表情反应失败" },
      { status: 500 }
    );
  }
} 