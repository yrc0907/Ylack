'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (workspaceId: string, channelId: string) => void;
  leaveChannel: (workspaceId: string, channelId: string) => void;
  sendMessage: (workspaceId: string, channelId: string, message: any) => void;
  emitTyping: (workspaceId: string, channelId: string, user: { name: string }) => void;
  emitStopTyping: (workspaceId: string, channelId: string, user: { name: string }) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinChannel: () => {},
  leaveChannel: () => {},
  sendMessage: () => {},
  emitTyping: () => {},
  emitStopTyping: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // 只有在用户登录后才初始化socket
    if (!session?.user) return;

    // 初始化Socket服务器
    const initSocket = async () => {
      try {
        // 先初始化Socket.IO服务器
        await fetch('/api/socket');
        
        // 创建Socket客户端
        const socketInstance = io({
          path: '/api/socket',
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected with ID:', socketInstance.id);
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        setSocket(socketInstance);

        return socketInstance;
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        return null;
      }
    };

    let socketInstance: Socket | null = null;
    
    initSocket().then((s) => {
      socketInstance = s;
    });

    // 清理函数
    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
      }
    };
  }, [session]);

  // 加入频道
  const joinChannel = (workspaceId: string, channelId: string) => {
    if (!socket || !isConnected) return;
    
    console.log('Joining channel:', workspaceId, channelId);
    socket.emit('join-channel', { workspaceId, channelId });
  };

  // 离开频道
  const leaveChannel = (workspaceId: string, channelId: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('leave-channel', { workspaceId, channelId });
  };

  // 发送消息
  const sendMessage = (workspaceId: string, channelId: string, message: any) => {
    if (!socket || !isConnected) return;
    
    console.log('Sending message via socket:', message.id);
    socket.emit('new-message', { workspaceId, channelId, message });
  };

  // 发送正在输入
  const emitTyping = (workspaceId: string, channelId: string, user: { name: string }) => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing', { workspaceId, channelId, user });
  };

  // 发送停止输入
  const emitStopTyping = (workspaceId: string, channelId: string, user: { name: string }) => {
    if (!socket || !isConnected) return;
    
    socket.emit('stop-typing', { workspaceId, channelId, user });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChannel,
        leaveChannel,
        sendMessage,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
} 