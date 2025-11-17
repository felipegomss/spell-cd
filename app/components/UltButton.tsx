"use client";

import { useRef, useState } from "react";

type UltButtonProps = {
  ultData: {
    remaining: number;
    elapsed: number;
    maxCd: number;
    rankCD: number;
    rankLabel: string;
    status: "down" | "maybe" | "up";
  } | null;
  ultImageUrl: string;
  ultCooldowns: number[];
  size: "large" | "small";
  onToggle: () => void;
};

export function UltButton({
  ultData,
  ultImageUrl,
  ultCooldowns,
  size,
  onToggle,
}: UltButtonProps) {
  const dimension = size === "large" ? "w-20 h-20" : "w-16 h-16";
  const textSize = size === "large" ? "text-xl" : "text-sm";
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isOnCooldown = !!ultData && ultData.remaining > 0;
  const progress =
    ultData && isOnCooldown
      ? Math.min(1, Math.max(0, ultData.remaining / ultData.rankCD))
      : 0;

  let borderColor = "border-slate-600";
  let barColor = "bg-emerald-400/70";
  let circleColor = "text-yellow-300";

  if (ultData) {
    if (ultData.status === "down") {
      borderColor = isOnCooldown ? "border-red-500" : "border-slate-600";
      barColor = "bg-red-400/80";
      circleColor = "text-red-300";
    } else if (ultData.status === "maybe") {
      borderColor = isOnCooldown ? "border-yellow-400" : "border-slate-600";
      barColor = "bg-yellow-400/80";
      circleColor = "text-yellow-300";
    } else {
      borderColor = isOnCooldown ? "border-emerald-400" : "border-slate-600";
      barColor = "bg-emerald-400/70";
      circleColor = "text-emerald-300";
    }
  }

  const handleClick = () => {
    setClickCount((prev) => prev + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCount + 1 === 1) {
        // Single click
        if (!isOnCooldown) {
          onToggle();
        }
      } else if (clickCount + 1 >= 2) {
        // Double click
        if (isOnCooldown) {
          onToggle();
        }
      }
      setClickCount(0);
    }, 250);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`relative ${dimension} rounded-md border ${borderColor} bg-slate-900 text-slate-100 shadow-sm transition-transform active:scale-95 flex items-center justify-center overflow-hidden`}
      >
        <img
          src={ultImageUrl}
          alt="Ult"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={`absolute inset-0 border-2 ${
            isOnCooldown ? `${borderColor}/80` : "border-slate-500/40"
          } rounded-md`}
        />
        {isOnCooldown && (
          <svg
            className="pointer-events-none absolute inset-1 text-black/80"
            viewBox="0 0 36 36"
          >
            <circle
              className="text-black/40"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              cx="18"
              cy="18"
              r="15.5"
            />
            <circle
              className={circleColor}
              stroke="currentColor"
              strokeWidth="3.5"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15.5}
              strokeDashoffset={2 * Math.PI * 15.5 * (1 - progress)}
              cx="18"
              cy="18"
              r="15.5"
            />
          </svg>
        )}
        {isOnCooldown && (
          <div className="relative flex flex-col items-center justify-center gap-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <span className={`font-semibold ${textSize}`}>
              {ultData?.remaining}
            </span>
          </div>
        )}
        {isOnCooldown && <div className="absolute inset-0 bg-black/60" />}
        {isOnCooldown && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-1.5 ${barColor}`}
          />
        )}
        {!isOnCooldown && (
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${barColor}`} />
        )}
      </button>
    </div>
  );
}
