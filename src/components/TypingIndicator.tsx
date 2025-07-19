'use client';

import { useEffect, useState } from 'react';

type TypingUser = {
  name: string;
  timestamp?: number;
};

interface TypingIndicatorProps {
  users: TypingUser[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  const [dots, setDots] = useState('.');

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (users.length === 0) {
    return null;
  }

  let message = '';

  if (users.length === 1) {
    message = `${users[0].name} is typing`;
  } else if (users.length === 2) {
    message = `${users[0].name} and ${users[1].name} are typing`;
  } else {
    message = `${users.length} people are typing`;
  }

  return (
    <div className="px-4 py-1 text-sm text-gray-500 italic animate-pulse">
      {message}{dots}
    </div>
  );
} 