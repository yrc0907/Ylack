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
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JoinWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinWorkspaceDialog({ isOpen, onClose }: JoinWorkspaceDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { switchWorkspace } = useWorkspace();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("请输入邀请码");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/workspaces/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "加入工作区失败");
      }

      toast.success(`成功加入工作区: ${data.workspace.name}`);
      // Assuming switchWorkspace will update context and trigger re-renders
      await switchWorkspace(data.workspace.id);
      onClose();
      router.refresh(); // Refresh to reflect new workspace in the list etc.

    } catch (error: any) {
      toast.error(error.message || "发生未知错误");
      console.error("Join workspace error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">加入工作区</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2">
            输入朋友分享给您的邀请码以加入他们的工作区。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Input
            id="inviteCode"
            placeholder="例如: aB1cD2eF"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={isLoading}
            className="text-center text-lg tracking-wider"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "加入中..." : "加入工作区"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 