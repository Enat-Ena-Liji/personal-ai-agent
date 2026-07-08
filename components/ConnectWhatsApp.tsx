"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Loader2, Check, X, QrCode, RefreshCw } from "lucide-react";

interface ConnectWhatsAppProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function ConnectWhatsApp({ isConnected = false, onConnect, onDisconnect }: ConnectWhatsAppProps) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const statusRef = useRef<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fix: Use useEffect with a ref to avoid state updates during render
  useEffect(() => {
    if (isConnected && statusRef.current !== 'connected') {
      // Use a timeout to avoid setState during render
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setStatus('connected');
          statusRef.current = 'connected';
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setLoading(true);
    setStatus('connecting');
    statusRef.current = 'connecting';
    
    try {
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.qr) {
        setQrCode(data.qr);
        if (onConnect) onConnect();
      } else if (data.status === 'connected') {
        setStatus('connected');
        statusRef.current = 'connected';
        if (onConnect) onConnect();
      }
    } catch (error) {
      console.error("Failed to connect WhatsApp:", error);
      setStatus('error');
      statusRef.current = 'error';
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/whatsapp/connect", {
        method: "DELETE",
      });
      setQrCode(null);
      setStatus('idle');
      statusRef.current = 'idle';
      if (onDisconnect) onDisconnect();
    } catch (error) {
      console.error("Failed to disconnect WhatsApp:", error);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/connect");
      const data = await response.json();
      
      if (data.connected && data.status === 'connected' && statusRef.current !== 'connected') {
        if (isMounted.current) {
          setStatus('connected');
          statusRef.current = 'connected';
          setQrCode(null);
          if (onConnect) onConnect();
        }
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    }
  };

  // Fix: Use a ref to track polling interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'connecting' && !intervalRef.current) {
      intervalRef.current = setInterval(checkStatus, 3000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <MessageSquare className={`w-5 h-5 ${status === 'connected' ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">WhatsApp</h3>
            <p className="text-sm text-gray-500">
              {status === 'connected' ? "Connected" : 
               status === 'connecting' ? "Connecting..." :
               status === 'error' ? "Connection failed" :
               "Connect WhatsApp account"}
            </p>
          </div>
        </div>
        {status === 'connected' ? (
          <button
            onClick={handleDisconnect}
            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading || status === 'connecting'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-70"
          >
            {loading || status === 'connecting' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4" />
            )}
            {status === 'connecting' ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>

      {qrCode && status === 'connecting' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Scan QR Code with WhatsApp
          </p>
          <div className="bg-white p-3 rounded-lg inline-block border border-gray-200">
            <img 
              src={`data:image/png;base64,${qrCode}`}
              alt="WhatsApp QR Code"
              className="w-40 h-40"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Open WhatsApp → Settings → QR Code → Scan
          </p>
          <button
            onClick={checkStatus}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 justify-center"
          >
            <RefreshCw className="w-3 h-3" />
            Check connection status
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Connection failed. Please try again.
        </div>
      )}
    </div>
  );
}