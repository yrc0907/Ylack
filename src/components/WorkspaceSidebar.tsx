"use client";

import Link from "next/link";
import { Home, MessageSquare, Bell, MoreHorizontal, LogOut, User, Plus } from "lucide-react";
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

export function WorkspaceSidebar() {
  const { data: session } = useSession();

  return (
    <div className="h-full flex flex-col w-20 fixed left-0 top-0 z-30 bg-purple-900 text-white">
      {/* 工作区徽标 */}
      <div className="flex items-center justify-center h-20 border-b border-purple-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-md bg-white text-purple-900 flex items-center justify-center font-bold text-xl cursor-pointer">
              W
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuLabel>当前工作区</DropdownMenuLabel>
            <DropdownMenuItem className="font-medium">
              Work2
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
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
            <button className="h-10 w-10 rounded-full bg-purple-700 hover:bg-purple-600 flex items-center justify-center cursor-pointer overflow-hidden">
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
    </div>
  );
} 