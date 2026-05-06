// ============================================================
//  RSA — Pure Math Implementation (No Libraries)
//  Implements RSA from scratch using JavaScript BigInt
//  Steps are fully recorded for visualization
// ============================================================

export interface RSAKeys {
  p: bigint;
  q: bigint;
  n: bigint;
  phi: bigint;
  e: bigint;
  d: bigint;
  publicKey: { e: bigint; n: bigint };
  privateKey: { d: bigint; n: bigint };
}

export interface RSAKeyGenStep {
  label: string;
  value: string;
  formula: string;
  description: string;
}

export interface RSAEncryptStep {
  label: string;
  value: string;
  formula: string;
  description: string;
}

export interface RSAResult {
  input: bigint;
  output: bigint;
  steps: RSAEncryptStep[];
}

// ─── Miller-Rabin Primality Test ─────────────────────────────
function millerRabinTest(n: bigint, a: bigint): boolean {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }

  let x = modPow(a, d, n);
  if (x === 1n || x === n - 1n) return true;

  for (let i = 0n; i < r - 1n; i++) {
    x = modPow(x, 2n, n);
    if (x === n - 1n) return true;
  }
  return false;
}

export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n || n === 5n || n === 7n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  // Deterministic for numbers < 3.2 × 10^18 with these witnesses
  const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const a of witnesses) {
    if (a >= n) continue;
    if (!millerRabinTest(n, a)) return false;
  }
  return true;
}

// ─── Modular Exponentiation ──────────────────────────────────
// base^exp mod m — fast using square-and-multiply
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

// ─── Modular Exponentiation Steps (for visualization) ────────
export interface ModPowStep {
  bit: string;
  currentExp: string;
  base: string;
  result: string;
}
export function modPowSteps(base: bigint, exp: bigint, mod: bigint): ModPowStep[] {
  const steps: ModPowStep[] = [];
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    const bit = (e % 2n === 1n) ? '1' : '0';
    if (e % 2n === 1n) result = (result * b) % mod;
    steps.push({
      bit,
      currentExp: e.toString(),
      base: b.toString(),
      result: result.toString(),
    });
    e = e / 2n;
    b = (b * b) % mod;
  }
  return steps;
}

// ─── Extended Euclidean Algorithm ────────────────────────────
export interface EEAStep {
  a: bigint;
  b: bigint;
  q: bigint;
  r: bigint;
  s: bigint;
  t: bigint;
}

export function extendedGCD(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint; steps: EEAStep[] } {
  const steps: EEAStep[] = [];
  let old_r = a, r = b;
  let old_s = 1n, s = 0n;
  let old_t = 0n, t = 1n;

  while (r !== 0n) {
    const q = old_r / r;
    steps.push({ a: old_r, b: r, q, r: old_r - q * r, s: old_s, t: old_t });
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
    [old_t, t] = [t, old_t - q * t];
  }

  return { gcd: old_r, x: old_s, y: old_t, steps };
}

// Modular inverse of a mod m
export function modInverse(a: bigint, m: bigint): bigint {
  const { gcd, x } = extendedGCD(a, m);
  if (gcd !== 1n) throw new Error('Modular inverse does not exist');
  return ((x % m) + m) % m;
}

// ─── GCD ─────────────────────────────────────────────────────
export function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) { [a, b] = [b, a % b]; }
  return a;
}

// ─── Random Prime Generation ─────────────────────────────────
// Generate a random prime with approximately `bits` bits
export function randomPrime(bits: number): bigint {
  const min = 1n << BigInt(bits - 1);
  const max = (1n << BigInt(bits)) - 1n;

  // For large bit sizes, we need to generate random bytes directly
  const byteLength = Math.ceil(bits / 8);
  
  while (true) {
    // Generate random bytes
    const randomBytes = new Uint8Array(byteLength);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < byteLength; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    
    // Convert bytes to BigInt
    let candidate = 0n;
    for (let i = 0; i < byteLength; i++) {
      candidate = (candidate << 8n) | BigInt(randomBytes[i]);
    }
    
    // Ensure candidate is within range and odd
    candidate = candidate % (max - min + 1n) + min;
    if (candidate % 2n === 0n) candidate += 1n;
    if (candidate > max) candidate -= 2n;
    
    if (isPrime(candidate)) return candidate;
  }
}


