"use client";

import { useState, useEffect } from "react";
import Tiptap, { Message } from "@/components/editor";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";
import ChatHeader from "@/components/ChatHeader";
import { v4 as uuidv4 } from "uuid";

// Mock current user data - in a real app this would come from authentication
const currentUser = {
  name: "John Doe",
  avatar: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
};

// Sample avatar images for demo purposes
const avatarImages = [
  "https://ui-avatars.com/api/?name=Sarah+Wilson&background=27AE60&color=fff",
  "https://ui-avatars.com/api/?name=Alex+Johnson&background=8E44AD&color=fff",
  "https://ui-avatars.com/api/?name=Michael+Brown&background=D35400&color=fff",
];

// Sample user data for demo
const users = [
  { name: "Sarah Wilson", avatar: avatarImages[0], isOnline: true },
  { name: "Alex Johnson", avatar: avatarImages[1], isOnline: true },
  { name: "Michael Brown", avatar: avatarImages[2], isOnline: false },
];

// For demo purposes, we'll use some placeholder messages
const initialMessages: Message[] = [
  {
    id: uuidv4(),
    content: "<p>Hello team! I've uploaded the latest design files.</p>",
    sender: users[0],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: uuidv4(),
    content: "<p>Thanks Sarah! I'll take a look at them.</p>",
    sender: users[1],
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
  },
  {
    id: uuidv4(),
    content: "<p>I've added comments on the homepage layout.</p>",
    sender: users[2],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
];

export default function WorkspacePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<{ name: string }[]>([]);

  // Simulate random users typing for demo purposes
  useEffect(() => {
    const randomTypingInterval = setInterval(() => {
      // Randomly decide if a user should start or stop typing
      const shouldAddTyper = Math.random() > 0.7;

      if (shouldAddTyper && typingUsers.length < 2) {
        // Pick a random user who isn't already typing
        const availableUsers = users.filter(
          user => !typingUsers.some(typingUser => typingUser.name === user.name)
        );

        if (availableUsers.length > 0) {
          const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
          setTypingUsers(prev => [...prev, { name: randomUser.name }]);

          // Auto-remove typing status after a random time
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(user => user.name !== randomUser.name));
          }, 2000 + Math.random() * 3000);
        }
      }
    }, 5000);

    return () => clearInterval(randomTypingInterval);
  }, [typingUsers]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender: currentUser,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate a response after a delay
    setTimeout(() => {
      // Get a random user to respond
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Create a response message
      const responseMessage: Message = {
        id: uuidv4(),
        content: `<p>Thanks for sharing that, ${currentUser.name}!</p>`,
        sender: randomUser,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);
    }, 3000 + Math.random() * 5000);
  };

  return (
    <div className="flex flex-col h-screen p-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <ChatHeader
        title="Project Discussion"
        participants={users}
        currentUser={currentUser}
      />

      {/* Main content with message list */}
      <div className="flex-grow overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          currentUser={currentUser}
        />
        <TypingIndicator users={typingUsers} />
      </div>

      {/* Message composer */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <Tiptap onSend={handleSendMessage} />
      </div>
    </div>
  );
}