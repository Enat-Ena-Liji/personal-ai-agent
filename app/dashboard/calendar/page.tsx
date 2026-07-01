"use client";

import { useUser } from "@/hooks/useUser";
import { Loader2, Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { isLoaded, isSignedIn } = useUser();

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

  // Get current date
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  // Generate days for current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const firstDay = getFirstDayOfMonth(today.getFullYear(), today.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sample events
  const events = [
    { date: 15, title: "Team Meeting", time: "10:00 AM", color: "bg-blue-100 text-blue-700" },
    { date: 18, title: "Project Review", time: "2:00 PM", color: "bg-green-100 text-green-700" },
    { date: 22, title: "Client Call", time: "11:30 AM", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-700">
            {currentMonth} {currentYear}
          </span>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] p-2 rounded-lg border ${
                  day === today.getDate()
                    ? 'bg-blue-50 border-blue-200'
                    : day !== null
                    ? 'border-gray-100 hover:border-gray-200'
                    : 'border-transparent'
                } transition-colors`}
              >
                {day !== null && (
                  <>
                    <div className={`text-sm font-medium ${
                      day === today.getDate() ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {events
                        .filter(event => event.date === day)
                        .map((event, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1.5 py-0.5 rounded ${event.color}`}
                          >
                            {event.title}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${event.color.split(' ')[0]}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.date} {today.toLocaleString('default', { month: 'short' })} • {event.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Connected calendars</span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                + Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}