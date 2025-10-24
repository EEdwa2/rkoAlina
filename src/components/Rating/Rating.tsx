import s from "./Rating.module.css";

import banksJson from "../../data/banks.json";
import type { Bank } from "../../types/bank";
import { getRefLink, type BankId } from "../../utils/bankLinks";

const banks = banksJson as Bank[];
const REF_TAIL = import.meta.env.VITE_REF ?? "";

export default function Rating() {
  return (
    <section className={s.section} id="rating">
      <div className="container">
        <h2 className={s.heading}>Рейтинг банков для ИП и ООО</h2>

        <div className={s.list}>
          {banks.map((b) => {
            const href = getRefLink(b.id as BankId, REF_TAIL);
            const logoSrc = `/logos/${b.id}.svg`;
            return (
              <div key={b.id} className={s.row}>
                <div className={s.logoWrap}>
                  {/* скрываем, если файла нет */}
                  <img
                    className={s.logo}
                    src={logoSrc}
                    alt={b.name}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>

                <div className={s.colTitle}>
                  <p className={s.title}>
                    {b.name} — <span className={s.plan}>{b.plan}</span>
                  </p>
                </div>

                <div className={s.meta}>Обсл.: {b.fees.monthly} ₽</div>
                <div className={s.meta}>Платёж: {b.fees.toOthers}</div>
                <div className={s.meta}>Эквайринг: {b.fees.acquiring}</div>

                <div className={s.btnBox}>
                  <a
                    className={s.button}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть счёт
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
