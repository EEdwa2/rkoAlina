import s from "./Header.module.css";

type Anchor = { id: string; label: string };

const LINKS: Anchor[] = [
  { id: "calculator", label: "Калькулятор" },
  { id: "best", label: "Лучшие банки" },
  { id: "rating", label: "Рейтинг" },
];

export default function Header() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={s.header}>
      <div className={s.wrap}>
        {/* Лого: кликабельно — скролл к началу */}
        <button className={s.logo} onClick={scrollToTop} aria-label="К началу">
          <img src="/logo.svg" alt="РКО" width={60} height={40} />
          {/* <span className={s.brand}>РКО</span> */}
        </button>

        {/* Навигация по якорям страницы */}
        <nav className={s.nav} aria-label="Навигация по разделам">
          {LINKS.map((l) => (
            <button
              key={l.id}
              className={s.link}
              onClick={() => scrollToId(l.id)}
              type="button"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
