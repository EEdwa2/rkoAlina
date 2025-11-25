import type { CalcInputs, TariffCalcResult } from "../types/calc";
import { getRefLink } from "../utils/bankLinks";

/**
 * Нормализуем числа: NaN / отрицательные → 0.
 */
function norm(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value;
}

/**
 * Округляем до рублей.
 */
function rub(n: number): number {
  return Math.round(n);
}

/**
 * Шаговая комиссия «после FREE за каждые STEP — feePerStep».
 * Пример: «0 ₽ — первые 25 переводов, далее — 59 ₽ за перевод».
 */
function calcStepFee(opts: {
  amount: number;
  free: number;
  step: number;
  feePerStep: number;
}): number {
  const a = norm(opts.amount);
  if (a <= opts.free) return 0;
  const over = a - opts.free;
  const steps = Math.ceil(over / opts.step);
  return rub(steps * opts.feePerStep);
}

/**
 * Прогрессивный процент по диапазонам.
 * ranges: [{ upTo?: number; rate: number }]
 * - upTo — верхняя граница сегмента (если нет — до бесконечности)
 * - rate — ставка на этот сегмент.
 *
 * Используем для:
 *  - сложных «0% до X, Y% до Z, …»
 *  - модульбанка и части Альфы.
 */
type PercentRange = { upTo?: number; rate: number };

function calcPercentRanges(amount: number, ranges: PercentRange[]): number {
  let rest = norm(amount);
  if (rest <= 0) return 0;

  let from = 0;
  let fee = 0;

  for (const r of ranges) {
    const limit = r.upTo ?? Number.POSITIVE_INFINITY;
    if (rest <= 0 || limit <= from) break;

    const chunk = Math.min(rest, limit - from);
    if (chunk > 0 && r.rate > 0) {
      fee += chunk * r.rate;
    }

    rest -= chunk;
    from = limit;
  }

  return rub(fee);
}

/**
 * Специальный helper для Т-Банка по переводу физлицам:
 * выбираем один диапазон по сумме и считаем amount * rate + add.
 */
type TinkoffSegment = { upTo?: number; rate: number; add: number };

function calcTinkoffIndividuals(
  amount: number,
  segments: TinkoffSegment[]
): number {
  const v = norm(amount);
  if (v <= 0) return 0;

  let seg = segments[segments.length - 1];
  for (const s of segments) {
    if (typeof s.upTo === "number" && v <= s.upTo) {
      seg = s;
      break;
    }
  }

  return rub(v * seg.rate + seg.add);
}

/**
 * Общая полная стоимость тарифа в месяц (для сортировки).
 */
function totalCost(t: TariffCalcResult): number {
  return (
    t.monthlyFee +
    t.transfersToLegal +
    t.transfersToIndividuals +
    t.cashHandling
  );
}

/* ========================================================================== */
/*                                АЛЬФА-БАНК                                  */
/* ========================================================================== */

function calcAlfaZero(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  // В таблице обслуживание зависит от «поступлений».
  // Пока считаем минимальный вариант — 0 ₽.
  const monthlyFee = 0;

  const transfersToLegal = calcStepFee({
    amount: payments,
    free: 3,
    step: 1,
    feePerStep: 149,
  });

  // «2% + 149 ₽» на весь объём переводов физлицам в месяц.
  const transfersToIndividuals =
    toIndividuals > 0 ? rub(toIndividuals * 0.02 + 149) : 0;

  // «0% — до 100 000 ₽, 0,4% — свыше 100 000 ₽»
  const cashHandling = calcPercentRanges(cashIn, [
    { upTo: 100_000, rate: 0 },
    { rate: 0.004 },
  ]);

  return {
    bankId: "alfa",
    bankName: "Альфа-Банк",
    tariffId: "alfa-zero",
    tariffName: "Ноль за обслуживание",
    description: "Для начинающего или сезонного бизнеса.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("alfa"),
  };
}

function calcAlfaSimple(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  // В таблице обслуживание = проценты от поступлений.
  // Пока используем фиксированную оценку 5 000 ₽/мес (как в старом описании).
  const monthlyFee = 5_000;

  // «0 ₽» за переводы юр. лицам.
  const transfersToLegal = 0;

  // «0% — до 1 млн ₽, 2,8% — от 1 млн ₽»
  const transfersToIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 1_000_000, rate: 0 },
    { rate: 0.028 },
  ]);

  // «1% — до 750 000 ₽, 2,25% — 750 000 — 2 млн ₽, 3,5% — свыше 2 млн ₽»
  const cashHandling = calcPercentRanges(cashIn, [
    { upTo: 750_000, rate: 0.01 },
    { upTo: 2_000_000, rate: 0.0225 },
    { rate: 0.035 },
  ]);

  return {
    bankId: "alfa",
    bankName: "Альфа-Банк",
    tariffId: "alfa-simple",
    tariffName: "Простой",
    description: "Для обслуживания без лишних условий.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("alfa"),
  };
}

