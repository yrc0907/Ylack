"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { RefreshCw, Copy } from "lucide-react";

interface InvitePeopleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitePeopleDialog({ isOpen, onClose }: InvitePeopleDialogProps) {
  const { currentWorkspace } = useWorkspace();
  const [inviteCode, setInviteCode] = useState("...");
  const [isLoading, setIsLoading] = useState(false);

  const fetchInviteCode = useCallback(async () => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/invite`);
      if (!response.ok) {
        throw new Error("获取邀请码失败");
      }
      const data = await response.json();
      setInviteCode(data.code);
    } catch (error) {
      toast.error("无法加载邀请码，请稍后再试。");
      console.error(error);
      setInviteCode("N/A");
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      fetchInviteCode();
    }
  }, [isOpen, currentWorkspace, fetchInviteCode]);

  const handleRefreshCode = () => {
    fetchInviteCode();
  };

  const handleCopyCode = () => {
    if (inviteCode && inviteCode !== "..." && inviteCode !== "N/A") {
      navigator.clipboard.writeText(inviteCode);
      toast.success("邀请码已复制到剪贴板");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">邀请成员到 {currentWorkspace?.name}</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2">
            使用下面的代码邀请新成员加入您的工作区。
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-8">
          <p className="text-5xl font-mono tracking-widest bg-gray-100 py-4 rounded-md">
            {isLoading ? "..." : inviteCode}
          </p>
        </div>

        <div className="text-center mb-4">
          <Button variant="ghost" onClick={handleCopyCode} className="text-sm text-gray-600 hover:text-black">
            <Copy size={14} className="mr-2" />
            复制邀请码
          </Button>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleRefreshCode} disabled={isLoading}>
            <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '加载中...' : '刷新'}
          </Button>
          <DialogClose asChild>
            <Button type="button" onClick={onClose}>关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 