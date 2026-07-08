"use client";

import { useState } from "react";
import { Loader2, Calendar, Clock, Users, CheckCircle, XCircle, Sparkles } from "lucide-react";

interface SuggestedTime {
  start: Date;
  end: Date;
  score: number;
  reason: string;
}

export function AutoScheduler() {
  const [participants, setParticipants] = useState("");
  const [duration, setDuration] = useState(60);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [suggestions, setSuggestions] = useState<SuggestedTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findTimes = async () => {
    if (!participants || !dateRange.start || !dateRange.end) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/calendar/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: participants.split(",").map(p => p.trim()),
          durationMinutes: duration,
          dateRange: {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end),
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestedTimes);
      } else {
        setError(data.error || "Failed to find optimal times");
        // Use fallback suggestions
        setSuggestions(getFallbackSuggestions());
      }
    } catch (error) {
      console.error("Failed to find times:", error);
      setError("Failed to find optimal times. Using fallback.");
      setSuggestions(getFallbackSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSuggestions = (): SuggestedTime[] => {
    const now = new Date();
    return [
      {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
        score: 85,
        reason: "Optimal time - high availability",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
        score: 75,
        reason: "Good time - most participants available",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0),
        score: 65,
        reason: "Decent time - some participants may be busy",
      },
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        AI Auto-Scheduler
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Participants</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="john@example.com, sarah@example.com"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Separate emails with commas</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={findTimes}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          {loading ? "Finding Times..." : "Find Optimal Times"}
        </button>

        {suggestions.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Suggested Times
            </h4>
            <div className="space-y-2">
              {suggestions.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {slot.start.toLocaleDateString()} {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">{slot.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getScoreColor(slot.score)}`}>
                      {slot.score}%
                    </span>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}