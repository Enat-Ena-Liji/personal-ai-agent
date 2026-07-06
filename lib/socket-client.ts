// lib/socket-client.ts
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isConnected = false;

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      this.socket?.emit('user:login', userId);
      this.emit('socket:connected', {});
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('reconnect', () => {
      console.log('Reconnected to socket server');
      this.isConnected = true;
      this.socket?.emit('user:login', userId);
    });

    // Setup default handlers
    this.setupHandlers();
  }

  private setupHandlers() {
    if (!this.socket) return;

    // Handle incoming messages
    this.socket.on('message:receive', (data) => {
      this.triggerHandlers('message:receive', data);
    });

    // Handle typing indicators
    this.socket.on('typing:indicator', (data) => {
      this.triggerHandlers('typing:indicator', data);
    });

    // Handle user status
    this.socket.on('user:status', (data) => {
      this.triggerHandlers('user:status', data);
    });

    // Handle online users
    this.socket.on('users:online', (users) => {
      this.triggerHandlers('users:online', users);
    });

    // Handle notifications
    this.socket.on('notification:updated', (data) => {
      this.triggerHandlers('notification:updated', data);
    });
  }

  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event) || [];
      this.messageHandlers.set(event, handlers.filter(h => h !== handler));
    }
  }

  private triggerHandlers(event: string, data: any) {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  sendMessage(message: any) {
    this.emit('message:send', message);
  }

  startTyping(channel: string) {
    this.emit('typing:start', { channel });
  }

  stopTyping(channel: string) {
    this.emit('typing:stop', { channel });
  }

  markNotificationRead(notificationId: string) {
    this.emit('notification:read', notificationId);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketClient = new SocketClient();