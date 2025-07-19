"use client";

import { Message } from "./editor";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import MessageReply from "./MessageReply";
import MessageReactions, { ReactionType } from "./MessageReactions";
import { Reply, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface MessageListProps {
  messages: Message[];
  currentUser?: {
    name: string;
    avatar: string;
  };
  workspaceId: string;
  channelId: string;
  onReplyToMessage?: (message: Message) => void;
}

// 扩展消息类型，包含回复信息和反应
export interface ExtendedMessage extends Message {
  replyTo?: {
    id: string;
    content: string;
    user: {
      id: string;
      name?: string | null;
      username: string;
    };
  } | null;
  reactions?: ReactionType[];
}

export default function MessageList({
  messages,
  currentUser,
  workspaceId,
  channelId,
  onReplyToMessage
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const [messageReactions, setMessageReactions] = useState<Record<string, ReactionType[]>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});
  const loadedMessagesRef = useRef<Set<string>>(new Set());

  // 去重并确保消息ID唯一
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter(message => {
      // 提取基本ID（去除可能的client-前缀）
      const baseId = message.id.startsWith('client-')
        ? message.id.substring(7) // 去掉 'client-' 前缀
        : message.id;

      // 检查我们是否已经有这个ID（原始形式或客户端形式）
      const fullKey = `${baseId}-${message.sender.name}`;
      if (seen.has(fullKey)) {
        return false;
      }
      seen.add(fullKey);
      return true;
    }) as ExtendedMessage[];
  }, [messages]);

  // 滚动到底部当消息变化时
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = uniqueMessages.length;
  }, [uniqueMessages]);

  // 预加载所有消息的表情反应
  useEffect(() => {
    uniqueMessages.forEach(message => {
      if (!loadedMessagesRef.current.has(message.id)) {
        loadReactions(message.id);
        loadedMessagesRef.current.add(message.id);
      }
    });
  }, [uniqueMessages]);

  // 加载消息反应
  const loadReactions = useCallback(async (messageId: string) => {
    if (loadingReactions[messageId] || messageReactions[messageId]) return;

    setLoadingReactions(prev => ({ ...prev, [messageId]: true }));

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/reactions`);
      if (!response.ok) {
        if (response.status !== 404) { // 404可能意味着没有表情反应，不需要报错
          throw new Error('Failed to load reactions');
        }
        // 空表情数组
        setMessageReactions(prev => ({ ...prev, [messageId]: [] }));
        return;
      }

      const reactions = await response.json();
      console.log(`Loaded reactions for message ${messageId}:`, reactions);
      setMessageReactions(prev => ({ ...prev, [messageId]: reactions }));
    } catch (error) {
      console.error('Error loading reactions:', error);
      // 确保即使出错也设置一个空数组，这样UI不会尝试重新加载
      setMessageReactions(prev => ({ ...prev, [messageId]: [] }));
    } finally {
      setLoadingReactions(prev => ({ ...prev, [messageId]: false }));
    }
  }, [workspaceId, channelId, messageReactions, loadingReactions]);

  // 添加表情反应
  const handleAddReaction = async (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      const result = await response.json();
      console.log("Reaction result:", result);

      // 更新本地状态，避免重新加载整个列表
      setMessageReactions(prev => {
        const currentReactions = [...(prev[messageId] || [])];
        const existingIndex = currentReactions.findIndex(r => r.emoji === emoji);

        if (existingIndex >= 0) {
          // 更新现有表情
          currentReactions[existingIndex] = {
            ...currentReactions[existingIndex],
            count: result.count,
            users: result.users,
            userCount: result.userCount
          };
        } else {
          // 添加新表情
          currentReactions.push({
            emoji,
            count: result.count,
            users: result.users,
            userCount: result.userCount
          });
        }

        return { ...prev, [messageId]: currentReactions };
      });
    } catch (error) {
      toast.error('Failed to add reaction');
      console.error('Error adding reaction:', error);
    }
  };

  // 删除表情反应
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }

      const result = await response.json();
      console.log("Remove reaction result:", result);

      // 更新本地状态，避免重新加载整个列表
      setMessageReactions(prev => {
        const currentReactions = [...(prev[messageId] || [])];
        if (result.count === 0) {
          // 如果计数为0，则完全移除该表情
          return {
            ...prev,
            [messageId]: currentReactions.filter(r => r.emoji !== emoji)
          };
        } else {
          // 否则更新计数和用户数据
          return {
            ...prev,
            [messageId]: currentReactions.map(r =>
              r.emoji === emoji
                ? {
                  ...r,
                  count: result.count,
                  users: result.users,
                  userCount: result.userCount
                }
                : r
            )
          };
        }
      });
    } catch (error) {
      toast.error('Failed to remove reaction');
      console.error('Error removing reaction:', error);
    }
  };

  if (uniqueMessages.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: ExtendedMessage[] } = {};
  uniqueMessages.forEach(message => {
    const dateKey = message.timestamp.toDateString();
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(message);
  });

  // Determine if a message is new (for animation)
  const isNewMessage = (index: number) => {
    return index >= prevMessagesLengthRef.current - 1;
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-6">
      {Object.entries(groupedMessages).map(([dateKey, messagesForDate], groupIndex) => (
        <div key={dateKey} className="space-y-4 animate-fadeIn" style={{ animationDelay: `${groupIndex * 100}ms` }}>
          <div className="flex justify-center">
            <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
              {formatDate(new Date(dateKey))}
            </span>
          </div>

          {messagesForDate.map((message, msgIndex) => {
            const isCurrentUser = currentUser && message.sender.name === currentUser.name;
            const messageAnimation = isNewMessage(uniqueMessages.findIndex(m => m.id === message.id))
              ? 'animate-messageIn'
              : '';

            // 为每条消息创建真正唯一的key
            const uniqueKey = `${message.id}-${msgIndex}-${dateKey}`;

            return (
              <div
                key={uniqueKey}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${messageAnimation}`}
                style={{ animationDelay: `${msgIndex * 150}ms` }}
              >
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] group`}>
                  <div className="flex-shrink-0">
                    <div className="relative h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover shadow-md"
                        src={message.sender.avatar}
                        alt={`${message.sender.name}'s avatar`}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col ${isCurrentUser ? 'items-end mr-3' : 'items-start ml-3'} relative`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{message.sender.name}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>

                      {/* 回复按钮，仅在hover时显示 */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center">
                        {onReplyToMessage && (
                          <MessageReply onReplyClick={() => onReplyToMessage(message)} />
                        )}
                      </div>
                    </div>

                    {/* 如果是回复消息，显示回复引用 */}
                    {message.replyTo && (
                      <MessageReply replyTo={message.replyTo} />
                    )}

                    <div className={`
                      p-3 rounded-lg shadow-md transition-all hover:shadow-lg
                      ${isCurrentUser
                        ? 'bg-blue-500 text-white bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
                    `}>
                      <div
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    </div>

                    {/* 表情反应区域 - 总是渲染，如果没有反应会显示空 */}
                    <MessageReactions
                      reactions={messageReactions[message.id] || []}
                      messageId={message.id}
                      workspaceId={workspaceId}
                      channelId={channelId}
                      onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
                      onRemoveReaction={(emoji) => handleRemoveReaction(message.id, emoji)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 