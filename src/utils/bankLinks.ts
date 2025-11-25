// src/utils/bankLinks.ts

/** Идентификаторы банков. Соответствуют именам svg в /public/logos/*.svg */
export type BankId = "alfa" | "tinkoff" | "tochka" | "vtb" | "modulbank";

/** Хвост из env (например: ref=ID&utm_source=rko). Можно пустой. */
const REF = (import.meta.env.VITE_REF ?? "").trim();

/** База ссылок по банкам (BASE-URL). Можно указывать уже с query-параметрами. */
export const LINK_BASE: Record<BankId, string> = {
  // действующие реф-ссылки:
  modulbank: "https://partner.modulbank.ru/r/YXvAFdhlhxJB",
  alfa: "https://alfa.link/a3wetf",
  tochka: "https://partner.tochka.com?referer1=344202107903",
  tinkoff: "https://t-cpa.ru/1P5RZh",

  // базовый URL без реф-хвоста:
  vtb: "https://www.vtb.ru/small-business/",
};

/** Локальный путь до svg-лого в /public/logos */
export const logoLocal = (id: BankId) => `/logos/${id}.svg`;

/** Источник логотипа: если в данных есть абсолютный URL — используем его, иначе — локальный svg */
export function getLogoSrc(id: BankId, logoFromData?: string | null): string {
  if (logoFromData && /^https?:\/\//i.test(logoFromData)) return logoFromData;
  return logoLocal(id);
}

/* ===================== helpers ===================== */

/** Корректно склеивает base и tail: подставляет ? или &, допускает хвост с префиксом ?/& */
function joinWithTail(base: string, tail: string): string {
  const cleanBase = base.trim();
  const cleanTail = tail.trim();
  if (!cleanTail) return cleanBase;

  // Если хвост уже начинается с ? или &, просто конкатенируем
  if (/^[?&]/.test(cleanTail)) return cleanBase + cleanTail;

  // Иначе подберём разделитель
  const sep = cleanBase.includes("?") ? "&" : "?";
  return `${cleanBase}${sep}${cleanTail}`;
}

/** Добавляет кликовый суб-идентификатор (для тестов и трекинга в партнёрках) */
function withSubId(url: string): string {
  // Ключ для партнёрки: по умолчанию "sub", можно переопределить VITE_SUB_KEY
  const key = (import.meta.env.VITE_SUB_KEY ?? "sub").trim();
  // Простой уникальный маркер клика
  const value = Date.now().toString(36);
  return joinWithTail(
    url,
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  );
}

/* ===================== public API ===================== */

/**
 * Реферальная ссылка для банка.
 * - base берём из LINK_BASE
 * - хвост: приоритет у явно переданного tail, затем VITE_REF (если задан)
 * - аккуратно склеиваем c учётом ?/&
 * - опционально добавляем subid, если VITE_ADD_SUBID=true
 */
export function getRefLink(id: BankId, tail?: string): string {
  const base = LINK_BASE[id];
  if (!base) return "#";

  const extra = (tail ?? REF) || "";
  let url = joinWithTail(base, extra);

  if (String(import.meta.env.VITE_ADD_SUBID ?? "").toLowerCase() === "true") {
    url = withSubId(url);
  }

  if (import.meta.env.DEV) {
    // Удобно видеть итог, пока разворачиваем
    // eslint-disable-next-line no-console
    console.debug("[ref-link]", id, url);
  }

  return url;
}
