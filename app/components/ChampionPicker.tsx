"use client";

import { useMemo, useState } from "react";

export type ChampionSummary = {
  id: string;
  name: string;
  imageUrl: string;
  ultName: string;
  ultCooldowns: number[];
  ultImageUrl: string;
  tags: string[];
};

type ChampionPickerProps = {
  champions: ChampionSummary[];
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  roleLabel: string;
};

export function ChampionPicker({
  champions,
  value,
  onChange,
  roleLabel,
}: ChampionPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [search, setSearch] = useState("");

  const tags = useMemo(
    () => ["All", "Assassin", "Fighter", "Mage", "Marksman", "Tank", "Support"],
    []
  );

  const current = useMemo(
    () => champions.find((c) => c.id === value) ?? null,
    [champions, value]
  );

  const filtered = useMemo(
    () =>
      champions.filter((c) => {
        const matchesTag =
          selectedTag === "All" || c.tags.includes(selectedTag);
        const matchesSearch =
          !search.trim() ||
          c.name.toLowerCase().includes(search.trim().toLowerCase());
        return matchesTag && matchesSearch;
      }),
    [champions, selectedTag, search]
  );

  return (
    <div className="inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded border border-slate-600 bg-slate-800">
            {current ? (
              <img
                src={current.imageUrl}
                alt={current.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-500">
                ?
              </div>
            )}
          </div>
          <span className="max-w-[120px] truncate">
            {current ? current.name : "Selecionar champion"}
          </span>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
                  Selecionar Champion  {roleLabel}
                </span>
                <span className="text-[10px] text-slate-500">
                  Filtre por funo ou busque pelo nome.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      tag === selectedTag
                        ? "bg-yellow-400 text-black"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-48">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar campeo..."
                  className="h-7 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
              {filtered.map((champ) => (
                <button
                  key={champ.id}
                  type="button"
                  onClick={() => {
                    onChange(champ.id);
                    setOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-md bg-slate-800/70 p-1 text-[9px] text-slate-100 hover:bg-slate-700"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded border border-slate-600">
                    <img
                      src={champ.imageUrl}
                      alt={champ.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="line-clamp-1 text-center">{champ.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
