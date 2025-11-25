import styles from "./App.module.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import BestBanks from "./components/BestBanks/BestBanks";
import Calculator from "./components/Calculator/Calculator";
import Rating from "./components/Rating/Rating";
import EgrulBlock from "./components/EgrulBlock/EgrulBlock";
import CalculatorV2 from "./components/CalculatorV2/CalculatorV2";

export default function App() {
  return (
    <div className={styles.page}>
      {/* ВЕРХНЯЯ НАВИГАЦИЯ */}
      <Header />

      <main>
        <section id="hero">
          <Hero />
        </section>
        <section id="best">
          <BestBanks />
        </section>
        {/* <section id="calculator">
          <Calculator />
        </section> */}
        <section id="calculator">
          <CalculatorV2 />
        </section>{" "}
        <section id="rating">
          <Rating />
        </section>
        <section id="EgrulBlock">
          <EgrulBlock />
        </section>
      </main>

      <Footer />
    </div>
  );
}
// "logo": "modulbank.svg",
// "fallbackLogo": "https://logo.clearbit.com/modulbank.ru",

//       "logo": "vtb.svg",
// "fallbackLogo": "https://logo.clearbit.com/vtb.ru",

//       "logo": "tochka.svg",
// "fallbackLogo": "https://logo.clearbit.com/tochka.com",

//       "logo": "tinkoff.svg",
// "fallbackLogo": "https://logo.clearbit.com/tbank.ru",

// "logo": "alfa.svg",
