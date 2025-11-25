import { useMemo, useState, type ChangeEvent } from "react";
import s from "./CalculatorV2.module.css";

import type { OrgType } from "../../types/tariff";
import type { CalcInputs, TariffCalcResult } from "../../types/calc";
import { calculateTariffs } from "../../logic/tariffEngine";
import { getLogoSrc } from "../../utils/bankLinks";

const fmt = (n: number) => n.toLocaleString("ru-RU");

type FormState = {
  org: OrgType;
  withdrawal: string;
  payments: string;
  deposit: string;
};

type BankGroup = {
  bankId: TariffCalcResult["bankId"];
  bankName: string;
  tariffs: TariffCalcResult[];
};

export default function CalculatorV2() {
  const [form, setForm] = useState<FormState>({
    org: "ip",
    withdrawal: "",
    payments: "",
    deposit: "",
  });

  const [results, setResults] = useState<TariffCalcResult[] | null>(null);
  const [touched, setTouched] = useState(false);

  const canShow =
    form.withdrawal.trim() !== "" &&
    form.payments.trim() !== "" &&
    form.deposit.trim() !== "";

  const handleNumberChange =
    (field: keyof Omit<FormState, "org">) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\s+/g, "");
      setForm((prev) => ({ ...prev, [field]: raw }));
    };

  const handleShow = () => {
    setTouched(true);
    if (!canShow) return;

    const inputs: CalcInputs = {
      org: form.org,
      withdrawal: Number(form.withdrawal) || 0,
      payments: Number(form.payments) || 0,
      deposit: Number(form.deposit) || 0,
    };

    const calcResults = calculateTariffs(inputs);
    setResults(calcResults);
  };

  const helpText = !touched
    ? "Заполните все три поля, чтобы увидеть подходящие тарифы банка."
    : !canShow
    ? "Проверьте, что все поля заполнены корректно."
    : "";

  const groups = useMemo<BankGroup[]>(() => {
    if (!results || results.length === 0) return [];
    const map = new Map<string, BankGroup>();
    for (const row of results) {
      const key = row.bankId;
      const existing = map.get(key);
      if (existing) {
        existing.tariffs.push(row);
      } else {
        map.set(key, {
          bankId: row.bankId,
          bankName: row.bankName,
          tariffs: [row],
        });
      }
    }
    return Array.from(map.values());
  }, [results]);

  return (
    <section className={s.section} id="calculator">
      <div className={s.inner}>
        <h2 className={s.heading}>Калькулятор стоимости (новая версия)</h2>
        <p className={s.sub}>
          Укажите форму регистрации и примерные обороты. Ниже мы покажем
          ориентировочную стоимость обслуживания по тарифам разных банков.
        </p>

        {/* карточка формы */}
        <div className={s.card}>
          <h3 className={s.h3}>Форма регистрации</h3>

          <div className={s.segment}>
            <button
              type="button"
              className={`${s.segbtn} ${form.org === "ip" ? s.active : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, org: "ip" }))}
            >
              ИП
            </button>
            <button
              type="button"
              className={`${s.segbtn} ${form.org === "ooo" ? s.active : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, org: "ooo" }))}
            >
              ООО
            </button>
          </div>

          <div className={s.grid3}>
            <label className={s.label}>
              <span className={s.labelText}>Вывод денег на карту</span>
              <div className={s.inputWrap}>
                <input
                  inputMode="numeric"
                  type="number"
                  placeholder={`Например, ${fmt(150000)}`}
                  value={form.withdrawal}
                  onChange={handleNumberChange("withdrawal")}
                />
                <span className={s.suffix}>₽</span>
              </div>
            </label>

            <label className={s.label}>
              <span className={s.labelText}>
                Количество платежей другим юр. лицам
              </span>
              <div className={s.inputWrap}>
                <input
                  inputMode="numeric"
                  type="number"
                  placeholder={`Например, ${fmt(30)}`}
                  value={form.payments}
                  onChange={handleNumberChange("payments")}
                />
                <span className={s.suffix}>шт</span>
              </div>
            </label>

            <label className={s.label}>
              <span className={s.labelText}>Внесение наличных на счёт</span>
              <div className={s.inputWrap}>
                <input
                  inputMode="numeric"
                  type="number"
                  placeholder={`Например, ${fmt(50000)}`}
                  value={form.deposit}
                  onChange={handleNumberChange("deposit")}
                />
                <span className={s.suffix}>₽</span>
              </div>
            </label>
          </div>

          <div className={s.actions}>
            <button
              type="button"
              className={`${s.btn} ${!canShow ? s.btnDisabled : ""}`}
              onClick={handleShow}
              disabled={!canShow}
            >
              Показать
            </button>
          </div>

          {helpText && <div className={s.help}>{helpText}</div>}
        </div>

        {/* результаты */}
        {groups.length > 0 && (
          <div className={s.list}>
            {groups.map((group) => {
              const logoSrc = getLogoSrc(group.bankId as any);

              return (
                <div key={group.bankId} className={s.listItem}>
                  <div className={s.bankHeader}>
                    <img
                      src={logoSrc}
                      alt={group.bankName}
                      className={s.bankLogo}
                      loading="lazy"
                    />
                    <h3 className={s.bankTitle}>{group.bankName}</h3>
                  </div>

                  <div className={s.tariffGrid}>
                    {group.tariffs.map((t) => {
                      const isAlfaSimple =
                        t.bankId === "alfa" && t.tariffId === "alfa-simple";

                      const monthlyFeeText = isAlfaSimple
                        ? "Зависит от поступлений"
                        : `${fmt(t.monthlyFee)} ₽`;

                      return (
                        <article key={t.tariffId} className={s.tariffCard}>
                          <header className={s.tariffHeader}>
                            <div className={s.tariffName}>{t.tariffName}</div>
                            {t.description && (
                              <div className={s.tariffDescr}>
                                {t.description}
                              </div>
                            )}
                          </header>

                          <dl className={s.tariffMeta}>
                            <div
                              className={`${s.tariffMetaRow} ${
                                isAlfaSimple ? s.tariffMetaRowStack : ""
                              }`}
                            >
                              <dt>Обслуживание</dt>
                              <dd>{monthlyFeeText}</dd>
                            </div>
                            <div className={s.tariffMetaRow}>
                              <dt>Переводы юр. лицам</dt>
                              <dd>{fmt(t.transfersToLegal)} ₽</dd>
                            </div>
                            <div className={s.tariffMetaRow}>
                              <dt>Вывод на карту</dt>
                              <dd>{fmt(t.transfersToIndividuals)} ₽</dd>
                            </div>
                            <div className={s.tariffMetaRow}>
                              <dt>Внесение наличных (через партнеров)</dt>
                              <dd>{fmt(t.cashHandling)} ₽</dd>
                            </div>
                          </dl>

                          {t.link && (
                            <div className={s.tariffActions}>
                              <a
                                href={t.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={s.btn}
                              >
                                Подробнее
                              </a>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className={s.note}>
          Расчёты носят ориентировочный характер: точные условия и итоговые
          суммы подтверждает банк. Мы сопоставляем ваши данные с тарифами
          каждого банка.
        </p>
      </div>
    </section>
  );
}
