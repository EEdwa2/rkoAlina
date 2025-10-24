// Идентификаторы банков, совпадают с именами файлов в /public/logos/*.svg
export type BankId = "alfa" | "tinkoff" | "tochka" | "vtb" | "modulbank";

// База реферальных ссылок. Хвост берём из env (например, ?ref=....)
const REF = import.meta.env.VITE_REF ?? "";

/** База ссылок по банкам (без хвоста). Заполни своими. */
export const LINK_BASE: Record<BankId, string> = {
  alfa: "https://alfa.me/yabWTq",
  tinkoff: "https://www.tinkoff.ru/business/rko/",
  tochka: "https://tochka.com/business/",
  vtb: "https://www.vtb.ru/small-business/",
  modulbank: "https://modulbank.ru/rko",
};

/** Локальный путь до svg-лого в public/logos */
export const logoLocal = (id: BankId) => `/logos/${id}.svg`;

/** Источник логотипа: если в данных есть абсолютный url — используем его, иначе — локальный svg */
export function getLogoSrc(id: BankId, logoFromData?: string | null): string {
  if (logoFromData && /^https?:\/\//i.test(logoFromData)) return logoFromData;
  return logoLocal(id);
}

/** Реферальная ссылка для банка с подставленным хвостом */
export function getRefLink(id: BankId, tail?: string): string {
  const base = LINK_BASE[id];
  const extra = (tail ?? REF) || "";
  return base ? `${base}${extra}` : "#";
}
