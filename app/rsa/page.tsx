"use client";

import { useState, useCallback } from "react";
import {
  generateRSAKeys,
  rsaEncrypt,
  rsaDecrypt,
  textToBigInt,
  bigIntToText,
  modPowSteps,
  extendedGCD,
  type RSAKeys,
  type RSAKeyGenStep,
  type RSAEncryptStep,
} from "@/lib/rsa";
import { RSA_CONFIG, RSA_PRIME_LABELS } from "@/config";
import RSAVisualizer from "@/components/RSAVisualizer";

type Tab = "keygen" | "encrypt" | "decrypt";
type InputMode = "text" | "number";

interface ModPowVizRow {
  bit: string;
  currentExp: string;
  base: string;
  result: string;
}

export default function RSAPage() {
  // ── Key generation state ───────────────────────────────
  const [primeBits, setPrimeBits] = useState<number>(RSA_CONFIG.defaultPrimeBits);
  const [keys, setKeys] = useState<RSAKeys | null>(null);
  const [keyGenSteps, setKeyGenSteps] = useState<RSAKeyGenStep[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // ── Custom key override state ──────────────────────────
  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [customE, setCustomE] = useState("");
  const [customN, setCustomN] = useState("");
  const [customD, setCustomD] = useState("");

  // ── Encrypt/Decrypt state ──────────────────────────────
  const [tab, setTab] = useState<Tab>("keygen");
  const [encInputMode, setEncInputMode] = useState<InputMode>("text");
  const [encInput, setEncInput] = useState("Hello");
  const [encResult, setEncResult] = useState<{
    input: bigint; output: bigint; steps: RSAEncryptStep[];
    modPowRows: ModPowVizRow[];
  } | null>(null);

  const [decInputMode, setDecInputMode] = useState<InputMode>("number");
  const [decInput, setDecInput] = useState("");
  const [decResult, setDecResult] = useState<{
    input: bigint; output: bigint; steps: RSAEncryptStep[];
    modPowRows: ModPowVizRow[]; text: string;
  } | null>(null);

  const [eeaRows, setEeaRows] = useState<{ a: string; b: string; q: string; r: string; s: string; t: string }[]>([]);
  const [showEEA, setShowEEA] = useState(false);

  const [error, setError] = useState("");

  // ── Generate keys ──────────────────────────────────────
  const generateKeys = useCallback(() => {
    setError("");
    setGenLoading(true);
    setEncResult(null);
    setDecResult(null);
    setTimeout(() => {
      try {
        const { keys: k, steps } = generateRSAKeys(primeBits);
        setKeys(k);
        setKeyGenSteps(steps);
        setDecInput("");

        // Compute EEA rows for visualization
        const { steps: eSteps } = extendedGCD(k.e, k.phi);
        setEeaRows(eSteps.map(s => ({
          a: s.a.toString(),
          b: s.b.toString(),
          q: s.q.toString(),
          r: s.r.toString(),
          s: s.s.toString(),
          t: s.t.toString(),
        })));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Key generation failed");
      } finally {
        setGenLoading(false);
      }
    }, 10);
  }, [primeBits]);

  // ── Get active keys (custom or generated) ─────────────
  const getEncryptKeys = (): { e: bigint; n: bigint } | null => {
    if (useCustomKeys && customE && customN) {
      try { return { e: BigInt(customE), n: BigInt(customN) }; } catch { return null; }
    }
    if (keys) return { e: keys.e, n: keys.n };
    return null;
  };

  const getDecryptKeys = (): { d: bigint; n: bigint } | null => {
    if (useCustomKeys && customD && customN) {
      try { return { d: BigInt(customD), n: BigInt(customN) }; } catch { return null; }
    }
    if (keys) return { d: keys.d, n: keys.n };
    return null;
  };

  // ── Encrypt ────────────────────────────────────────────
  const runEncrypt = useCallback(() => {
    setError("");
    const kp = getEncryptKeys();
    if (!kp) { setError("Generate or enter RSA keys first."); return; }
    try {
      let m: bigint;
      if (encInputMode === "text") {
        m = textToBigInt(encInput);
        if (m >= kp.n) throw new Error(`Message too large for modulus. Use shorter text or larger prime bits.`);
      } else {
        m = BigInt(encInput.trim());
      }
      const res = rsaEncrypt(m, kp.e, kp.n);
      const rows = modPowSteps(m, kp.e, kp.n);
      setEncResult({ ...res, modPowRows: rows });
      setDecInput(res.output.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Encryption failed");
    }
  }, [encInput, encInputMode, keys, useCustomKeys, customE, customN]);

  // ── Decrypt ────────────────────────────────────────────
  const runDecrypt = useCallback(() => {
    setError("");
    const kp = getDecryptKeys();
    if (!kp) { setError("Generate or enter RSA keys first."); return; }
    try {
      const c = BigInt(decInput.trim());
      const res = rsaDecrypt(c, kp.d, kp.n);
      const rows = modPowSteps(c, kp.d, kp.n);
      let text = "";
      try { text = bigIntToText(res.output); } catch { text = res.output.toString(); }
      setDecResult({ ...res, modPowRows: rows, text });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decryption failed");
    }
  }, [decInput, keys, useCustomKeys, customD, customN]);

  const activeK = keys;

  return (
    <div className="container" style={{ 
      paddingTop: "clamp(24px, 5vw, 48px)", 
      paddingBottom: "clamp(40px, 8vw, 80px)",
      paddingLeft: "clamp(16px, 4vw, 24px)",
      paddingRight: "clamp(16px, 4vw, 24px)",
    }}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ marginBottom: "clamp(24px, 5vw, 40px)" }}>
        <div style={{
          fontFamily: "var(--heading)", 
          fontSize: "clamp(8px, 1.5vw, 10px)", 
          letterSpacing: "0.3em",
          color: "var(--accent2)", 
          textTransform: "uppercase", 
          marginBottom: "clamp(8px, 2vw, 12px)",
        }}>
          ◈ Algorithm / RSA
        </div>
        <h1 style={{ 
          fontSize: "clamp(24px, 5vw, 48px)", 
          marginBottom: "clamp(4px, 1vw, 8px)" 
        }}>
          RSA Encryption
        </h1>
        <p style={{ 
          color: "var(--text-dim)", 
          fontSize: "clamp(13px, 2vw, 15px)", 
          maxWidth: "min(560px, 100%)" 
        }}>
          Rivest–Shamir–Adleman — asymmetric cipher built on integer factorization.
          Pure math: Miller-Rabin primes, Extended Euclidean Algorithm, square-and-multiply modular exponentiation.
        </p>
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="tab-bar" style={{ 
        marginBottom: "clamp(20px, 4vw, 32px)",
        overflowX: "auto",
        flexWrap: "wrap",
      }}>
        {(["keygen", "encrypt", "decrypt"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => { setTab(t); setError(""); }}
            style={{
              fontSize: "clamp(9px, 1.3vw, 10px)",
              padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 2vw, 24px)",
              whiteSpace: "nowrap",
              color: t === "keygen" ? undefined : t === "encrypt" ? undefined : undefined,
            }}
          >
            {t === "keygen" ? "⚙ Key Generation" : t === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          fontFamily: "var(--mono)", 
          fontSize: "clamp(11px, 1.5vw, 12px)", 
          color: "var(--accent2)",
          background: "rgba(255,107,53,0.07)", 
          border: "1px solid rgba(255,107,53,0.2)",
          borderRadius: "var(--radius)", 
          padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)", 
          marginBottom: "clamp(16px, 3vw, 24px)",
          wordBreak: "break-word",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ═══════════════════ KEY GENERATION ════════════════════ */}
      {tab === "keygen" && (
        <div className="grid-2" style={{ 
          alignItems: "start",
          gap: "clamp(16px, 3vw, 24px)",
        }}>
          {/* Left: config */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 20px)" }}>
            <div className="card" style={{
              padding: "clamp(16px, 3vw, 24px)",
            }}>
              <div className="card-header" style={{
                fontSize: "clamp(10px, 1.5vw, 11px)",
                marginBottom: "clamp(16px, 3vw, 20px)",
              }}>
                Prime Generation Config
              </div>

              <div className="input-group" style={{ marginBottom: "clamp(16px, 3vw, 20px)" }}>
                <label className="input-label" style={{
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                }}>Prime Bit Size</label>
                <select
                  className="select-field"
                  value={primeBits}
                  onChange={(e) => setPrimeBits(Number(e.target.value))}
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  }}
                >
                  {RSA_CONFIG.primeBitOptions.map((b) => (
                    <option key={b} value={b}>{RSA_PRIME_LABELS[b]}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-secondary w-full"
                onClick={generateKeys}
                disabled={genLoading}
                style={{ 
                  justifyContent: "center",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                }}
              >
                {genLoading ? "Generating primes…" : "⚙ Generate RSA Keys"}
              </button>
            </div>

            {/* Key summary */}
            {activeK && (
              <div className="card" style={{ 
                borderColor: "var(--accent2)", 
                boxShadow: "0 0 0 1px rgba(255,107,53,0.1)",
                padding: "clamp(16px, 3vw, 24px)",
              }}>
                <div className="card-header" style={{ 
                  color: "var(--accent2)",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  marginBottom: "clamp(16px, 3vw, 20px)",
                }}>
                  Generated Keys
                </div>
                {[
                  { label: "p (prime)", val: activeK.p.toString(), accent: true },
                  { label: "q (prime)", val: activeK.q.toString(), accent: true },
                  { label: "n = p × q", val: activeK.n.toString() },
                  { label: "φ(n) = (p−1)(q−1)", val: activeK.phi.toString() },
                  { label: "e (public exp)", val: activeK.e.toString() },
                  { label: "d (private exp)", val: activeK.d.toString() },
                ].map(({ label, val, accent }) => (
                  <div key={label} style={{ marginBottom: "clamp(8px, 1.5vw, 12px)" }}>
                    <div className="input-label" style={{ 
                      marginBottom: "clamp(2px, 0.5vw, 4px)",
                      fontSize: "clamp(9px, 1.3vw, 10px)",
                    }}>{label}</div>
                    <div className="rsa-value" style={{ 
                      fontSize: "clamp(11px, 1.8vw, 13px)",
                      wordBreak: "break-all",
                      ...(accent ? { borderColor: "rgba(0,255,231,0.2)", color: "var(--accent)" } : {}),
                    }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: step visualizer */}
          <div style={{ overflowX: "auto" }}>
            {keyGenSteps.length > 0 ? (
              <div className="card animate-fade-up" style={{
                padding: "clamp(16px, 3vw, 24px)",
              }}>
                <div className="card-header" style={{
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  marginBottom: "clamp(16px, 3vw, 20px)",
                }}>
                  Key Generation Steps
                </div>
                <RSAVisualizer steps={keyGenSteps} />

                {/* EEA Table */}
                {eeaRows.length > 0 && (
                  <div style={{ marginTop: "clamp(16px, 3vw, 24px)" }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowEEA(!showEEA)}
                      style={{ 
                        marginBottom: "clamp(8px, 1.5vw, 12px)",
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                        padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                      }}
                    >
                      {showEEA ? "▲ Hide" : "▼ Show"} Extended Euclidean Algorithm Table
                    </button>
                    {showEEA && (
                      <div className="overflow-x animate-fade-up">
                        <table style={{
                          width: "100%", 
                          borderCollapse: "collapse",
                          fontFamily: "var(--mono)", 
                          fontSize: "clamp(10px, 1.5vw, 11px)",
                          minWidth: "600px",
                        }}>
                          <thead>
                            <tr>
                              {["a", "b", "q = a÷b", "r = a mod b", "s", "t"].map(h => (
                                <th key={h} style={{
                                  textAlign: "left", 
                                  padding: "clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 10px)",
                                  color: "var(--accent)", 
                                  borderBottom: "1px solid var(--border)",
                                  fontFamily: "var(--heading)", 
                                  fontSize: "clamp(8px, 1.2vw, 9px)", 
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {eeaRows.map((row, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                {[row.a, row.b, row.q, row.r, row.s, row.t].map((v, j) => (
                                  <td key={j} style={{
                                    padding: "clamp(5px, 1vw, 7px) clamp(8px, 1.5vw, 10px)", 
                                    color: "var(--text)", 
                                    fontSize: "clamp(10px, 1.5vw, 11px)",
                                    maxWidth: 120, 
                                    overflow: "hidden", 
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ 
                textAlign: "center", 
                padding: "clamp(32px, 6vw, 48px)" 
              }}>
                <div style={{
                  fontFamily: "var(--heading)", 
                  fontSize: "clamp(10px, 1.5vw, 11px)", 
                  letterSpacing: "0.2em",
                  color: "var(--text-dim)", 
                  marginBottom: "clamp(8px, 2vw, 12px)",
                }}>
                  NO KEYS GENERATED
                </div>
                <p style={{ 
                  color: "var(--text-dim)", 
                  fontSize: "clamp(12px, 1.8vw, 13px)",
                  maxWidth: "min(400px, 100%)",
                  margin: "0 auto",
                }}>
                  Select a prime bit size and click "Generate RSA Keys" to see the full key generation walkthrough.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ ENCRYPT ════════════════════════ */}
      {tab === "encrypt" && (
        <div className="grid-2" style={{ 
          alignItems: "start",
          gap: "clamp(16px, 3vw, 24px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 20px)" }}>
            <div className="card" style={{
              padding: "clamp(16px, 3vw, 24px)",
            }}>
              <div className="card-header" style={{
                fontSize: "clamp(10px, 1.5vw, 11px)",
                marginBottom: "clamp(16px, 3vw, 20px)",
              }}>
                Encrypt Configuration
              </div>

              {/* Custom key toggle */}
              <div style={{ marginBottom: "clamp(16px, 3vw, 20px)" }}>
                <div style={{ 
                  display: "flex", 
                  gap: "clamp(6px, 1.5vw, 8px)", 
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                  flexWrap: "wrap",
                }}>
                  <button
                    className={`btn btn-sm${!useCustomKeys ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(false)}
                    style={{
                      fontSize: "clamp(9px, 1.3vw, 10px)",
                      padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                      whiteSpace: "nowrap",
                    }}
                  >Use Generated Keys</button>
                  <button
                    className={`btn btn-sm${useCustomKeys ? " btn-secondary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(true)}
                    style={{
                      fontSize: "clamp(9px, 1.3vw, 10px)",
                      padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                      whiteSpace: "nowrap",
                    }}
                  >Enter Custom Keys</button>
                </div>

                {!useCustomKeys && !keys && (
                  <div style={{ 
                    fontSize: "clamp(11px, 1.5vw, 12px)", 
                    color: "var(--accent2)", 
                    fontFamily: "var(--mono)" 
                  }}>
                    ⚠ No keys generated. Go to Key Generation tab first.
                  </div>
                )}

                {!useCustomKeys && keys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1vw, 8px)" }}>
                    {[
                      { label: "Public Key e", val: keys.e.toString() },
                      { label: "Modulus n", val: keys.n.toString() },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="input-label" style={{ 
                          marginBottom: "clamp(2px, 0.5vw, 4px)",
                          fontSize: "clamp(9px, 1.3vw, 10px)",
                        }}>{label}</div>
                        <div className="rsa-value" style={{ 
                          maxHeight: 40,
                          fontSize: "clamp(11px, 1.8vw, 13px)",
                          wordBreak: "break-all",
                        }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {useCustomKeys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 12px)" }}>
                    <div className="input-group">
                      <label className="input-label" style={{
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                      }}>Public Exponent e</label>
                      <input className="input-field" value={customE}
                        onChange={(e) => setCustomE(e.target.value)} 
                        placeholder="e.g. 65537"
                        style={{
                          fontSize: "clamp(12px, 1.8vw, 14px)",
                          padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                        }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                      }}>Modulus n</label>
                      <input className="input-field" value={customN}
                        onChange={(e) => setCustomN(e.target.value)} 
                        placeholder="n = p × q"
                        style={{
                          fontSize: "clamp(12px, 1.8vw, 14px)",
                          padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                        }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="input-group" style={{ marginBottom: "clamp(8px, 1.5vw, 12px)" }}>
                <label className="input-label" style={{
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                }}>Input Format</label>
                <div style={{ display: "flex", gap: "clamp(6px, 1.5vw, 8px)", flexWrap: "wrap" }}>
                  {(["text", "number"] as InputMode[]).map((m) => (
                    <button key={m}
                      className={`btn btn-sm${encInputMode === m ? " btn-primary" : " btn-ghost"}`}
                      onClick={() => setEncInputMode(m)}
                      style={{
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                        padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                        whiteSpace: "nowrap",
                      }}
                    >{m === "text" ? "Text" : "Number"}</button>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: "clamp(16px, 3vw, 20px)" }}>
                <label className="input-label" style={{
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                }}>
                  {encInputMode === "text" ? "Plaintext (converted to BigInt)" : "Message as integer (m < n)"}
                </label>
                <input className="input-field" value={encInput}
                  onChange={(e) => setEncInput(e.target.value)}
                  placeholder={encInputMode === "text" ? "Hello" : "42"}
                  spellCheck={false}
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  }} />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={runEncrypt}
                style={{ 
                  justifyContent: "center",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                }}
              >
                🔒 Encrypt
              </button>
            </div>

            {/* Output */}
            {encResult && (
              <div className="card animate-fade-up" style={{ 
                borderColor: "var(--accent2)",
                padding: "clamp(16px, 3vw, 24px)",
              }}>
                <div className="card-header" style={{ 
                  color: "var(--accent2)",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                }}>Ciphertext</div>
                <div className="input-label" style={{ 
                  marginBottom: "clamp(4px, 1vw, 6px)",
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                }}>m = {encResult.input.toString()}</div>
                <div style={{ 
                  fontSize: "clamp(11px, 1.5vw, 12px)", 
                  color: "var(--text-dim)", 
                  fontFamily: "var(--mono)", 
                  marginBottom: "clamp(6px, 1.5vw, 8px)" 
                }}>
                  c = m^e mod n
                </div>
                <div className="rsa-value" style={{ 
                  borderColor: "rgba(255,107,53,0.3)", 
                  color: "var(--accent2)", 
                  maxHeight: "none",
                  fontSize: "clamp(11px, 1.8vw, 13px)",
                  wordBreak: "break-all",
                }}>
                  {encResult.output.toString()}
                </div>
                <div style={{ 
                  marginTop: "clamp(8px, 1.5vw, 12px)", 
                  fontSize: "clamp(11px, 1.5vw, 12px)", 
                  color: "var(--text-dim)", 
                  fontFamily: "var(--mono)" 
                }}>
                  Square-and-multiply: {encResult.modPowRows.length} steps
                </div>
              </div>
            )}
          </div>

          {/* Right: steps + mod pow table */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "clamp(16px, 2vw, 20px)",
            overflowX: "auto",
          }}>
            {encResult ? (
              <>
                <div className="card animate-fade-up" style={{
                  padding: "clamp(16px, 3vw, 24px)",
                }}>
                  <div className="card-header" style={{
                    fontSize: "clamp(10px, 1.5vw, 11px)",
                    marginBottom: "clamp(16px, 3vw, 20px)",
                  }}>Encryption Steps</div>
                  <RSAVisualizer steps={encResult.steps} />
                </div>

                <div className="card animate-fade-up" style={{
                  padding: "clamp(16px, 3vw, 24px)",
                }}>
                  <div className="card-header" style={{
                    fontSize: "clamp(10px, 1.5vw, 11px)",
                    marginBottom: "clamp(16px, 3vw, 20px)",
                  }}>Square-and-Multiply Table</div>
                  <p className="description-text" style={{ 
                    marginBottom: "clamp(12px, 2vw, 16px)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                  }}>
                    Computes m^e mod n by scanning bits of e. Bit=1: multiply result by base. Always: square base.
                  </p>
                  <ModPowTable rows={encResult.modPowRows} />
                </div>
              </>
            ) : (
              <div className="card" style={{ 
                textAlign: "center", 
                padding: "clamp(32px, 6vw, 48px)" 
              }}>
                <div style={{ 
                  fontFamily: "var(--heading)", 
                  fontSize: "clamp(10px, 1.5vw, 11px)", 
                  letterSpacing: "0.2em", 
                  color: "var(--text-dim)", 
                  marginBottom: "clamp(8px, 2vw, 12px)" 
                }}>
                  WAITING FOR INPUT
                </div>
                <p style={{ 
                  color: "var(--text-dim)", 
                  fontSize: "clamp(12px, 1.8vw, 13px)",
                  maxWidth: "min(400px, 100%)",
                  margin: "0 auto",
                }}>
                  Enter a message and click Encrypt to see the step-by-step modular exponentiation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ DECRYPT ════════════════════════ */}
      {tab === "decrypt" && (
        <div className="grid-2" style={{ 
          alignItems: "start",
          gap: "clamp(16px, 3vw, 24px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 20px)" }}>
            <div className="card" style={{
              padding: "clamp(16px, 3vw, 24px)",
            }}>
              <div className="card-header" style={{
                fontSize: "clamp(10px, 1.5vw, 11px)",
                marginBottom: "clamp(16px, 3vw, 20px)",
              }}>Decrypt Configuration</div>

              {/* Custom key toggle */}
              <div style={{ marginBottom: "clamp(16px, 3vw, 20px)" }}>
                <div style={{ 
                  display: "flex", 
                  gap: "clamp(6px, 1.5vw, 8px)", 
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                  flexWrap: "wrap",
                }}>
                  <button
                    className={`btn btn-sm${!useCustomKeys ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(false)}
                    style={{
                      fontSize: "clamp(9px, 1.3vw, 10px)",
                      padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                      whiteSpace: "nowrap",
                    }}
                  >Use Generated Keys</button>
                  <button
                    className={`btn btn-sm${useCustomKeys ? " btn-secondary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(true)}
                    style={{
                      fontSize: "clamp(9px, 1.3vw, 10px)",
                      padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
                      whiteSpace: "nowrap",
                    }}
                  >Enter Custom Keys</button>
                </div>

                {!useCustomKeys && !keys && (
                  <div style={{ 
                    fontSize: "clamp(11px, 1.5vw, 12px)", 
                    color: "var(--accent2)", 
                    fontFamily: "var(--mono)" 
                  }}>
                    ⚠ No keys generated. Go to Key Generation tab first.
                  </div>
                )}

                {!useCustomKeys && keys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1vw, 8px)" }}>
                    {[
                      { label: "Private Key d", val: keys.d.toString() },
                      { label: "Modulus n", val: keys.n.toString() },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="input-label" style={{ 
                          marginBottom: "clamp(2px, 0.5vw, 4px)",
                          fontSize: "clamp(9px, 1.3vw, 10px)",
                        }}>{label}</div>
                        <div className="rsa-value" style={{ 
                          maxHeight: 40,
                          fontSize: "clamp(11px, 1.8vw, 13px)",
                          wordBreak: "break-all",
                        }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {useCustomKeys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 12px)" }}>
                    <div className="input-group">
                      <label className="input-label" style={{
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                      }}>Private Exponent d</label>
                      <input className="input-field" value={customD}
                        onChange={(e) => setCustomD(e.target.value)} 
                        placeholder="private exponent d"
                        style={{
                          fontSize: "clamp(12px, 1.8vw, 14px)",
                          padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                        }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{
                        fontSize: "clamp(9px, 1.3vw, 10px)",
                      }}>Modulus n</label>
                      <input className="input-field" value={customN}
                        onChange={(e) => setCustomN(e.target.value)} 
                        placeholder="n = p × q"
                        style={{
                          fontSize: "clamp(12px, 1.8vw, 14px)",
                          padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                        }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: "clamp(16px, 3vw, 20px)" }}>
                <label className="input-label" style={{
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                }}>Ciphertext (integer c)</label>
                <textarea className="textarea-field" value={decInput}
                  onChange={(e) => setDecInput(e.target.value)}
                  placeholder="Paste ciphertext integer from encryption step"
                  spellCheck={false} 
                  style={{ 
                    minHeight: "clamp(60px, 8vw, 72px)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  }} />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={runDecrypt}
                style={{ 
                  justifyContent: "center",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                }}
              >
                🔓 Decrypt
              </button>
            </div>

            {/* Output */}
            {decResult && (
              <div className="card animate-fade-up" style={{ 
                borderColor: "var(--accent)",
                padding: "clamp(16px, 3vw, 24px)",
              }}>
                <div className="card-header" style={{
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                }}>Recovered Plaintext</div>
                <div style={{ 
                  fontSize: "clamp(11px, 1.5vw, 12px)", 
                  color: "var(--text-dim)", 
                  fontFamily: "var(--mono)", 
                  marginBottom: "clamp(6px, 1.5vw, 8px)" 
                }}>
                  m = c^d mod n
                </div>
                <div className="rsa-value" style={{ 
                  borderColor: "rgba(0,255,231,0.3)", 
                  color: "var(--accent)", 
                  maxHeight: "none", 
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                  fontSize: "clamp(11px, 1.8vw, 13px)",
                  wordBreak: "break-all",
                }}>
                  {decResult.output.toString()}
                </div>
                {decResult.text && decResult.text !== decResult.output.toString() && (
                  <div style={{
                    fontFamily: "var(--mono)", 
                    fontSize: "clamp(12px, 1.8vw, 14px)", 
                    color: "var(--accent)",
                    padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)", 
                    background: "rgba(0,255,231,0.04)",
                    border: "1px solid rgba(0,255,231,0.2)", 
                    borderRadius: "var(--radius)",
                    wordBreak: "break-word",
                  }}>
                    "{decResult.text}"
                  </div>
                )}
                <div style={{ 
                  marginTop: "clamp(8px, 1.5vw, 12px)", 
                  fontSize: "clamp(11px, 1.5vw, 12px)", 
                  color: "var(--text-dim)", 
                  fontFamily: "var(--mono)" 
                }}>
                  Square-and-multiply: {decResult.modPowRows.length} steps
                </div>
              </div>
            )}
          </div>

          {/* Right: steps + mod pow table */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "clamp(16px, 2vw, 20px)",
            overflowX: "auto",
          }}>
            {decResult ? (
              <>
                <div className="card animate-fade-up" style={{
                  padding: "clamp(16px, 3vw, 24px)",
                }}>
                  <div className="card-header" style={{
                    fontSize: "clamp(10px, 1.5vw, 11px)",
                    marginBottom: "clamp(16px, 3vw, 20px)",
                  }}>Decryption Steps</div>
                  <RSAVisualizer steps={decResult.steps} />
                </div>

                <div className="card animate-fade-up" style={{
                  padding: "clamp(16px, 3vw, 24px)",
                }}>
                  <div className="card-header" style={{
                    fontSize: "clamp(10px, 1.5vw, 11px)",
                    marginBottom: "clamp(16px, 3vw, 20px)",
                  }}>Square-and-Multiply Table</div>
                  <p className="description-text" style={{ 
                    marginBottom: "clamp(12px, 2vw, 16px)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                  }}>
                    Computes c^d mod n. By Euler&apos;s theorem: (m^e)^d ≡ m^(ed) ≡ m (mod n).
                  </p>
                  <ModPowTable rows={decResult.modPowRows} />
                </div>
              </>
            ) : (
              <div className="card" style={{ 
                textAlign: "center", 
                padding: "clamp(32px, 6vw, 48px)" 
              }}>
                <div style={{ 
                  fontFamily: "var(--heading)", 
                  fontSize: "clamp(10px, 1.5vw, 11px)", 
                  letterSpacing: "0.2em", 
                  color: "var(--text-dim)", 
                  marginBottom: "clamp(8px, 2vw, 12px)" 
                }}>
                  WAITING FOR CIPHERTEXT
                </div>
                <p style={{ 
                  color: "var(--text-dim)", 
                  fontSize: "clamp(12px, 1.8vw, 13px)",
                  maxWidth: "min(400px, 100%)",
                  margin: "0 auto",
                }}>
                  Paste a ciphertext integer and click Decrypt to recover the message.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Square-and-Multiply table ─────────────
function ModPowTable({ rows }: { rows: ModPowVizRow[] }) {
  const MAX_ROWS = 40;
  const shown = rows.slice(0, MAX_ROWS);

  return (
    <div className="overflow-x">
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        fontFamily: "var(--mono)", 
        fontSize: "clamp(10px, 1.5vw, 11px)",
        minWidth: "min(100%, 600px)",
      }}>
        <thead>
          <tr>
            {["Bit of e", "Exponent (e)", "Base²", "Result"].map(h => (
              <th key={h} style={{
                textAlign: "left", 
                padding: "clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 10px)",
                color: "var(--accent)", 
                borderBottom: "1px solid var(--border)",
                fontFamily: "var(--heading)", 
                fontSize: "clamp(8px, 1.2vw, 9px)", 
                letterSpacing: "0.15em",
                textTransform: "uppercase", 
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i} style={{
              borderBottom: "1px solid var(--border)",
              background: row.bit === "1" ? "rgba(0,255,231,0.03)" : undefined,
            }}>
              <td style={{
                padding: "clamp(5px, 1vw, 7px) clamp(8px, 1.5vw, 10px)",
                color: row.bit === "1" ? "var(--accent)" : "var(--text-dim)",
                fontWeight: row.bit === "1" ? 700 : undefined,
                fontSize: "clamp(10px, 1.5vw, 11px)",
              }}>{row.bit}</td>
              <td style={{ 
                padding: "clamp(5px, 1vw, 7px) clamp(8px, 1.5vw, 10px)", 
                color: "var(--text)", 
                maxWidth: 100, 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                fontSize: "clamp(10px, 1.5vw, 11px)",
              }}>{row.currentExp}</td>
              <td style={{ 
                padding: "clamp(5px, 1vw, 7px) clamp(8px, 1.5vw, 10px)", 
                color: "var(--text-dim)", 
                maxWidth: 100, 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                fontSize: "clamp(10px, 1.5vw, 11px)",
              }}>{row.base}</td>
              <td style={{ 
                padding: "clamp(5px, 1vw, 7px) clamp(8px, 1.5vw, 10px)", 
                color: row.bit === "1" ? "var(--accent2)" : "var(--text)", 
                maxWidth: 100, 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                fontSize: "clamp(10px, 1.5vw, 11px)",
              }}>{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > MAX_ROWS && (
        <div style={{ 
          padding: "clamp(8px, 1.5vw, 10px)", 
          fontSize: "clamp(10px, 1.5vw, 11px)", 
          color: "var(--text-dim)", 
          fontFamily: "var(--mono)", 
          textAlign: "center" 
        }}>
          … {rows.length - MAX_ROWS} more rows (exponent has many bits)
        </div>
      )}
    </div>
  );
}