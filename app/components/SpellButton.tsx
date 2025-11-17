"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { SPELLS } from "../constants";
import type { SpellState } from "../types";

type SpellButtonProps = {
  state: SpellState;
  size: "large" | "small";
  now: number;
  onToggle: () => void;
};

export function SpellButton({ state, size, now, onToggle }: SpellButtonProps) {
  const spell = SPELLS[state.spellId];
  const baseSeconds = spell.cooldown;
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const remainingSeconds = useMemo(() => {
    if (!state.endTime) return 0;
    const diff = Math.ceil((state.endTime - now) / 1000);
    if (diff <= 0) return 0;
    return diff;
  }, [state.endTime, now]);

  const isOnCooldown = remainingSeconds > 0;

  const dimension = size === "large" ? "w-20 h-20" : "w-16 h-16";
  const textSize = size === "large" ? "text-xl" : "text-sm";

  const progress = isOnCooldown
    ? Math.min(1, Math.max(0, remainingSeconds / baseSeconds))
    : 0;

  // Determinar cor baseado no tempo restante
  const progressPercent = isOnCooldown ? remainingSeconds / baseSeconds : 0;
  let borderColor = "border-slate-600";
  let barColor = "bg-emerald-400/70";
  let circleColor = "text-yellow-300";

  if (isOnCooldown) {
    if (progressPercent > 0.1) {
      // Mais de 10% restante - vermelho (certeza que está em CD)
      borderColor = "border-red-500";
      barColor = "bg-red-400/80";
      circleColor = "text-red-300";
    } else {
      // Últimos 10% - amarelo (pode estar up com runa)
      borderColor = "border-yellow-400";
      barColor = "bg-yellow-400/80";
      circleColor = "text-yellow-300";
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
    <button
      type="button"
      onClick={handleClick}
      className={`relative ${dimension} rounded-md border ${borderColor} bg-slate-900 text-slate-100 shadow-sm transition-transform active:scale-95 flex items-center justify-center overflow-hidden`}
    >
      <Image
        src={spell.iconSrc}
        alt={spell.name}
        fill
        sizes="80px"
        className="object-cover"
        priority={false}
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
            {remainingSeconds}
          </span>
        </div>
      )}
      {isOnCooldown && <div className="absolute inset-0 bg-black/60" />}
      {isOnCooldown && (
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${barColor}`} />
      )}
      {!isOnCooldown && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${barColor}`} />
      )}
    </button>
  );
}
