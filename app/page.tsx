"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfigDialog } from "./components/ConfigDialog";
import { RoleCard } from "./components/RoleCard";
import { INITIAL_SLOTS, SPELLS } from "./constants";
import { useChampions } from "./hooks/useChampions";
import { useIsLandscape } from "./hooks/useIsLandscape";
import { useNow } from "./hooks/useNow";
import type { RoleId, RoleSlot, SpellState } from "./types";

export default function Home() {
  const [slots, setSlots] = useState<RoleSlot[]>(() => INITIAL_SLOTS);
  const [activeRoleId, setActiveRoleId] = useState<RoleId>("mid");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const isLandscape = useIsLandscape();
  const now = useNow(200);
  const { champions, loading: championsLoading } = useChampions();

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("spells-cd-slots-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as RoleSlot[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setSlots(parsed);
    } catch {
      // ignore invalid storage
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("spells-cd-slots-v1", JSON.stringify(slots));
    } catch {
      // ignore
    }
  }, [slots]);

  const activeSlot = useMemo(
    () => slots.find((slot) => slot.id === activeRoleId) ?? slots[0],
    [slots, activeRoleId]
  );

  const secondarySlots = useMemo(
    () => slots.filter((slot) => slot.id !== activeSlot.id),
    [slots, activeSlot.id]
  );

  const handleToggleSpell = (roleId: RoleId, spellKey: "spell1" | "spell2") => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== roleId) return slot;

        const currentState = slot[spellKey];
        const spell = SPELLS[currentState.spellId];

        const nowMs = Date.now();
        const isRunning =
          !!currentState.endTime && currentState.endTime > nowMs;

        const nextState: SpellState = {
          spellId: currentState.spellId,
          endTime: isRunning ? null : nowMs + spell.cooldown * 1000,
        };

        return {
          ...slot,
          [spellKey]: nextState,
        };
      })
    );
  };

  const handleToggleUlt = (roleId: RoleId) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== roleId) return slot;

        const champ = champions.find((c) => c.id === slot.championId);
        if (!champ || !champ.ultCooldowns || champ.ultCooldowns.length === 0) {
          return slot;
        }

        const nowMs = Date.now();

        // Verificar se está realmente em cooldown
        let isRunning = false;
        if (slot.ultLastClickTime) {
          const elapsed = Math.floor((nowMs - slot.ultLastClickTime) / 1000);
          const maxCd = Math.max(...champ.ultCooldowns);

          if (slot.ultRankMode === "manual" && slot.ultRankManual) {
            const idx = Math.min(
              slot.ultRankManual - 1,
              champ.ultCooldowns.length - 1
            );
            const rankCD = champ.ultCooldowns[idx];
            isRunning = elapsed < rankCD;
          } else {
            isRunning = elapsed < maxCd;
          }
        }

        return {
          ...slot,
          ultLastClickTime: isRunning ? null : nowMs,
        };
      })
    );
  };

  const handleResetAll = () => {
    setSlots(INITIAL_SLOTS);
    setActiveRoleId("mid");
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("spells-cd-slots-v1");
      } catch {
        // ignore
      }
    }
  };

  const handleUpdateSlot = (roleId: RoleId, updates: Partial<RoleSlot>) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === roleId ? { ...slot, ...updates } : slot))
    );
  };

  const portraitLayout = (
    <div className="flex w-full max-w-md flex-col gap-3">
      {slots.map((slot) => {
        const champ = champions.find((c) => c.id === slot.championId) ?? null;
        return (
          <RoleCard
            key={slot.id}
            slot={slot}
            now={now}
            size="large"
            onToggleSpell={(spellKey) => handleToggleSpell(slot.id, spellKey)}
            onSelectHighlight={() => setActiveRoleId(slot.id)}
            isHighlighted={slot.id === activeRoleId}
            champion={champ}
            onToggleUlt={
              champ && champ.ultCooldowns.length > 0
                ? () => handleToggleUlt(slot.id)
                : undefined
            }
          />
        );
      })}
    </div>
  );

  const landscapeLayout = (
    <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center gap-2">
      <div className="flex justify-center">
        {(() => {
          const champ =
            champions.find((c) => c.id === activeSlot.championId) ?? null;
          return (
            <RoleCard
              slot={activeSlot}
              now={now}
              size="large"
              onToggleSpell={(spellKey) =>
                handleToggleSpell(activeSlot.id, spellKey)
              }
              onSelectHighlight={undefined}
              isHighlighted
              champion={champ}
              onToggleUlt={
                champ && champ.ultCooldowns.length > 0
                  ? () => handleToggleUlt(activeSlot.id)
                  : undefined
              }
            />
          );
        })()}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {secondarySlots.map((slot) => {
          const champ = champions.find((c) => c.id === slot.championId) ?? null;
          return (
            <RoleCard
              key={slot.id}
              slot={slot}
              now={now}
              size="large"
              onToggleSpell={(spellKey) => handleToggleSpell(slot.id, spellKey)}
              onSelectHighlight={() => setActiveRoleId(slot.id)}
              isHighlighted={slot.id === activeRoleId}
              champion={champ}
              onToggleUlt={
                champ && champ.ultCooldowns.length > 0
                  ? () => handleToggleUlt(slot.id)
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <main className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center px-2 py-2">
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 shadow-sm hover:bg-slate-700"
          >
            Info
          </button>
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 shadow-sm hover:bg-slate-700"
          >
            Config
          </button>
        </div>

        <section className="flex h-full w-full items-center justify-center">
          {isLandscape ? landscapeLayout : portraitLayout}
        </section>

        <ConfigDialog
          isOpen={isConfigOpen}
          slots={slots}
          champions={champions}
          activeRoleId={activeRoleId}
          onClose={() => setIsConfigOpen(false)}
          onResetAll={handleResetAll}
          onSetActiveRole={setActiveRoleId}
          onUpdateSlot={handleUpdateSlot}
        />

        {isInfoOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                  Como Usar
                </h2>
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(false)}
                  className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Fechar
                </button>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <h3 className="mb-1 font-semibold text-yellow-400">
                    ⚙️ Configuração
                  </h3>
                  <p className="text-slate-400">
                    Clique em <span className="text-yellow-400">Config</span>{" "}
                    para selecionar champions e spells de cada oponente. Escolha
                    o modo da ult: <span className="text-yellow-400">Auto</span>{" "}
                    (mostra todas as possibilidades com cores) ou
                    <span className="text-yellow-400"> R1/R2/R3</span> (nível
                    fixo se você souber).
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-yellow-400">
                    🎯 Durante o Jogo
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-400">
                    <li>
                      <span className="text-yellow-400">1 clique</span> em
                      spell/ult → Inicia countdown
                    </li>
                    <li>
                      <span className="text-yellow-400">2 cliques rápidos</span>{" "}
                      em spell/ult → Cancela countdown
                    </li>
                    <li>
                      <span className="text-yellow-400">Botão Focus</span> →
                      Muda qual oponente fica em destaque
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-yellow-400">
                    🎨 Cores
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-300">
                        Spells:
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-slate-400">
                        <li>
                          <span className="text-red-400">Vermelho</span> →
                          Certeza que está em cooldown
                        </li>
                        <li>
                          <span className="text-yellow-400">Amarelo</span> →
                          Últimos 10% (pode ter runa de CD)
                        </li>
                        <li>
                          <span className="text-emerald-400">Verde</span> →
                          Voltou
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-300">
                        Ult (Modo Auto):
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-slate-400">
                        <li>
                          <span className="text-red-400">Vermelho</span> →
                          Certeza que está em cooldown
                        </li>
                        <li>
                          <span className="text-yellow-400">Amarelo</span> →
                          Pode estar up (depende do nível)
                        </li>
                        <li>
                          <span className="text-emerald-400">Verde</span> →
                          Certeza que já voltou
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-yellow-400">
                    💾 Salvamento
                  </h3>
                  <p className="text-slate-400">
                    Suas configurações são salvas automaticamente. Use{" "}
                    <span className="text-red-400">Limpar tudo</span> no Config
                    para resetar entre partidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
