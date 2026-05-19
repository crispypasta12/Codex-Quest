export function TitleLogo() {
  return (
    <h1 className="hero-title">
      <span>The </span>
      <span className="accent">Code Academy</span>
      <span
        style={{
          display: "block",
          fontSize: "0.5em",
          color: "var(--ink-dim)",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          letterSpacing: "0.04em",
          marginTop: 12,
        }}
      >
        a cozy place to learn how machines think
      </span>
    </h1>
  );
}
