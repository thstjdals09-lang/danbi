import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell" style={{ minHeight: "70svh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
      <p className="eyebrow">404 · Not found</p>
      <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 120px)" }}>
        No player
        <br />
        at this seat.
      </h1>
      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn">
          Back home <span className="arrow">→</span>
        </Link>
        <Link href="/community" className="link">Find players</Link>
      </div>
    </section>
  );
}
