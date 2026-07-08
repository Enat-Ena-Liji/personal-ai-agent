"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: number;
  read: boolean;
}

export function RealTimeMessage({ channel, userId }: { channel: string; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, startTyping, stopTyping, isConnected } = useSocket();

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (message: Message) => {
      if (message.to === userId || message.from === userId) {
        setMessages(prev => [...prev, message]);
      }
    };

    // Add event listener through socket
    // This should be handled by the socket context
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      from: userId,
      to: channel,
      content: input.trim(),
      type: 'text',
      timestamp: Date.now(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    sendMessage(message);
    setInput("");
  };

  const handleTyping = (isTyping: boolean) => {
    if (isTyping) {
      startTyping(channel);
    } else {
      stopTyping(channel);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.from === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping(true);
          }}
          onBlur={() => handleTyping(false)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {!isConnected && (
        <div className="p-2 bg-yellow-50 border-t border-yellow-200 text-center text-xs text-yellow-700">
          Connecting to server...
        </div>
      )}
    </div>
  );
}