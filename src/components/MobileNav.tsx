"use client";

import Link from "next/link";
import { Home, MessageSquare, Bell, User, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { useWorkspace } from "@/context/WorkspaceContext";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspace();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 shadow-lg">
      <Link
        href="/dashboard"
        className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-1"
      >
        <Home size={20} />
        <span className="text-xs mt-1">首页</span>
      </Link>

      <Link
        href="/dashboard/dms"
        className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-1"
      >
        <MessageSquare size={20} />
        <span className="text-xs mt-1">消息</span>
      </Link>

      {/* 频道抽屉 */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-1">
            <Menu size={20} />
            <span className="text-xs mt-1">频道</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80%] sm:w-[380px] p-0">
          <div className="h-full overflow-y-auto">
            <ChannelSidebar />
          </div>
        </SheetContent>
      </Sheet>

      <Link
        href="/dashboard/activity"
        className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-1"
      >
        <Bell size={20} />
        <span className="text-xs mt-1">通知</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-1">
            <div className="h-5 w-5 rounded-full bg-purple-700 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="用户头像" className="h-full w-full object-cover" />
              ) : (
                <User size={14} />
              )}
            </div>
            <span className="text-xs mt-1">我的</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>个人设置</DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
} 