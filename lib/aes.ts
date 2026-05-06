// ============================================================
//  AES — Pure Math Implementation (No Libraries)
//  Implements AES-128 / AES-192 / AES-256 from the ground up
// ============================================================

// ─── S-Box (SubBytes lookup) ────────────────────────────────
export const SBOX: number[] = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];

// ─── Inverse S-Box ──────────────────────────────────────────
export const INV_SBOX: number[] = [
  0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
  0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
  0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
  0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
  0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
  0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
  0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
  0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
  0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
  0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
  0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
  0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
  0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
  0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
  0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
  0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d,
];

const RCON: number[] = [
  0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36,
];

export type AESState = number[][];

export interface AESStep {
  round: number;
  operation: string;
  state: AESState;
  roundKey?: AESState;
  description: string;
  formula: string;
  changedCells: boolean[][];
}

export interface KeyExpansionStep {
  index: number;
  word: number[];
  operation: string;
  detail: string;
}

export interface AESResult {
  outputBytes: number[];
  steps: AESStep[];
  roundKeys: AESState[];
  keyExpansionSteps: KeyExpansionStep[];
  inputHex: string;
  outputHex: string;
}

export function gmul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hiBit = (a & 0x80) !== 0;
    a = (a << 1) & 0xff;
    if (hiBit) a ^= 0x1b;
    b >>= 1;
  }
  return p & 0xff;
}

export function bytesToState(bytes: number[]): AESState {
  const s: AESState = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < 16; i++) s[i % 4][Math.floor(i / 4)] = bytes[i];
  return s;
}

export function stateToBytes(s: AESState): number[] {
  const b = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) b[i] = s[i % 4][Math.floor(i / 4)];
  return b;
}

function copyState(s: AESState): AESState {
  return s.map(r => [...r]);
}

function diff(a: AESState, b: AESState): boolean[][] {
  return a.map((row, r) => row.map((_, c) => a[r][c] !== b[r][c]));
}

function allTrue(): boolean[][] {
  return Array.from({ length: 4 }, () => Array(4).fill(true));
}

function subBytes(s: AESState): AESState {
  return s.map(row => row.map(b => SBOX[b]));
}

function invSubBytes(s: AESState): AESState {
  return s.map(row => row.map(b => INV_SBOX[b]));
}

function shiftRows(s: AESState): AESState {
  return s.map((row, r) => [...row.slice(r), ...row.slice(0, r)]);
}

function invShiftRows(s: AESState): AESState {
  return s.map((row, r) => [...row.slice(4 - r), ...row.slice(0, 4 - r)]);
}

function mixColumns(s: AESState): AESState {
  const n = copyState(s);
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [s[0][c], s[1][c], s[2][c], s[3][c]];
    n[0][c] = gmul(2, a0) ^ gmul(3, a1) ^ a2 ^ a3;
    n[1][c] = a0 ^ gmul(2, a1) ^ gmul(3, a2) ^ a3;
    n[2][c] = a0 ^ a1 ^ gmul(2, a2) ^ gmul(3, a3);
    n[3][c] = gmul(3, a0) ^ a1 ^ a2 ^ gmul(2, a3);
  }
  return n;
}

function invMixColumns(s: AESState): AESState {
  const n = copyState(s);
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [s[0][c], s[1][c], s[2][c], s[3][c]];
    n[0][c] = gmul(0x0e, a0) ^ gmul(0x0b, a1) ^ gmul(0x0d, a2) ^ gmul(0x09, a3);
    n[1][c] = gmul(0x09, a0) ^ gmul(0x0e, a1) ^ gmul(0x0b, a2) ^ gmul(0x0d, a3);
    n[2][c] = gmul(0x0d, a0) ^ gmul(0x09, a1) ^ gmul(0x0e, a2) ^ gmul(0x0b, a3);
    n[3][c] = gmul(0x0b, a0) ^ gmul(0x0d, a1) ^ gmul(0x09, a2) ^ gmul(0x0e, a3);
  }
  return n;
}

function addRoundKey(s: AESState, rk: AESState): AESState {
  return s.map((row, r) => row.map((b, c) => b ^ rk[r][c]));
}

