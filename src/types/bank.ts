// ---- формы регистрации ----
export type OrgType = "ip" | "ooo";

// ---- правила для расчёта ----
export interface PercentTier {
  upTo?: number;
  rate: number;
}
export interface PercentRule {
  freeAmount?: number; // сколько ₽ бесплатно в месяц
  tiers: PercentTier[]; // диапазоны ставок; последняя может быть без upTo = "до бесконечности"
}

export interface PerPaymentRule {
  price: number; // ₽ за платёж
  freeCount?: number; // бесплатных платежей в месяц
}

// ---- тариф ----
export interface Tariff {
  id: string; // "start" / "nachalo" / ...
  name: string; // "Старт"
  for: OrgType[]; // ["ip","ooo"] или ["ip"]
  monthly: number; // абонплата ₽/мес
  payments: PerPaymentRule; // стоимость b2b-платежей
  withdrawal: PercentRule; // вывод на карту
  deposit: PercentRule; // внесение наличных
  link?: string; // прямая ссылка «Открыть счёт»
}

// ---- ваши старые типы банка (оставляем) ----
export type BankId = "alfa" | "tinkoff" | "tochka" | "vtb" | "modulbank";

export interface Bank {
  id: BankId;
  name: string;
  plan: string;
  logo?: string;
  domain: string;
  fees: { monthly: number | string; toOthers: string; acquiring: string };
  coeffs: any;

  // НОВОЕ: тарифы для калькулятора V2
  tariffs?: Tariff[];

  // опционально оставляем ссылки
  links?: { label: string; href?: string; urlBase?: string; mode?: string }[];
}
