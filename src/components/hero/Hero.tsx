"use client";

import { useEffect, useRef } from "react";

import { Bookshelf } from "./Bookshelf";
import { FloatingParticles } from "./FloatingParticles";
import { StarField } from "./StarField";
import { TitleLogo } from "./TitleLogo";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      const sy = window.scrollY;
      if (!heroRef.current) return;

      const stars = heroRef.current.querySelector<HTMLElement>(".hero-stars");
      const bookshelf = heroRef.current.querySelector<HTMLElement>(".bookshelf-scene");
      const content = heroRef.current.querySelector<HTMLElement>(".hero-content");

      if (stars) stars.style.transform = `translateY(${sy * 0.3}px)`;
      if (bookshelf) bookshelf.style.transform = `translateY(${sy * 0.1}px)`;
      if (content) content.style.opacity = `${Math.max(0, 1 - sy / 600)}`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function enterAcademy() {
    document.getElementById("game-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="hero" ref={heroRef}>
      <StarField />
      <FloatingParticles />
      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-tag">
            <span className="pulse" />
            <span>Loop Forest · Open Now</span>
          </div>
          <TitleLogo />
          <p className="hero-sub">
            A cozy pixel world where computer science is a kind of magic. Walk
            through Loop Forest. Befriend tired machines. Learn{" "}
            <em>loops, functions, algorithms,</em> and how everything talks to
            everything else — at your own pace, by the lantern light.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={enterAcademy}>
              Enter The Academy
            </button>
            <button className="btn-ghost">Read the Codex</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="num">7</span>
              <span className="label">Chapters</span>
            </div>
            <div className="hero-stat">
              <span className="num">240+</span>
              <span className="label">Lessons</span>
            </div>
            <div className="hero-stat">
              <span className="num">∞</span>
              <span className="label">Loops</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <Bookshelf />
        </div>
      </div>
    </section>
  );
}
