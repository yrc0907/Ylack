"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash, Users, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/WorkspaceContext";

// Define the type for a workspace member
export interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface WorkspaceSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsDialog({ isOpen, onClose }: WorkspaceSettingsDialogProps) {
  const router = useRouter();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const [activeTab, setActiveTab] = useState("general");

  // States for general settings
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // States for members tab
  const [members, setMembers] = useState<Member[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);


  // Fetch members when the dialog is open and the members tab is selected
  useEffect(() => {
    if (isOpen && activeTab === "members" && currentWorkspace) {
      const fetchMembers = async () => {
        setIsMembersLoading(true);
        try {
          const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members`);
          if (!response.ok) {
            throw new Error("获取成员列表失败");
          }
          const data = await response.json();
          setMembers(data);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "获取成员时发生错误");
        } finally {
          setIsMembersLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, activeTab, currentWorkspace]);


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setIsEditing(false);
      setIsDeleting(false);
      // Reset to the general tab when dialog closes
      setActiveTab("general");
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

  const renderGeneralSettings = () => {
    if (isEditing) {
      return (
        <div className="pt-4">
          <Label htmlFor="name">工作区名称</Label>
          <Input id="name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} disabled={isLoading} />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>取消</Button>
            <Button onClick={handleUpdate} disabled={isLoading}>{isLoading ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </div>
      );
    }
    if (isDeleting) {
      return (
        <div className="pt-4 text-center">
          <p>确定要删除工作区 <strong>{currentWorkspace?.name}</strong> 吗？此操作无法撤销。</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleting(false)} disabled={isLoading}>取消</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>{isLoading ? "删除中..." : "确认删除"}</Button>
          </DialogFooter>
        </div>
      );
    }
    return (
      <div className="space-y-2 pt-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4" /> 编辑名称</Button>
        <Button variant="destructive" className="w-full justify-start" onClick={() => setIsDeleting(true)}><Trash className="mr-2 h-4 w-4" /> 删除工作区</Button>
      </div>
    );
  };

  const renderMembers = () => {
    if (isMembersLoading) {
      return <div className="text-center py-8">加载成员中...</div>;
    }
    return (
      <div className="space-y-3 pt-4 max-h-80 overflow-y-auto">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback>{member.user.name?.charAt(0) || member.user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name || member.user.username}</p>
                <p className="text-sm text-gray-500">{member.user.username}</p>
              </div>
            </div>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{member.role}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentWorkspace?.name} 设置</DialogTitle>
          <DialogDescription>
            管理您的工作区设置和成员
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">通用</TabsTrigger>
            <TabsTrigger value="members">成员 ({members.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            {renderGeneralSettings()}
          </TabsContent>
          <TabsContent value="members">
            {renderMembers()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 