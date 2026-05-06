import Link from "next/link";
import type { Metadata } from "next";
import { PROJECT, ABOUT_SECTIONS, TECH_STACK } from "@/config";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="container" style={{ 
      paddingTop: "clamp(40px, 8vw, 80px)", 
      paddingBottom: "clamp(40px, 8vw, 80px)",
      paddingLeft: "clamp(16px, 4vw, 24px)",
      paddingRight: "clamp(16px, 4vw, 24px)",
    }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{ 
        textAlign: "center", 
        marginBottom: "clamp(40px, 8vw, 80px)", 
        position: "relative" 
      }}>
        {/* Decorative glows */}
        <div
          className="hero-glow"
          style={{
            width: "min(400px, 80vw)",
            height: "min(300px, 40vh)",
            background: "var(--accent3)",
            top: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "100%",
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
            color: "var(--accent3)",
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
              background: "var(--accent3)",
              boxShadow: "0 0 10px var(--accent3)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Behind the Scenes
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
          About
          <br />
          <span style={{ color: "var(--accent3)" }}>{PROJECT.shortName}</span>
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
          An open-source initiative bridging the gap between abstract cryptographic theory and intuitive visual understanding.
        </p>

        <div style={{ 
          display: "flex", 
          gap: "clamp(8px, 2vw, 12px)", 
          justifyContent: "center", 
          flexWrap: "wrap",
          paddingLeft: "clamp(0px, 2vw, 16px)",
          paddingRight: "clamp(0px, 2vw, 16px)",
        }}>
          {PROJECT.socials?.github && (
            <a href={PROJECT.socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              GitHub
            </a>
          )}
          {PROJECT.socials?.instagram && (
            <a href={PROJECT.socials.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Instagram
            </a>
          )}
          {PROJECT.socials?.twitter && (
            <a href={PROJECT.socials.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Twitter
            </a>
          )}
          {PROJECT.socials?.linkedin && (
            <a href={PROJECT.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              LinkedIn
            </a>
          )}
        </div>
      </section>

      {/* ── About Sections ──────────────────────────────────── */}
      <section 
        className="grid-2" 
        style={{ 
          marginBottom: "clamp(32px, 6vw, 64px)",
          gap: "clamp(16px, 3vw, 24px)",
        }}
      >
        {ABOUT_SECTIONS.map((section, idx) => {
          const color = idx % 2 === 0 ? "var(--accent)" : "var(--accent2)";
          return (
            <div
              key={section.title}
              className="card"
              style={{
                borderColor: color,
                boxShadow: `0 0 0 1px ${color}18, inset 0 0 60px ${color}04`,
                display: "flex",
                flexDirection: "column",
                gap: "clamp(16px, 2vw, 20px)",
                padding: "clamp(20px, 4vw, 32px)",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "clamp(20px, 3vw, 24px)",
                    marginBottom: "clamp(8px, 2vw, 12px)",
                    color: "var(--text-bright)",
                  }}
                >
                  {section.title}
                </h2>
                <p style={{ 
                  color: "var(--text-dim)", 
                  lineHeight: 1.7, 
                  fontSize: "clamp(14px, 2vw, 15px)" 
                }}>
                  {section.body}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Tech Stack ──────────────────────────────── */}
      <section 
        className="card" 
        style={{ 
          marginBottom: "clamp(32px, 6vw, 64px)",
          padding: "clamp(20px, 4vw, 32px)",
        }}
      >
        <div 
          className="card-header"
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            marginBottom: "clamp(16px, 3vw, 24px)",
          }}
        >
          Tech Stack
        </div>
        <div 
          className="grid-3" 
          style={{ 
            gap: "clamp(8px, 2vw, 12px)",
          }}
        >
          {TECH_STACK.map((tech) => (
            <div
              key={tech.label}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "clamp(12px, 2vw, 14px) clamp(12px, 2vw, 16px)",
                minWidth: 0, // Prevents overflow
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
                {tech.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  color: "var(--accent3)",
                  fontWeight: 600,
                  wordBreak: "break-word",
                }}
              >
                {tech.value}
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
        <span style={{ color: "var(--accent3)" }}>{PROJECT.developer}</span>
        {" · "}
        {PROJECT.name}
        {" · "}
        {PROJECT.year}
      </footer>
    </div>
  );
}