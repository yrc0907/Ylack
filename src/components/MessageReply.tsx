'use client';

import { Reply, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyToMessage {
  id: string;
  content: string;
  user: {
    id: string;
    name?: string | null;
    username: string;
  };
}

interface MessageReplyProps {
  replyTo?: ReplyToMessage | null;
  onReplyClick?: () => void;
  onCancelReply?: () => void;
  isReplying?: boolean;
}

export default function MessageReply({
  replyTo,
  onReplyClick,
  onCancelReply,
  isReplying = false
}: MessageReplyProps) {
  // 如果是展示回复的消息，显示完整组件
  if (replyTo) {
    // 清理HTML标签，只显示纯文本
    const cleanContent = replyTo.content.replace(/<[^>]*>?/gm, '');
    // 截取前50个字符作为预览
    const previewText = cleanContent.length > 50
      ? cleanContent.substring(0, 50) + '...'
      : cleanContent;

    return (
      <div className="flex items-start space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 text-sm mb-2 max-w-full overflow-hidden">
        <div className="flex-shrink-0 mt-0.5 hidden sm:block">
          <Reply className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex-grow overflow-hidden">
          <p className="font-medium text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
            回复 {replyTo.user.name || replyTo.user.username}
          </p>
          <p className="text-gray-600 dark:text-gray-300 truncate text-xs sm:text-sm">{previewText}</p>
        </div>
        {onCancelReply && (
          <button
            className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            onClick={onCancelReply}
            aria-label="取消回复"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // 如果没有replyTo但有onReplyClick，显示回复按钮
  if (onReplyClick) {
    return (
      <button
        className={cn(
          "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
          isReplying && "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
        )}
        onClick={onReplyClick}
        aria-label="回复消息"
      >
        <Reply className="h-4 w-4" />
      </button>
    );
  }

  return null;
} 