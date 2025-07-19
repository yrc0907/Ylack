"use client";

import { useState, useEffect, useRef } from "react";
import Tiptap, { Message as DisplayMessage } from "@/components/editor";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";
import ChatHeader from "@/components/ChatHeader";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSocket } from "@/context/SocketContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { debounce } from "lodash";

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
  const [typingUsers, setTypingUsers] = useState<{ name: string; timestamp: number }[]>([]);
  const { socket, joinChannel, leaveChannel, sendMessage, emitTyping, emitStopTyping, isConnected } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelJoinedRef = useRef<boolean>(false);

  const workspaceId = params.workspaceId as string;
  const channelId = params.channelId as string;

  const currentUser = session?.user
    ? {
      name: session.user.name || session.user.username || "Unknown User",
      avatar:
        session.user.image ||
        `https://ui-avatars.com/api/?name=${session.user.name || "default"
        }&background=0D8ABC&color=fff`,
    }
    : null;

  // Load initial messages
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

  // Join channel when socket is connected and channel/workspace IDs are available
  useEffect(() => {
    if (!isConnected || !socket || !workspaceId || !channelId || !currentUser) return;
    
    console.log(`Joining channel ${channelId} in workspace ${workspaceId}`);
    joinChannel(workspaceId, channelId);
    channelJoinedRef.current = true;
    
    return () => {
      if (channelJoinedRef.current) {
        console.log(`Leaving channel ${channelId}`);
        leaveChannel(workspaceId, channelId);
        channelJoinedRef.current = false;
      }
    };
  }, [isConnected, socket, workspaceId, channelId, currentUser, joinChannel, leaveChannel]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected || !workspaceId || !channelId) return;
    
    // Handle new messages from socket
    const handleMessageReceived = (message: Message) => {
      console.log("Received message via socket:", message.id);
      
      // Skip if the message is already in our list (prevent duplicates)
      if (messages.some(m => m.id === message.id)) {
        console.log("Skipping duplicate message:", message.id);
        return;
      }
      
      const formattedMessage: DisplayMessage = {
        id: message.id,
        content: message.content,
        timestamp: new Date(message.createdAt),
        sender: {
          name: message.user.name || message.user.username,
          avatar:
            message.user.image ||
            `https://ui-avatars.com/api/?name=${message.user.name || message.user.username
            }&background=27AE60&color=fff`,
        }
      };
      
      setMessages(prev => {
        // 最后一次检查以确保没有重复
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, formattedMessage];
      });
    };
    
    // Handle typing indicator
    const handleUserTyping = (user: { name: string }) => {
      setTypingUsers(prev => {
        const existingUserIndex = prev.findIndex(u => u.name === user.name);
        if (existingUserIndex !== -1) {
          const updated = [...prev];
          updated[existingUserIndex].timestamp = Date.now();
          return updated;
        }
        return [...prev, { ...user, timestamp: Date.now() }];
      });
    };
    
    // Handle stop typing
    const handleUserStopTyping = (user: { name: string }) => {
      setTypingUsers(prev => prev.filter(u => u.name !== user.name));
    };
    
    console.log("Setting up socket event listeners");
    
    // Subscribe to socket events
    socket.on("message-received", handleMessageReceived);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    
    // Clean up typing users that haven't updated in 3 seconds
    const typingInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(user => (now - user.timestamp) < 3000));
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log("Removing socket event listeners");
      socket.off("message-received", handleMessageReceived);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      clearInterval(typingInterval);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, isConnected, workspaceId, channelId, messages]);

  // Debounced typing emitter
  const debouncedEmitTyping = useRef(
    debounce((workspaceId: string, channelId: string, user: { name: string }) => {
      emitTyping(workspaceId, channelId, user);
      
      // Set a timeout to stop typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(workspaceId, channelId, user);
      }, 3000);
    }, 300)
  ).current;

  // Handler for typing events
  const handleTyping = () => {
    if (currentUser && workspaceId && channelId && isConnected) {
      debouncedEmitTyping(workspaceId, channelId, { name: currentUser.name });
    }
  };

  // Handler for sending messages
  const handleSendMessage = async (content: string) => {
    if (!workspaceId || !channelId || !session?.user) {
      toast.error("Cannot send message. No active workspace or channel.");
      return;
    }

    // Clear typing indicator when sending a message
    if (currentUser) {
      emitStopTyping(workspaceId, channelId, { name: currentUser.name });
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
    
    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Send message to the server via API
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
      
      // Replace temporary message with saved one
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
      
      // Broadcast the message via socket to other clients
      if (isConnected) {
        console.log("Broadcasting message via socket:", savedMessage.id);
        // 将消息ID加上唯一前缀，确保客户端发送的消息和服务器消息不重复
        const socketMessage = {
          ...savedMessage,
          id: `client-${savedMessage.id}` // 添加前缀以区分
        };
        sendMessage(workspaceId, channelId, socketMessage);
      }
    } catch (err) {
      toast.error((err as Error).message);
      // Remove the temporary message if sending failed
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
        <Tiptap onSend={handleSendMessage} onTyping={handleTyping} />
      </div>
      <ConnectionStatus />
    </div>
  );
} 