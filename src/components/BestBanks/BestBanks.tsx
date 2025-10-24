import s from "./BestBanks.module.css";
import { monthYearTitle } from "../../utils/date";
import { useBanks } from "../../utils/banksStore";
import BankCard from "../BankCard/BankCard";
import type { BankId, Bank } from "../../types/bank";

export default function BestBanks() {
  const banks = useBanks();
  const REF_TAIL = import.meta.env.VITE_REF ?? "";

  return (
    <section className={s.section} id="best">
      <div className={s.container}>
        <div className={s.headingWrap}>
          <h2 className={s.heading}>{monthYearTitle("Лучшие банки")}</h2>
          <p className={s.sub}>Карточки банков с ключевыми условиями.</p>
        </div>

        <div className={s.grid}>
          {banks.map((b) => {
            // приводим id к BankId (валидные значения совпадают с union-типом)
            const bank: Bank = { ...b, id: b.id as BankId };
            return <BankCard key={b.id} bank={bank} refTail={REF_TAIL} />;
          })}
        </div>
      </div>
    </section>
  );
}
