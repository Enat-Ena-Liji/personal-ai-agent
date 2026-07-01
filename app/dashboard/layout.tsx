"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Calendar, Plus, ChevronLeft, ChevronRight, Sparkles, Clock, Users, CheckCircle } from "lucide-react";
import { MeetingSummary } from "@/components/MeetingSummary";

// Mock events for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 11, 0),
    attendees: ['john@example.com', 'sarah@example.com'],
    description: 'Weekly team sync'
  },
  {
    id: '2',
    title: 'Project Review',
    start: new Date(2024, 0, 15, 14, 0),
    end: new Date(2024, 0, 15, 15, 30),
    attendees: ['mike@example.com', 'lisa@example.com'],
    description: 'Review Q1 progress'
  },
  {
    id: '3',
    title: 'Client Call',
    start: new Date(2024, 0, 16, 11, 0),
    end: new Date(2024, 0, 16, 12, 0),
    attendees: ['client@example.com'],
    description: 'Discuss project requirements'
  }
];

export default function CalendarPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const isCalendarConnected = false; // Will be replaced with actual check

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
          <p className="text-gray-600">Please sign in to view your calendar.</p>
        </div>
      </div>
    );
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-700 min-w-[120px] text-center">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {!isCalendarConnected ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Connect Your Calendar</h3>
          <p className="text-gray-500 mb-4">
            Connect your Google Calendar to view events and get AI-powered meeting summaries.
          </p>
          <button
            onClick={() => window.location.href = '/api/auth/calendar'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Connect Calendar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = mockEvents.filter(e => 
                  e.start.getMonth() === currentMonth && 
                  e.start.getDate() === day
                );
                const isToday = day === new Date().getDate() && 
                               currentMonth === new Date().getMonth() &&
                               currentYear === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 rounded-lg border ${
                      isToday
                        ? 'bg-blue-50 border-blue-200'
                        : day !== null
                        ? 'border-gray-100 hover:border-gray-200 cursor-pointer'
                        : 'border-transparent'
                    } transition-colors`}
                    onClick={() => {
                      if (dayEvents.length > 0) {
                        setSelectedEvent(dayEvents[0]);
                        setShowSummary(true);
                      }
                    }}
                  >
                    {day !== null && (
                      <>
                        <div className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded truncate"
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Meeting Details or Summary */}
          <div>
            {showSummary && selectedEvent ? (
              <MeetingSummary
                event={{
                  id: selectedEvent.id,
                  title: selectedEvent.title,
                  start: selectedEvent.start,
                  end: selectedEvent.end,
                  attendees: selectedEvent.attendees,
                }}
                onSummaryGenerated={() => {}}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                <div className="space-y-3">
                  {mockEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowSummary(true);
                      }}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}
                          </div>
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Users className="w-3 h-3" />
                              {event.attendees.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setShowSummary(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI Summary
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}