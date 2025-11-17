export type SpellId =
  | "flash"
  | "ignite"
  | "teleport"
  | "exhaust"
  | "heal"
  | "ghost"
  | "barrier"
  | "cleanse"
  | "smite";

export type Spell = {
  id: SpellId;
  name: string;
  abbreviation: string;
  cooldown: number;
  iconSrc: string;
};

export type RoleId = "top" | "jungle" | "mid" | "adc" | "support";

export type SpellState = {
  spellId: SpellId;
  endTime: number | null;
};

export type RoleSlot = {
  id: RoleId;
  label: string;
  spell1: SpellState;
  spell2: SpellState;
  championId?: string | null;
  ultLastClickTime?: number | null;
  ultRankMode?: "auto" | "manual";
  ultRankManual?: number;
};
