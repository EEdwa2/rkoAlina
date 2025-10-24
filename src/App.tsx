import styles from "./App.module.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import BestBanks from "./components/BestBanks/BestBanks";
import Calculator from "./components/Calculator/Calculator";
import Rating from "./components/Rating/Rating";

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

        <section id="calculator">
          <Calculator />
        </section>

        <section id="rating">
          <Rating />
        </section>
      </main>

      <Footer />
    </div>
  );
}
