// server.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store online users
  const onlineUsers = new Map();
  const userStatus = new Map();
  const typingUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user login
    socket.on('user:login', (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      userStatus.set(userId, 'online');
      
      // Broadcast to all clients
      io.emit('user:status', {
        userId,
        status: 'online',
        timestamp: Date.now()
      });
      
      // Send online users list
      io.emit('users:online', Array.from(onlineUsers.keys()));
      
      console.log(`User ${userId} is online`);
    });

    // Handle typing
    socket.on('typing:start', (data) => {
      const { userId, channel } = data;
      typingUsers.set(`${userId}:${channel}`, true);
      
      socket.broadcast.emit('typing:indicator', {
        userId,
        channel,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { userId, channel } = data;
      typingUsers.delete(`${userId}:${channel}`);
      
      socket.broadcast.emit('typing:indicator', {
        userId,
        channel,
        isTyping: false
      });
    });

    // Handle messages
    socket.on('message:send', (message) => {
      const { to, from, content, type } = message;
      
      // Store message in database (implement with Convex)
      // For now, broadcast
      socket.broadcast.emit('message:receive', {
        ...message,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });

    // Handle notifications
    socket.on('notification:read', (notificationId) => {
      // Mark notification as read
      io.emit('notification:updated', {
        notificationId,
        read: true
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        userStatus.set(socket.userId, 'offline');
        
        io.emit('user:status', {
          userId: socket.userId,
          status: 'offline',
          timestamp: Date.now()
        });
        
        io.emit('users:online', Array.from(onlineUsers.keys()));
        
        console.log(`User ${socket.userId} disconnected`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`Next.js app running on http://localhost:3000`);
  });
});