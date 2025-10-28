import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import s from "./Header.module.css";

type Anchor = {
  id: "best" | "calculator" | "rating" | "egrul";
  labelFull: string;
  labelShort: string;
};

// SVG-иконки, наследуют цвет через currentColor
const IconBank = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.icon}>
    <path
      d="M3 9.5V8.8l8.4-4.2a2 2 0 0 1 1.8 0L21.6 8.8v.7H3Z"
      fill="currentColor"
    />
    <path
      d="M5 11h2v7H5v-7Zm6 0h2v7h-2v-7Zm6 0h2v7h-2v-7Z"
      fill="currentColor"
    />
    <path d="M3 20h18v2H3z" fill="currentColor" />
  </svg>
);
const IconCalc = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.icon}>
    <rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="2"
      ry="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect x="7" y="5" width="10" height="4" rx="1" fill="currentColor" />
    <path
      d="M8 12h2m4 0h2M8 16h2m4 0h2M8 20h2m4 0h2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.icon}>
    <path
      d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"
      fill="currentColor"
    />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.icon}>
    <path
      d="M12 3l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8.5 12.5l2.5 2.5 4.5-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LINKS: Anchor[] = [
  { id: "best", labelFull: "Лучшие банки", labelShort: "Банки" },
  { id: "calculator", labelFull: "Калькулятор", labelShort: "Кальк." },
  { id: "rating", labelFull: "Рейтинг", labelShort: "Рейтинг" },
  { id: "egrul", labelFull: "Проверка фирмы", labelShort: "ЕГРЮЛ" },
];

const ICONS: Record<Anchor["id"], JSX.Element> = {
  best: <IconBank />,
  calculator: <IconCalc />,
  rating: <IconStar />,
  egrul: <IconShield />,
};

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Блоки на странице (герой не включаем — он по клику на лого)
  const sections = useMemo(() => ["best", "calculator", "rating", "egrul"], []);

  // null — верх страницы (герой), ничего не подсвечиваем
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, height: 0 });

  const lockUntilRef = useRef<number>(0);

  const getHeaderOffset = () =>
    (headerRef.current?.getBoundingClientRect().height ?? 0) + 8;

  const positionPill = (id = activeId) => {
    if (!id) {
      setPill((p) => ({ ...p, width: 0 }));
      return;
    }
    const btn = btnRefs.current[id];
    const nav = navRef.current;
    if (!btn || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPill({
      left: btnRect.left - navRect.left - 2,
      width: btnRect.width + 4,
      height: btnRect.height,
    });
  };

  const scrollToTop = () => {
    setActiveId(null);
    requestAnimationFrame(() => positionPill(null));
    window.scrollTo({ top: 0, behavior: "smooth" });
    lockUntilRef.current = performance.now() + 600;
  };

  const scrollToId = (id: string) => {
    setActiveId(id);
    requestAnimationFrame(() => positionPill(id));
    lockUntilRef.current = performance.now() + 700;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    let ticking = false;

    const chooseActiveByScroll = () => {
      if (performance.now() < lockUntilRef.current) return;

      const offset = getHeaderOffset();
      let current: string | null = null;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset + 1) current = id;
        else break;
      }

      // у низа страницы — активна последняя
      const doc = document.documentElement;
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        doc.clientHeight
      );
      if (scrollBottom >= docHeight - 120) current = "egrul";

      if (current !== activeId) setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          chooseActiveByScroll();
          ticking = false;
        });
      }
    };

    const onResize = () => {
      chooseActiveByScroll();
      requestAnimationFrame(() => positionPill());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    chooseActiveByScroll();
    positionPill();

    // @ts-ignore
    const onScrollEnd = () => {
      lockUntilRef.current = 0;
      positionPill();
    };
    // @ts-ignore
    window.addEventListener?.("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      // @ts-ignore
      window.removeEventListener?.("scrollend", onScrollEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, activeId]);

  useLayoutEffect(() => {
    positionPill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (
    <header className={s.header} ref={headerRef}>
      <div className={s.wrap}>
        {/* Лого → к началу, без активной подсветки */}
        <button className={s.logo} onClick={scrollToTop} aria-label="К началу">
          <img src="/logo.svg" alt="РКО" width={60} height={40} />
        </button>

        <nav ref={navRef} className={s.nav} aria-label="Навигация по разделам">
          {/* Пилюля; при width=0 визуально скрыта */}
          <span
            className={s.pill}
            style={{
              width: pill.width,
              height: pill.height,
              transform: `translateX(${pill.left}px)`,
            }}
            aria-hidden="true"
          />

          {LINKS.map((l) => (
            <button
              key={l.id}
              ref={(el) => (btnRefs.current[l.id] = el)}
              className={`${s.link} ${activeId === l.id ? s.linkActive : ""}`}
              onClick={() => scrollToId(l.id)}
              type="button"
              aria-label={l.labelFull}
              title={l.labelFull}
            >
              {ICONS[l.id]}
              {/* Полная подпись */}
              <span className={s.textFull}>{l.labelFull}</span>
              {/* Короткая подпись */}
              <span className={s.textShort}>{l.labelShort}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
