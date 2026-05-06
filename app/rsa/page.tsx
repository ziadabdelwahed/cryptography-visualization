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
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: "var(--heading)", fontSize: 10, letterSpacing: "0.3em",
          color: "var(--accent2)", textTransform: "uppercase", marginBottom: 12,
        }}>
          ◈ Algorithm / RSA
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 8 }}>
          RSA Encryption
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: 560 }}>
          Rivest–Shamir–Adleman — asymmetric cipher built on integer factorization.
          Pure math: Miller-Rabin primes, Extended Euclidean Algorithm, square-and-multiply modular exponentiation.
        </p>
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="tab-bar" style={{ marginBottom: 32 }}>
        {(["keygen", "encrypt", "decrypt"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => { setTab(t); setError(""); }}
            style={{ color: t === "keygen" ? undefined : t === "encrypt" ? undefined : undefined }}
          >
            {t === "keygen" ? "⚙ Key Generation" : t === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent2)",
          background: "rgba(255,107,53,0.07)", border: "1px solid rgba(255,107,53,0.2)",
          borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 24,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ═══════════════════ KEY GENERATION ════════════════════ */}
      {tab === "keygen" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* Left: config */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-header">Prime Generation Config</div>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Prime Bit Size</label>
                <select
                  className="select-field"
                  value={primeBits}
                  onChange={(e) => setPrimeBits(Number(e.target.value))}
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
                style={{ justifyContent: "center" }}
              >
                {genLoading ? "Generating primes…" : "⚙ Generate RSA Keys"}
              </button>
            </div>

            {/* Key summary */}
            {activeK && (
              <div className="card" style={{ borderColor: "var(--accent2)", boxShadow: "0 0 0 1px rgba(255,107,53,0.1)" }}>
                <div className="card-header" style={{ color: "var(--accent2)" }}>Generated Keys</div>
                {[
                  { label: "p (prime)", val: activeK.p.toString(), accent: true },
                  { label: "q (prime)", val: activeK.q.toString(), accent: true },
                  { label: "n = p × q", val: activeK.n.toString() },
                  { label: "φ(n) = (p−1)(q−1)", val: activeK.phi.toString() },
                  { label: "e (public exp)", val: activeK.e.toString() },
                  { label: "d (private exp)", val: activeK.d.toString() },
                ].map(({ label, val, accent }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div className="input-label" style={{ marginBottom: 4 }}>{label}</div>
                    <div className="rsa-value" style={accent ? { borderColor: "rgba(0,255,231,0.2)", color: "var(--accent)" } : undefined}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: step visualizer */}
          <div>
            {keyGenSteps.length > 0 ? (
              <div className="card animate-fade-up">
                <div className="card-header">Key Generation Steps</div>
                <RSAVisualizer steps={keyGenSteps} />

                {/* EEA Table */}
                {eeaRows.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowEEA(!showEEA)}
                      style={{ marginBottom: 12 }}
                    >
                      {showEEA ? "▲ Hide" : "▼ Show"} Extended Euclidean Algorithm Table
                    </button>
                    {showEEA && (
                      <div className="overflow-x animate-fade-up">
                        <table style={{
                          width: "100%", borderCollapse: "collapse",
                          fontFamily: "var(--mono)", fontSize: 11,
                        }}>
                          <thead>
                            <tr>
                              {["a", "b", "q = a÷b", "r = a mod b", "s", "t"].map(h => (
                                <th key={h} style={{
                                  textAlign: "left", padding: "8px 10px",
                                  color: "var(--accent)", borderBottom: "1px solid var(--border)",
                                  fontFamily: "var(--heading)", fontSize: 9, letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {eeaRows.map((row, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                {[row.a, row.b, row.q, row.r, row.s, row.t].map((v, j) => (
                                  <td key={j} style={{
                                    padding: "7px 10px", color: "var(--text)", fontSize: 11,
                                    maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis",
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
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <div style={{
                  fontFamily: "var(--heading)", fontSize: 11, letterSpacing: "0.2em",
                  color: "var(--text-dim)", marginBottom: 12,
                }}>
                  NO KEYS GENERATED
                </div>
                <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
                  Select a prime bit size and click "Generate RSA Keys" to see the full key generation walkthrough.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ ENCRYPT ════════════════════════ */}
      {tab === "encrypt" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-header">Encrypt Configuration</div>

              {/* Custom key toggle */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    className={`btn btn-sm${!useCustomKeys ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(false)}
                  >Use Generated Keys</button>
                  <button
                    className={`btn btn-sm${useCustomKeys ? " btn-secondary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(true)}
                  >Enter Custom Keys</button>
                </div>

                {!useCustomKeys && !keys && (
                  <div style={{ fontSize: 12, color: "var(--accent2)", fontFamily: "var(--mono)" }}>
                    ⚠ No keys generated. Go to Key Generation tab first.
                  </div>
                )}

                {!useCustomKeys && keys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Public Key e", val: keys.e.toString() },
                      { label: "Modulus n", val: keys.n.toString() },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="input-label" style={{ marginBottom: 4 }}>{label}</div>
                        <div className="rsa-value" style={{ maxHeight: 40 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {useCustomKeys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Public Exponent e</label>
                      <input className="input-field" value={customE}
                        onChange={(e) => setCustomE(e.target.value)} placeholder="e.g. 65537" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Modulus n</label>
                      <input className="input-field" value={customN}
                        onChange={(e) => setCustomN(e.target.value)} placeholder="n = p × q" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Input Format</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["text", "number"] as InputMode[]).map((m) => (
                    <button key={m}
                      className={`btn btn-sm${encInputMode === m ? " btn-primary" : " btn-ghost"}`}
                      onClick={() => setEncInputMode(m)}
                    >{m === "text" ? "Text" : "Number"}</button>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">
                  {encInputMode === "text" ? "Plaintext (converted to BigInt)" : "Message as integer (m < n)"}
                </label>
                <input className="input-field" value={encInput}
                  onChange={(e) => setEncInput(e.target.value)}
                  placeholder={encInputMode === "text" ? "Hello" : "42"}
                  spellCheck={false} />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={runEncrypt}
                style={{ justifyContent: "center" }}
              >
                🔒 Encrypt
              </button>
            </div>

            {/* Output */}
            {encResult && (
              <div className="card animate-fade-up" style={{ borderColor: "var(--accent2)" }}>
                <div className="card-header" style={{ color: "var(--accent2)" }}>Ciphertext</div>
                <div className="input-label" style={{ marginBottom: 6 }}>m = {encResult.input.toString()}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)", marginBottom: 8 }}>
                  c = m^e mod n
                </div>
                <div className="rsa-value" style={{ borderColor: "rgba(255,107,53,0.3)", color: "var(--accent2)", maxHeight: "none" }}>
                  {encResult.output.toString()}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                  Square-and-multiply: {encResult.modPowRows.length} steps
                </div>
              </div>
            )}
          </div>

          {/* Right: steps + mod pow table */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {encResult ? (
              <>
                <div className="card animate-fade-up">
                  <div className="card-header">Encryption Steps</div>
                  <RSAVisualizer steps={encResult.steps} />
                </div>

                <div className="card animate-fade-up">
                  <div className="card-header">Square-and-Multiply Table</div>
                  <p className="description-text" style={{ marginBottom: 16 }}>
                    Computes m^e mod n by scanning bits of e. Bit=1: multiply result by base. Always: square base.
                  </p>
                  <ModPowTable rows={encResult.modPowRows} />
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontFamily: "var(--heading)", fontSize: 11, letterSpacing: "0.2em", color: "var(--text-dim)", marginBottom: 12 }}>
                  WAITING FOR INPUT
                </div>
                <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
                  Enter a message and click Encrypt to see the step-by-step modular exponentiation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ DECRYPT ════════════════════════ */}
      {tab === "decrypt" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-header">Decrypt Configuration</div>

              {/* Custom key toggle */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    className={`btn btn-sm${!useCustomKeys ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(false)}
                  >Use Generated Keys</button>
                  <button
                    className={`btn btn-sm${useCustomKeys ? " btn-secondary" : " btn-ghost"}`}
                    onClick={() => setUseCustomKeys(true)}
                  >Enter Custom Keys</button>
                </div>

                {!useCustomKeys && !keys && (
                  <div style={{ fontSize: 12, color: "var(--accent2)", fontFamily: "var(--mono)" }}>
                    ⚠ No keys generated. Go to Key Generation tab first.
                  </div>
                )}

                {!useCustomKeys && keys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Private Key d", val: keys.d.toString() },
                      { label: "Modulus n", val: keys.n.toString() },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="input-label" style={{ marginBottom: 4 }}>{label}</div>
                        <div className="rsa-value" style={{ maxHeight: 40 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {useCustomKeys && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Private Exponent d</label>
                      <input className="input-field" value={customD}
                        onChange={(e) => setCustomD(e.target.value)} placeholder="private exponent d" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Modulus n</label>
                      <input className="input-field" value={customN}
                        onChange={(e) => setCustomN(e.target.value)} placeholder="n = p × q" />
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Ciphertext (integer c)</label>
                <textarea className="textarea-field" value={decInput}
                  onChange={(e) => setDecInput(e.target.value)}
                  placeholder="Paste ciphertext integer from encryption step"
                  spellCheck={false} style={{ minHeight: 72 }} />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={runDecrypt}
                style={{ justifyContent: "center" }}
              >
                🔓 Decrypt
              </button>
            </div>

            {/* Output */}
            {decResult && (
              <div className="card animate-fade-up" style={{ borderColor: "var(--accent)" }}>
                <div className="card-header">Recovered Plaintext</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)", marginBottom: 8 }}>
                  m = c^d mod n
                </div>
                <div className="rsa-value" style={{ borderColor: "rgba(0,255,231,0.3)", color: "var(--accent)", maxHeight: "none", marginBottom: 12 }}>
                  {decResult.output.toString()}
                </div>
                {decResult.text && decResult.text !== decResult.output.toString() && (
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent)",
                    padding: "10px 14px", background: "rgba(0,255,231,0.04)",
                    border: "1px solid rgba(0,255,231,0.2)", borderRadius: "var(--radius)",
                  }}>
                    "{decResult.text}"
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                  Square-and-multiply: {decResult.modPowRows.length} steps
                </div>
              </div>
            )}
          </div>

          {/* Right: steps + mod pow table */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {decResult ? (
              <>
                <div className="card animate-fade-up">
                  <div className="card-header">Decryption Steps</div>
                  <RSAVisualizer steps={decResult.steps} />
                </div>

                <div className="card animate-fade-up">
                  <div className="card-header">Square-and-Multiply Table</div>
                  <p className="description-text" style={{ marginBottom: 16 }}>
                    Computes c^d mod n. By Euler's theorem: (m^e)^d ≡ m^(ed) ≡ m (mod n).
                  </p>
                  <ModPowTable rows={decResult.modPowRows} />
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontFamily: "var(--heading)", fontSize: 11, letterSpacing: "0.2em", color: "var(--text-dim)", marginBottom: 12 }}>
                  WAITING FOR CIPHERTEXT
                </div>
                <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
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
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 11 }}>
        <thead>
          <tr>
            {["Bit of e", "Exponent (e)", "Base²", "Result"].map(h => (
              <th key={h} style={{
                textAlign: "left", padding: "8px 10px",
                color: "var(--accent)", borderBottom: "1px solid var(--border)",
                fontFamily: "var(--heading)", fontSize: 9, letterSpacing: "0.15em",
                textTransform: "uppercase", whiteSpace: "nowrap",
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
                padding: "7px 10px",
                color: row.bit === "1" ? "var(--accent)" : "var(--text-dim)",
                fontWeight: row.bit === "1" ? 700 : undefined,
              }}>{row.bit}</td>
              <td style={{ padding: "7px 10px", color: "var(--text)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.currentExp}</td>
              <td style={{ padding: "7px 10px", color: "var(--text-dim)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.base}</td>
              <td style={{ padding: "7px 10px", color: row.bit === "1" ? "var(--accent2)" : "var(--text)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > MAX_ROWS && (
        <div style={{ padding: "10px", fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)", textAlign: "center" }}>
          … {rows.length - MAX_ROWS} more rows (exponent has many bits)
        </div>
      )}
    </div>
  );
}