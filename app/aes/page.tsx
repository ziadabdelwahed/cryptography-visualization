"use client";

import { useState, useCallback } from "react";
import {
  aesEncrypt,
  aesDecrypt,
  normalizeKey,
  textToBlock,
  blockToText,
  bytesToHex,
  hexToBytes,
  type AESResult,
} from "@/lib/aes";
import { AES_CONFIG, AES_KEY_SIZE_LABELS } from "@/config";
import StepVisualizer from "@/components/StepVisualizer";
import StateMatrix from "@/components/StateMatrix";

type Mode = "encrypt" | "decrypt";
type KeyBits = 128 | 192 | 256;
type InputFormat = "text" | "hex";

export default function AESPage() {
  // ── UI state ──────────────────────────────────────────────
  const [mode, setMode]               = useState<Mode>("encrypt");
  const [tab, setTab]                 = useState<"steps" | "keys">("steps");
  const [keyBits, setKeyBits]         = useState<KeyBits>(AES_CONFIG.defaultKeyBits);
  const [inputFormat, setInputFormat] = useState<InputFormat>("text");
  const [inputVal, setInputVal]       = useState(AES_CONFIG.defaultPlaintext);
  const [keyVal, setKeyVal]           = useState(AES_CONFIG.defaultKey);
  const [result, setResult]           = useState<AESResult | null>(null);
  const [error, setError]             = useState<string>("");
  const [loading, setLoading]         = useState(false);

  // ── Run ───────────────────────────────────────────────────
  const run = useCallback(() => {
    setError("");
    setLoading(true);

    try {
      // Parse input bytes
      let inputBytes: number[];
      if (inputFormat === "hex") {
        const clean = inputVal.replace(/\s/g, "");
        if (clean.length !== 32)
          throw new Error("Hex input must be exactly 32 hex chars (16 bytes).");
        inputBytes = hexToBytes(clean);
      } else {
        inputBytes = textToBlock(inputVal);
      }

      // Parse key bytes
      const keyBytes = normalizeKey(keyVal, keyBits);

      // Run AES
      const res =
        mode === "encrypt"
          ? aesEncrypt(inputBytes, keyBytes)
          : aesDecrypt(inputBytes, keyBytes);

      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [mode, keyBits, inputFormat, inputVal, keyVal]);

  // ── Output text (for encrypt: decoded output; for decrypt: decoded) ──
  const outputText = result ? blockToText(result.outputBytes) : "";
  const outputHex  = result ? result.outputHex : "";

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "var(--heading)",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ◈ Algorithm / AES
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 8 }}>
          AES Encryption
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: 540 }}>
          Advanced Encryption Standard — symmetric block cipher operating on a
          4×4 byte state. Implemented from scratch: S-Box, MixColumns in
          GF(2⁸), full key expansion with Rcon.
        </p>
      </div>

      {/* ── Controls grid ────────────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: 32, alignItems: "start" }}>
        {/* Left: inputs */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card-header">Configuration</div>

          {/* Mode toggle */}
          <div className="input-group">
            <label className="input-label">Mode</label>
            <div className="tab-bar" style={{ marginBottom: 0 }}>
              {(["encrypt", "decrypt"] as Mode[]).map((m) => (
                <button
                  key={m}
                  className={`tab-btn${mode === m ? " active" : ""}`}
                  onClick={() => { setMode(m); setResult(null); }}
                >
                  {m === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
                </button>
              ))}
            </div>
          </div>

          {/* Key size */}
          <div className="input-group">
            <label className="input-label">Key Size</label>
            <select
              className="select-field"
              value={keyBits}
              onChange={(e) => setKeyBits(Number(e.target.value) as KeyBits)}
            >
              {([128, 192, 256] as KeyBits[]).map((k) => (
                <option key={k} value={k}>
                  {AES_KEY_SIZE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          {/* Input format */}
          <div className="input-group">
            <label className="input-label">
              {mode === "encrypt" ? "Plaintext" : "Ciphertext"} Format
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["text", "hex"] as InputFormat[]).map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm${inputFormat === f ? " btn-primary" : " btn-ghost"}`}
                  onClick={() => setInputFormat(f)}
                >
                  {f === "text" ? "Plain Text" : "Hex"}
                </button>
              ))}
            </div>
          </div>

          {/* Input value */}
          <div className="input-group">
            <label className="input-label">
              {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
              {inputFormat === "text"
                ? "  (padded to 16 bytes)"
                : "  (32 hex chars = 16 bytes)"}
            </label>
            <textarea
              className="textarea-field"
              value={inputVal}
              // @ts-ignore
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                inputFormat === "hex"
                  ? "e.g. 3243f6a8885a308d313198a2e0370734"
                  : "Enter up to 16 characters"
              }
              spellCheck={false}
              style={{ minHeight: 64 }}
            />
          </div>

          {/* Key */}
          <div className="input-group">
            <label className="input-label">
              Key (padded/truncated to {keyBits / 8} bytes)
            </label>
            <input
              className="input-field"
              value={keyVal}
              // @ts-ignore
              onChange={(e) => setKeyVal(e.target.value)}
              placeholder="Enter key string"
              spellCheck={false}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--accent2)",
                background: "rgba(255,107,53,0.07)",
                border: "1px solid rgba(255,107,53,0.2)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Run button */}
          <button
            className="btn btn-primary w-full"
            onClick={run}
            disabled={loading}
            style={{ justifyContent: "center" }}
          >
            {loading
              ? "Processing…"
              : mode === "encrypt"
              ? "🔒 Encrypt"
              : "🔓 Decrypt"}
          </button>
        </div>

        {/* Right: result summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Input / Output hex */}
          <div className="card">
            <div className="card-header">
              {mode === "encrypt" ? "Plaintext Bytes" : "Ciphertext Bytes"}
            </div>
            {result ? (
              <>
                <div className="hex-output" style={{ marginBottom: 8 }}>
                  {result.inputHex}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                  ↓ {result.steps.length} operations across {
                    result.roundKeys.length - 1
                  } rounds
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: 13 }}>
                Run encryption/decryption to see results.
              </div>
            )}
          </div>

          <div className="card">
            <div
              className="card-header"
              style={{ color: mode === "encrypt" ? "var(--accent2)" : "var(--accent)" }}
            >
              {mode === "encrypt" ? "Ciphertext (Hex)" : "Recovered Plaintext"}
            </div>
            {result ? (
              <>
                <div
                  className="hex-output"
                  style={{
                    borderColor:
                      mode === "encrypt"
                        ? "rgba(255,107,53,0.3)"
                        : "rgba(0,255,231,0.3)",
                    color:
                      mode === "encrypt" ? "var(--accent2)" : "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  {outputHex}
                </div>
                {mode === "decrypt" && outputText && (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      color: "var(--accent)",
                      padding: "8px 12px",
                      background: "rgba(0,255,231,0.04)",
                      border: "1px solid rgba(0,255,231,0.15)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    "{outputText}"
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: 13 }}>
                Output appears here.
              </div>
            )}
          </div>

          {/* Initial/final state preview */}
          {result && (
            <div className="card">
              <div className="card-header">Final State Matrix</div>
              <StateMatrix
                state={result.steps[result.steps.length - 1].state}
                changedCells={result.steps[result.steps.length - 1].changedCells}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Visualization tabs ───────────────────────────── */}
      {result && (
        <div className="card animate-fade-up">
          <div className="tab-bar">
            <button
              className={`tab-btn${tab === "steps" ? " active" : ""}`}
              onClick={() => setTab("steps")}
            >
              Round Steps ({result.steps.length})
            </button>
            <button
              className={`tab-btn${tab === "keys" ? " active" : ""}`}
              onClick={() => setTab("keys")}
            >
              Round Keys ({result.roundKeys.length})
            </button>
          </div>

          {tab === "steps" && (
            <StepVisualizer steps={result.steps} />
          )}

          {tab === "keys" && (
            <div>
              <p className="description-text" style={{ marginBottom: 20 }}>
                Key expansion generates {result.roundKeys.length} round keys
                from the original key using RotWord, SubWord, and Rcon XOR
                operations. Click a key to inspect its bytes.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 24,
                }}
              >
                {result.roundKeys.map((rk, i) => (
                  <StateMatrix
                    key={i}
                    state={rk}
                    label={`Key ${i}`}
                    small
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}