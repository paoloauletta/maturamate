"use client";

import { Clock } from "lucide-react";

interface TimerDisplayProps {
  timeRemaining: number;
  formatTime: (seconds: number) => string;
}

export default function TimerDisplay({
  timeRemaining,
  formatTime,
}: TimerDisplayProps) {
  const isLowTime = timeRemaining < 300;

  return (
    <div
      className={`flex items-center justify-center rounded-md border ${
        isLowTime
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          : "border-border/30 bg-muted/20"
      } px-3 py-1.5`}
    >
      <Clock className={`h-4 w-4 mr-2 ${isLowTime ? "text-red-500" : ""}`} />
      <span
        className={`font-mono text-base ${
          isLowTime ? "text-red-500 font-bold" : ""
        }`}
      >
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
