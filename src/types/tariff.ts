export type OrgType = "ip" | "ooo";

/** Стоимость b2b-платежей: либо бесплатно, либо X ₽ за платёж с бесплатным лимитом. */
export type PerPaymentRule =
  | { type: "free" }
  | { type: "per"; rub: number; freeUpTo?: number };

/** Процентное правило (например, 1.3% с минималкой). */
export type PercentRule = {
  pct: number; // 0.013 = 1.3%
  minRub?: number; // минимальная комиссия за операцию, опционально
};

export interface Tariff {
  id: string; // "start", "nachalo", ...
  name: string; // "Старт"
  description?: string; // ← НОВОЕ: описание тарифа. Если его нет — просто оставляем пустым.
  for: OrgType[]; // ["ip","ooo"] или ["ip"]
  monthly: number; // абонплата ₽/мес
  payments: PerPaymentRule; // стоимость b2b-платежей
  withdrawal: PercentRule; // вывод на карту (проценты)
  deposit: PercentRule; // внесение наличных (проценты)
  link?: string; // ссылка "Открыть счёт"
}

export type BankTariffs = {
  bankId: "tinkoff" | "tochka" | "modulbank" | "alfa"; // под ваши лого
  bankName: string;
  tariffs: Tariff[];
};
