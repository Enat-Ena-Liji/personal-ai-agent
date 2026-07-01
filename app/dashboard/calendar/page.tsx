"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Calendar, Plus, ChevronLeft, ChevronRight, BarChart3, Settings, Sparkles } from "lucide-react";
import { AutoScheduler } from "@/components/AutoScheduler";
import { MeetingPrep } from "@/components/MeetingPrep";
import { MeetingSummary } from "@/components/MeetingSummary";
import { CalendarAnalytics } from "@/components/CalendarAnalytics";

type View = 'calendar' | 'analytics' | 'scheduler' | 'prep';

export default function CalendarPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [view, setView] = useState<View>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const isCalendarConnected = useQuery(api.platforms.getPlatforms)?.some(
    p => p.platform === "calendar" && p.isConnected
  ) || false;

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

  if (!isCalendarConnected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Connect Your Calendar</h3>
        <p className="text-gray-500 mb-4">
          Connect your Google Calendar to access all advanced features.
        </p>
        <button
          onClick={() => window.location.href = '/api/auth/calendar'}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Connect Calendar
        </button>
      </div>
    );
  }

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      {/* Header with View Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('scheduler')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'scheduler' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Schedule
            </button>
            <button
              onClick={() => setView('prep')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'prep' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-3 h-3 inline mr-1" />
              Prep
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'analytics' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              Analytics
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* View Content */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                    else setCurrentMonth(currentMonth - 1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                    else setCurrentMonth(currentMonth + 1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 rounded-lg border ${
                    day === new Date().getDate() && currentMonth === new Date().getMonth()
                      ? 'bg-blue-50 border-blue-200'
                      : day !== null ? 'border-gray-100 hover:border-gray-200 cursor-pointer' : 'border-transparent'
                  }`}
                >
                  {day !== null && (
                    <>
                      <div className={`text-sm font-medium ${
                        day === new Date().getDate() ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {day}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          </div>
        </div>
      )}

      {view === 'scheduler' && <AutoScheduler />}
      {view === 'prep' && <MeetingPrep />}
      {view === 'analytics' && <CalendarAnalytics />}
    </div>
  );
}