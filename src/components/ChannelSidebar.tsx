"use client";

import { ChevronsUpDown, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ChannelSidebar() {
  const { currentWorkspace, isLoading } = useWorkspace();

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
      <div className="h-14 flex items-center px-4 border-b border-purple-900">
        <h2 className="font-bold text-lg flex-1">{currentWorkspace.name}</h2>
        <button className="p-1 hover:bg-purple-700 rounded" aria-label="工作区选项">
          <ChevronsUpDown size={20} />
        </button>
      </div>
      <div className="flex-1 p-4">
        {/* Placeholder for channel list */}
        <p className="text-sm text-gray-400">Channels and DMs will be here.</p>
      </div>
      <div className="p-2 border-t border-purple-900 flex items-center justify-between">
        <div className="text-sm">Your Name</div>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-purple-700 rounded" aria-label="编辑个人资料">
            <Pencil size={16} />
          </button>
          <button className="p-1 hover:bg-purple-700 rounded" aria-label="设置">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 