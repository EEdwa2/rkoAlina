import s from "./BestBanks.module.css";
import { getLogoSrc, getRefLink, type BankId } from "../../utils/bankLinks";

type Card = {
  id: BankId;
  name: string;
  bullets: string[];
};

const cards: Card[] = [
  {
    id: "alfa",
    name: "Альфа-Банк",
    bullets: [
      "Линейка тарифов РКО для ИП и ООО — от нулевого обслуживания до активных расчётов.",
      "Удобный интернет-банк и быстрое открытие счёта онлайн.",
      "Подходит бизнесу с регулярными платежами и большим числом контрагентов.",
    ],
  },
  {
    id: "tinkoff", // Т-Банк
    name: "Т-Банк",
    bullets: [
      "Полностью онлайн-банк для предпринимателей: всё управление из приложения.",
      "Гибкие условия по переводам и работе с наличными под разные обороты.",
      "Удобная аналитика и интеграции с бухгалтерией и эквайрингом.",
    ],
  },
  {
    id: "tochka",
    name: "Точка",
    bullets: [
      "РКО с акцентом на сервис и персональную поддержку предпринимателей.",
      "Пакетные тарифы с понятными лимитами по переводам и внесению наличных.",
      "Хороший вариант для малого бизнеса, который ценит прозрачные условия.",
    ],
  },
  {
    id: "modulbank",
    name: "Модульбанк",
    bullets: [
      "Гибкие тарифы РКО для фриланса, малого и среднего бизнеса.",
      "Продвинутый онлайн-банк с интеграциями с учётом и эквайрингом.",
      "Подходит компаниям с разным уровнем оборотов и количеством операций.",
    ],
  },
  // ВТБ не добавляем — его просто нет в массиве.
];

export default function BestBanks() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.headingWrap}>
          <h2 className={s.heading}>Основные банки</h2>
          <p className={s.sub}>
            Тарифы банков для расчётно-кассового обслуживания которых представлены
            на этом сайте.
          </p>
        </div>

        <div className={s.grid}>
          {cards.map((card) => {
            const logo = getLogoSrc(card.id);
            const link = getRefLink(card.id);

            return (
              <article key={card.id} className={s.card}>
                <header className={s.top}>
                  <div className={s.logo}>
                    <img src={logo} alt={card.name} />
                  </div>
                  <h3 className={s.title}>{card.name}</h3>
                </header>

                <ul className={s.features}>
                  {card.bullets.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>

                <div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.button}
                  >
                    Подробнее
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
