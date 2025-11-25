import s from "./TariffItem.module.css";
import type { Tariff } from "../../types/tariff";
import { feeByPayments, feeByPercentRule } from "../../utils/tariffMath";

type Props = {
  t: Tariff;
  inputs: { payments: number; withdrawal: number; deposit: number };
  link?: string;
};

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function TariffItem({ t, inputs, link }: Props) {
  // ВАЖНО: у тебя utils принимают (amount, rule) — сначала число, потом правило
  const payFee = feeByPayments(inputs.payments, t.payments);
  const wdFee = feeByPercentRule(inputs.withdrawal, t.withdrawal);
  const depFee = feeByPercentRule(inputs.deposit, t.deposit);

  const total = t.monthly + payFee + wdFee + depFee;
  const openLink = link ?? t.link;

  return (
    <div className={s.card}>
      <div className={s.name}>{t.name}</div>

      <div className={s.row}>
        <span>Обслуживание</span>
        <b>{fmt(t.monthly)} ₽</b>
      </div>

      <div className={s.row}>
        <span>Переводы юр. лицам</span>
        <b>{fmt(payFee)} ₽</b>
      </div>

      <div className={s.row}>
        <span>Вывод на карту</span>
        <b>{fmt(wdFee)} ₽</b>
      </div>

      <div className={s.row}>
        <span>Внесение наличных</span>
        <b>{fmt(depFee)} ₽</b>
      </div>

      <div className={s.total}>
        <span>Итого/мес</span>
        <b>{fmt(total)} ₽</b>
      </div>

      {openLink && (
        <a className={s.btn} href={openLink} target="_blank" rel="noreferrer">
          Открыть счёт
        </a>
      )}
    </div>
  );
}
