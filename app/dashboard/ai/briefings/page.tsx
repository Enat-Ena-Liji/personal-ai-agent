"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Sparkles, Calendar, MessageSquare, Mail, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function BriefingsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const todayBriefing = useQuery(api.briefings.getTodayBriefing);
  const allBriefings = useQuery(api.briefings.getBriefings, { limit: 30 });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBriefing = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/briefing", { method: "POST" });
      const data = await response.json();
      if (!data.success) setError(data.error || "Failed to generate briefing");
    } catch (error) {
      setError("Failed to generate briefing. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

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
          <p className="text-gray-600">Please sign in to view briefings.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Briefings
        </h1>
        <button
          onClick={generateBriefing}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Generating..." : "Generate Briefing"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {todayBriefing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{todayBriefing.title}</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {format(todayBriefing.createdAt, "PPPP 'at' pp")}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Today
            </span>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700">{todayBriefing.summary}</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 whitespace-pre-wrap">{todayBriefing.details}</p>
            </div>
          </div>

          {todayBriefing.items && todayBriefing.items.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Action Items
              </h3>
              <div className="space-y-3">
                {todayBriefing.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {item.platform === "gmail" && <Mail className="w-4 h-4 text-red-500" />}
                      {item.platform === "whatsapp" && <MessageSquare className="w-4 h-4 text-green-500" />}
                      {item.platform === "calendar" && <Calendar className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.priority === "high" ? "bg-red-100 text-red-700" :
                      item.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Briefing Available</h3>
          <p className="text-gray-600 mb-4">
            Generate your first daily briefing by clicking the button above.
          </p>
        </div>
      )}

      {allBriefings && allBriefings.length > 1 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Previous Briefings</h3>
          <div className="space-y-3">
            {allBriefings.slice(1, 6).map((briefing) => (
              <div key={briefing._id} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{briefing.title}</h4>
                    <p className="text-sm text-gray-500">
                      {format(briefing.createdAt, "PPP")}
                    </p>
                  </div>
                  <span className={`text-sm ${briefing.isRead ? "text-gray-400" : "text-blue-600 font-medium"}`}>
                    {briefing.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}