// ─── Key Generation ─────────────────────────────────────────
export function generateRSAKeys(primeBits: number = 16): {
  keys: RSAKeys;
  steps: RSAKeyGenStep[];
} {
  const steps: RSAKeyGenStep[] = [];

  // Step 1: Generate p
  const p = randomPrime(primeBits);
  steps.push({
    label: "Generate prime p",
    value: p.toString(),
    formula: `p = ${p.toString()}`,
    description: `Generate a random ${primeBits}-bit prime number p using Miller-Rabin primality testing.`,
  });

  // Step 2: Generate q (different from p)
  let q = randomPrime(primeBits);
  while (q === p) q = randomPrime(primeBits);
  steps.push({
    label: "Generate prime q",
    value: q.toString(),
    formula: `q = ${q.toString()}`,
    description: `Generate another random ${primeBits}-bit prime q ≠ p using Miller-Rabin primality testing.`,
  });

  // Step 3: Compute n = p × q
  const n = p * q;
  steps.push({
    label: "Compute modulus n",
    value: n.toString(),
    formula: `n = p × q = ${p} × ${q}`,
    description: `The RSA modulus n is the product of the two primes. Its bit length determines the key strength.`,
  });

  // Step 4: Compute φ(n) = (p-1)(q-1)
  const phi = (p - 1n) * (q - 1n);
  steps.push({
    label: "Compute Euler's totient φ(n)",
    value: phi.toString(),
    formula: `φ(n) = (p−1)(q−1) = ${p - 1n} × ${q - 1n}`,
    description: `Euler's totient φ(n) counts integers from 1 to n that are coprime to n. Used to find the private key.`,
  });

  // Step 5: Choose e
  let e = 65537n;
  if (gcd(e, phi) !== 1n) {
    // Fallback for small primes
    e = 3n;
    while (gcd(e, phi) !== 1n) e += 2n;
  }
  steps.push({
    label: "Choose public exponent e",
    value: e.toString(),
    formula: `e = ${e}, gcd(e, φ(n)) = gcd(${e}, ${phi}) = 1`,
    description: `e must satisfy 1 < e < φ(n) and gcd(e, φ(n)) = 1. We prefer e = 65537 (a Fermat prime) for efficiency.`,
  });

  // Step 6: Compute d = e⁻¹ mod φ(n)
  const { steps: eeaSteps } = extendedGCD(e, phi);
  const d = modInverse(e, phi);
  steps.push({
    label: "Compute private exponent d",
    value: d.toString(),
    formula: `d ≡ e⁻¹ (mod φ(n)) → d × ${e} ≡ 1 (mod ${phi})`,
    description: `d is the modular multiplicative inverse of e modulo φ(n), computed via the Extended Euclidean Algorithm.`,
  });

  // Step 7: Keys
  steps.push({
    label: "Public Key",
    value: `(e=${e}, n=${n})`,
    formula: `Public Key = (e, n) = (${e}, ${n})`,
    description: `Share this openly. Anyone can encrypt messages to you using your public key.`,
  });
  steps.push({
    label: "Private Key",
    value: `(d=${d}, n=${n})`,
    formula: `Private Key = (d, n) = (${d}, ${n})`,
    description: `Keep this secret. Only you can decrypt ciphertexts produced with the corresponding public key.`,
  });

  return {
    keys: { p, q, n, phi, e, d, publicKey: { e, n }, privateKey: { d, n } },
    steps,
  };
}

// ─── Encrypt ────────────────────────────────────────────────
// c = m^e mod n
export function rsaEncrypt(message: bigint, e: bigint, n: bigint): RSAResult {
  const steps: RSAEncryptStep[] = [];

  steps.push({
    label: "Message (m)",
    value: message.toString(),
    formula: `m = ${message}`,
    description: "The plaintext message, represented as an integer. Must satisfy 0 ≤ m < n.",
  });
  steps.push({
    label: "Public Key",
    value: `e = ${e}, n = ${n}`,
    formula: `(e, n) = (${e}, ${n})`,
    description: "The public key used for encryption. e is the public exponent, n is the modulus.",
  });

  const sqSteps = modPowSteps(message, e, n);
  steps.push({
    label: "Square-and-Multiply (mod exp)",
    value: `${sqSteps.length} steps`,
    formula: `c = m^e mod n`,
    description: `Efficient modular exponentiation: scan bits of e from LSB to MSB. For each '1' bit: multiply result by current base. Always: square the base. Reduces time from O(e) to O(log e) multiplications.`,
  });

  const ciphertext = modPow(message, e, n);
  steps.push({
    label: "Ciphertext (c)",
    value: ciphertext.toString(),
    formula: `c = ${message}^${e} mod ${n} = ${ciphertext}`,
    description: "The encrypted ciphertext. Without the private key d, recovering m from c requires solving the discrete logarithm problem.",
  });

  return { input: message, output: ciphertext, steps };
}

// ─── Decrypt ────────────────────────────────────────────────
// m = c^d mod n
export function rsaDecrypt(ciphertext: bigint, d: bigint, n: bigint): RSAResult {
  const steps: RSAEncryptStep[] = [];

  steps.push({
    label: "Ciphertext (c)",
    value: ciphertext.toString(),
    formula: `c = ${ciphertext}`,
    description: "The encrypted ciphertext received. We will recover m using the private key.",
  });
  steps.push({
    label: "Private Key",
    value: `d = ${d}, n = ${n}`,
    formula: `(d, n) = (${d}, ${n})`,
    description: "The private key used for decryption. d is the private exponent derived via Extended Euclidean Algorithm.",
  });

  const sqSteps = modPowSteps(ciphertext, d, n);
  steps.push({
    label: "Square-and-Multiply (mod exp)",
    value: `${sqSteps.length} steps`,
    formula: `m = c^d mod n`,
    description: `Compute c^d mod n using square-and-multiply. The result equals the original message m because (m^e)^d ≡ m (mod n) by Euler's theorem.`,
  });

  const message = modPow(ciphertext, d, n);
  steps.push({
    label: "Recovered Message (m)",
    value: message.toString(),
    formula: `m = ${ciphertext}^${d} mod ${n} = ${message}`,
    description: "The decrypted plaintext. Euler's theorem guarantees (m^e)^d ≡ m^(ed) ≡ m (mod n).",
  });

  return { input: ciphertext, output: message, steps };
}

// ─── Text <-> Number helpers ─────────────────────────────────
export function textToBigInt(text: string): bigint {
  const bytes = new TextEncoder().encode(text);
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte);
  }
  return result;
}

export function bigIntToText(n: bigint): string {
  const bytes: number[] = [];
  let tmp = n;
  while (tmp > 0n) {
    bytes.unshift(Number(tmp & 0xffn));
    tmp >>= 8n;
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return n.toString();
  }
}