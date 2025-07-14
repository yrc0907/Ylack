"use client";

import { ChevronsUpDown, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

// 定义工作区类型
interface Workspace {
  id: string;
  name: string;
  description?: string;
}

// 模拟从API获取工作区数据
const useWorkspace = () => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用
    const fetchWorkspace = async () => {
      try {
        // 这里可以替换为实际的API调用
        // 为了演示，我们随机决定是否有工作区
        const hasWorkspace = Math.random() > 0.5;

        if (hasWorkspace) {
          setWorkspace({
            id: "1",
            name: "Work2",
            description: "A workspace for our team"
          });
        } else {
          setWorkspace(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch workspace:", error);
        setWorkspace(null);
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  return { workspace, loading };
};

export function ChannelSidebar() {
  const { workspace, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="h-full bg-purple-800 text-white flex flex-col items-center justify-center">
        <p className="text-sm text-gray-300">加载中...</p>
      </div>
    );
  }

  if (!workspace) {
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
        <h2 className="font-bold text-lg flex-1">{workspace.name}</h2>
        <button className="p-1 hover:bg-purple-700 rounded" aria-label="Workspace options">
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
          <button className="p-1 hover:bg-purple-700 rounded" aria-label="Edit profile">
            <Pencil size={16} />
          </button>
          <button className="p-1 hover:bg-purple-700 rounded" aria-label="Settings">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 