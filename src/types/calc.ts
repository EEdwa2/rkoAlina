import type { BankId } from "./bank";
import type { OrgType } from "./tariff";

/** То, что вводит пользователь в форму */
export type CalcInputs = {
  org: OrgType; // ип / ооо
  payments: number; // Количество платежей другим юр. лицам (шт)
  withdrawal: number; // Вывод денег на карту (₽ в месяц)
  deposit: number; // Внесение наличных на счёт (₽ в месяц)
};

/** Результат расчёта по одному тарифу банка */
export type TariffCalcResult = {
  bankId: BankId; // "tinkoff" | "alfa" | ...
  bankName: string; // Человеческое имя банка: "Т-Банк", "Альфа-Банк"...

  tariffId: string; // id тарифа внутри банка, например "simple"
  tariffName: string; // "Простой", "Активные расчёты" и т.п.
  description: string; // Описание тарифа. Если его нет в данных — кладём пустую строку.

  monthlyFee: number; // Обслуживание счёта за месяц, ₽
  transfersToLegal: number; // Сумма комиссии за переводы юр. лицам, ₽
  transfersToIndividuals: number; // Комиссия за вывод на карту / переводы физлицам, ₽
  cashHandling: number; // Комиссия за снятие/внесение наличных, ₽ (мы договоримся, как именно считаем)

  link?: string; // реферальная ссылка "Подробнее / Открыть счёт"
};
