import type { PercentRule, PerPaymentRule } from "../types/tariff";

/** Комиссия за B2B-платежи */
export function feeByPayments(n: number, rule: PerPaymentRule): number {
  if (n <= 0) return 0;
  if (rule.type === "free") return 0;
  const free = rule.freeUpTo ?? 0;
  const paid = Math.max(0, Math.floor(n) - free);
  return paid * rule.rub;
}

/** Комиссии по процентным правилам (вывод/внесение) */
export function feeByPercentRule(amount: number, rule: PercentRule): number {
  if (amount <= 0) return 0;
  const fee = amount * rule.pct;
  return Math.max(fee, rule.minRub ?? 0);
}

/** Удобные конструкторы (опционально) */
export const r = {
  per: (rub: number, freeUpTo?: number): PerPaymentRule => ({
    type: "per",
    rub,
    freeUpTo,
  }),
  free: (): PerPaymentRule => ({ type: "free" }),
  pct: (pct: number, minRub?: number): PercentRule => ({ pct, minRub }),
};
