"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Clock, Users, Calendar, AlertCircle, CheckCircle } from "lucide-react";

export function CalendarAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/calendar/analytics?days=30");
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p>No analytics data available</p>
        <p className="text-sm">Connect your calendar and schedule some meetings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          title="Total Meetings"
          value={analytics.totalMeetings}
          subtitle="Last 30 days"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-green-500" />}
          title="Avg Duration"
          value={`${analytics.averageDuration} min`}
          subtitle="Per meeting"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          title="Productivity Score"
          value={`${analytics.productivityScore}%`}
          subtitle="Based on efficiency"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-orange-500" />}
          title="Meeting Types"
          value={Object.keys(analytics.meetingTypes).length}
          subtitle="Different categories"
        />
      </div>

      {/* Meeting Types Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Meeting Distribution</h4>
        <div className="space-y-2">
          {Object.entries(analytics.meetingTypes).map(([type, count]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24">{type}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: `${(count / analytics.totalMeetings) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Meeting Trends</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500">Weekly</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.trends.weekly.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">meetings/week</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500">Monthly</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics.trends.monthly}
            </p>
            <p className="text-xs text-gray-400">meetings/month</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-500">Quarterly</p>
            <p className="text-2xl font-bold text-purple-600">
              {analytics.trends.quarterly}
            </p>
            <p className="text-xs text-gray-400">meetings/quarter</p>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Peak Meeting Hours</h4>
        <div className="flex items-end gap-1 h-32">
          {analytics.peakHours.map((hour: any, index: number) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="w-full bg-blue-600 rounded-t"
                style={{
                  height: `${(hour.count / Math.max(...analytics.peakHours.map((h: any) => h.count))) * 100}%`,
                }}
              />
              <span className="text-xs text-gray-500 mt-1">
                {hour.hour}:00
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Productivity Tips
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {analytics.recommendations.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}