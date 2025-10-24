export function monthYearTitle(prefix: string) {
  const now = new Date();
  const month = now.toLocaleDateString("ru-RU", { month: "long" });
  const year = now.getFullYear();
  // с заглавной буквы
  const m = month[0].toLowerCase() === month[0] ? month : month.toLowerCase();
  return `${prefix} — ${m} ${year}`;
}

// Сервис: вызвать cb ровно в полночь и каждый следующий день
export function onMidnight(cb: () => void) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const ms = +next - +now;
  const t = setTimeout(() => {
    cb();
    onMidnight(cb);
  }, ms);
  return () => clearTimeout(t);
}
