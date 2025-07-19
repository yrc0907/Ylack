"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

// 定义工作区类型
export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  role?: string;
}

// 定义频道类型
export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type?: string;
}

// 定义上下文的类型
interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  currentChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  fetchWorkspaces: () => Promise<Workspace[]>;
  switchChannel: (channel: Channel | null) => void;
}

// 创建上下文
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// 工作区提供者组件
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 获取工作区列表
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/workspaces");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取工作区失败");
      }

      const data = await response.json() as Workspace[];
      setWorkspaces(data);

      // 如果有工作区但没有选择当前工作区，则选择第一个
      if (data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]);
      } else if (data.length === 0) {
        setCurrentWorkspace(null);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取工作区时发生错误";
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 切换工作区
  const switchWorkspace = async (workspaceId: string) => {
    const workspaceToSwitch = workspaces.find(ws => ws.id === workspaceId);
    if (workspaceToSwitch) {
      setCurrentWorkspace(workspaceToSwitch);
      // Optional: Store the current workspace ID in localStorage for persistence
      localStorage.setItem('currentWorkspaceId', workspaceId);
      toast.info(`已切换到工作区: ${workspaceToSwitch.name}`);
    } else {
      // If workspace is not in the list (e.g., just joined), refetch the list
      await fetchWorkspaces();
      // After refetching, the useEffect for setting current workspace should handle it.
      // We can add a more direct switch here if needed.
    }
    router.refresh();
  };

  const switchChannel = (channel: Channel | null) => {
    setCurrentChannel(channel);
    if (channel) {
      router.push(`/dashboard/workspace/${currentWorkspace?.id}/channel/${channel.id}`);
    }
  };

  // 初始化时获取工作区列表
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    fetchWorkspaces().then(fetchedWorkspaces => {
      if (savedWorkspaceId) {
        const savedWs = fetchedWorkspaces.find(ws => ws.id === savedWorkspaceId);
        if (savedWs) {
          setCurrentWorkspace(savedWs);
          return;
        }
      }
      if (fetchedWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(fetchedWorkspaces[0]);
      }
    });
  }, []);

  // 提供上下文值
  const contextValue: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    currentChannel,
    isLoading,
    error,
    switchWorkspace,
    fetchWorkspaces,
    switchChannel,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// 使用工作区上下文的钩子
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace 必须在 WorkspaceProvider 内部使用");
  }
  return context;
} 