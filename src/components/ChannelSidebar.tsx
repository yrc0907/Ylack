"use client";

import { useState } from "react";
import { ChevronsUpDown, Pencil, Trash2, AlertTriangle, User, Settings, ChevronDown, Edit, List } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog";
import { InvitePeopleDialog } from "./InvitePeopleDialog";

export function ChannelSidebar() {
  const { currentWorkspace, isLoading } = useWorkspace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full bg-purple-800 text-white flex flex-col items-center justify-center">
        <p className="text-sm text-gray-300">加载中...</p>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="h-full bg-purple-800 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 mb-4 text-yellow-400" />
        <h3 className="text-xl font-medium mb-2">Workspace not found</h3>
        <p className="text-sm text-gray-300 text-center px-4">
          请创建或选择一个工作区继续操作
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-purple-800 text-white flex flex-col">
      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-white hover:bg-purple-700 rounded-md p-2 transition flex-grow">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-white text-purple-900 flex items-center justify-center font-bold text-lg">
                    {currentWorkspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-md">{currentWorkspace.name}</h2>
                    <p className="text-xs text-gray-300">Active Workspace</p>
                  </div>
                </div>
                <ChevronDown size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white">
              <div className="py-2 px-4 font-medium text-lg border-b">工作区设置</div>
              <DropdownMenuItem
                className="py-2 px-4 focus:bg-gray-100 cursor-pointer"
                onClick={() => setIsInviteOpen(true)}
              >
                <User className="mr-2 h-5 w-5 text-gray-600" />
                <span>邀请成员到 {currentWorkspace.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2 px-4 focus:bg-gray-100 cursor-pointer"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="mr-2 h-5 w-5 text-gray-600" />
                <span>偏好设置</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-purple-700 rounded-md transition" aria-label="编辑工作区">
              <Edit size={16} />
            </button>
            <button className="p-1.5 hover:bg-purple-700 rounded-md transition" aria-label="列表视图">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Placeholder for channel list */}
        <p className="text-sm text-gray-400">Channels and DMs will be here.</p>
      </div>

      {/* 工作区设置弹窗 */}
      <WorkspaceSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <InvitePeopleDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
} 