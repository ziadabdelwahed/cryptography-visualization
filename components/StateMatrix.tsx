"use client";

import type { AESState } from "@/lib/aes";

interface StateMatrixProps {
  state: AESState;
  changedCells?: boolean[][];
  label?: string;
  small?: boolean;
}

export default function StateMatrix({
  state,
  changedCells,
  label,
  small = false,
}: StateMatrixProps) {
  return (
    <div style={{ 
      display: "inline-flex", 
      flexDirection: "column", 
      gap: "clamp(4px, 1vw, 6px)",
      minWidth: 0,
    }}>
      {label && (
        <div className="input-label" style={{ 
          textAlign: "center",
          fontSize: "clamp(9px, 1.3vw, 10px)",
          wordBreak: "break-word",
        }}>
          {label}
        </div>
      )}
      <div
        className="state-matrix"
        style={small 
          ? { 
              maxWidth: "clamp(120px, 25vw, 160px)", 
              gap: "clamp(2px, 0.5vw, 3px)" 
            } 
          : {
              maxWidth: "clamp(180px, 35vw, 220px)",
              gap: "clamp(3px, 0.7vw, 4px)",
            }
        }
      >
        {state.map((row, r) =>
          row.map((byte, c) => {
            const changed = changedCells?.[r]?.[c] ?? false;
            return (
              <div
                key={`${r}-${c}`}
                className={`matrix-cell${changed ? " changed" : ""}`}
                style={
                  small
                    ? { 
                        fontSize: "clamp(8px, 1.5vw, 10px)", 
                        padding: "clamp(3px, 0.8vw, 5px) clamp(1px, 0.3vw, 2px)",
                        minWidth: 0,
                      }
                    : {
                        fontSize: "clamp(10px, 1.8vw, 12px)",
                        padding: "clamp(6px, 1.2vw, 8px) clamp(2px, 0.5vw, 4px)",
                        minWidth: 0,
                      }
                }
                title={`row ${r}, col ${c} = 0x${byte
                  .toString(16)
                  .padStart(2, "0")} (${byte})`}
              >
                {byte.toString(16).padStart(2, "0")}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}