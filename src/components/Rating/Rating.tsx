// src/components/BankRating/BankRating.tsx

import s from "./Rating.module.css";
import { getLogoSrc, getRefLink, type BankId } from "../../utils/bankLinks";

type RatingRow = {
  id: BankId;
  bankName: string;
  tariffName: string;
  service: string;
};

const rows: RatingRow[] = [
  {
    id: "alfa",
    bankName: "Альфа-Банк",
    tariffName: "Ноль за обслуживание",
    service: "0 ₽",
  },
  {
    id: "tinkoff",
    bankName: "Т-Банк",
    tariffName: "Простой",
    service: "490 ₽",
  },
  {
    id: "alfa",
    bankName: "Альфа-Банк",
    tariffName: "Простой",
    service: "зависит от поступлений",
  },
  {
    id: "tochka",
    bankName: "Точка",
    tariffName: "Начало",
    service: "950 ₽",
  },
  {
    id: "modulbank",
    bankName: "Модульбанк",
    tariffName: "Оптимальный",
    service: "690 ₽",
  },
];

export default function BankRating() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <h2 className={s.title}>Рейтинг банков для ИП и ООО</h2>
        <p className={s.subtitle}>
          Тарифы РКО, которые чаще всего выбирают посетители этого сайта.
        </p>

        <div className={s.list}>
          {rows.map((row) => {
            const logo = getLogoSrc(row.id);
            const link = getRefLink(row.id);

            return (
              <article key={`${row.id}-${row.tariffName}`} className={s.row}>
                {/* Левая часть: логотип + названия */}
                <div className={s.bank}>
                  <div className={s.logoWrap}>
                    <img src={logo} alt={row.bankName} />
                  </div>
                  <div>
                    <div className={s.bankName}>{row.bankName}</div>
                    <div className={s.tariffName}>{row.tariffName}</div>
                  </div>
                </div>

                {/* Средняя колонка: обслуживание (жёсткий столбец) */}
                <div className={s.service}>
                  <span className={s.serviceLabel}>Обслуживание:</span>{" "}
                  <span className={s.serviceValue}>{row.service}</span>
                </div>

                {/* Правая колонка: кнопка */}
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.button}
                >
                  Подробнее
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
