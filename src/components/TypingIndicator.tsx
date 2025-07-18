"use client";

interface TypingIndicatorProps {
  users: { name: string }[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  let message = '';
  if (users.length === 1) {
    message = `${users[0].name} is typing...`;
  } else if (users.length === 2) {
    message = `${users[0].name} and ${users[1].name} are typing...`;
  } else {
    message = `${users[0].name} and ${users.length - 1} others are typing...`;
  }

  return (
    <div className="text-xs text-gray-500 italic px-4 py-1">
      <div className="flex items-center">
        <span>{message}</span>
        <div className="ml-1 flex">
          <span className="animate-bounce mx-[1px] h-1 w-1 bg-gray-500 rounded-full" style={{ animationDelay: '0ms' }}></span>
          <span className="animate-bounce mx-[1px] h-1 w-1 bg-gray-500 rounded-full" style={{ animationDelay: '150ms' }}></span>
          <span className="animate-bounce mx-[1px] h-1 w-1 bg-gray-500 rounded-full" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
} 