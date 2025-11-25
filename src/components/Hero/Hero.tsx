import s from "./Hero.module.css";
import heroFinance from "@/assets/illustrations/hero-finance.png";

export default function Hero() {
  return (
    <section className={s.section} id="hero">
      <div className="container">
        <div className={s.wrap}>
          {/* Левая часть (контент) */}
          <div className={s.left}>
            <h1 className={s.h1}>РКО-подбор — сравнить банки и открыть счёт</h1>
            <p className={s.lead}>
              Сравните банки для бизнеса и оформите РКО онлайн. Честное
              сравнение условий и наглядный расчёт реальных ежемесячных
              расходов.
            </p>
            <div className={s.actions}>
              <a href="#best" className="button primary">
                Смотреть банки
              </a>
              <a href="#calculator" className="button">
                Открыть калькулятор
              </a>
            </div>
          </div>

          {/* Правая часть — вместо голубого блока */}
          <figure className={s.right} aria-hidden="true">
            <img
              src={heroFinance}
              alt=""
              className={s.illustration}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
