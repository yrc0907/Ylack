"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, MessageSquare, Bell, MoreHorizontal, LogOut, User, Plus, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { CreateWorkspaceDialog } from "@/components/CreateWorkspaceDialog";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";

export function WorkspaceSidebar() {
  const { data: session } = useSession();
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const { currentWorkspace, workspaces, isLoading, switchWorkspace, fetchWorkspaces } = useWorkspace();

  // 处理工作区切换
  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      switchWorkspace(workspace.id);
      toast.success(`已切换到工作区: ${workspace.name}`);
    }
  };

  // 处理创建工作区对话框关闭
  const handleDialogClose = async () => {
    setIsCreateWorkspaceOpen(false);
    await fetchWorkspaces(); // 重新获取工作区列表
  };

  // 工作区图标显示
  const WorkspaceIcon = () => {
    if (isLoading) {
      return (
        <button
          className="h-10 w-10 rounded-md bg-purple-700 text-white flex items-center justify-center font-bold text-xl cursor-wait"
          aria-label="加载中"
        >
          ...
        </button>
      );
    }

    if (!currentWorkspace) {
      return (
        <button
          onClick={() => setIsCreateWorkspaceOpen(true)}
          className="h-10 w-10 rounded-md bg-purple-700 text-white flex items-center justify-center cursor-pointer"
          aria-label="创建新工作区"
        >
          <Plus size={24} />
        </button>
      );
    }

    return (
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 rounded-md bg-white text-purple-900 flex items-center justify-center font-bold text-xl cursor-pointer"
          aria-label={`当前工作区: ${currentWorkspace.name}`}
        >
          {currentWorkspace.name.charAt(0).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
    );
  };

  return (
    <div className="h-full flex flex-col w-20 fixed left-0 top-0 z-30 bg-purple-900 text-white">
      {/* 工作区徽标 */}
      <div className="flex items-center justify-center h-20 border-b border-purple-800">
        <DropdownMenu>
          <WorkspaceIcon />
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>
              {workspaces.length > 0 ? "选择工作区" : "暂无工作区"}
            </DropdownMenuLabel>

            {/* 工作区列表 */}
            {workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className={`font-medium ${workspace.id === currentWorkspace?.id ? 'bg-accent' : ''}`}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-purple-800 text-white flex items-center justify-center font-bold text-xs">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{workspace.name}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-2 px-2 text-sm text-center text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                请创建一个工作区
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsCreateWorkspaceOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>新建工作区</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 导航链接 */}
      <nav className="flex flex-col items-center pt-4 gap-2">
        <Link
          href="/dashboard"
          className="w-full flex flex-col items-center p-3 hover:bg-purple-800 transition"
        >
          <Home size={24} />
          <span className="mt-1 text-xs">Home</span>
        </Link>

        <Link
          href="/dashboard/dms"
          className="w-full flex flex-col items-center p-3 hover:bg-purple-800 transition"
        >
          <MessageSquare size={24} />
          <span className="mt-1 text-xs">DMs</span>
        </Link>

        <Link
          href="/dashboard/activity"
          className="w-full flex flex-col items-center p-3 hover:bg-purple-800 transition"
        >
          <Bell size={24} />
          <span className="mt-1 text-xs">Activity</span>
        </Link>

        <div className="mt-auto">
          <Link
            href="/dashboard/more"
            className="w-full flex flex-col items-center p-3 hover:bg-purple-800 transition"
          >
            <MoreHorizontal size={24} />
            <span className="mt-1 text-xs">More</span>
          </Link>
        </div>
      </nav>

      {/* 用户头像 */}
      <div className="mt-auto p-4 flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-10 w-10 rounded-full bg-purple-700 hover:bg-purple-600 flex items-center justify-center cursor-pointer overflow-hidden"
              aria-label="用户菜单"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="User avatar" className="h-full w-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人信息设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 创建工作区对话框 */}
      <CreateWorkspaceDialog
        isOpen={isCreateWorkspaceOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
} 