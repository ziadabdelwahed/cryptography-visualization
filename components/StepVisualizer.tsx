"use client";

import { useState } from "react";
import type { AESStep } from "@/lib/aes";
import StateMatrix from "./StateMatrix";

interface StepVisualizerProps {
  steps: AESStep[];
}

const BADGE_CLASS: Record<string, string> = {
  SubBytes:      "subbytes",
  InvSubBytes:   "subbytes",
  ShiftRows:     "shiftrows",
  InvShiftRows:  "shiftrows",
  MixColumns:    "mixcolumns",
  InvMixColumns: "mixcolumns",
  AddRoundKey:   "addroundkey",
  Input:         "input",
};

export default function StepVisualizer({ steps }: StepVisualizerProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const toggle = (i: number) =>
    setActiveIdx((prev) => (prev === i ? null : i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1vw, 8px)" }}>
      {/* Step navigation dots */}
      <div className="step-nav" style={{
        gap: "clamp(4px, 0.8vw, 6px)",
        marginBottom: "clamp(12px, 2vw, 16px)",
      }}>
        {steps.map((s, i) => (
          <div
            key={i}
            className={`step-dot${activeIdx === i ? " active" : ""}`}
            onClick={() => toggle(i)}
            title={`Round ${s.round} — ${s.operation}`}
            style={{
              width: "clamp(7px, 1.2vw, 8px)",
              height: "clamp(7px, 1.2vw, 8px)",
            }}
          />
        ))}
      </div>

      {/* Step cards */}
      {steps.map((step, i) => {
        const isActive = activeIdx === i;
        const badgeClass =
          BADGE_CLASS[step.operation] ?? "input";

        return (
          <div
            key={i}
            className={`step-card${isActive ? " active" : ""} animate-fade-up`}
            style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
          >
            {/* Header — always visible */}
            <div 
              className="step-header" 
              onClick={() => toggle(i)}
              style={{
                padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 20px)",
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "clamp(8px, 1.5vw, 12px)",
                flex: 1,
                minWidth: 0,
              }}>
                {/* Round pill */}
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "clamp(9px, 1.3vw, 10px)",
                    color: "var(--text-dim)",
                    minWidth: "clamp(50px, 10vw, 60px)",
                    flexShrink: 0,
                  }}
                >
                  RND {String(step.round).padStart(2, "0")}
                </div>

                <span 
                  className={`step-badge ${badgeClass}`}
                  style={{
                    fontSize: "clamp(8px, 1.2vw, 9px)",
                    padding: "clamp(3px, 0.5vw, 4px) clamp(8px, 1.5vw, 10px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.operation}
                </span>
              </div>

              {/* Chevron */}
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
                  marginLeft: "clamp(8px, 1.5vw, 12px)",
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

            {/* Body — expanded */}
            {isActive && (
              <div className="step-body" style={{
                padding: "clamp(16px, 3vw, 20px)",
              }}>
                {/* Description */}
                <p className="description-text" style={{
                  fontSize: "clamp(12px, 1.8vw, 14px)",
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                }}>
                  {step.description}
                </p>

                {/* Formula */}
                <div className="formula-block" style={{
                  fontSize: "clamp(11px, 1.5vw, 12px)",
                  padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                  wordBreak: "break-all",
                }}>
                  {step.formula}
                </div>

                {/* Matrices side by side */}
                <div
                  style={{
                    display: "flex",
                    gap: "clamp(16px, 3vw, 32px)",
                    flexWrap: "wrap",
                    marginTop: "clamp(12px, 2vw, 16px)",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <StateMatrix
                    state={step.state}
                    changedCells={step.changedCells}
                    label="State After"
                  />

                  {step.roundKey && (
                    <StateMatrix
                      state={step.roundKey}
                      label={`Round Key ${step.round}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}