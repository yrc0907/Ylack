"use client";

import { Message } from "./editor";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  currentUser?: {
    name: string;
    avatar: string;
  };
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  if (messages.length === 0) {
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
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
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
            const messageAnimation = isNewMessage(messages.findIndex(m => m.id === message.id))
              ? 'animate-messageIn'
              : '';

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${messageAnimation}`}
                style={{ animationDelay: `${msgIndex * 150}ms` }}
              >
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                  <div className="flex-shrink-0">
                    <div className="relative h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover shadow-md"
                        src={message.sender.avatar}
                        alt={`${message.sender.name}'s avatar`}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col ${isCurrentUser ? 'items-end mr-3' : 'items-start ml-3'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{message.sender.name}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>

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