"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function BriefingCard() {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [error, setError] = useState(null);

  const generateBriefing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/briefing/generate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      setBriefing(data.briefing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">📊 Today's Briefing</h2>
        <button
          onClick={generateBriefing}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {briefing ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">{briefing.summary}</p>
          </div>
          
          {briefing.actionItems?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Action Items</h3>
              <div className="space-y-2">
                {briefing.actionItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.priority === 'high' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : item.priority === 'medium' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{item.task}</p>
                      <p className="text-xs text-gray-500">
                        Priority: {item.priority} • Source: {item.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Click " Generate" to get your AI-powered daily briefing
        </div>
      )}
    </div>
  );
}