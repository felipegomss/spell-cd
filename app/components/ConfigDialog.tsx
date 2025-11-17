"use client";

import Image from "next/image";
import { ROLE_ICONS, SPELLS } from "../constants";
import type { RoleId, RoleSlot, SpellId } from "../types";
import type { ChampionSummary } from "./ChampionPicker";
import { ChampionPicker } from "./ChampionPicker";

type ConfigDialogProps = {
  isOpen: boolean;
  slots: RoleSlot[];
  champions: ChampionSummary[];
  activeRoleId: RoleId;
  onClose: () => void;
  onResetAll: () => void;
  onSetActiveRole: (roleId: RoleId) => void;
  onUpdateSlot: (roleId: RoleId, updates: Partial<RoleSlot>) => void;
};

export function ConfigDialog({
  isOpen,
  slots,
  champions,
  activeRoleId,
  onClose,
  onResetAll,
  onSetActiveRole,
  onUpdateSlot,
}: ConfigDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Configuração de Spells
            </h2>
            <p className="text-[11px] text-slate-400">
              Ajuste rapidamente as spells dos 5 oponentes. Os tempos de
              cooldown usam os valores padrão de cada spell.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetAll}
              className="rounded-md px-2 py-1 text-[10px] text-red-300 hover:bg-red-900/40"
            >
              Limpar tudo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1 text-xs">
          <div className="grid gap-3 md:grid-cols-2">
            {[...slots]
              .sort((a, b) =>
                a.id === activeRoleId ? -1 : b.id === activeRoleId ? 1 : 0
              )
              .map((slot) => {
                const isActive = slot.id === activeRoleId;
                return (
                  <div
                    key={slot.id}
                    className={`flex flex-col gap-2 rounded-lg border p-3 ${
                      isActive
                        ? "md:col-span-2 border-yellow-400/80 bg-slate-900 shadow-[0_0_18px_rgba(250,204,21,0.35)]"
                        : "border-slate-700 bg-slate-950/60"
                    }`}
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
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                          {slot.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSetActiveRole(slot.id)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          isActive
                            ? "bg-yellow-400 text-black"
                            : "border border-slate-600 bg-slate-900 text-slate-300 hover:border-yellow-400/70 hover:text-yellow-300"
                        }`}
                      >
                        {isActive ? "Destaque" : "Focar"}
                      </button>
                    </div>

                    <div className="mt-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          Champion
                        </span>
                        <ChampionPicker
                          champions={champions}
                          value={slot.championId ?? null}
                          onChange={(id) =>
                            onUpdateSlot(slot.id, { championId: id })
                          }
                          roleLabel={slot.label}
                        />
                      </div>

                      {(() => {
                        const champ = champions.find(
                          (c) => c.id === slot.championId
                        );
                        if (!champ) return null;

                        const cds = champ.ultCooldowns;
                        const cdsLabel =
                          cds && cds.length > 0 ? cds.join(" / ") + "s" : "-";

                        const mode = slot.ultRankMode ?? "auto";
                        const manualRank = slot.ultRankManual ?? 1;

                        return (
                          <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[160px]">
                                R: {champ.ultName}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span>{cdsLabel}</span>
                            </div>
                            {cds && cds.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="uppercase tracking-wide text-slate-500">
                                  Modo
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateSlot(slot.id, {
                                        ultRankMode: "auto",
                                        ultLastClickTime: null,
                                      })
                                    }
                                    className={`rounded px-2 py-0.5 text-[10px] ${
                                      mode === "auto"
                                        ? "bg-yellow-400 text-black"
                                        : "border border-slate-600 bg-slate-900 text-slate-200 hover:border-yellow-400/70 hover:text-yellow-300"
                                    }`}
                                  >
                                    Auto
                                  </button>
                                  {cds.map((_, idx) => {
                                    const lvl = idx + 1;
                                    const active =
                                      mode === "manual" && manualRank === lvl;
                                    return (
                                      <button
                                        key={lvl}
                                        type="button"
                                        onClick={() =>
                                          onUpdateSlot(slot.id, {
                                            ultRankMode: "manual",
                                            ultRankManual: lvl,
                                            ultLastClickTime: null,
                                          })
                                        }
                                        className={`rounded px-2 py-0.5 text-[10px] ${
                                          active
                                            ? "bg-yellow-400 text-black"
                                            : "border border-slate-600 bg-slate-900 text-slate-200 hover:border-yellow-400/70 hover:text-yellow-300"
                                        }`}
                                      >
                                        R{lvl}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          Spell 1
                        </span>
                        <select
                          className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          value={slot.spell1.spellId}
                          onChange={(e) => {
                            const value = e.target.value as SpellId;
                            onUpdateSlot(slot.id, {
                              spell1: { spellId: value, endTime: null },
                            });
                          }}
                        >
                          {Object.values(SPELLS).map((spell) => (
                            <option key={spell.id} value={spell.id}>
                              {spell.name} ({spell.cooldown}s)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          Spell 2
                        </span>
                        <select
                          className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          value={slot.spell2.spellId}
                          onChange={(e) => {
                            const value = e.target.value as SpellId;
                            onUpdateSlot(slot.id, {
                              spell2: { spellId: value, endTime: null },
                            });
                          }}
                        >
                          {Object.values(SPELLS).map((spell) => (
                            <option key={spell.id} value={spell.id}>
                              {spell.name} ({spell.cooldown}s)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
