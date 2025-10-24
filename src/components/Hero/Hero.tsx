import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={s.section} id="hero">
      <div className="container">
        <div className={s.wrap}>
          {/* Левая часть (контент) */}
          <div className={s.left}>
            <h1 className={s.h1}>Калькулятор РКО для ИП и ООО</h1>
            <p className={s.lead}>
              Подберите банк и рассчитайте ежемесячные расходы на обслуживание с
              учётом платежей, наличных и эквайринга.
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
              src="../../../public/illustrations/hero-finance.png"
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
