import s from "./BankCard.module.css";

import type { Bank } from "../../types/bank";
import { getRefLink, type BankId } from "../../utils/bankLinks";

type Props = {
  bank: Bank;
  /** хвост реф-ссылки, например import.meta.env.VITE_REF */
  refTail?: string;
};

export default function BankCard({ bank, refTail = "" }: Props) {
  // Приводим id к нашему enum/union
  const id = bank.id as BankId;

  const logoSrc = `/logos/${id}.svg`; // файлы лежат в /public/logos/, имя = id

  // Лого: из данных, иначе локальное из /public/logos/*.svg
  //   const logo = bank.logo ?? `/logos/${id}.svg`;

  // Ссылка «Открыть счёт»
  const href = getRefLink(id, refTail);

  // Список фичей
  const bullets: string[] = [
    `Обслуживание: ${bank.fees.monthly} ₽`,
    `Платёж в другие банки: ${bank.fees.toOthers}`,
    `Эквайринг: ${bank.fees.acquiring}`,
  ];

  return (
    <article className={s.card} data-bank={id}>
      <div className={s.top}>
        <img className={s.logo} src={logoSrc} alt={bank.name} />
        <h3 className={s.title}>
          {bank.name} — <span className={s.plan}>{bank.plan}</span>
        </h3>
      </div>

      <ul className={s.features}>
        {bullets.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      {/* отдельный контейнер, чтобы кнопка была внизу и на одной высоте у всех */}
      <div className={s.cta}>
        <a
          className="button primary"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Подробнее
        </a>
      </div>
    </article>
  );
}
