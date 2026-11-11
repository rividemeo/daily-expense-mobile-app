// Parses the text lines of a myBCA "Mutasi Rekening" PDF into transactions.
// Each entry is one line "<dd/mm/yyyy|PEND> <description> <amount> <DB|CR>"
// followed by a type line (TRANSAKSI DEBIT, TRSF E-BANKING DB, BI-FAST CR, ...)
// and sometimes a reference number. Reference and account numbers are dropped:
// only date, a cleaned-up name, amount and direction are kept.

import type { PaymentMethod, TransactionType } from '@/types/models';

export interface ParsedTx {
  id: string; // stable, so re-importing an overlapping statement skips duplicates
  date: string; // yyyy-mm-dd
  amount: number;
  type: TransactionType;
  description: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
}

export interface ParsedStatement {
  transactions: ParsedTx[];
  skippedOwnTransfers: number;
}

const ENTRY =
  /^(\d{2})\/(\d{2})\/(\d{4})\s+(.*?)\s*([\d,]+\.\d{2})\s+(DB|CR)$|^PEND\s+(.*?)\s*([\d,]+\.\d{2})\s+(DB|CR)$/;

// BCA cuts merchant names to 10 characters.
const ALIASES: [RegExp, string][] = [
  [/^IDM INDOMA/i, 'Indomaret'],
  [/^ALFAMA/i, 'Alfamart'],
  [/^GO-?PAY TOPUP/i, 'GoPay top-up'],
];

// Generic list of common Indonesian chains and food words. First match wins.
// ponytail: keyword guessing; unknown names land in "Other" and can be recategorised in the app.
const CATEGORY_RULES: [RegExp, string][] = [
  [/top-?up|\bDANA\b|\bOVO\b|SHOPEEPAY|ATM withdrawal/i, 'cat_expense_other'],
  [/INDOMARET|ALFA|SUPERINDO|HYPERMART|LOTTE|TRANSMART|HERO\b|GIANT/i, 'cat_household'],
  [/TOKOPEDIA|SHOPEE|LAZADA|BLIBLI|IKEA|ZALORA/i, 'cat_shopping'],
  [/PARKIR|GRAB|GOJEK|GOCAR|\bKRL\b|\bMRT\b|PERTAMINA|SPBU|\bTOL\b|TRANSJAKARTA|BLUEBIRD/i, 'cat_transport'],
  [/TELKOMSEL|\bPLN\b|INDIHOME|\bXL\b|BPJS|PDAM|BIZNET|FIRSTMEDIA|INDOSAT/i, 'cat_utilities'],
  [/CGV|\bXXI\b|NETFLIX|SPOTIFY|STEAM|PLAYSTATION/i, 'cat_entertainment'],
  [/APOTEK|KIMIA FARMA|KLINIK|\bRS\b|HOSPITAL|GUARDIAN|WATSONS/i, 'cat_health'],
  [/NASI|\bRM\b|KOPI|COFFEE|CAFE|RESTO|BAKSO|\bMIE\b|SATE|AYAM|WARUNG|KFC|MCD|STARBUCKS|PIZZA|BURGER|BAKERY|ROTI|SUSHI|RAMEN/i, 'cat_food'],
];

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\s+/g, ' ').trim();

function alias(name: string): string {
  for (const [re, nice] of ALIASES) if (re.test(name)) return nice;
  return titleCase(name);
}

interface Clean {
  description: string;
  method: PaymentMethod;
  ddmm?: string; // date hint inside the line, for PEND rows
  person?: string; // counterpart of a transfer
}

