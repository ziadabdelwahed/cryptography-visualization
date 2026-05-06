// ============================================================
//  Project Configuration
// ============================================================

export const PROJECT = {
  name: "Cryptography Visualization",
  shortName: "CRYPTO·VIZ",
  developer: "AL-Hassan Sarrar",
  version: "1.0.0",
  description:
    "Interactive step-by-step visualization of AES and RSA encryption algorithms — built from pure mathematics, no libraries.",
  year: new Date().getFullYear(),
  socials: {
    github: "https://github.com/s4rrar",
    instagram: "https://instagram.com/s4rrar",
    twitter: "https://twitter.com/s4rrar",
    linkedin: "https://linkedin.com/in/s4rrar",
  }
} as const;

// ── Navigation ───────────────────────────────────────────────
export const NAV_LINKS = [
  { href: "/",      label: "Home",  short: "HOME" },
  { href: "/aes",   label: "AES",   short: "AES"  },
  { href: "/rsa",   label: "RSA",   short: "RSA"  },
  { href: "/about", label: "About", short: "ABOUT"},
] as const;

// ── AES ──────────────────────────────────────────────────────
export const AES_CONFIG = {
  defaultKeyBits:  128 as 128 | 192 | 256,
  keySizeOptions:  [128, 192, 256] as const,
  defaultPlaintext: "Hello, AES World",   // exactly 16 chars
  defaultKey:       "mysecretkey12345",   // exactly 16 chars
} as const;

export const AES_KEY_SIZE_LABELS: Record<128 | 192 | 256, string> = {
  128: "AES-128  (10 rounds)",
  192: "AES-192  (12 rounds)",
  256: "AES-256  (14 rounds)",
};

// ── RSA ──────────────────────────────────────────────────────
export const RSA_CONFIG = {
  defaultPrimeBits: 16,
  // primeBitOptions: [8, 12, 16, 20, 32, 64, 128, 256, 512, 1024, 2048, 3072, 4096, 8192] as const,
  primeBitOptions: [8, 12, 16, 20, 32, 64, 128, 256, 512, 1024, 2048] as const,
} as const;

export const RSA_PRIME_LABELS: Record<number, string> = {
  8:    "8-bit primes (toy — instant)",
  12:   "12-bit primes (small)",
  16:   "16-bit primes (default)",
  20:   "20-bit primes (larger)",
  32:   "32-bit primes (tiny — educational)",
  64:   "64-bit primes (very small)",
  128:  "128-bit primes (small)",
  256:  "256-bit primes (medium)",
  512:  "512-bit primes (large — weak)",
  1024: "1024-bit primes (legacy — deprecated)",
  2048: "2048-bit primes (standard — common)",
  // 3072: "3072-bit primes (high security)",
  // 4096: "4096-bit primes (very high security)",
  // 8192: "8192-bit primes (paranoid — slow)",
};

// ── Theme tokens (mirrors globals.css, useful for JS) ────────
export const THEME = {
  bg:        "#030712",
  surface:   "#080f1a",
  surface2:  "#0d1825",
  border:    "#1a2e44",
  accent:    "#00ffe7",
  accent2:   "#ff6b35",
  accent3:   "#7c3aed",
  text:      "#c8d8e8",
  textDim:   "#5a7a96",
  textBright:"#e8f4ff",
} as const;

// ── About page content ───────────────────────────────────────
export const ABOUT_SECTIONS = [
  {
    title: "What is this?",
    body:  "A fully client-side cryptography visualization tool. Every AES and RSA operation is implemented from scratch in TypeScript — no crypto libraries, no black boxes. You can inspect every intermediate byte, every round key, and every modular exponentiation step.",
  },
  {
    title: "AES — Advanced Encryption Standard",
    body:  "AES is a symmetric block cipher that operates on 4×4 byte state matrices. This tool shows every SubBytes (S-Box lookup), ShiftRows (cyclic rotation), MixColumns (GF(2⁸) polynomial multiplication), and AddRoundKey (XOR) step across all rounds for AES-128, AES-192, and AES-256.",
  },
  {
    title: "RSA — Rivest–Shamir–Adleman",
    body:  "RSA is an asymmetric cipher built on the difficulty of factoring large composites. This tool generates prime candidates with Miller-Rabin testing, computes the modular inverse via the Extended Euclidean Algorithm, and visualizes every square-and-multiply step of modular exponentiation.",
  },
  {
    title: "No libraries — pure math",
    body:  "All field arithmetic (GF(2⁸) multiplication via Russian-peasant method), the full S-Box, key expansion with Rcon, BigInt-native modular exponentiation, and the Extended Euclidean Algorithm are implemented from first principles in vanilla TypeScript.",
  },
] as const;

export const TECH_STACK = [
  { label: "Framework",   value: "Next.js 14  (App Router)" },
  { label: "Language",    value: "TypeScript" },
  { label: "Styling",     value: "CSS (custom, no Tailwind)" },
  { label: "Crypto",      value: "Pure math — zero libraries" },
  { label: "BigInt",      value: "Native JS BigInt for RSA" },
  { label: "Fonts",       value: "Orbitron · Rajdhani · Share Tech Mono" },
] as const;