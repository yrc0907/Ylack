"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChevronsUpDown, Pencil, Trash2, AlertTriangle, User, Settings, ChevronDown, Edit, List, PlusCircle, MessageSquareText, Send, Plus, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceSettingsDialog, Member } from "./WorkspaceSettingsDialog";
import { InvitePeopleDialog } from "./InvitePeopleDialog";
import { JoinWorkspaceDialog } from "./JoinWorkspaceDialog";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

interface Channel {
  id: string;
  name: string;
}

export function ChannelSidebar() {
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const { data: session } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(true);
  const [isChannelsExpanded, setIsChannelsExpanded] = useState(true);

  const fetchChannels = useCallback(() => {
    if (currentWorkspace?.id) {
      setIsChannelsLoading(true);
      fetch(`/api/workspaces/${currentWorkspace.id}/channels`)
        .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch channels"))
        .then(setChannels)
        .catch((e) => toast.error(e.toString()))
        .finally(() => setIsChannelsLoading(false));
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      setIsMembersLoading(true);
      fetch(`/api/workspaces/${currentWorkspace.id}/members`)
        .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch members"))
        .then(setMembers)
        .catch((e) => toast.error(e.toString()))
        .finally(() => setIsMembersLoading(false));

      fetchChannels();
    }
  }, [currentWorkspace?.id, fetchChannels]);

  if (isWorkspaceLoading) {
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
      <div className="px-3 py-3 border-b border-purple-700/50">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center text-white hover:bg-purple-700 rounded-md p-2 transition">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-8 w-8 rounded-md bg-white text-purple-900 flex items-center justify-center font-bold text-lg">
                    {currentWorkspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="font-bold text-md">{currentWorkspace.name}</h2>
                  </div>
                </div>
                <ChevronDown size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-white">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2 px-4 focus:bg-gray-100 cursor-pointer"
                onClick={() => setIsJoinOpen(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5 text-gray-600" />
                <span>加入其它工作区</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        <div className="space-y-1">
          <button className="flex items-center w-full p-2 text-sm font-medium text-gray-200 rounded-md hover:bg-purple-700/50">
            <MessageSquareText className="mr-3 h-5 w-5 text-gray-400" />
            <span>Threads</span>
          </button>
          <button className="flex items-center w-full p-2 text-sm font-medium text-gray-200 rounded-md hover:bg-purple-700/50">
            <Send className="mr-3 h-5 w-5 text-gray-400" />
            <span>Drafts & Sent</span>
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <button className="flex items-center gap-1 flex-1" onClick={() => setIsChannelsExpanded(!isChannelsExpanded)}>
              <ChevronRight size={14} className={`transition-transform ${isChannelsExpanded ? "rotate-90" : ""}`} />
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Channels</h3>
            </button>
            <button onClick={() => setIsCreateChannelOpen(true)} className="p-1 hover:bg-purple-700 rounded-md" aria-label="Create new channel">
              <Plus size={16} className="text-gray-400" />
            </button>
          </div>
          {isChannelsExpanded && (
            <div className="space-y-1">
              {isChannelsLoading ? (
                <p className="p-2 text-sm text-gray-400">Loading channels...</p>
              ) : (
                channels.map((channel) => (
                  <button key={channel.id} className="w-full flex items-center p-2 text-sm font-medium text-left text-gray-200 rounded-md hover:bg-purple-700/50">
                    <span className="mr-2">#</span>
                    {channel.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div>
          <h3 className="px-2 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">Direct Messages</h3>
          <div className="space-y-1">
            {isMembersLoading ? (
              <p className="p-2 text-sm text-gray-400">Loading members...</p>
            ) : (
              members
                .filter(member => member.user.id !== session?.user?.id) // Exclude current user
                .map(member => (
                  <button key={member.id} className="w-full flex items-center gap-2 p-2 text-sm font-medium text-left text-gray-200 rounded-md hover:bg-purple-700">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback className="text-xs bg-gray-600">
                        {member.user.name?.charAt(0) || member.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.user.name || member.user.username}</span>
                  </button>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <WorkspaceSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <InvitePeopleDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
      <JoinWorkspaceDialog
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
      <CreateChannelDialog
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onChannelCreated={fetchChannels}
      />
    </div>
  );
} 