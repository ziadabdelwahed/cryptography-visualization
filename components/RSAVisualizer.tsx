"use client";

import { useState } from "react";
import type { RSAKeyGenStep, RSAEncryptStep } from "@/lib/rsa";

interface RSAVisualizerProps {
  steps: RSAKeyGenStep[] | RSAEncryptStep[];
  title?: string;
}

export default function RSAVisualizer({ steps, title }: RSAVisualizerProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1vw, 8px)" }}>
      {title && (
        <div className="card-header" style={{ 
          marginBottom: "clamp(6px, 1vw, 8px)",
          fontSize: "clamp(10px, 1.5vw, 11px)",
        }}>
          {title}
        </div>
      )}

      {steps.map((step, i) => {
        const isActive = activeIdx === i;
        return (
          <div
            key={i}
            className={`rsa-step animate-fade-up`}
            style={{
              animationDelay: `${i * 0.05}s`,
              borderColor: isActive ? "var(--accent)" : undefined,
              boxShadow: isActive
                ? "0 0 0 1px rgba(0,255,231,0.1)"
                : undefined,
              cursor: "pointer",
              padding: "clamp(16px, 3vw, 20px)",
            }}
            onClick={() => setActiveIdx(isActive ? null : i)}
          >
            {/* Label row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "clamp(8px, 1.5vw, 12px)",
              }}
            >
              <div className="rsa-step-label" style={{
                fontSize: "clamp(9px, 1.3vw, 10px)",
                flex: 1,
                minWidth: 0,
              }}>
                {step.label}
              </div>
              <svg
                width="clamp(12px, 2vw, 14px)"
                height="clamp(12px, 2vw, 14px)"
                viewBox="0 0 14 14"
                fill="none"
                style={{
                  color: "var(--text-dim)",
                  transform: isActive ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              >
                <path
                  d="M3 5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Value — always shown, truncated */}
            <div
              className="rsa-value"
              style={{ 
                maxHeight: isActive ? "none" : "clamp(32px, 5vw, 40px)", 
                overflow: "hidden",
                fontSize: "clamp(11px, 1.8vw, 13px)",
                padding: "clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 12px)",
                wordBreak: "break-all",
                marginTop: "clamp(6px, 1vw, 8px)",
                marginBottom: "clamp(6px, 1vw, 8px)",
              }}
            >
              {step.value}
            </div>

            {/* Expanded detail */}
            {isActive && (
              <>
                <div className="formula-block" style={{
                  fontSize: "clamp(11px, 1.5vw, 12px)",
                  padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                  marginTop: "clamp(8px, 1.5vw, 12px)",
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                  wordBreak: "break-all",
                }}>
                  {step.formula}
                </div>
                <p className="description-text" style={{
                  fontSize: "clamp(12px, 1.8vw, 14px)",
                  lineHeight: 1.7,
                  wordBreak: "break-word",
                }}>
                  {step.description}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}