function calcAlfaFastGrowth(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 1_990;

  // «0 ₽ — первые 25 переводов, далее — 59 ₽ за перевод»
  const transfersToLegal = calcStepFee({
    amount: payments,
    free: 25,
    step: 1,
    feePerStep: 59,
  });

  // «0% — до 100 000 ₽, 1,6% + 59 ₽ — от 100 000 ₽»
  const baseIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 100_000, rate: 0 },
    { rate: 0.016 },
  ]);
  const extra59 = toIndividuals > 100_000 ? 59 : 0;
  const transfersToIndividuals = baseIndividuals + extra59;

  // «0% — до 500 000 ₽, 0,2% — свыше 500 000 ₽»
  const cashHandling = calcPercentRanges(cashIn, [
    { upTo: 500_000, rate: 0 },
    { rate: 0.002 },
  ]);

  return {
    bankId: "alfa",
    bankName: "Альфа-Банк",
    tariffId: "alfa-growth",
    tariffName: "Быстрое развитие",
    description: "Для активно развивающегося бизнеса.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("alfa"),
  };
}

function calcAlfaActive(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 3_990;

  // «0 ₽ — первые 50 переводов, далее — 49 ₽ за перевод»
  const transfersToLegal = calcStepFee({
    amount: payments,
    free: 50,
    step: 1,
    feePerStep: 49,
  });

  // «0% — до 200 000 ₽, 1,4% — от 200 000 ₽»
  const transfersToIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 200_000, rate: 0 },
    { rate: 0.014 },
  ]);

  // «0% — до 600 000 ₽, 0,15% — свыше 600 000 ₽»
  const cashHandling = calcPercentRanges(cashIn, [
    { upTo: 600_000, rate: 0 },
    { rate: 0.0015 },
  ]);

  return {
    bankId: "alfa",
    bankName: "Альфа-Банк",
    tariffId: "alfa-active",
    tariffName: "Активные расчёты",
    description: "Для частых расчётов с контрагентами.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("alfa"),
  };
}

/* ========================================================================== */
/*                               Т-БАНК (TINKOFF)                             */
/* ========================================================================== */

function calcTinkoffSimple(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 490;

  // «49 ₽ за операцию»
  const transfersToLegal = payments * 49;

  // «1,5% + 99 ₽ — до 400 000 ₽,
  //   5% + 99 ₽ — до 1 000 000 ₽,
  //   15% + 99 ₽ — от 1 000 000 ₽»
  const transfersToIndividuals = calcTinkoffIndividuals(toIndividuals, [
    { upTo: 400_000, rate: 0.015, add: 99 },
    { upTo: 1_000_000, rate: 0.05, add: 99 },
    { rate: 0.15, add: 99 },
  ]);

  // «до 100 000 ₽/мес. — бесплатно, свыше 100 000 ₽/мес. — 0,3% от суммы»
  const cashHandling = cashIn <= 100_000 ? 0 : rub((cashIn - 100_000) * 0.003);

  return {
    bankId: "tinkoff",
    bankName: "Т-Банк",
    tariffId: "tinkoff-simple",
    tariffName: "Простой",
    description: "Для начинающих предпринимателей.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tinkoff"),
  };
}

function calcTinkoffAdvanced(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 1_990;

  // «29 ₽ за операцию»
  const transfersToLegal = payments * 29;

  // «1% + 79 ₽ — до 400 000 ₽,
  //   5% + 79 ₽ — до 2 000 000 ₽,
  //   15% + 79 ₽ — от 2 000 000 ₽»
  const transfersToIndividuals = calcTinkoffIndividuals(toIndividuals, [
    { upTo: 400_000, rate: 0.01, add: 79 },
    { upTo: 2_000_000, rate: 0.05, add: 79 },
    { rate: 0.15, add: 79 },
  ]);

  // «до 300 000 ₽/мес. — бесплатно, свыше 300 000 ₽/мес. — 0,2% от суммы»
  const cashHandling = cashIn <= 300_000 ? 0 : rub((cashIn - 300_000) * 0.002);

  return {
    bankId: "tinkoff",
    bankName: "Т-Банк",
    tariffId: "tinkoff-advanced",
    tariffName: "Продвинутый",
    description: "Для малого бизнеса с сотрудниками.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tinkoff"),
  };
}