function clean(raw: string, typeLine: string): Clean {
  let m: RegExpMatchArray | null;
  // QRIS payment: "TGL: mmdd QR 014 00000.00<MERCHANT>"
  if ((m = raw.match(/^TGL:\s*(\d{2})(\d{2})\s+QRC?\s+\d+\s+[\d.]+\s*(.*)$/))) {
    return { description: alias(m[3]), method: 'debit_card', ddmm: m[2] + m[1] };
  }
  // Virtual account: "ddmm/FTFVA/WS<ref>/<NAME> - -"
  if ((m = raw.match(/^(\d{4})\/FTFVA\/[^/]*\/(.+?)-?(\s+-.*)?$/))) {
    return { description: alias(m[2].trim()), method: 'bank_transfer', ddmm: m[1] };
  }
  // e-banking transfer with note: "ddmm/FTSCY/WS<ref> <amount><note> <NAME>"
  if ((m = raw.match(/^(\d{4})\/FTSCY\/\S+\s+[\d.]+\s*(.*)$/))) {
    return { description: `Transfer: ${titleCase(m[2])}`, method: 'bank_transfer', ddmm: m[1], person: m[2] };
  }
  if (/^BIAYA TXN KE\b/.test(raw)) return { description: 'Transfer fee', method: 'bank_transfer' };
  if ((m = raw.match(/^TRANSFER KE\s+\d+\s+(.+?)(\s*M-BCA)?$/))) {
    return { description: `Transfer to ${titleCase(m[1])}`, method: 'bank_transfer', person: m[1] };
  }
  if ((m = raw.match(/^TRANSFER DR\s+\d+\s+(.+?)(\s*M-BCA)?$/))) {
    return { description: `Transfer from ${titleCase(m[1])}`, method: 'bank_transfer', person: m[1] };
  }
  if (/TARIKAN ATM/.test(typeLine)) return { description: 'ATM withdrawal', method: 'other' };
  if (/BIAYA ADM/.test(typeLine)) return { description: 'Bank admin fee', method: 'other' };
  const text = raw.replace(/\d{6,}/g, '').trim(); // never keep account/reference numbers
  return { description: titleCase(text || typeLine), method: 'bank_transfer' };
}

