"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Workspace, useWorkspace } from "@/context/WorkspaceContext";

interface WorkspaceSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsDialog({ isOpen, onClose }: WorkspaceSettingsDialogProps) {
  const router = useRouter();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // 当弹窗打开时，重置状态并设置工作区名称
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setIsEditing(false);
      setIsDeleting(false);
    } else if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name);
    }
  };

  // 处理更新工作区
  const handleUpdate = async () => {
    if (!currentWorkspace) return;

    if (!workspaceName.trim()) {
      toast.error("工作区名称不能为空");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "更新工作区失败");
      }

      toast.success("工作区名称已更新");
      await fetchWorkspaces();
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新工作区时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除工作区
  const handleDelete = async () => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除工作区失败");
      }

      toast.success("工作区已删除");
      await fetchWorkspaces();
      onClose();
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除工作区时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>编辑工作区</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">工作区名称</Label>
              <Input
                id="name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="输入工作区名称"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (isDeleting) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>删除工作区</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center">确定要删除工作区 <strong>{currentWorkspace?.name}</strong> 吗？此操作无法撤销。</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)} disabled={isLoading}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>工作区设置</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 transition"
            >
              <Pencil className="mr-2 h-5 w-5 text-gray-600" />
              <span>编辑工作区</span>
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 transition text-red-600"
            >
              <Trash className="mr-2 h-5 w-5" />
              <span>删除工作区</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 