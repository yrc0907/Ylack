"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export function CreateChannelDialog({ isOpen, onClose, onChannelCreated }: CreateChannelDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("频道名称不能为空");
      return;
    }
    if (!currentWorkspace) {
      toast.error("没有选中的工作区");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.toLowerCase().replace(/\s+/g, '-'), description }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "创建频道失败");
      }

      toast.success(`频道 #${data.name} 已创建`);
      onChannelCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setName("");
      setDescription("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建一个新频道</DialogTitle>
          <DialogDescription>
            频道是团队沟通的地方。最好围绕一个主题来组织，例如：#marketing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="channel-name">名称</Label>
            <Input
              id="channel-name"
              placeholder="例如：plan-updates"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="channel-description">描述 (可选)</Label>
            <Input
              id="channel-description"
              placeholder="这个频道是关于什么的？"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading}>取消</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "创建中..." : "创建频道"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 