function categoryFor(type: TransactionType, description: string): string {
  if (type === 'income') return /SALARY|GAJI|PAYROLL/i.test(description) ? 'cat_salary' : 'cat_income_other';
  for (const [re, cat] of CATEGORY_RULES) if (re.test(description)) return cat;
  return 'cat_expense_other';
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const num = (s: string) => Number(s.replace(/,/g, ''));
const letters = (s: string) => s.replace(/[^A-Z]/gi, '').toUpperCase();
const HEADER = /^(MUTASI|NO\.|NAMA|HALAMAN|JENIS|PERIODE|MATA|CATATAN|TANGGAL|Bersambung|Apabila|Rekening|dengan|tercantum)/;

export function parseBcaStatement(lines: string[]): ParsedStatement {
  const holder = lines.map((l) => l.match(/^NAMA\s*:\s*(.+)$/)).find(Boolean)?.[1] ?? '';
  const period = lines.map((l) => l.match(/^PERIODE\s*:.*-\s*(\d{2})\/(\d{2})\/(\d{4})/)).find(Boolean);
  const periodEnd = period ? `${period[3]}-${period[2]}-${period[1]}` : new Date().toISOString().slice(0, 10);

  const entries: { date?: string; raw: string; amount: number; dir: string; type: string }[] = [];
  for (const line of lines) {
    const m = line.match(ENTRY);
    if (m) {
      entries.push(
        m[1]
          ? { date: `${m[3]}-${m[2]}-${m[1]}`, raw: m[4], amount: num(m[5]), dir: m[6], type: '' }
          : { raw: m[7], amount: num(m[8]), dir: m[9], type: '' },
      );
    } else if (entries.length && !entries[entries.length - 1].type && /[A-Z]{3,}/.test(line) && !HEADER.test(line)) {
      entries[entries.length - 1].type = line; // first text line after an entry is its type
    }
  }

  const seen: Record<string, number> = {};
  const transactions: ParsedTx[] = [];
  let skippedOwnTransfers = 0;
  for (const e of entries) {
    const c = clean(e.raw, e.type);
    // Moving money between your own accounts is neither spending nor income.
    if (holder && c.person && letters(c.person).startsWith(letters(holder))) {
      skippedOwnTransfers++;
      continue;
    }
    const year = (e.date ?? periodEnd).slice(0, 4);
    const date = e.date ?? (c.ddmm ? `${year}-${c.ddmm.slice(2)}-${c.ddmm.slice(0, 2)}` : periodEnd);
    const type: TransactionType = e.dir === 'CR' ? 'income' : 'expense';
    const key = `${date}|${e.amount}|${e.dir}|${c.description}`;
    seen[key] = (seen[key] ?? 0) + 1; // same shop, same amount, same day twice = two rows
    transactions.push({
      id: `bca_${hash(key)}_${seen[key]}`,
      date,
      amount: e.amount,
      type,
      description: c.description,
      categoryId: categoryFor(type, c.description),
      paymentMethod: c.method,
    });
  }
  return { transactions, skippedOwnTransfers };
}

// Invented rows in BCA's layout (no real data). Run: npx tsx src/features/import/bcaStatement.ts
export function selfCheck() {
  const sample = [
    'MUTASI REKENING',
    'NAMA : BUDI SANTOSO',
    'PERIODE : 01/01/2026 - 05/01/2026',
    'TANGGAL KETERANGAN MUTASI',
    'PEND TGL: 0105 QRC 014 00000.00IDM INDOMA 17,500.00 DB',
    'TRANSAKSI DEBIT',
    '04/01/2026 0401/FTFVA/WS1234567890/GOPAY TOPUP - - 50,000.00 DB',
    '123456789012',
    'TRSF E-BANKING DB',
    '04/01/2026 0401/FTSCY/WS12345 40000.00sewa kos ANDI 40,000.00 DB',
    'TRSF E-BANKING DB',
    '03/01/2026 TGL: 0103 QR 008 00000.00Warung Bu 20,000.00 DB',
    'TRANSAKSI DEBIT',
    '03/01/2026 TGL: 0103 QR 008 00000.00Warung Bu 20,000.00 DB',
    'TRANSAKSI DEBIT',
    '02/01/2026 123456789012 1,000,000.00 DB',
    'TARIKAN ATM 02/01',
    'Bersambung ke Halaman berikutnya',
    'HALAMAN : 2/2',
    '02/01/2026 TRANSFER KE 011 BUDI SANTOSO M-BCA 500,000.00 DB',
    'BI-FAST DB',
    '01/01/2026 TRANSFER DR 008 SITI AMINAH 75,000.00 CR',
    'BI-FAST CR',
  ];
  const { transactions: t, skippedOwnTransfers } = parseBcaStatement(sample);
  const eq = (a: unknown, b: unknown, what: string) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  };
  eq(t.length, 7, 'count');
  eq(skippedOwnTransfers, 1, 'own transfer skipped');
  eq([t[0].date, t[0].description, t[0].categoryId, t[0].amount], ['2026-01-05', 'Indomaret', 'cat_household', 17500], 'PEND QR row');
  eq([t[1].description, t[1].categoryId], ['GoPay top-up', 'cat_expense_other'], 'VA row');
  eq(t[2].description, 'Transfer: Sewa Kos Andi', 'FTSCY row');
  eq([t[3].categoryId, t[3].id === t[4].id], ['cat_food', false], 'twin rows stay two');
  eq([t[5].description, t[5].amount], ['ATM withdrawal', 1000000], 'ATM row');
  eq([t[6].type, t[6].description], ['income', 'Transfer from Siti Aminah'], 'incoming transfer');
  eq(t.some((x) => /\d{6,}/.test(x.description)), false, 'no reference numbers kept');
  eq(parseBcaStatement(sample).transactions.map((x) => x.id), t.map((x) => x.id), 'ids stable');
  return 'ok';
}
