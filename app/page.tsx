import Link from "next/link";
import type { Metadata } from "next";
import { PROJECT } from "@/config";

export const metadata: Metadata = {
  title: "Home",
};

const FEATURES = [
  {
    href: "/aes",
    tag: "AES",
    color: "var(--accent)",
    title: "AES Encryption",
    subtitle: "Advanced Encryption Standard",
    body: "Step through every SubBytes, ShiftRows, MixColumns, and AddRoundKey operation. Supports AES-128, AES-192, and AES-256. Every byte change highlighted in real time.",
    bullets: [
      "10 / 12 / 14 rounds visualized",
      "Full key expansion walkthrough",
      "GF(2⁸) Galois field arithmetic",
      "Encrypt & Decrypt with any key",
    ],
    cta: "Open AES →",
    ctaClass: "btn btn-primary",
  },
  {
    href: "/rsa",
    tag: "RSA",
    color: "var(--accent2)",
    title: "RSA Encryption",
    subtitle: "Rivest–Shamir–Adleman",
    body: "Generate prime pairs with Miller-Rabin testing, compute private keys via the Extended Euclidean Algorithm, and watch every square-and-multiply exponentiation step.",
    bullets: [
      "Random prime generation",
      "Euler's totient & modular inverse",
      "Extended Euclidean Algorithm",
      "Square-and-multiply visualization",
    ],
    cta: "Open RSA →",
    ctaClass: "btn btn-secondary",
  },
] as const;

const MATH_FACTS = [
  { label: "AES block size", value: "128 bits" },
  { label: "AES key sizes", value: "128 / 192 / 256" },
  { label: "AES rounds (128)", value: "10 rounds" },
  { label: "S-Box entries", value: "256 lookups" },
  { label: "GF(2⁸) polynomial", value: "x⁸+x⁴+x³+x+1" },
  { label: "RSA key exchange", value: "Asymmetric" },
  { label: "RSA security basis", value: "Integer factoring" },
  { label: "Miller-Rabin witnesses", value: "12 deterministic" },
] as const;

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{ textAlign: "center", marginBottom: 80, position: "relative" }}
      >
        {/* Decorative glows */}
        <div
          className="hero-glow"
          style={{
            width: 500,
            height: 300,
            background: "var(--accent)",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="hero-glow"
          style={{
            width: 300,
            height: 200,
            background: "var(--accent2)",
            top: 20,
            left: "30%",
          }}
        />

        {/* Tag line */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--heading)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "1px solid var(--border)",
            padding: "6px 16px",
            borderRadius: 2,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "var(--glow)",
              display: "inline-block",
            }}
          />
          Pure Mathematics — No Libraries
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            marginBottom: 20,
          }}
        >
          Cryptography
          <br />
          <span style={{ color: "var(--accent)" }}>Visualized</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-dim)",
            maxWidth: 560,
            margin: "0 auto 36px",
            lineHeight: 1.7,
            fontFamily: "var(--body)",
          }}
        >
          {PROJECT.description}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/aes" className="btn btn-primary">
            Explore AES
          </Link>
          <Link href="/rsa" className="btn btn-secondary">
            Explore RSA
          </Link>
          <Link href="/about" className="btn btn-ghost">
            Learn More
          </Link>
        </div>
      </section>

      {/* ── Feature cards ──────────────────────────────────── */}
      <section className="grid-2" style={{ marginBottom: 64 }}>
        {FEATURES.map((f) => (
          <div
            key={f.href}
            className="card"
            style={{
              borderColor: f.color,
              boxShadow: `0 0 0 1px ${f.color}18, inset 0 0 60px ${f.color}04`,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Tag */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  color: f.color,
                  border: `1px solid ${f.color}`,
                  padding: "4px 10px",
                  borderRadius: 2,
                }}
              >
                {f.tag}
              </div>
              <div
                style={{
                  fontFamily: "var(--body)",
                  fontSize: 12,
                  color: "var(--text-dim)",
                  letterSpacing: "0.05em",
                }}
              >
                {f.subtitle}
              </div>
            </div>

            <div>
              <h2
                style={{
                  fontSize: 28,
                  marginBottom: 12,
                  color: "var(--text-bright)",
                }}
              >
                {f.title}
              </h2>
              <p style={{ color: "var(--text-dim)", lineHeight: 1.7, fontSize: 14 }}>
                {f.body}
              </p>
            </div>

            {/* Bullet list */}
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {f.bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <span style={{ color: f.color, fontSize: 16 }}>›</span>
                  {b}
                </li>
              ))}
            </ul>

            <Link href={f.href} className={f.ctaClass} style={{ alignSelf: "flex-start" }}>
              {f.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* ── Math facts ticker ──────────────────────────────── */}
      <section className="card" style={{ marginBottom: 64 }}>
        <div className="card-header">Math Facts</div>
        <div className="grid-3" style={{ gap: 12 }}>
          {MATH_FACTS.map((fact) => (
            <div
              key={fact.label}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {fact.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 14,
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer credit ─────────────────────────────────── */}
      <footer
        style={{
          textAlign: "center",
          borderTop: "1px solid var(--border)",
          paddingTop: 32,
          color: "var(--text-dim)",
          fontSize: 12,
          fontFamily: "var(--mono)",
          letterSpacing: "0.05em",
        }}
      >
        Built by{" "}
        <span style={{ color: "var(--accent)" }}>{PROJECT.developer}</span>
        {" · "}
        {PROJECT.name}
        {" · "}
        {PROJECT.year}
      </footer>
    </div>
  );
}