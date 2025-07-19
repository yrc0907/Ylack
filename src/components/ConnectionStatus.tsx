'use client';

import { useSocket } from '@/context/SocketContext';
import { CircleSlash, Wifi, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function ConnectionStatus() {
  const { isConnected } = useSocket();
  const [showStatus, setShowStatus] = useState(false);
  const [connecting, setConnecting] = useState(true);

  // 初始加载时给一些时间来建立连接
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnecting(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 显示连接状态的延迟效果
  useEffect(() => {
    if (!isConnected && !connecting) {
      setShowStatus(true);
    } else if (isConnected) {
      // 连接成功后短暂显示，然后隐藏
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, connecting]);

  if (!showStatus) return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className={cn(
        "px-3 py-1 rounded-full flex items-center gap-2 text-sm shadow-md transition-all",
        isConnected ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
      )}>
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>连接中...</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>已连接</span>
          </>
        ) : (
          <>
            <CircleSlash className="h-4 w-4" />
            <span>已断开连接</span>
          </>
        )}
      </div>
    </div>
  );
} 