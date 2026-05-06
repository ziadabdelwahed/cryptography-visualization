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
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <div className="input-label" style={{ textAlign: "center" }}>
          {label}
        </div>
      )}
      <div
        className="state-matrix"
        style={small ? { maxWidth: 160, gap: 3 } : undefined}
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
                    ? { fontSize: 10, padding: "5px 2px" }
                    : undefined
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