"use client";

import { useState, useEffect } from "react";
import Tiptap, { Message as DisplayMessage } from "@/components/editor";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";
import ChatHeader from "@/components/ChatHeader";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

export default function ChannelPage() {
  const params = useParams();
  const { currentWorkspace, currentChannel } = useWorkspace();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ name: string }[]>([]);

  const workspaceId = params.workspaceId as string;
  const channelId = params.channelId as string;

  const currentUser = session?.user
    ? {
      name: session.user.name || "Unknown User",
      avatar:
        session.user.image ||
        `https://ui-avatars.com/api/?name=${session.user.name || "default"
        }&background=0D8ABC&color=fff`,
    }
    : null;

  useEffect(() => {
    if (channelId && workspaceId) {
      setIsLoadingMessages(true);
      fetch(`/api/workspaces/${workspaceId}/channels/${channelId}/messages`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch messages");
          }
          return res.json();
        })
        .then((data: Message[]) => {
          const formattedMessages: DisplayMessage[] = data.map((msg) => ({
            id: msg.id,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            sender: {
              name: msg.user.name || msg.user.username,
              avatar:
                msg.user.image ||
                `https://ui-avatars.com/api/?name=${msg.user.name || msg.user.username
                }&background=27AE60&color=fff`,
            },
          }));
          setMessages(formattedMessages);
        })
        .catch((err) => {
          toast.error(err.message);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    } else {
      setMessages([]);
    }
  }, [channelId, workspaceId]);

  const handleSendMessage = async (content: string) => {
    if (!workspaceId || !channelId || !session?.user) {
      toast.error("Cannot send message. No active workspace or channel.");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMessage: DisplayMessage = {
      id: tempId,
      content,
      sender: {
        name: session.user.name || session.user.username || "Anonymous",
        avatar:
          session.user.image ||
          `https://ui-avatars.com/api/?name=${session.user.name || session.user.username || "A"
          }&background=0D8ABC&color=fff`,
      },
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const savedMessage: Message = await response.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
              id: savedMessage.id,
              content: savedMessage.content,
              timestamp: new Date(savedMessage.createdAt),
              sender: {
                name: savedMessage.user.name || savedMessage.user.username,
                avatar:
                  session.user.image ||
                  `https://ui-avatars.com/api/?name=${savedMessage.user.name || savedMessage.user.username
                  }&background=0D8ABC&color=fff`,
              },
            }
            : m
        )
      );
    } catch (err) {
      toast.error((err as Error).message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col h-screen p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <h1 className="text-2xl font-bold">Welcome to Ylack</h1>
        <p>Select or create a workspace to get started.</p>
      </div>
    );
  }

  if (!currentChannel) {
    return (
      <div className="flex flex-col h-screen p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <h1 className="text-2xl font-bold">Select a channel</h1>
        <p>Choose a channel from the sidebar to start messaging.</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <ChatHeader
        title={currentChannel.name}
        participants={[]}
        currentUser={currentUser}
      />
      <div className="flex-grow overflow-hidden flex flex-col">
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading messages...</p>
          </div>
        ) : (
          <MessageList messages={messages} currentUser={currentUser} />
        )}
        <TypingIndicator users={typingUsers} />
      </div>
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <Tiptap onSend={handleSendMessage} />
      </div>
    </div>
  );
} 