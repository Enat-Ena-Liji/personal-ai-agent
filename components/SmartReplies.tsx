"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";

interface SmartRepliesProps {
  message: string;
  context?: string;
  onSelectReply: (reply: string) => void;
}

export default function SmartReplies({ message, context = "", onSelectReply }: SmartRepliesProps) {
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const generateReplies = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setShow(true);
    
    try {
      const response = await fetch("/api/ai/smart-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });
      
      const data = await response.json();
      
      if (data.success && data.replies) {
        setReplies(data.replies.replies || []);
      }
    } catch (error) {
      console.error("Failed to generate replies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          if (!show) {
            generateReplies();
          } else {
            setShow(false);
          }
        }}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Sparkles className="w-4 h-4" />
        {show ? "Hide smart replies" : "Generate smart replies"}
      </button>

      {show && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating replies...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {replies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectReply(reply);
                    setShow(false);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full transition-colors border border-blue-200"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}