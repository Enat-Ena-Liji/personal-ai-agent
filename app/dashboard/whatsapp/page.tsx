"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, MessageSquare, Users, Send, RefreshCw, QrCode, LogOut } from "lucide-react";

interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  timestamp: number;
  sender: string;
  senderName?: string;
}

export default function WhatsAppPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Fix: Use useCallback for checkStatus
  const checkStatus = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const response = await fetch("/api/whatsapp/connect");
      const data = await response.json();
      
      if (isMounted.current) {
        setConnected(data.connected);
        setStatus(data.status);
        if (data.qr) {
          setQrCode(data.qr);
        }
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    }
  }, []);

  // Fix: Use useEffect with proper dependency
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Initial check
    checkStatus();
    
    // Set up polling
    intervalRef.current = setInterval(checkStatus, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoaded, isSignedIn, checkStatus]);

  const connectWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
      });
      const data = await response.json();
      
      if (isMounted.current) {
        if (data.qr) {
          setQrCode(data.qr);
          setStatus('connecting');
        }
      }
    } catch (error) {
      console.error("Failed to connect WhatsApp:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const disconnectWhatsApp = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/connect", {
        method: "DELETE",
      });
      if (isMounted.current) {
        setConnected(false);
        setQrCode(null);
        setStatus('disconnected');
      }
    } catch (error) {
      console.error("Failed to disconnect WhatsApp:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !recipient.trim()) return;
    
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipient, message: messageText }),
      });
      
      if (response.ok && isMounted.current) {
        setMessageText("");
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          from: "You",
          body: messageText,
          timestamp: Date.now() / 1000,
          sender: "You",
          senderName: "You"
        }]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Rest of the component remains the same...
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-green-500" />
          WhatsApp
        </h1>
        <div className="flex items-center gap-3">
          {status === 'connected' && (
            <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connected
            </span>
          )}
          {status === 'connecting' && (
            <span className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting...
            </span>
          )}
        </div>
      </div>

      {!connected ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          {qrCode ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Scan QR Code</h3>
              <p className="text-gray-500 mb-4">
                Open WhatsApp on your phone and scan the QR code to connect
              </p>
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                <img src={`data:image/png;base64,${qrCode}`}alt="WhatsApp QR Code"
  className="w-48 h-48"
                />
              </div>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={checkStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </button>
                <button
                  onClick={disconnectWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                QR code expires in 60 seconds. Refresh if needed.
              </p>
            </div>
          ) : (
            <>
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Connect WhatsApp</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your WhatsApp account to send and receive messages with AI assistance, smart replies, and automated responses.
              </p>
              <button
                onClick={connectWhatsApp}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
                {loading ? "Connecting..." : "Connect WhatsApp"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts/Conversations */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Chats</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                <Users className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">Last message here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === 'You' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.body}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No messages yet</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient number (e.g., 1234567890)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim() || !recipient.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}