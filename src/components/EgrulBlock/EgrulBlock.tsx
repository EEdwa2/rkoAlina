import s from "./EgrulBlock.module.css";

export default function EgrulBlock() {
  return (
    <section id="egrul" className={s.section} aria-labelledby="egrul_title">
      <div className={s.wrap}>
        {/* Заголовок и описание – как в других блоках */}
        <h2 id="egrul_title" className={s.title}>
          Проверка компании в ЕГРЮЛ
        </h2>
        <p className={s.subtitle}>
          Быстрая проверка ИП или юрлица в официальном сервисе ФНС: выписка,
          статус, адрес, руководитель, ОКВЭД и дата регистрации.
        </p>

        {/* Карточка с белым фоном */}
        <div className={s.card} role="region" aria-label="Проверка в ЕГРЮЛ">
          <div className={s.cardBody}>
            <ul className={s.list}>
              <li>Официальные данные ФНС РФ</li>
              <li>Поиск по ИНН, ОГРН, названию или адресу</li>
              <li>Бесплатная онлайн-проверка</li>
            </ul>

            <div className={s.actions}>
              <a
                className={s.primary}
                href="https://egrul.nalog.ru/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть ЕГРЮЛ на сайте ФНС
              </a>
              <span className={s.note}>Откроется в новой вкладке</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
