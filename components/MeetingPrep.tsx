"use client";

import { useState } from "react";
import { Loader2, FileText, Users, Clock, List, BookOpen, Lightbulb, Calendar, User, Target, MessageSquare } from "lucide-react";

interface AgendaItem {
  topic: string;
  duration: number;
  presenter: string;
}

interface MeetingAgenda {
  title: string;
  objectives: string[];
  topics: AgendaItem[];
  preparation: string[];
  questions: string[];
  materials: string[];
}

export function MeetingPrep() {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [context, setContext] = useState("");
  const [duration, setDuration] = useState(60);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAgenda = async () => {
    if (!title || !participants) {
      setError("Please fill in meeting title and participants");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/calendar/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingTitle: title,
          participants: participants.split(",").map(p => p.trim()),
          context: context || "General meeting discussion",
          durationMinutes: duration,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAgenda(data.agenda);
      } else {
        setError(data.error || "Failed to generate agenda");
        // Use fallback agenda
        setAgenda(getFallbackAgenda(title, participants.split(",").map(p => p.trim())));
      }
    } catch (error) {
      console.error("Failed to generate agenda:", error);
      setError("Failed to generate agenda. Using fallback.");
      setAgenda(getFallbackAgenda(title, participants.split(",").map(p => p.trim())));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAgenda = (title: string, participants: string[]): MeetingAgenda => {
    return {
      title: title || "Team Meeting",
      objectives: [
        "Review current project status",
        "Discuss key challenges and blockers",
        "Define next steps and action items",
      ],
      topics: [
        { topic: "Opening & Context Setting", duration: 5, presenter: participants[0] || "Organizer" },
        { topic: "Project Status Review", duration: 15, presenter: "Team Lead" },
        { topic: "Discussion & Problem Solving", duration: 20, presenter: "All Participants" },
        { topic: "Action Items & Next Steps", duration: 10, presenter: "All Participants" },
        { topic: "Q&A & Closing", duration: 5, presenter: "Organizer" },
      ],
      preparation: [
        "Review previous meeting notes",
        "Prepare project updates",
        "Bring relevant documents and metrics",
      ],
      questions: [
        "What are the main challenges we're facing?",
        "What resources do we need to move forward?",
        "What's our priority for the next sprint?",
      ],
      materials: [
        "Project dashboard",
        "Current sprint metrics",
        "Previous meeting notes",
      ],
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        AI Meeting Prep
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Meeting Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly Team Sync"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

        <div>
          <label className="text-sm font-medium text-gray-700">Context / Background</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What's the meeting about? Any background info?"
            rows={3}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

        <button
          onClick={generateAgenda}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {loading ? "Generating..." : "Generate Agenda"}
        </button>

        {agenda && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Objectives
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {agenda.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <List className="w-4 h-4 text-blue-500" />
                Agenda Topics
              </h4>
              <div className="space-y-2">
                {agenda.topics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium">{topic.topic}</span>
                    <div className="flex items-center gap-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {topic.duration} min
                      </span>
                      <span className="text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {topic.presenter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Preparation
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {agenda.preparation.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Questions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {agenda.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Materials
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {agenda.materials.map((material, i) => (
                  <li key={i}>{material}</li>
                ))}
              </ul>
            </div>

            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Save Agenda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}