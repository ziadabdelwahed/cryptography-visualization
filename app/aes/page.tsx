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
    <div className="container" style={{ 
      paddingTop: "clamp(24px, 5vw, 48px)", 
      paddingBottom: "clamp(40px, 8vw, 80px)",
      paddingLeft: "clamp(16px, 4vw, 24px)",
      paddingRight: "clamp(16px, 4vw, 24px)",
    }}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ marginBottom: "clamp(24px, 5vw, 40px)" }}>
        <div
          style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(8px, 1.5vw, 10px)",
            letterSpacing: "0.3em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: "clamp(8px, 2vw, 12px)",
          }}
        >
          ◈ Algorithm / AES
        </div>
        <h1 style={{ 
          fontSize: "clamp(24px, 5vw, 48px)", 
          marginBottom: "clamp(4px, 1vw, 8px)" 
        }}>
          AES Encryption
        </h1>
        <p style={{ 
          color: "var(--text-dim)", 
          fontSize: "clamp(13px, 2vw, 15px)", 
          maxWidth: "min(540px, 100%)" 
        }}>
          Advanced Encryption Standard — symmetric block cipher operating on a
          4×4 byte state. Implemented from scratch: S-Box, MixColumns in
          GF(2⁸), full key expansion with Rcon.
        </p>
      </div>

      {/* ── Controls grid ────────────────────────────────── */}
      <div className="grid-2" style={{ 
        marginBottom: "clamp(20px, 4vw, 32px)", 
        alignItems: "start",
        gap: "clamp(16px, 3vw, 24px)",
      }}>
        {/* Left: inputs */}
        <div className="card" style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "clamp(16px, 2vw, 20px)",
          padding: "clamp(16px, 3vw, 24px)",
        }}>
          <div className="card-header" style={{
            fontSize: "clamp(10px, 1.5vw, 11px)",
            marginBottom: 0,
          }}>
            Configuration
          </div>

          {/* Mode toggle */}
          <div className="input-group">
            <label className="input-label" style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
            }}>Mode</label>
            <div className="tab-bar" style={{ 
              marginBottom: 0,
              overflowX: "auto",
              flexWrap: "wrap",
              scrollbarWidth: "none",
            }}>
              {(["encrypt", "decrypt"] as Mode[]).map((m) => (
                <button
                  key={m}
                  className={`tab-btn${mode === m ? " active" : ""}`}
                  onClick={() => { setMode(m); setResult(null); }}
                  style={{
                    fontSize: "clamp(9px, 1.3vw, 10px)",
                    padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 2vw, 24px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
                </button>
              ))}
            </div>
          </div>

          {/* Key size */}
          <div className="input-group">
            <label className="input-label" style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
            }}>Key Size</label>
            <select
              className="select-field"
              value={keyBits}
              onChange={(e) => setKeyBits(Number(e.target.value) as KeyBits)}
              style={{
                fontSize: "clamp(12px, 1.8vw, 14px)",
                padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
              }}
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
            <label className="input-label" style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
            }}>
              {mode === "encrypt" ? "Plaintext" : "Ciphertext"} Format
            </label>
            <div style={{ display: "flex", gap: "clamp(6px, 1.5vw, 8px)", flexWrap: "wrap" }}>
              {(["text", "hex"] as InputFormat[]).map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm${inputFormat === f ? " btn-primary" : " btn-ghost"}`}
                  onClick={() => setInputFormat(f)}
                  style={{
                    fontSize: "clamp(9px, 1.3vw, 10px)",
                    padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f === "text" ? "Plain Text" : "Hex"}
                </button>
              ))}
            </div>
          </div>

          {/* Input value */}
          <div className="input-group">
            <label className="input-label" style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
            }}>
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
              style={{ 
                minHeight: "clamp(56px, 8vw, 64px)",
                fontSize: "clamp(12px, 1.8vw, 14px)",
                padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
              }}
            />
          </div>

          {/* Key */}
          <div className="input-group">
            <label className="input-label" style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
            }}>
              Key (padded/truncated to {keyBits / 8} bytes)
            </label>
            <input
              className="input-field"
              value={keyVal}
              // @ts-ignore
              onChange={(e) => setKeyVal(e.target.value)}
              placeholder="Enter key string"
              spellCheck={false}
              style={{
                fontSize: "clamp(12px, 1.8vw, 14px)",
                padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "clamp(11px, 1.5vw, 12px)",
                color: "var(--accent2)",
                background: "rgba(255,107,53,0.07)",
                border: "1px solid rgba(255,107,53,0.2)",
                borderRadius: "var(--radius)",
                padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                wordBreak: "break-word",
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
            style={{ 
              justifyContent: "center",
              padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
              fontSize: "clamp(10px, 1.5vw, 11px)",
            }}
          >
            {loading
              ? "Processing…"
              : mode === "encrypt"
              ? "🔒 Encrypt"
              : "🔓 Decrypt"}
          </button>
        </div>

        {/* Right: result summary */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "clamp(12px, 2vw, 16px)" 
        }}>
          {/* Input / Output hex */}
          <div className="card" style={{
            padding: "clamp(16px, 3vw, 24px)",
          }}>
            <div className="card-header" style={{
              fontSize: "clamp(10px, 1.5vw, 11px)",
              marginBottom: "clamp(12px, 2vw, 16px)",
            }}>
              {mode === "encrypt" ? "Plaintext Bytes" : "Ciphertext Bytes"}
            </div>
            {result ? (
              <>
                <div className="hex-output" style={{ 
                  marginBottom: "clamp(6px, 1.5vw, 8px)",
                  fontSize: "clamp(11px, 1.8vw, 13px)",
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  wordBreak: "break-all",
                }}>
                  {result.inputHex}
                </div>
                <div style={{ 
                  fontSize: "clamp(11px, 1.5vw, 12px)", 
                  color: "var(--text-dim)", 
                  fontFamily: "var(--mono)" 
                }}>
                  ↓ {result.steps.length} operations across {
                    result.roundKeys.length - 1
                  } rounds
                </div>
              </>
            ) : (
              <div style={{ 
                color: "var(--text-dim)", 
                fontSize: "clamp(12px, 1.8vw, 13px)" 
              }}>
                Run encryption/decryption to see results.
              </div>
            )}
          </div>

          <div className="card" style={{
            padding: "clamp(16px, 3vw, 24px)",
          }}>
            <div
              className="card-header"
              style={{ 
                color: mode === "encrypt" ? "var(--accent2)" : "var(--accent)",
                fontSize: "clamp(10px, 1.5vw, 11px)",
                marginBottom: "clamp(12px, 2vw, 16px)",
              }}
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
                    marginBottom: "clamp(6px, 1.5vw, 8px)",
                    fontSize: "clamp(11px, 1.8vw, 13px)",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                    wordBreak: "break-all",
                  }}
                >
                  {outputHex}
                </div>
                {mode === "decrypt" && outputText && (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "clamp(11px, 1.8vw, 13px)",
                      color: "var(--accent)",
                      padding: "clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px)",
                      background: "rgba(0,255,231,0.04)",
                      border: "1px solid rgba(0,255,231,0.15)",
                      borderRadius: "var(--radius)",
                      wordBreak: "break-all",
                    }}
                  >
                    "{outputText}"
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                color: "var(--text-dim)", 
                fontSize: "clamp(12px, 1.8vw, 13px)" 
              }}>
                Output appears here.
              </div>
            )}
          </div>

          {/* Initial/final state preview */}
          {result && (
            <div className="card" style={{
              padding: "clamp(16px, 3vw, 24px)",
              overflowX: "auto",
            }}>
              <div className="card-header" style={{
                fontSize: "clamp(10px, 1.5vw, 11px)",
                marginBottom: "clamp(12px, 2vw, 16px)",
              }}>
                Final State Matrix
              </div>
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
        <div className="card animate-fade-up" style={{
          padding: "clamp(16px, 3vw, 24px)",
          overflowX: "auto",
        }}>
          <div className="tab-bar" style={{
            overflowX: "auto",
            flexWrap: "wrap",
          }}>
            <button
              className={`tab-btn${tab === "steps" ? " active" : ""}`}
              onClick={() => setTab("steps")}
              style={{
                fontSize: "clamp(9px, 1.3vw, 10px)",
                padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 2vw, 24px)",
                whiteSpace: "nowrap",
              }}
            >
              Round Steps ({result.steps.length})
            </button>
            <button
              className={`tab-btn${tab === "keys" ? " active" : ""}`}
              onClick={() => setTab("keys")}
              style={{
                fontSize: "clamp(9px, 1.3vw, 10px)",
                padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 2vw, 24px)",
                whiteSpace: "nowrap",
              }}
            >
              Round Keys ({result.roundKeys.length})
            </button>
          </div>

          {tab === "steps" && (
            <div style={{ overflowX: "auto" }}>
              <StepVisualizer steps={result.steps} />
            </div>
          )}

          {tab === "keys" && (
            <div style={{ overflowX: "auto" }}>
              <p className="description-text" style={{ 
                marginBottom: "clamp(16px, 3vw, 20px)",
                fontSize: "clamp(12px, 1.8vw, 14px)",
              }}>
                Key expansion generates {result.roundKeys.length} round keys
                from the original key using RotWord, SubWord, and Rcon XOR
                operations. Click a key to inspect its bytes.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "clamp(12px, 2vw, 24px)",
                  justifyContent: "flex-start",
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