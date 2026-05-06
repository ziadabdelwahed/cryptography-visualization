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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {title && (
        <div className="card-header" style={{ marginBottom: 8 }}>
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
            }}
            onClick={() => setActiveIdx(isActive ? null : i)}
          >
            {/* Label row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="rsa-step-label">{step.label}</div>
              <svg
                width="14"
                height="14"
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
              style={{ maxHeight: isActive ? "none" : 40, overflow: "hidden" }}
            >
              {step.value}
            </div>

            {/* Expanded detail */}
            {isActive && (
              <>
                <div className="formula-block">{step.formula}</div>
                <p className="description-text">{step.description}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}