function calcTinkoffPro(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 4_990;

  // «19 ₽ за операцию»
  const transfersToLegal = payments * 19;

  // «1% + 59 ₽ — до 800 000 ₽,
  //   5% + 59 ₽ — до 2 000 000 ₽,
  //   15% + 59 ₽ — от 2 000 000 ₽»
  const transfersToIndividuals = calcTinkoffIndividuals(toIndividuals, [
    { upTo: 800_000, rate: 0.01, add: 59 },
    { upTo: 2_000_000, rate: 0.05, add: 59 },
    { rate: 0.15, add: 59 },
  ]);

  // «до 1 000 000 ₽/мес. — бесплатно, свыше 1 000 000 ₽/мес. — 0,1% от суммы»
  const cashHandling =
    cashIn <= 1_000_000 ? 0 : rub((cashIn - 1_000_000) * 0.001);

  return {
    bankId: "tinkoff",
    bankName: "Т-Банк",
    tariffId: "tinkoff-pro",
    tariffName: "Профессиональный",
    description: "Для бизнеса с большими оборотами.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tinkoff"),
  };
}

/* ========================================================================== */
/*                                  ТОЧКА                                     */
/* ========================================================================== */

function calcTochkaZero(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 0;
  const transfersToLegal = 0;

  // «До 150 000 ₽ бесплатно, свыше — 500 ₽ за каждые 15 000 ₽»
  const transfersToIndividuals = calcStepFee({
    amount: toIndividuals,
    free: 150_000,
    step: 15_000,
    feePerStep: 500,
  });

  // «за каждые 10 000 ₽ — комиссия 80 ₽»
  const cashHandling = calcStepFee({
    amount: cashIn,
    free: 0,
    step: 10_000,
    feePerStep: 80,
  });

  return {
    bankId: "tochka",
    bankName: "Точка",
    tariffId: "tochka-zero",
    tariffName: "Ноль",
    description: "Только для ИП, зарегистрированного не более 90 дней назад.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tochka"),
  };
}

function calcTochkaStart(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 950;
  const transfersToLegal = 0;

  // «До 400 000 ₽ бесплатно, свыше — 2 100 ₽ за каждые 75 000 ₽»
  const transfersToIndividuals = calcStepFee({
    amount: toIndividuals,
    free: 400_000,
    step: 75_000,
    feePerStep: 2_100,
  });

  // «до 100 000 ₽ бесплатно, далее — 350 ₽ за каждые 50 000 ₽»
  const cashHandling = calcStepFee({
    amount: cashIn,
    free: 100_000,
    step: 50_000,
    feePerStep: 350,
  });

  return {
    bankId: "tochka",
    bankName: "Точка",
    tariffId: "tochka-start",
    tariffName: "Начало",
    description: "",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tochka"),
  };
}

function calcTochkaGrowth(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);
  const cashIn = norm(inputs.deposit);

  const monthlyFee = 3_500;
  const transfersToLegal = 0;

  // Исправлено по твоему замечанию:
  // «До 1 000 000 ₽ в месяц бесплатно,
  //  свыше — 3 300 ₽ за каждые 150 000 ₽»
  const transfersToIndividuals = calcStepFee({
    amount: toIndividuals,
    free: 1_000_000,
    step: 150_000,
    feePerStep: 3_300,
  });

  // «до 600 000 ₽ бесплатно, далее — 600 ₽ за каждые 100 000 ₽»
  const cashHandling = calcStepFee({
    amount: cashIn,
    free: 600_000,
    step: 100_000,
    feePerStep: 600,
  });

  return {
    bankId: "tochka",
    bankName: "Точка",
    tariffId: "tochka-growth",
    tariffName: "Развитие",
    description: "",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("tochka"),
  };
}

/* ========================================================================== */
/*                               МОДУЛЬБАНК                                   */
/* ========================================================================== */

function calcModulStart(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);

  const monthlyFee = 0;
  const transfersToLegal = 0;
  const cashHandling = 0; // внесение бесплатно

  // «0,5 % от 0 до 50 000 ₽,
  //   3% от 50 000,01 до 500 000 ₽,
  //   5% от 500 000,01 ₽»
  const transfersToIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 50_000, rate: 0.005 },
    { upTo: 500_000, rate: 0.03 },
    { rate: 0.05 },
  ]);

  return {
    bankId: "modulbank",
    bankName: "Модульбанк",
    tariffId: "modul-start",
    tariffName: "Стартовый",
    description: "Отличное начало бизнеса.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("modulbank"),
  };
}

