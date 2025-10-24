// src/types/bank.ts
export type BankId = "alfa" | "tinkoff" | "tochka" | "vtb" | "modulbank";

export interface Bank {
  coeffs: any;
  id: BankId;
  name: string; // "Альфа-Банк"
  plan: string; // "Бизнес", "Старт", "Гибкий" и т.п.
  logo?: string; // можно переопределить путь к svg, иначе берём из /logos/<id>.svg
  fees: {
    monthly: number | string; // 0–1200 ₽ и т.п.
    toOthers: string; // 0–39 ₽ и т.п.
    acquiring: string; // от 1.3% и т.п.
  };
}
