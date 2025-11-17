"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ROLE_ICONS } from "../constants";
import type { RoleSlot } from "../types";
import type { ChampionSummary } from "./ChampionPicker";
import { SpellButton } from "./SpellButton";
import { UltButton } from "./UltButton";

type RoleCardProps = {
  slot: RoleSlot;
  now: number;
  size: "large" | "small";
  onToggleSpell: (spellKey: "spell1" | "spell2") => void;
  onSelectHighlight?: () => void;
  isHighlighted?: boolean;
  champion?: ChampionSummary | null;
  onToggleUlt?: () => void;
};

export function RoleCard({
  slot,
  now,
  size,
  onToggleSpell,
  onSelectHighlight,
  isHighlighted,
  champion,
  onToggleUlt,
}: RoleCardProps) {
  const ultData = useMemo(() => {
    if (
      !champion?.ultCooldowns ||
      champion.ultCooldowns.length === 0 ||
      !slot.ultLastClickTime
    ) {
      return null;
    }

    const ultCooldowns = champion.ultCooldowns;
    const maxCd = Math.max(...ultCooldowns);
    const elapsedMs = now - slot.ultLastClickTime;
    const elapsed = Math.max(0, Math.floor(elapsedMs / 1000));

    let rankCD: number;
    let rankLabel: string;
    let remaining: number;
    let status: "down" | "maybe" | "up";

    if (slot.ultRankMode === "manual" && slot.ultRankManual) {
      // Modo manual: countdown fixo baseado no nível escolhido
      const idx = Math.min(slot.ultRankManual - 1, ultCooldowns.length - 1);
      rankCD = ultCooldowns[idx];
      rankLabel = `R${slot.ultRankManual}`;
      remaining = Math.max(0, Math.ceil(rankCD - elapsed));
      // No modo manual, status é simples: down se ainda não passou o CD, up se passou
      status = elapsed < rankCD ? "down" : "up";
    } else {
      // Modo auto: countdown do maior CD com lógica de status
      remaining = Math.max(0, Math.ceil(maxCd - elapsed));
      const possibleRanks = ultCooldowns
        .map((cd, idx) => ({ cd, rank: idx + 1 }))
        .filter((r) => elapsed >= r.cd);
      if (possibleRanks.length > 0) {
        const best = possibleRanks[possibleRanks.length - 1];
        rankCD = best.cd;
        rankLabel = `R${best.rank}`;
      } else {
        rankCD = ultCooldowns[0];
        rankLabel = "R1";
      }

      if (elapsed < rankCD) {
        status = "down";
      } else if (elapsed >= maxCd) {
        status = "up";
      } else {
        status = "maybe";
      }
    }

    return { remaining, elapsed, maxCd, rankCD, rankLabel, status };
  }, [
    champion,
    slot.ultLastClickTime,
    slot.ultRankMode,
    slot.ultRankManual,
    now,
  ]);

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border ${
        isHighlighted
          ? "border-2 border-yellow-400/90 shadow-[0_0_25px_rgba(250,204,21,0.35)]"
          : "border-slate-600/80"
      } bg-slate-900/80 p-2 shadow-md`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full border border-slate-600 bg-slate-900">
            <Image
              src={ROLE_ICONS[slot.id]}
              alt={slot.label}
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>
          {champion && (
            <div className="relative h-6 w-6 overflow-hidden rounded border border-slate-600 bg-slate-900">
              <img
                src={champion.imageUrl}
                alt={champion.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
        {onSelectHighlight && (
          <button
            type="button"
            onClick={onSelectHighlight}
            className="text-[10px] uppercase tracking-wide text-slate-400 hover:text-yellow-400"
          >
            Focus
          </button>
        )}
      </div>
      <div className="flex items-center justify-around gap-3">
        <SpellButton
          state={slot.spell1}
          size={size}
          now={now}
          onToggle={() => onToggleSpell("spell1")}
        />
        <SpellButton
          state={slot.spell2}
          size={size}
          now={now}
          onToggle={() => onToggleSpell("spell2")}
        />
        {champion &&
          champion.ultCooldowns &&
          champion.ultCooldowns.length > 0 &&
          onToggleUlt && (
            <UltButton
              ultData={ultData}
              ultImageUrl={champion.ultImageUrl}
              ultCooldowns={champion.ultCooldowns}
              size={size}
              onToggle={onToggleUlt}
            />
          )}
      </div>
    </div>
  );
}
