import { useEffect, useState } from "react";
import type { ChampionSummary } from "../components/ChampionPicker";

const DDRAGON_VERSION = "14.23.1";

type ChampionFetchState = {
  champions: ChampionSummary[];
  loading: boolean;
  error: string | null;
};

export function useChampions(): ChampionFetchState {
  const [state, setState] = useState<ChampionFetchState>({
    champions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/championFull.json`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const data = json.data as Record<string, any>;

        const champions: ChampionSummary[] = Object.values(data).map(
          (champ: any) => {
            const ult =
              Array.isArray(champ.spells) && champ.spells.length > 3
                ? champ.spells[3]
                : null;

            const ultImageKey = ult?.image?.full ?? `${champ.id}R.png`;
            return {
              id: champ.id as string,
              name: champ.name as string,
              imageUrl: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champ.id}.png`,
              ultName: ult?.name ?? "Ult",
              ultCooldowns: Array.isArray(ult?.cooldown)
                ? (ult.cooldown as number[])
                : [],
              ultImageUrl: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${ultImageKey}`,
              tags: Array.isArray(champ.tags) ? (champ.tags as string[]) : [],
            };
          }
        );

        champions.sort((a, b) => a.name.localeCompare(b.name));

        if (!cancelled) {
          setState({ champions, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            champions: [],
            loading: false,
            error: "Erro ao carregar campeões",
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