function calcModulOptimal(inputs: CalcInputs): TariffCalcResult {
  const payments = norm(inputs.payments);
  const toIndividuals = norm(inputs.withdrawal);

  const monthlyFee = 690;

  // «19 рублей за операцию»
  const transfersToLegal = payments * 19;
  const cashHandling = 0; // внесение бесплатно

  // «0 ₽ до 50 000 ₽,
  //   1,5% от 50 000,01 до 300 000 ₽,
  //   2,5% от 300 000,01 до 500 000 ₽,
  //   5% от 500 000,01 ₽»
  const transfersToIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 50_000, rate: 0 },
    { upTo: 300_000, rate: 0.015 },
    { upTo: 500_000, rate: 0.025 },
    { rate: 0.05 },
  ]);

  return {
    bankId: "modulbank",
    bankName: "Модульбанк",
    tariffId: "modul-optimal",
    tariffName: "Оптимальный",
    description: "Лучший выбор для дела.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("modulbank"),
  };
}

function calcModulUnlimited(inputs: CalcInputs): TariffCalcResult {
  const toIndividuals = norm(inputs.withdrawal);

  const monthlyFee = 4_900;
  const transfersToLegal = 0;
  const cashHandling = 0; // внесение бесплатно

  // «0 ₽ до 100 000 ₽,
  //   1,5% от 100 000,01 до 500 000 ₽,
  //   2,5% от 500 000,01 до 1 000 000 ₽,
  //   5% от 1 000 000,01 ₽»
  const transfersToIndividuals = calcPercentRanges(toIndividuals, [
    { upTo: 100_000, rate: 0 },
    { upTo: 500_000, rate: 0.015 },
    { upTo: 1_000_000, rate: 0.025 },
    { rate: 0.05 },
  ]);

  return {
    bankId: "modulbank",
    bankName: "Модульбанк",
    tariffId: "modul-unlimited",
    tariffName: "Безлимитный",
    description: "Бизнес на высоких оборотах.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("modulbank"),
  };
}

function calcModulCorp(inputs: CalcInputs): TariffCalcResult {
  const monthlyFee = 39_900;
  const transfersToLegal = 0;
  const transfersToIndividuals = 0;
  const cashHandling = 0;

  return {
    bankId: "modulbank",
    bankName: "Модульбанк",
    tariffId: "modul-corp",
    tariffName: "Корпоративный",
    description: "Когда нужен максимум.",
    monthlyFee: rub(monthlyFee),
    transfersToLegal: rub(transfersToLegal),
    transfersToIndividuals: rub(transfersToIndividuals),
    cashHandling: rub(cashHandling),
    link: getRefLink("modulbank"),
  };
}

/* ========================================================================== */
/*                         ГЛАВНАЯ ФУНКЦИЯ КАЛЬКУЛЯТОРА                       */
/* ========================================================================== */

export function calculateTariffs(inputs: CalcInputs): TariffCalcResult[] {
  // Альфа — фиксированный порядок:
  // 1) Ноль за обслуживание
  // 2) Простой
  // 3) Быстрое развитие
  // 4) Активные расчёты
  const alfaTariffs: TariffCalcResult[] = [
    calcAlfaZero(inputs),
    calcAlfaSimple(inputs),
    calcAlfaFastGrowth(inputs),
    calcAlfaActive(inputs),
  ];

  // Остальные банки — сортируем тарифы внутри банка по полной стоимости.
  const tinkoffTariffs = [
    calcTinkoffSimple(inputs),
    calcTinkoffAdvanced(inputs),
    calcTinkoffPro(inputs),
  ].sort((a, b) => totalCost(a) - totalCost(b));

  const tochkaTariffs = [
    calcTochkaZero(inputs),
    calcTochkaStart(inputs),
    calcTochkaGrowth(inputs),
  ].sort((a, b) => totalCost(a) - totalCost(b));

  const modulTariffs = [
    calcModulStart(inputs),
    calcModulOptimal(inputs),
    calcModulUnlimited(inputs),
    calcModulCorp(inputs),
  ].sort((a, b) => totalCost(a) - totalCost(b));

  return [...alfaTariffs, ...tinkoffTariffs, ...tochkaTariffs, ...modulTariffs];
}