export function keyExpansion(keyBytes: number[]): {
  roundKeys: AESState[];
  steps: KeyExpansionStep[];
} {
  const Nk = keyBytes.length / 4;
  const Nr = Nk + 6;
  const total = 4 * (Nr + 1);
  const steps: KeyExpansionStep[] = [];
  const W: number[][] = [];

  for (let i = 0; i < Nk; i++) {
    W.push([keyBytes[4*i], keyBytes[4*i+1], keyBytes[4*i+2], keyBytes[4*i+3]]);
    steps.push({ index: i, word: [...W[i]], operation: 'Initial', detail: `W[${i}] = key bytes [${4*i}..${4*i+3}]` });
  }

  for (let i = Nk; i < total; i++) {
    let temp = [...W[i - 1]];
    let op = '', detail = '';

    if (i % Nk === 0) {
      temp = [temp[1], temp[2], temp[3], temp[0]];
      temp = temp.map(b => SBOX[b]);
      temp[0] ^= RCON[i / Nk];
      op = 'RotWord + SubWord + Rcon';
      detail = `W[${i}] = W[${i-1}] after RotWord→SubWord→⊕Rcon[${i/Nk}]  ⊕  W[${i-Nk}]`;
    } else if (Nk > 6 && i % Nk === 4) {
      temp = temp.map(b => SBOX[b]);
      op = 'SubWord';
      detail = `W[${i}] = SubWord(W[${i-1}])  ⊕  W[${i-Nk}]  (AES-256 extra step)`;
    } else {
      op = 'XOR';
      detail = `W[${i}] = W[${i-1}]  ⊕  W[${i-Nk}]`;
    }

    W.push(W[i - Nk].map((b, j) => b ^ temp[j]));
    steps.push({ index: i, word: [...W[i]], operation: op, detail });
  }

  const roundKeys: AESState[] = [];
  for (let r = 0; r <= Nr; r++) {
    const rk: AESState = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let c = 0; c < 4; c++) {
      for (let row = 0; row < 4; row++) {
        rk[row][c] = W[r * 4 + c][row];
      }
    }
    roundKeys.push(rk);
  }

  return { roundKeys, steps };
}

export function aesEncrypt(inputBytes: number[], keyBytes: number[]): AESResult {
  const steps: AESStep[] = [];
  const { roundKeys, steps: keySteps } = keyExpansion(keyBytes);
  const Nr = roundKeys.length - 1;

  let state = bytesToState(inputBytes);

  steps.push({
    round: 0, operation: 'Input', state: copyState(state),
    description: 'Plaintext loaded into the 4×4 state matrix in column-major order.',
    formula: 'state[row][col] = byte[col×4 + row]',
    changedCells: allTrue(),
  });

  const prev0 = copyState(state);
  state = addRoundKey(state, roundKeys[0]);
  steps.push({
    round: 0, operation: 'AddRoundKey', state: copyState(state), roundKey: copyState(roundKeys[0]),
    description: 'XOR every byte of the state with the corresponding byte of Round Key 0.',
    formula: 'state[r][c]  ⊕=  roundKey[0][r][c]',
    changedCells: diff(prev0, state),
  });

  for (let round = 1; round <= Nr; round++) {
    const prevSB = copyState(state);
    state = subBytes(state);
    steps.push({
      round, operation: 'SubBytes', state: copyState(state),
      description: `Each byte independently substituted via the AES S-Box — a non-linear lookup table derived from multiplicative inverses in GF(2⁸) combined with an affine transformation.`,
      formula: 'state[r][c] = SBOX[ state[r][c] ]',
      changedCells: diff(prevSB, state),
    });

    const prevSR = copyState(state);
    state = shiftRows(state);
    steps.push({
      round, operation: 'ShiftRows', state: copyState(state),
      description: `Row 0: no shift. Row 1: left-rotate by 1. Row 2: left-rotate by 2. Row 3: left-rotate by 3.`,
      formula: 'state[r] = leftRotate(state[r], r)',
      changedCells: diff(prevSR, state),
    });

    if (round < Nr) {
      const prevMC = copyState(state);
      state = mixColumns(state);
      steps.push({
        round, operation: 'MixColumns', state: copyState(state),
        description: `Each column treated as a GF(2⁸) polynomial and multiplied by the fixed polynomial c(x) = {03}x³+{01}x²+{01}x+{02} mod (x⁴+1).`,
        formula: `col' = M × col  in GF(2⁸)  |  M = [[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]]`,
        changedCells: diff(prevMC, state),
      });
    }

    const prevARK = copyState(state);
    state = addRoundKey(state, roundKeys[round]);
    steps.push({
      round, operation: 'AddRoundKey', state: copyState(state), roundKey: copyState(roundKeys[round]),
      description: `XOR state with Round Key ${round}. Round keys derived from key expansion using RotWord, SubWord, and Rcon.`,
      formula: `state[r][c]  ⊕=  roundKey[${round}][r][c]`,
      changedCells: diff(prevARK, state),
    });
  }

  const outputBytes = stateToBytes(state);
  return { outputBytes, steps, roundKeys, keyExpansionSteps: keySteps, inputHex: bytesToHex(inputBytes), outputHex: bytesToHex(outputBytes) };
}

