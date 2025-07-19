import { Server } from "socket.io";

export default function handler(req, res) {
  // 如果Socket.IO服务器已经初始化，返回
  if (res.socket.server.io) {
    console.log("Socket.IO server already running");
    res.end();
    return;
  }

  console.log("Setting up Socket.IO server...");
  
  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });
  
  // 将Socket.IO实例保存到服务器对象
  res.socket.server.io = io;

  // 监听连接事件
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 加入频道
    socket.on("join-channel", (data) => {
      const { workspaceId, channelId } = data;
      const roomId = `workspace:${workspaceId}:channel:${channelId}`;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // 离开频道
    socket.on("leave-channel", (data) => {
      const { workspaceId, channelId } = data;
      const roomId = `workspace:${workspaceId}:channel:${channelId}`;
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // 新消息
    socket.on("new-message", (data) => {
      const { workspaceId, channelId, message } = data;
      const roomId = `workspace:${workspaceId}:channel:${channelId}`;
      console.log(`Broadcasting message to ${roomId}:`, message.id);
      io.to(roomId).emit("message-received", message);
    });

    // 用户正在输入
    socket.on("typing", (data) => {
      const { workspaceId, channelId, user } = data;
      const roomId = `workspace:${workspaceId}:channel:${channelId}`;
      socket.to(roomId).emit("user-typing", user);
    });

    // 用户停止输入
    socket.on("stop-typing", (data) => {
      const { workspaceId, channelId, user } = data;
      const roomId = `workspace:${workspaceId}:channel:${channelId}`;
      socket.to(roomId).emit("user-stop-typing", user);
    });

    // 监听断开连接
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  res.end();
} 