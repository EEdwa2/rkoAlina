import { useMemo, useState } from "react";
import s from "./Calculator.module.css";
import banks from "../../data/banks.json";
import type { Bank } from "../../types/bank";

type Inputs = {
  turnover: number | "";
  payments: number | "";
  cash: number | "";
  acquiring: number | "";
  acquiringType: "online" | "offline";
};

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function Calculator() {
  const [bankId, setBankId] = useState<string>(""); // сперва пусто
  const [v, setV] = useState<Inputs>({
    turnover: "",
    payments: "",
    cash: "",
    acquiring: "",
    acquiringType: "online",
  });

  const bank = useMemo(
    () => (bankId ? (banks as Bank[]).find((b) => b.id === bankId) : undefined),
    [bankId]
  );

  const res = useMemo(() => {
    if (!bank) return null;
    if (
      v.turnover === "" ||
      v.payments === "" ||
      v.cash === "" ||
      v.acquiring === ""
    ) {
      return null;
    }

    const k = bank.coeffs;
    const base = k.base;
    const paymentFee = (v.payments as number) * k.perPayment;
    const cashFee = (v.cash as number) * k.cashRate;
    const aqRate = v.acquiringType === "online" ? k.aqOnline : k.aqOffline;
    const acquiringFee = (v.acquiring as number) * aqRate;
    const total = base + paymentFee + cashFee + acquiringFee;
    const min = Math.round(total * 0.85);
    const max = Math.round(total * 1.1);
    return { total, min, max };
  }, [bank, v]);

  return (
    <section className={s.section} id="calculator">
      {/* ВНИМАНИЕ: новая внутренняя «узкая» обёртка */}
      <div className={s.inner}>
        <h2 className={s.heading}>Калькулятор стоимости</h2>
        <p className={s.sub}>
          Сначала выберите банк — затем введите исходные данные.
        </p>

        <div className={s.grid}>
          {/* колонка: ввод */}
          <div className={s.card}>
            <h3>Банк</h3>
            <select
              className={s.select}
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
            >
              <option value="" disabled>
                Выберите банк…
              </option>
              {(banks as Bank[]).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <h3 className={s.h3}>Исходные данные</h3>

            <label>
              Обороты, ₽/мес
              <input
                type="number"
                placeholder="Введите обороты в месяц"
                value={v.turnover}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    turnover: e.target.value === "" ? "" : +e.target.value,
                  }))
                }
              />
            </label>

            <label>
              Платежей в месяц
              <input
                type="number"
                placeholder="Сколько исходящих платежей в месяц"
                value={v.payments}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    payments: e.target.value === "" ? "" : +e.target.value,
                  }))
                }
              />
            </label>

            <label>
              Наличные, ₽/мес
              <input
                type="number"
                placeholder="Сколько снимаете наличными в месяц"
                value={v.cash}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    cash: e.target.value === "" ? "" : +e.target.value,
                  }))
                }
              />
            </label>

            <label>
              Эквайринг, оборот
              <input
                type="number"
                placeholder="Оборот по эквайрингу"
                value={v.acquiring}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    acquiring: e.target.value === "" ? "" : +e.target.value,
                  }))
                }
              />
            </label>

            <div className={s.switch}>
              <span>Тип эквайринга</span>
              <div className={s.segment}>
                <button
                  onClick={() =>
                    setV((p) => ({ ...p, acquiringType: "online" }))
                  }
                  className={v.acquiringType === "online" ? s.active : ""}
                >
                  Онлайн
                </button>
                <button
                  onClick={() =>
                    setV((p) => ({ ...p, acquiringType: "offline" }))
                  }
                  className={v.acquiringType === "offline" ? s.active : ""}
                >
                  Офлайн (POS)
                </button>
              </div>
            </div>
          </div>

          {/* колонка: результат */}
          <div className={s.card}>
            <h3>Результат</h3>

            {!bank ? (
              <div className={s.help}>Выберите банк.</div>
            ) : (
              <div className={s.result}>
                <div className={s.row}>
                  <div className={s.label}>Банк</div>
                  <div className={s.value}>{bank.name}</div>
                </div>

                <div className={s.row}>
                  <div className={s.label}>Оценка, ₽/мес</div>
                  <div className={s.value}>
                    {res ? (
                      <>
                        от {fmt(res.min)} до {fmt(res.max)}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                {/* шкала — доля ежемесячных затрат к обороту */}
                <div aria-hidden className={s.gaugeWrap}>
                  <span className={s.gaugeBg} />
                  <span
                    className={s.gaugeFill}
                    style={{
                      width:
                        res && v.turnover !== "" && (v.turnover as number) > 0
                          ? `${Math.min(
                              100,
                              Math.round(
                                (res.total / (v.turnover as number)) * 100
                              )
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

                <p className={s.note}>
                  Диапазон зависит от тарифов/коэффициентов выбранного банка;
                  шкала показывает долю ежемесячных затрат к обороту.
                </p>
              </div>
            )}
          </div>
        </div>
        <p className={s.sub} role="note">
          Расчёты носят ориентировочный характер: точные условия и итоговые
          суммы подтверждает банк; данные берутся из тарифов банка и могут
          отличаться.
        </p>
      </div>
    </section>
  );
}
