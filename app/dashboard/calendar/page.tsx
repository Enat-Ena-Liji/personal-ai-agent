"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, BarChart3, Settings, Sparkles, Clock, Users } from "lucide-react";
import { AutoScheduler } from "@/components/AutoScheduler";
import { MeetingPrep } from "@/components/MeetingPrep";
import { MeetingSummary } from "@/components/MeetingSummary";
import { CalendarAnalytics } from "@/components/CalendarAnalytics";

type View = 'calendar' | 'analytics' | 'scheduler' | 'prep';

// ... rest of the calendar page code

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  attendees?: string[];
  description?: string;
}

export default function CalendarPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [view, setView] = useState<View>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const isCalendarConnected = useQuery(api.platforms.getPlatforms)?.some(
    p => p.platform === "calendar" && p.isConnected
  ) || false;

  // Fetch real calendar events
  useEffect(() => {
    if (isCalendarConnected) {
      fetchCalendarEvents();
    }
  }, [isCalendarConnected, currentMonth, currentYear]);

  const fetchCalendarEvents = async () => {
    setLoadingEvents(true);
    try {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const response = await fetch(`/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        })));
      } else {
        // Fallback mock data
        setEvents(getMockEvents(currentMonth, currentYear));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents(getMockEvents(currentMonth, currentYear));
    } finally {
      setLoadingEvents(false);
    }
  };

  const getMockEvents = (month: number, year: number): CalendarEvent[] => {
    return [
      {
        id: '1',
        title: 'Team Sync',
        start: new Date(year, month, 15, 10, 0),
        end: new Date(year, month, 15, 11, 0),
        attendees: ['john@example.com', 'sarah@example.com'],
        description: 'Weekly team sync meeting',
      },
      {
        id: '2',
        title: 'Project Review',
        start: new Date(year, month, 18, 14, 0),
        end: new Date(year, month, 18, 15, 30),
        attendees: ['mike@example.com', 'lisa@example.com'],
        description: 'Review project progress',
      },
      {
        id: '3',
        title: 'Client Call',
        start: new Date(year, month, 22, 11, 0),
        end: new Date(year, month, 22, 12, 0),
        attendees: ['client@example.com'],
        description: 'Discuss project requirements',
      },
    ];
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
          <p className="text-gray-600">Please sign in to view your calendar.</p>
        </div>
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

  const getDayEvents = (day: number) => {
    return events.filter(e => e.start.getDate() === day);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  return (
    <div>
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
              <CalendarIcon className="w-3 h-3 inline mr-1" />
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

      {!isCalendarConnected ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Connect Your Calendar</h3>
          <p className="text-gray-500 mb-4">
            Connect your Google Calendar to view events and access AI features.
          </p>
          <button
            onClick={() => window.location.href = '/api/auth/calendar'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Connect Calendar
          </button>
        </div>
      ) : (
        <>
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
                    <span className="font-semibold text-lg">
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
                  <button
                    onClick={() => {
                      const today = new Date();
                      setCurrentMonth(today.getMonth());
                      setCurrentYear(today.getFullYear());
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Today
                  </button>
                </div>

                {loadingEvents ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((day, index) => {
                        const dayEvents = day !== null ? getDayEvents(day) : [];
                        return (
                          <div
                            key={index}
                            onClick={() => day !== null && setSelectedDate(day)}
                            className={`min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all ${
                              day === null ? 'border-transparent' :
                              isToday(day) ? 'bg-blue-50 border-blue-200' :
                              dayEvents.length > 0 ? 'bg-white border-blue-100 hover:shadow-md' :
                              'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {day !== null && (
                              <>
                                <div className={`text-sm font-medium ${
                                  isToday(day) ? 'text-blue-600' : 'text-gray-700'
                                }`}>
                                  {day}
                                </div>
                                <div className="mt-1 space-y-1">
                                  {dayEvents.slice(0, 2).map((event) => (
                                    <div
                                      key={event.id}
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
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                  {events.length === 0 ? (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}
                          </div>
                          {event.attendees && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Assistant
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Need help scheduling? Try the AI Scheduler
                  </p>
                  <button
                    onClick={() => setView('scheduler')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Find optimal times →
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === 'scheduler' && <AutoScheduler />}
          {view === 'prep' && <MeetingPrep />}
          {view === 'analytics' && <CalendarAnalytics />}
        </>
      )}
    </div>
  );
}