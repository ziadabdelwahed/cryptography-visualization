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
    <div className="container" style={{ 
      paddingTop: "clamp(40px, 8vw, 80px)", 
      paddingBottom: "clamp(40px, 8vw, 80px)",
      paddingLeft: "clamp(16px, 4vw, 24px)",
      paddingRight: "clamp(16px, 4vw, 24px)",
    }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{ 
          textAlign: "center", 
          marginBottom: "clamp(40px, 8vw, 80px)", 
          position: "relative" 
        }}
      >
        {/* Decorative glows */}
        <div
          className="hero-glow"
          style={{
            width: "min(500px, 90vw)",
            height: "min(300px, 40vh)",
            background: "var(--accent)",
            top: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "100%",
          }}
        />
        <div
          className="hero-glow"
          style={{
            width: "min(300px, 60vw)",
            height: "min(200px, 30vh)",
            background: "var(--accent2)",
            top: "5%",
            left: "clamp(20%, 30%, 30%)",
            display: "block",
          }}
        />

        {/* Tag line */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--heading)",
            fontSize: "clamp(8px, 1.5vw, 10px)",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "1px solid var(--border)",
            padding: "6px 16px",
            borderRadius: 2,
            marginBottom: "clamp(20px, 4vw, 28px)",
            flexWrap: "wrap",
            justifyContent: "center",
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
              flexShrink: 0,
            }}
          />
          Pure Mathematics — No Libraries
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 8vw, 72px)",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            marginBottom: "clamp(16px, 3vw, 20px)",
            paddingLeft: "clamp(0px, 2vw, 16px)",
            paddingRight: "clamp(0px, 2vw, 16px)",
          }}
        >
          Cryptography
          <br />
          <span style={{ color: "var(--accent)" }}>Visualized</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2.5vw, 18px)",
            color: "var(--text-dim)",
            maxWidth: "min(560px, 90vw)",
            margin: "0 auto clamp(24px, 4vw, 36px)",
            lineHeight: 1.7,
            fontFamily: "var(--body)",
            paddingLeft: "clamp(0px, 2vw, 16px)",
            paddingRight: "clamp(0px, 2vw, 16px)",
          }}
        >
          {PROJECT.description}
        </p>

        <div style={{ 
          display: "flex", 
          gap: "clamp(8px, 2vw, 12px)", 
          justifyContent: "center", 
          flexWrap: "wrap",
          paddingLeft: "clamp(0px, 2vw, 16px)",
          paddingRight: "clamp(0px, 2vw, 16px)",
        }}>
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
      <section 
        className="grid-2" 
        style={{ 
          marginBottom: "clamp(32px, 6vw, 64px)",
          gap: "clamp(16px, 3vw, 24px)",
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.href}
            className="card"
            style={{
              borderColor: f.color,
              boxShadow: `0 0 0 1px ${f.color}18, inset 0 0 60px ${f.color}04`,
              display: "flex",
              flexDirection: "column",
              gap: "clamp(16px, 2vw, 20px)",
              padding: "clamp(20px, 4vw, 24px)",
            }}
          >
            {/* Tag */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "clamp(8px, 2vw, 12px)",
              flexWrap: "wrap",
            }}>
              <div
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: "clamp(8px, 1.3vw, 10px)",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  color: f.color,
                  border: `1px solid ${f.color}`,
                  padding: "4px 10px",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {f.tag}
              </div>
              <div
                style={{
                  fontFamily: "var(--body)",
                  fontSize: "clamp(11px, 1.8vw, 12px)",
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
                  fontSize: "clamp(22px, 3.5vw, 28px)",
                  marginBottom: "clamp(8px, 2vw, 12px)",
                  color: "var(--text-bright)",
                }}
              >
                {f.title}
              </h2>
              <p style={{ 
                color: "var(--text-dim)", 
                lineHeight: 1.7, 
                fontSize: "clamp(13px, 2vw, 14px)" 
              }}>
                {f.body}
              </p>
            </div>

            {/* Bullet list */}
            <ul style={{ 
              listStyle: "none", 
              display: "flex", 
              flexDirection: "column", 
              gap: "clamp(6px, 1.5vw, 8px)" 
            }}>
              {f.bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(6px, 1.5vw, 10px)",
                    fontSize: "clamp(11px, 1.8vw, 13px)",
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <span style={{ 
                    color: f.color, 
                    fontSize: "clamp(14px, 2vw, 16px)",
                    flexShrink: 0,
                  }}>›</span>
                  {b}
                </li>
              ))}
            </ul>

            <Link 
              href={f.href} 
              className={f.ctaClass} 
              style={{ 
                alignSelf: "flex-start",
                fontSize: "clamp(10px, 1.5vw, 11px)",
                padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
              }}
            >
              {f.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* ── Math facts ticker ──────────────────────────────── */}
      <section 
        className="card" 
        style={{ 
          marginBottom: "clamp(32px, 6vw, 64px)",
          padding: "clamp(20px, 4vw, 24px)",
        }}
      >
        <div className="card-header" style={{
          fontSize: "clamp(10px, 1.5vw, 11px)",
          marginBottom: "clamp(16px, 3vw, 20px)",
        }}>
          Math Facts
        </div>
        <div className="grid-3" style={{ gap: "clamp(8px, 2vw, 12px)" }}>
          {MATH_FACTS.map((fact) => (
            <div
              key={fact.label}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "clamp(12px, 2vw, 14px) clamp(12px, 2vw, 16px)",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: "clamp(7px, 1.2vw, 9px)",
                  letterSpacing: "0.2em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  marginBottom: "clamp(4px, 1vw, 6px)",
                }}
              >
                {fact.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  color: "var(--accent)",
                  fontWeight: 600,
                  wordBreak: "break-word",
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
          paddingTop: "clamp(24px, 4vw, 32px)",
          paddingBottom: "clamp(16px, 3vw, 24px)",
          color: "var(--text-dim)",
          fontSize: "clamp(10px, 1.5vw, 12px)",
          fontFamily: "var(--mono)",
          letterSpacing: "0.05em",
          wordBreak: "break-word",
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