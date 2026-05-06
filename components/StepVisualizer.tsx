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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Step navigation dots */}
      <div className="step-nav">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`step-dot${activeIdx === i ? " active" : ""}`}
            onClick={() => toggle(i)}
            title={`Round ${s.round} — ${s.operation}`}
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
            <div className="step-header" onClick={() => toggle(i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Round pill */}
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--text-dim)",
                    minWidth: 60,
                  }}
                >
                  RND {String(step.round).padStart(2, "0")}
                </div>

                <span className={`step-badge ${badgeClass}`}>
                  {step.operation}
                </span>
              </div>

              {/* Chevron */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{
                  color: "var(--text-dim)",
                  transform: isActive ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
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
              <div className="step-body">
                {/* Description */}
                <p className="description-text">{step.description}</p>

                {/* Formula */}
                <div className="formula-block">{step.formula}</div>

                {/* Matrices side by side */}
                <div
                  style={{
                    display: "flex",
                    gap: 32,
                    flexWrap: "wrap",
                    marginTop: 16,
                    alignItems: "flex-start",
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