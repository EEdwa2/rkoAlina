import s from "./BankCardAndTar.module.css";
import TariffItem from "../TariffItem/TariffItem";

import type { Tariff } from "../../types/tariff";
import type { OrgType, BankId } from "../../types/bank";
import { feeByPayments, feeByPercentRule } from "../../utils/tariffMath";

type Inputs = { payments: number; withdrawal: number; deposit: number };

type Props = {
  bankId: BankId;
  bankName: string;
  bankLogo: string;
  tariffs: Tariff[];
  org: OrgType;
  inputs: Inputs;
};

export default function BankCardAndTar({
  bankName,
  bankLogo,
  tariffs,
  org,
  inputs,
}: Props) {
  const items = tariffs
    .filter((t) => t.for.includes(org))
    .map((t) => ({
      tariff: t,
      total:
        t.monthly +
        feeByPayments(inputs.payments, t.payments) +
        feeByPercentRule(inputs.withdrawal, t.withdrawal) +
        feeByPercentRule(inputs.deposit, t.deposit),
    }))
    .sort((a, b) => a.total - b.total);

  return (
    <div className={s.card}>
      <div className={s.head}>
        <div className={s.logo}>
          <img src={bankLogo} alt={bankName} />
        </div>
        <div className={s.title}>{bankName}</div>
      </div>

      <div className={s.grid}>
        {items.map(({ tariff }) => (
          <TariffItem
            key={tariff.id}
            t={tariff}
            link={tariff.link}
            inputs={inputs}
          />
        ))}
      </div>
    </div>
  );
}
