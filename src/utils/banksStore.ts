import fallback from "../data/banks.json";

// Где держим актуальные данные.
// Можно указать свой источник в .env: VITE_BANKS_URL=https://.../banks.json
const REMOTE_URL = import.meta.env.VITE_BANKS_URL || "/data/banks.json";
const LS_KEY = "banksCacheV1";

export type Banks = typeof fallback;

function parseBanks(x: unknown): Banks {
  // минимальная валидация структуры
  if (Array.isArray(x)) return x as Banks;
  throw new Error("Bad banks payload");
}

export async function fetchBanksFresh(): Promise<Banks> {
  try {
    const r = await fetch(REMOTE_URL, { cache: "no-cache" });
    if (!r.ok) throw new Error(String(r.status));
    const json = await r.json();
    const data = parseBanks(json);
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch (e) {
    // пробуем кеш
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const cached = JSON.parse(raw) as { ts: number; data: Banks };
        return cached.data;
      } catch {}
    }
    // запасной вариант — локальный бандл
    return fallback as Banks;
  }
}

// Хук: отдаёт банки и следит за полуночью (обновит заголовки/данные)
import { useEffect, useState } from "react";
import { onMidnight } from "./date";

export function useBanks() {
  const [banks, setBanks] = useState<Banks>(fallback as Banks);

  const load = async () => {
    const data = await fetchBanksFresh();
    setBanks(data);
  };

  useEffect(() => {
    load();
    return onMidnight(load);
  }, []);

  return banks;
}
