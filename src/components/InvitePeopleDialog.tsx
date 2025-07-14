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

// Mock function to generate invite code. In a real app, this would be an API call.
const generateInviteCode = async (workspaceId: string): Promise<string> => {
  console.log(`Generating new invite code for workspace ${workspaceId}...`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API latency
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return newCode;
};

// Mock function to fetch invite code.
const fetchInviteCode = async (workspaceId: string): Promise<string> => {
  console.log(`Fetching invite code for workspace ${workspaceId}...`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  // In a real app, you might have a persistent code. For now, we generate one.
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function InvitePeopleDialog({ isOpen, onClose }: InvitePeopleDialogProps) {
  const { currentWorkspace } = useWorkspace();
  const [inviteCode, setInviteCode] = useState("...");
  const [isGenerating, setIsGenerating] = useState(false);

  const loadInviteCode = useCallback(async () => {
    if (currentWorkspace) {
      setIsGenerating(true);
      // Assuming currentWorkspace has an 'id' property
      const code = await fetchInviteCode(currentWorkspace.id);
      setInviteCode(code);
      setIsGenerating(false);
    }
  }, [currentWorkspace]);


  useEffect(() => {
    if (isOpen) {
      loadInviteCode();
    }
  }, [isOpen, loadInviteCode]);

  const handleGenerateNewCode = async () => {
    if (!currentWorkspace) return;
    setIsGenerating(true);
    const newCode = await generateInviteCode(currentWorkspace.id);
    setInviteCode(newCode);
    setIsGenerating(false);
    toast.success("新的邀请码已生成");
  };

  const handleCopyCode = () => {
    if (!inviteCode || inviteCode === "...") return;
    navigator.clipboard.writeText(inviteCode);
    toast.success("邀请码已复制到剪贴板");
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
            {isGenerating ? "..." : inviteCode}
          </p>
        </div>

        <div className="text-center mb-4">
          <Button variant="ghost" onClick={handleCopyCode} className="text-sm text-gray-600 hover:text-black">
            <Copy size={14} className="mr-2" />
            复制邀请码
          </Button>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleGenerateNewCode} disabled={isGenerating}>
            <RefreshCw size={14} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '新代码'}
          </Button>
          <DialogClose asChild>
            <Button type="button" onClick={onClose}>关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 