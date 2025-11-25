// scripts/update-banks.cjs  (CommonJS)
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const FILE = path.join(__dirname, "..", "public", "banks-live.json");

// 1) Настройки: URL тарифов и «точные» селекторы.
//    Я сделал максимально устойчивые CSS-пути + запасные селекторы.
//    Если что-то не найдётся — сработает genericExtractText() ниже.
const SOURCES = {
  alfa: {
    url: "https://alfabank.ru/sme/tariffs/settlement-account/",
    selectors: {
      monthly: [
        // пример: «Обслуживание: 0 ₽»
        '[class*="tariff"], [data-test-id*="tariff"] :contains("Обслужив")',
      ],
      toOthers: [
        // пример: строчка с «в другие банки» и ценой
        ":matchesOwn(/в другие банки/i)",
      ],
      acquiring: [":matchesOwn(/эквайринг/i)"],
    },
  },
  tinkoff: {
    url: "https://www.tbank.ru/business/rko/",
    selectors: {
      monthly: [
        // На Т-Банк часто встречается «Обслуживание» / «Абонплата»
        ":matchesOwn(/обслужив|абонплат/i)",
      ],
      toOthers: [":matchesOwn(/в другие банки/i)"],
      acquiring: [":matchesOwn(/эквайринг/i)"],
    },
  },
  tochka: {
    url: "https://tochka.com/tariffs/rko/",
    selectors: {
      monthly: [":matchesOwn(/обслужив/i)"],
      toOthers: [":matchesOwn(/в другие банки/i)"],
      acquiring: [":matchesOwn(/эквайринг/i)"],
    },
  },
  vtb: {
    url: "https://www.vtb.ru/malyj-biznes/rko/",
    selectors: {
      monthly: [":matchesOwn(/обслужив/i)"],
      toOthers: [":matchesOwn(/в другие банки/i)"],
      acquiring: [":matchesOwn(/эквайринг/i)"],
    },
  },
  modulbank: {
    url: "https://modulbank.ru/tariffs",
    selectors: {
      monthly: [":matchesOwn(/обслужив|абонплат/i)"],
      toOthers: [":matchesOwn(/в другие банки/i)"],
      acquiring: [":matchesOwn(/эквайринг/i)"],
    },
  },
};

// ---------- Нормализация значений ----------
function normalizeMoneyRange(s) {
  if (!s) return s;
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/руб\.?/gi, "₽").replace(/р(?![а-я])/gi, "₽");
  s = s.replace(/бесплатно/gi, "0 ₽");
  // 12 - 39 ₽ → 12–39 ₽
  s = s.replace(/(\d+)\s*[-—–]\s*(\d+)\s*₽/g, "$1–$2 ₽");
  // 39 → 39 ₽ (если рядом слово Платеж/в другие банки)
  if (/\d+\s*$/.test(s)) s = s + " ₽";
  return s;
}

function normalizePercent(s) {
  if (!s) return s;
  s = s.replace(/\s+/g, " ").trim().replace(",", ".");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return s;
  return `от ${m[1]}%`;
}

// ---------- Доставание текста по точным селекторам ----------
function extractBySelectors($, arr) {
  for (const sel of arr) {
    // поддержка :matchesOwn(regex)
    if (/^:matchesOwn\(/.test(sel)) {
      const m = sel.match(/^:matchesOwn\((\/.*\/[gimuy]*?)\)\s*$/);
      if (m) {
        const rx = new RegExp(
          m[1].slice(1, m[1].lastIndexOf("/")),
          m[1].slice(m[1].lastIndexOf("/") + 1)
        );
        const hit = $("*").filter((_, el) => rx.test($(el).text()));
        if (hit.length) return hit.first().text();
      }
      continue;
    }
    const hit = $(sel);
    if (hit.length) return hit.first().text();
  }
  return null;
}

// ---------- Резервный эвристический парсер по всему тексту ----------
function genericExtractText(html) {
  const $ = cheerio.load(html);
  const text = $("body").text().replace(/\s+/g, " ");

  let monthly =
    text.match(/обслужив[а-я]*[^0-9]*(\d+)\s*[₽рR]/i)?.[1] ||
    (text.match(/обслужив[а-я]*[^а-я]*бесплатно/i) ? "0" : null);
  monthly = monthly ? normalizeMoneyRange(`${monthly} ₽`) : null;

  let toOthers =
    text.match(
      /в другие банк[а-я]*[^0-9]*(\d+\s*[–-]\s*\d+|\d+)\s*[₽рR]/i
    )?.[1] || null;
  toOthers = toOthers ? normalizeMoneyRange(toOthers) : null;

  let acquiring =
    text.match(/эквайринг[а-я\s:]*?от?\s*(\d+[,.]?\d*)\s*%/i)?.[1] || null;
  acquiring = acquiring ? normalizePercent(acquiring + "%") : null;

  return { monthly, toOthers, acquiring };
}

// ---------- HTTP ----------
async function getHtml(url) {
  const r = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 20000,
    // без кэша
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return r.data;
}

// ---------- Основная логика ----------
async function update() {
  const original = JSON.parse(fs.readFileSync(FILE, "utf8"));

  for (const bank of original) {
    const src = SOURCES[bank.id];
    if (!src) {
      console.log(`[-] ${bank.id}: источник не настроен — пропускаю`);
      continue;
    }

    try {
      console.log(`[+] ${bank.id}: GET ${src.url}`);
      const html = await getHtml(src.url);
      const $ = cheerio.load(html);

      // 1) Стараемся взять точными селекторами
      let monthlyText = extractBySelectors($, src.selectors.monthly || []);
      let toOthersText = extractBySelectors($, src.selectors.toOthers || []);
      let acquiringText = extractBySelectors($, src.selectors.acquiring || []);

      // 2) Если не нашли — резервный парсер
      if (!monthlyText || !toOthersText || !acquiringText) {
        const fallback = genericExtractText(html);
        monthlyText = monthlyText || fallback.monthly;
        toOthersText = toOthersText || fallback.toOthers;
        acquiringText = acquiringText || fallback.acquiring;
      }

      const before = { ...bank.fees };

      if (monthlyText) bank.fees.monthly = normalizeMoneyRange(monthlyText);
      if (toOthersText) bank.fees.toOthers = normalizeMoneyRange(toOthersText);
      if (acquiringText) bank.fees.acquiring = normalizePercent(acquiringText);

      console.log(
        `    ${JSON.stringify(before)}  ->  ${JSON.stringify(bank.fees)}`
      );
    } catch (e) {
      console.warn(
        `[!] ${bank.id}: ошибка парсинга — оставляю прежние (${e.message})`
      );
    }
  }

  // безопасная запись
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(original, null, 2), "utf8");
  fs.renameSync(tmp, FILE);

  console.log("OK: public/banks-live.json обновлён");
}

update().catch((e) => {
  console.error(e);
  process.exit(1);
});
