import type { BankId } from "../types/bank";
import type { Tariff } from "../types/tariff";
import { r } from "../utils/tariffMath";

/**
 * Нормализованный справочник тарифов.
 * Ключ — id банка из banks.json, значение — массив тарифов Tariff[].
 * В примере ниже значения условные — ты можешь их поправить по реальным данным,
 * но ВАЖНО сохранить тип: Record<BankId, Tariff[]>
 */
export const tariffsByBank: Record<BankId, Tariff[]> = {
  // Т-Банк (бывш. Тинькофф) — id "tinkoff"
  tinkoff: [
    {
      id: "nachalo",
      name: "Начало",
      for: ["ip", "ooo"],
      monthly: 700,
      payments: r.free(), // переводы юр. лицам — бесплатно
      withdrawal: r.pct(1.3), // вывод на карту — ~1.3%
      deposit: r.pct(0.2), // внесение наличных — ~0.2%
      // link: (необязательно — можно добавить из своего справочника реф. ссылок)
    },
    {
      id: "start",
      name: "Старт",
      for: ["ip", "ooo"],
      monthly: 990,
      payments: r.per(19, 39), // по 19 ₽, первые ~39 платежей/мес
      withdrawal: r.pct(1.3),
      deposit: r.pct(0.2),
    },
  ],

  // Точка — id "tochka"
  tochka: [
    {
      id: "nachalo",
      name: "Начало",
      for: ["ip", "ooo"],
      monthly: 700,
      payments: r.free(),
      withdrawal: r.pct(1.3),
      deposit: r.pct(0.1),
    },
  ],

  // Модульбанк — id "modulbank"
  modulbank: [
    {
      id: "base",
      name: "Базовый",
      for: ["ip", "ooo"],
      monthly: 0,
      payments: r.per(29, 10),
      withdrawal: r.pct(1.6),
      deposit: r.pct(0.3),
    },
  ],

  // Альфа-Банк — id "alfa"
  alfa: [
    {
      id: "lite",
      name: "Лайт",
      for: ["ip", "ooo"],
      monthly: 0,
      payments: r.per(29, 5),
      withdrawal: r.pct(1.4),
      deposit: r.pct(0.25),
    },
  ],

  // ВТБ — id "vtb" (если хочешь скрыть — просто не выводи его на этапе рендера)
  vtb: [
    {
      id: "start",
      name: "Старт",
      for: ["ip", "ooo"],
      monthly: 0,
      payments: r.per(25, 5),
      withdrawal: r.pct(1.3),
      deposit: r.pct(0.25),
    },
  ],
} as const;
