"use client";

import { AutoScheduler } from "@/components/AutoScheduler";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Auto-Scheduler</h1>
      <AutoScheduler />
    </div>
  );
}