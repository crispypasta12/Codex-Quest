import { GameSection } from "@/components/game/GameSection";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main className="app-shell">
      <Hero />
      <section className="section-divider" aria-label="Chapter divider">
        <div className="section-divider-content">
          <span>Now Entering</span>
          <span className="line" />
          <span className="chapter">Loop Forest</span>
          <span className="line" />
          <span>Scroll to enter ↓</span>
        </div>
      </section>
      <GameSection />
    </main>
  );
}
