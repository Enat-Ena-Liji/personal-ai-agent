"use client";

import { useState } from "react";
import { Loader2, Sparkles, Users, Clock, CheckCircle, List, Calendar as CalendarIcon } from "lucide-react";

interface MeetingSummaryProps {
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    attendees?: string[];
  };
  onSummaryGenerated?: (summary: any) => void;
}

export function MeetingSummary({ event, onSummaryGenerated }: MeetingSummaryProps) {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!notes.trim()) {
      alert("Please add meeting notes first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/calendar/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingTitle: event.title,
          meetingDate: event.start.toISOString(),
          attendees: event.attendees?.join(", ") || "No attendees listed",
          meetingNotes: notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        if (onSummaryGenerated) onSummaryGenerated(data.summary);
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Meeting Summary Generator
        </h3>
        <span className="text-xs text-gray-500">
          <CalendarIcon className="w-4 h-4 inline mr-1" />
          {new Date(event.start).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Meeting Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            {event.attendees?.length || 0} attendees
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <label className="text-sm font-medium text-gray-700">Meeting Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your meeting notes here..."
            rows={6}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <button
          onClick={generateSummary}
          disabled={loading || !notes.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Generating Summary..." : "Generate AI Summary"}
        </button>

        {/* Summary Output */}
        {summary && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {summary.keyPoints?.map((point: string, i: number) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            {summary.decisions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Decisions Made</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {summary.decisions.map((decision: string, i: number) => (
                    <li key={i}>{decision}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.actionItems?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                <div className="space-y-2">
                  {summary.actionItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="flex-1">{item.task}</span>
                      <span className="text-xs text-gray-500">
                        {item.assignee} {item.deadline && `• ${item.deadline}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.nextSteps?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {summary.nextSteps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="font-medium text-blue-700">Full Summary</p>
              <p className="mt-1">{summary.fullSummary}</p>
            </div>

            <button
              onClick={() => {
                // Save or export summary
                console.log('Summary:', summary);
              }}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}