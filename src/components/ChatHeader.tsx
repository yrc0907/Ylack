"use client";

import { useState } from "react";
import { ChevronDown, Phone, Video, Info, MoreHorizontal, Search, Bell, User } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  participants: {
    name: string;
    avatar: string;
    isOnline?: boolean;
  }[];
  currentUser: {
    name: string;
    avatar: string;
  };
}

export default function ChatHeader({ title, participants, currentUser }: ChatHeaderProps) {
  const [showParticipants, setShowParticipants] = useState(false);

  const onlineCount = participants.filter(p => p.isOnline).length;
  const totalParticipants = participants.length + 1; // Including current user

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <h1 className="text-xl font-bold">{title}</h1>
            <ChevronDown className={`ml-1 w-5 h-5 transition-transform ${showParticipants ? 'rotate-180' : ''}`} />
          </div>

          <div className="ml-4 text-sm text-gray-500 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            <span>{onlineCount} online</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Audio call">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Video call">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Information">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="More options">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Participants dropdown */}
      {showParticipants && (
        <div className="p-4 bg-white dark:bg-gray-800 border-b animate-slideDown">
          <h2 className="font-medium mb-3">Participants ({totalParticipants})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {/* Current user */}
            <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
              </div>
              <span className="ml-2 font-medium">{currentUser.name} (You)</span>
            </div>

            {/* Other participants */}
            {participants.map((participant) => (
              <div key={participant.name} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="relative">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white dark:border-gray-800 ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                  ></span>
                </div>
                <span className="ml-2">{participant.name}</span>
              </div>
            ))}
          </div>

          <button className="mt-3 flex items-center text-blue-500 hover:text-blue-600">
            <User className="w-4 h-4 mr-1" />
            <span>Add participants</span>
          </button>
        </div>
      )}
    </header>
  );
} 