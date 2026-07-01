"use client";

import { useState } from "react";
import { Loader2, Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react";

export function AutoScheduler() {
  const [participants, setParticipants] = useState("");
  const [duration, setDuration] = useState(60);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const findTimes = async () => {
    if (!participants || !dateRange.start || !dateRange.end) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
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
      }
    } catch (error) {
      console.error("Failed to find times:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        AI Auto-Scheduler
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Participants (comma separated)</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="john@example.com, sarah@example.com"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
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
            <CheckCircle className="w-4 h-4" />
          )}
          {loading ? "Finding Times..." : "Find Optimal Times"}
        </button>

        {suggestions.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Suggested Times</h4>
            <div className="space-y-2">
              {suggestions.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(slot.start).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{slot.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">{slot.score}%</span>
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