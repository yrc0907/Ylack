'use client';

import { useState, useEffect } from 'react';
import { Smile, Plus } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface ReactionType {
  emoji: string;
  count: number;
  users: User[];
  userCount?: number; // 当前用户添加此表情的次数
}

interface MessageReactionsProps {
  reactions: ReactionType[];
  messageId: string;
  workspaceId: string;
  channelId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export default function MessageReactions({
  reactions,
  messageId,
  workspaceId,
  channelId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [displayedReactions, setDisplayedReactions] = useState<ReactionType[]>([]);

  // 将reactions同步到displayedReactions
  useEffect(() => {
    if (reactions && Array.isArray(reactions)) {
      setDisplayedReactions(reactions);
    }
  }, [reactions]);

  // 处理表情点击 - 始终添加新表情
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setShowEmojiPicker(false);
    onAddReaction(emojiData.emoji);

    // 乐观更新UI
    const existingReaction = displayedReactions.find(r => r.emoji === emojiData.emoji);
    if (existingReaction) {
      // 如果已经有这个表情，增加计数
      setDisplayedReactions(prev =>
        prev.map(r =>
          r.emoji === emojiData.emoji
            ? { ...r, count: r.count + 1, userCount: (r.userCount || 0) + 1 }
            : r
        )
      );
    } else {
      // 如果是全新的表情
      setDisplayedReactions(prev => [
        ...prev,
        {
          emoji: emojiData.emoji,
          count: 1,
          users: [], // 在API响应前我们可能没有完整的用户信息
          userCount: 1
        }
      ]);
    }
  };

  // 处理点击现有表情 - 可以反复添加
  const handleReactionClick = (reaction: ReactionType) => {
    // 检查是否有用户添加的表情
    if (reaction.userCount && reaction.userCount > 0) {
      // 有表情就移除一个
      onRemoveReaction(reaction.emoji);

      // 乐观更新UI - 减少计数
      setDisplayedReactions(prev =>
        prev.map(r =>
          r.emoji === reaction.emoji
            ? {
              ...r,
              count: Math.max(0, r.count - 1),
              userCount: Math.max(0, (r.userCount || 0) - 1)
            }
            : r
        ).filter(r => r.count > 0) // 如果计数为0，则移除
      );
    } else {
      // 没有表情就添加一个
      onAddReaction(reaction.emoji);

      // 乐观更新UI - 增加计数
      setDisplayedReactions(prev =>
        prev.map(r =>
          r.emoji === reaction.emoji
            ? { ...r, count: r.count + 1, userCount: (r.userCount || 0) + 1 }
            : r
        )
      );
    }
  };

  // 获取鼠标悬停时显示的用户名列表
  const getUsersTooltip = (reaction: ReactionType) => {
    if (!reaction.users || reaction.users.length === 0) {
      return "Loading...";
    }

    // 统计用户和他们的表情数量
    const userCounts = reaction.users.reduce((acc: Record<string, number>, user) => {
      if (user.name) {
        acc[user.name] = (acc[user.name] || 0) + 1;
      }
      return acc;
    }, {});

    // 生成用户名列表
    const userNameList = Object.entries(userCounts)
      .slice(0, 10)
      .map(([name, count]) => `${name}${count > 1 ? ` (${count})` : ''}`)
      .join(', ');

    const remaining = Object.keys(userCounts).length > 10 ?
      ` and ${Object.keys(userCounts).length - 10} more` : '';

    return `${userNameList}${remaining}`;
  };

  return (
    <div className="flex items-center gap-1 mt-1 relative">
      {displayedReactions && displayedReactions.length > 0 && displayedReactions.map((reaction) => (
        <Tooltip
          key={reaction.emoji}
          content={getUsersTooltip(reaction)}
          side="top"
        >
          <button
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${(reaction.userCount || 0) > 0
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            onClick={() => handleReactionClick(reaction)}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.count}</span>
            {(reaction.userCount || 0) > 1 && (
              <span className="font-semibold text-xs">
                ({reaction.userCount})
              </span>
            )}
          </button>
        </Tooltip>
      ))}

      <div className="relative">
        <button
          className="flex items-center justify-center p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {displayedReactions.length === 0 ? (
            <Smile className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 z-[9999] mb-2">
            {/* 透明遮罩层，点击时关闭表情选择器 */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowEmojiPicker(false)}
            />
            {/* 表情选择器 */}
            <div className="relative z-[9999]">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                lazyLoadEmojis={true}
                searchDisabled={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 