export function aesDecrypt(inputBytes: number[], keyBytes: number[]): AESResult {
  const steps: AESStep[] = [];
  const { roundKeys, steps: keySteps } = keyExpansion(keyBytes);
  const Nr = roundKeys.length - 1;

  let state = bytesToState(inputBytes);

  steps.push({
    round: 0, operation: 'Input', state: copyState(state),
    description: 'Ciphertext loaded into 4×4 state matrix. Decryption applies inverse operations in reverse order.',
    formula: 'state[row][col] = cipher_byte[col×4 + row]',
    changedCells: allTrue(),
  });

  const prev0 = copyState(state);
  state = addRoundKey(state, roundKeys[Nr]);
  steps.push({
    round: 0, operation: 'AddRoundKey', state: copyState(state), roundKey: copyState(roundKeys[Nr]),
    description: `Inverse decryption starts with Round Key ${Nr} (the last key used during encryption).`,
    formula: `state  ⊕=  roundKey[${Nr}]`,
    changedCells: diff(prev0, state),
  });

  for (let round = Nr - 1; round >= 0; round--) {
    const dispRound = Nr - round;

    const prevISR = copyState(state);
    state = invShiftRows(state);
    steps.push({
      round: dispRound, operation: 'InvShiftRows', state: copyState(state),
      description: `Inverse of ShiftRows. Row 0: no shift. Row 1: right-rotate by 1. Row 2: right-rotate by 2. Row 3: right-rotate by 3.`,
      formula: 'state[r] = rightRotate(state[r], r)',
      changedCells: diff(prevISR, state),
    });

    const prevISB = copyState(state);
    state = invSubBytes(state);
    steps.push({
      round: dispRound, operation: 'InvSubBytes', state: copyState(state),
      description: `Each byte substituted via the Inverse S-Box.`,
      formula: 'state[r][c] = INV_SBOX[ state[r][c] ]',
      changedCells: diff(prevISB, state),
    });

    const prevARK = copyState(state);
    state = addRoundKey(state, roundKeys[round]);
    steps.push({
      round: dispRound, operation: 'AddRoundKey', state: copyState(state), roundKey: copyState(roundKeys[round]),
      description: `XOR with Round Key ${round}. AddRoundKey is its own inverse since XOR is self-inverse.`,
      formula: `state  ⊕=  roundKey[${round}]`,
      changedCells: diff(prevARK, state),
    });

    if (round > 0) {
      const prevIMC = copyState(state);
      state = invMixColumns(state);
      steps.push({
        round: dispRound, operation: 'InvMixColumns', state: copyState(state),
        description: `Inverse MixColumns using the inverse matrix coefficients {0e},{0b},{0d},{09} in GF(2⁸).`,
        formula: `col' = M⁻¹ × col  |  M⁻¹ = [[0e,0b,0d,09],[09,0e,0b,0d],[0d,09,0e,0b],[0b,0d,09,0e]]`,
        changedCells: diff(prevIMC, state),
      });
    }
  }

  const outputBytes = stateToBytes(state);
  return { outputBytes, steps, roundKeys, keyExpansionSteps: keySteps, inputHex: bytesToHex(inputBytes), outputHex: bytesToHex(outputBytes) };
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/\s/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return bytes;
}

export function normalizeKey(keyStr: string, bits: 128 | 192 | 256): number[] {
  const byteLen = bits / 8;
  const encoded = Array.from(new TextEncoder().encode(keyStr));
  const result = new Array(byteLen).fill(0);
  for (let i = 0; i < Math.min(encoded.length, byteLen); i++) result[i] = encoded[i];
  return result;
}

export function padBlock(bytes: number[]): number[] {
  const padded = [...bytes];
  const padLen = 16 - (bytes.length % 16);
  for (let i = 0; i < padLen; i++) padded.push(padLen);
  return padded;
}

export function unpadBlock(bytes: number[]): number[] {
  const padLen = bytes[bytes.length - 1];
  if (padLen < 1 || padLen > 16) return bytes;
  return bytes.slice(0, bytes.length - padLen);
}

export function textToBlock(text: string): number[] {
  const encoded = Array.from(new TextEncoder().encode(text)).slice(0, 16);
  return padBlock(encoded);
}

export function blockToText(bytes: number[]): string {
  try {
    return new TextDecoder().decode(new Uint8Array(unpadBlock(bytes)));
  } catch {
    return bytesToHex(bytes);
  }
}