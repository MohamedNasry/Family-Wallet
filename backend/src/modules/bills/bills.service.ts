import pool from "../../config/db";
import { createWorker, PSM } from "tesseract.js";

type SplitType = "EQUAL" | "PERCENTAGE" | "FIXED";
type UserRole = "PARENT" | "CHILD" | "MEMBER";

type SplitParticipant = {
  userId: number;
  percentage?: number;
  fixedAmount?: number;
};

type DbClient = {
  query: (text: string, params?: any[]) => Promise<any>;
};

const ARAB_CURRENCY_CODES = [
  "AED", // United Arab Emirates Dirham
  "BHD", // Bahraini Dinar
  "KMF", // Comorian Franc
  "DJF", // Djiboutian Franc
  "DZD", // Algerian Dinar
  "EGP", // Egyptian Pound
  "IQD", // Iraqi Dinar
  "JOD", // Jordanian Dinar
  "KWD", // Kuwaiti Dinar
  "LBP", // Lebanese Pound
  "LYD", // Libyan Dinar
  "MAD", // Moroccan Dirham
  "MRU", // Mauritanian Ouguiya
  "OMR", // Omani Rial
  "QAR", // Qatari Riyal
  "SAR", // Saudi Riyal
  "SDG", // Sudanese Pound
  "SOS", // Somali Shilling
  "SYP", // Syrian Pound
  "TND", // Tunisian Dinar
  "YER", // Yemeni Rial
  "ILS", // Israeli Shekel, commonly used in Palestine
] as const;

const ARAB_CURRENCIES = [
  {
    code: "AED",
    keywords: ["AED", "د.إ", "درهم إماراتي", "درهم اماراتي", "درهم الإمارات"],
  },
  {
    code: "BHD",
    keywords: ["BHD", "BD", "د.ب", "دينار بحريني"],
  },
  {
    code: "KMF",
    keywords: ["KMF", "CF", "فرنك قمري", "فرنك جزر القمر"],
  },
  {
    code: "DJF",
    keywords: ["DJF", "FDJ", "فرنك جيبوتي"],
  },
  {
    code: "DZD",
    keywords: ["DZD", "DA", "دج", "د.ج", "دينار جزائري"],
  },
  {
    code: "EGP",
    keywords: ["EGP", "LE", "L.E", "E£", "£E", "ج.م", "جنيه مصري"],
  },
  {
    code: "IQD",
    keywords: ["IQD", "د.ع", "دينار عراقي"],
  },
  {
    code: "JOD",
    keywords: ["JOD", "JD", "د.أ", "دينار أردني", "دينار اردني"],
  },
  {
    code: "KWD",
    keywords: ["KWD", "KD", "د.ك", "دينار كويتي"],
  },
  {
    code: "LBP",
    keywords: ["LBP", "ل.ل", "ليرة لبنانية", "ليره لبنانيه"],
  },
  {
    code: "LYD",
    keywords: ["LYD", "LD", "د.ل", "دينار ليبي"],
  },
  {
    code: "MAD",
    keywords: ["MAD", "د.م", "درهم مغربي"],
  },
  {
    code: "MRU",
    keywords: ["MRU", "MRO", "أوقية", "اوقية", "أوقية موريتانية"],
  },
  {
    code: "OMR",
    keywords: ["OMR", "RO", "ر.ع", "ريال عماني"],
  },
  {
    code: "QAR",
    keywords: ["QAR", "QR", "ر.ق", "ريال قطري"],
  },
  {
    code: "SAR",
    keywords: ["SAR", "SR", "ر.س", "ريال سعودي"],
  },
  {
    code: "SDG",
    keywords: ["SDG", "ج.س", "جنيه سوداني"],
  },
  {
    code: "SOS",
    keywords: ["SOS", "SH.SO", "شلن صومالي"],
  },
  {
    code: "SYP",
    keywords: ["SYP", "ل.س", "ليرة سورية", "ليره سوريه"],
  },
  {
    code: "TND",
    keywords: ["TND", "DT", "د.ت", "دينار تونسي"],
  },
  {
    code: "YER",
    keywords: ["YER", "ر.ي", "ريال يمني"],
  },
  {
    code: "ILS",
    keywords: ["ILS", "NIS", "₪", "شيكل", "شيكل إسرائيلي", "شيكل اسرائيلي"],
  },
] as const;

const toCents = (value: number | string) => {
  return Math.round(Number(value) * 100);
};

const fromCents = (value: number) => {
  return Number((value / 100).toFixed(2));
};

const normalizeArabicText = (value: string) => {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .trim();
};

const containsLatinKeyword = (text: string, keyword: string) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|[^A-Z0-9])${escaped}([^A-Z0-9]|$)`, "i");
  return regex.test(text);
};

const containsCurrencyKeyword = (text: string, keyword: string) => {
  const upperText = text.toUpperCase();
  const upperKeyword = keyword.toUpperCase();

  const isLatin = /^[A-Z0-9.£$€]+$/i.test(keyword);

  if (isLatin) {
    return containsLatinKeyword(upperText, upperKeyword);
  }

  return normalizeArabicText(text).includes(normalizeArabicText(keyword));
};

const parseCurrencyFromText = (
  text: string,
  walletCurrency?: string | null
): string | null => {
  const upperText = text.toUpperCase();

  for (const currency of ARAB_CURRENCIES) {
    for (const keyword of currency.keywords) {
      if (containsCurrencyKeyword(upperText, keyword)) {
        return currency.code;
      }
    }
  }

  const normalized = normalizeArabicText(text).toLowerCase();

  const hasGenericDirham =
    normalized.includes("درهم") ||
    containsLatinKeyword(upperText, "DH") ||
    containsLatinKeyword(upperText, "DHS");

  if (hasGenericDirham) {
    if (walletCurrency === "MAD" || walletCurrency === "AED") {
      return walletCurrency;
    }

    return null;
  }

  const hasGenericRiyal =
    normalized.includes("ريال") || normalized.includes("﷼");

  if (hasGenericRiyal) {
    if (
      walletCurrency === "SAR" ||
      walletCurrency === "QAR" ||
      walletCurrency === "OMR" ||
      walletCurrency === "YER"
    ) {
      return walletCurrency;
    }

    return null;
  }

  const hasGenericDinar = normalized.includes("دينار");

  if (hasGenericDinar) {
    if (
      walletCurrency === "BHD" ||
      walletCurrency === "DZD" ||
      walletCurrency === "IQD" ||
      walletCurrency === "JOD" ||
      walletCurrency === "KWD" ||
      walletCurrency === "LYD" ||
      walletCurrency === "TND"
    ) {
      return walletCurrency;
    }

    return null;
  }

  const hasGenericPound =
    normalized.includes("جنيه") || normalized.includes("ليره");

  if (hasGenericPound) {
    if (
      walletCurrency === "EGP" ||
      walletCurrency === "SDG" ||
      walletCurrency === "LBP" ||
      walletCurrency === "SYP"
    ) {
      return walletCurrency;
    }

    return null;
  }

  return null;
};

const normalizeCurrencyInput = (
  currency: string,
  walletCurrency?: string | null
): string => {
  const upperCurrency = currency.trim().toUpperCase();

  if (ARAB_CURRENCY_CODES.includes(upperCurrency as any)) {
    return upperCurrency;
  }

  const parsed = parseCurrencyFromText(currency, walletCurrency);

  if (!parsed) {
    throw new Error("INVALID_CURRENCY");
  }

  return parsed;
};

const parseAmountCandidate = (rawValue: string): number | null => {
  let value = normalizeArabicText(rawValue).replace(/\s/g, "");

  if (!value) {
    return null;
  }

  const hasComma = value.includes(",");
  const hasDot = value.includes(".");

  if (hasComma && hasDot) {
    const lastComma = value.lastIndexOf(",");
    const lastDot = value.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";

    if (decimalSeparator === ",") {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = value.split(",");
    const lastPart = parts[parts.length - 1];

    if (lastPart.length <= 2) {
      value = parts.slice(0, -1).join("") + "." + lastPart;
    } else {
      value = parts.join("");
    }
  } else if (hasDot) {
    const parts = value.split(".");
    const lastPart = parts[parts.length - 1];

    if (lastPart.length <= 2) {
      value = parts.slice(0, -1).join("") + "." + lastPart;
    } else {
      value = parts.join("");
    }
  }

  const amount = Number(value);

  if (Number.isNaN(amount) || amount < 0) {
    return null;
  }

  return amount;
};

const extractAmountsFromLine = (line: string): number[] => {
  const normalizedLine = normalizeArabicText(line);

  const amountRegex =
    /\d{1,3}(?:[ ,.\u00A0]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?/g;

  const matches = normalizedLine.match(amountRegex);

  if (!matches) {
    return [];
  }

  return matches
    .map(parseAmountCandidate)
    .filter((value): value is number => value !== null)
    .filter((value) => value > 0 && value < 100000000);
};

const parseTotalAmountFromText = (text: string): number | null => {
  const normalizedText = normalizeArabicText(text);

  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const strongTotalKeywords = [
    "total",
    "grand total",
    "amount due",
    "balance due",
    "net a payer",
    "net à payer",
    "a payer",
    "à payer",
    "montant total",
    "total ttc",
    "إجمالي",
    "اجمالي",
    "المجموع",
    "المبلغ الاجمالي",
    "الصافي",
    "المستحق",
  ];

  const weakTotalKeywords = [
    "amount",
    "montant",
    "المبلغ",
  ];

  const ignoredTotalKeywords = [
    "subtotal",
    "sub total",
    "tax",
    "tva",
    "vat",
    "discount",
    "change",
    "cash",
    "payment",
  ];

  const findAmountInLine = (line: string): number | null => {
    const amounts = extractAmountsFromLine(line);

    if (amounts.length === 0) {
      return null;
    }

    return amounts[amounts.length - 1];
  };

  // 1. ابحث من الأسفل إلى الأعلى عن TOTAL الحقيقي
  for (const line of [...lines].reverse()) {
    const lower = normalizeArabicText(line).toLowerCase();

    const isIgnored = ignoredTotalKeywords.some((keyword) =>
      lower.includes(normalizeArabicText(keyword).toLowerCase())
    );

    if (isIgnored) {
      continue;
    }

    const hasStrongTotalKeyword = strongTotalKeywords.some((keyword) =>
      lower.includes(normalizeArabicText(keyword).toLowerCase())
    );

    if (hasStrongTotalKeyword) {
      const amount = findAmountInLine(line);

      if (amount !== null) {
        return amount;
      }
    }
  }

  // 2. إذا لم يجد TOTAL، ابحث عن كلمات أضعف مثل amount/montant
  for (const line of [...lines].reverse()) {
    const lower = normalizeArabicText(line).toLowerCase();

    const isIgnored = ignoredTotalKeywords.some((keyword) =>
      lower.includes(normalizeArabicText(keyword).toLowerCase())
    );

    if (isIgnored) {
      continue;
    }

    const hasWeakKeyword = weakTotalKeywords.some((keyword) =>
      lower.includes(normalizeArabicText(keyword).toLowerCase())
    );

    if (hasWeakKeyword) {
      const amount = findAmountInLine(line);

      if (amount !== null) {
        return amount;
      }
    }
  }

  // 3. fallback: خذ أكبر مبلغ، مع تجاهل السنوات
  const allAmounts = lines.flatMap(extractAmountsFromLine);

  if (allAmounts.length === 0) {
    return null;
  }

  const filteredAmounts = allAmounts.filter((amount) => {
    const isLikelyYear =
      amount >= 1900 && amount <= 2100 && Number.isInteger(amount);

    return !isLikelyYear;
  });

  if (filteredAmounts.length === 0) {
    return Math.max(...allAmounts);
  }

  return Math.max(...filteredAmounts);
};

const parseDateFromText = (text: string): string | null => {
  const normalizedText = normalizeArabicText(text);

  const yyyyMmDdRegex = /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/;
  const ddMmYyyyRegex = /\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/;

  const formatDate = (year: string, month: string, day: string) => {
    const fullYear = year.length === 2 ? `20${year}` : year;
    const paddedMonth = month.padStart(2, "0");
    const paddedDay = day.padStart(2, "0");

    const date = new Date(`${fullYear}-${paddedMonth}-${paddedDay}`);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return `${fullYear}-${paddedMonth}-${paddedDay}`;
  };

  const yyyyMatch = normalizedText.match(yyyyMmDdRegex);

  if (yyyyMatch) {
    return formatDate(yyyyMatch[1], yyyyMatch[2], yyyyMatch[3]);
  }

  const ddMatch = normalizedText.match(ddMmYyyyRegex);

  if (ddMatch) {
    return formatDate(ddMatch[3], ddMatch[2], ddMatch[1]);
  }

  return null;
};

const parseTitleFromText = (text: string): string | null => {
  const ignoredWords = [
    "total",
    "subtotal",
    "tax",
    "tva",
    "date",
    "invoice",
    "receipt",
    "ticket",
    "amount",
    "cash",
    "change",
    "payment",
    "merci",
    "thank",
    "المجموع",
    "اجمالي",
    "إجمالي",
    "المبلغ",
    "التاريخ",
    "فاتورة",
    "وصل",
    "ضريبة",
  ];

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 3);

  for (const line of lines.slice(0, 10)) {
    const normalizedLine = normalizeArabicText(line).toLowerCase();

    const hasIgnoredWord = ignoredWords.some((word) =>
      normalizedLine.includes(normalizeArabicText(word).toLowerCase())
    );

    const hasAmount = extractAmountsFromLine(line).length > 0;

    if (!hasIgnoredWord && !hasAmount) {
      return line.substring(0, 150);
    }
  }

  return null;
};

const assertBillBelongsToWallet = async (
  billId: number,
  walletId: number,
  client: DbClient = pool
) => {
  const billResult = await client.query(
    `SELECT bill_id, wallet_id, total_amount, currency, title
     FROM bill
     WHERE bill_id = $1
       AND wallet_id = $2`,
    [billId, walletId]
  );

  if (billResult.rows.length === 0) {
    throw new Error("BILL_NOT_FOUND");
  }

  return billResult.rows[0];
};

const assertUsersBelongToWallet = async (
  userIds: number[],
  walletId: number,
  client: DbClient
) => {
  const uniqueUserIds = [...new Set(userIds)];

  const result = await client.query(
    `SELECT user_id
     FROM app_user
     WHERE wallet_id = $1
       AND user_id = ANY($2::int[])`,
    [walletId, uniqueUserIds]
  );

  if (result.rows.length !== uniqueUserIds.length) {
    throw new Error("USERS_NOT_IN_WALLET");
  }
};

const assertCategoryExists = async (
  categoryId: number | null,
  client: DbClient
) => {
  if (!categoryId) {
    return;
  }

  const result = await client.query(
    `SELECT category_id
     FROM category
     WHERE category_id = $1`,
    [categoryId]
  );

  if (result.rows.length === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
};

const calculateEqualSplits = (
  totalCents: number,
  participants: SplitParticipant[]
) => {
  const count = participants.length;
  const base = Math.floor(totalCents / count);
  let remainder = totalCents % count;

  return participants.map((participant) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;

    return {
      userId: participant.userId,
      amountDue: fromCents(base + extra),
      percentage: null,
      fixedAmount: null,
    };
  });
};

const calculatePercentageSplits = (
  totalCents: number,
  participants: SplitParticipant[]
) => {
  const totalPercentage = participants.reduce(
    (sum, participant) => sum + Number(participant.percentage || 0),
    0
  );

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("INVALID_PERCENTAGE_TOTAL");
  }

  let usedCents = 0;

  return participants.map((participant, index) => {
    const percentage = Number(participant.percentage || 0);

    if (percentage < 0 || percentage > 100) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    let amountCents: number;

    if (index === participants.length - 1) {
      amountCents = totalCents - usedCents;
    } else {
      amountCents = Math.round((totalCents * percentage) / 100);
      usedCents += amountCents;
    }

    return {
      userId: participant.userId,
      amountDue: fromCents(amountCents),
      percentage,
      fixedAmount: null,
    };
  });
};

const calculateFixedSplits = (
  totalCents: number,
  participants: SplitParticipant[]
) => {
  const totalFixedCents = participants.reduce(
    (sum, participant) => sum + toCents(participant.fixedAmount || 0),
    0
  );

  if (totalFixedCents !== totalCents) {
    throw new Error("INVALID_FIXED_TOTAL");
  }

  return participants.map((participant) => {
    const fixedAmount = Number(participant.fixedAmount || 0);

    if (fixedAmount < 0) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    return {
      userId: participant.userId,
      amountDue: fixedAmount,
      percentage: null,
      fixedAmount,
    };
  });
};

const guessCategoryIdFromText = async (
  text: string
): Promise<number | null> => {
  const result = await pool.query(
    `SELECT category_id, name
     FROM category`
  );

  const lowerText = normalizeArabicText(text).toLowerCase();

  for (const category of result.rows) {
    const categoryName = normalizeArabicText(String(category.name)).toLowerCase();

    if (categoryName && lowerText.includes(categoryName)) {
      return Number(category.category_id);
    }
  }

  return null;
};
export const splitBillService = async ({
  billId,
  walletId,
  splitType,
  participants,
}: {
  billId: number;
  walletId: number;
  splitType: SplitType;
  participants: SplitParticipant[];
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const allowedTypes: SplitType[] = ["EQUAL", "PERCENTAGE", "FIXED"];

    if (!allowedTypes.includes(splitType)) {
      throw new Error("INVALID_SPLIT_TYPE");
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    const userIds = participants.map((participant) => Number(participant.userId));

    if (userIds.some((id) => !id)) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    const uniqueUserIds = [...new Set(userIds)];//ر يحذف المستخدمين المكررين من المصفوفة userIds.

    if (uniqueUserIds.length !== userIds.length) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    const bill = await assertBillBelongsToWallet(billId, walletId, client);

    await assertUsersBelongToWallet(userIds, walletId, client);

    const totalCents = toCents(bill.total_amount);

    let calculatedSplits;

    if (splitType === "EQUAL") {
      calculatedSplits = calculateEqualSplits(totalCents, participants);
    } else if (splitType === "PERCENTAGE") {
      calculatedSplits = calculatePercentageSplits(totalCents, participants);
    } else {
      calculatedSplits = calculateFixedSplits(totalCents, participants);
    }

    await client.query("DELETE FROM bill_split WHERE bill_id = $1", [billId]);

    const insertedSplits = [];

    for (const split of calculatedSplits) {
      const result = await client.query(
        `INSERT INTO bill_split (
           bill_id,
           user_id,
           split_type,
           percentage,
           fixed_amount,
           amount_due,
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'UNPAID')
         RETURNING 
           split_id AS "splitId",
           bill_id AS "billId",
           user_id AS "userId",
           split_type AS "splitType",
           percentage,
           fixed_amount AS "fixedAmount",
           amount_due AS "amountDue",
           status`,
        [
          billId,
          split.userId,
          splitType,
          split.percentage,
          split.fixedAmount,
          split.amountDue,
        ]
      );

      insertedSplits.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return {
      bill: {
        billId: Number(bill.bill_id),
        title: bill.title,
        totalAmount: Number(bill.total_amount),
        currency: bill.currency,
      },
      splits: insertedSplits,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getBillSplitsService = async (billId: number, walletId: number) => {
  await assertBillBelongsToWallet(billId, walletId);

  const result = await pool.query(
    `SELECT 
       bs.split_id AS "splitId",
       bs.bill_id AS "billId",
       bs.user_id AS "userId",
       au.full_name AS "fullName",
       au.email,
       bs.split_type AS "splitType",
       bs.percentage,
       bs.fixed_amount AS "fixedAmount",
       bs.amount_due AS "amountDue",
       bs.status
     FROM bill_split bs
     JOIN app_user au ON au.user_id = bs.user_id
     WHERE bs.bill_id = $1
     ORDER BY au.full_name ASC`,
    [billId]
  );

  return result.rows;
};

export const markSplitAsPaidService = async ({
  splitId,
  walletId,
  userId,
  role,
}: {
  splitId: number;
  walletId: number;
  userId: number;
  role: UserRole;
}) => {
  const splitResult = await pool.query(
    `SELECT 
       bs.split_id,
       bs.user_id,
       b.wallet_id
     FROM bill_split bs
     JOIN bill b ON b.bill_id = bs.bill_id
     WHERE bs.split_id = $1`,
    [splitId]
  );

  if (splitResult.rows.length === 0) {
    throw new Error("SPLIT_NOT_FOUND");
  }

  const split = splitResult.rows[0];

  if (Number(split.wallet_id) !== Number(walletId)) {
    throw new Error("NO_PERMISSION");
  }

  if (role !== "PARENT" && Number(split.user_id) !== Number(userId)) {
    throw new Error("NO_PERMISSION");
  }

  const result = await pool.query(
    `UPDATE bill_split
     SET status = 'PAID'
     WHERE split_id = $1
     RETURNING
       split_id AS "splitId",
       bill_id AS "billId",
       user_id AS "userId",
       split_type AS "splitType",
       percentage,
       fixed_amount AS "fixedAmount",
       amount_due AS "amountDue",
       status`,
    [splitId]
  );

  return result.rows[0];
};

export const processBillOcrService = async ({
  file,
  userId,
  walletId,
}: {
  file: Express.Multer.File;
  userId: number;
  walletId: number;
}) => {
  const imageUrl = `/uploads/bills/${file.filename}`;

  const walletResult = await pool.query(
    `SELECT currency
     FROM family_wallet
     WHERE wallet_id = $1`,
    [walletId]
  );

  const walletCurrency = walletResult.rows[0]?.currency || "MAD";

  // للغة العربية فقط استعمل ara
  // لو تريد قراءة أرقام/رموز مثل F-2026 بشكل أفضل استعمل ara+eng
  const ocrLanguages = process.env.OCR_LANGS || "ara+eng";

  const languages = ocrLanguages
    .split("+")
    .map((lang) => lang.trim())
    .filter(Boolean);

  let extractedText = "";

  const worker = await createWorker(languages);

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
    });

    const result = await worker.recognize(file.path);

    extractedText = result.data.text || "";
  } finally {
    await worker.terminate();
  }

  if (!extractedText.trim()) {
    throw new Error("OCR_NO_TEXT_FOUND");
  }

  const extractedTotal = parseTotalAmountFromText(extractedText);
  const extractedCurrency =
    parseCurrencyFromText(extractedText, walletCurrency) || walletCurrency;

  const extractedDate = parseDateFromText(extractedText);
  const extractedTitle = parseTitleFromText(extractedText) || "فاتورة OCR";
  const guessedCategoryId = await guessCategoryIdFromText(extractedText);

  const ocrDraftResult = await pool.query(
    `INSERT INTO bill_ocr_draft (
       wallet_id,
       user_id,
       image_url,
       extracted_text,
       extracted_title,
       extracted_total,
       extracted_currency,
       extracted_bill_date,
       confirmed
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
     RETURNING
       ocr_id AS "ocrId",
       wallet_id AS "walletId",
       user_id AS "userId",
       image_url AS "imageUrl",
       extracted_text AS "extractedText",
       extracted_title AS "extractedTitle",
       extracted_total AS "extractedTotal",
       extracted_currency AS "extractedCurrency",
       extracted_bill_date AS "extractedBillDate",
       confirmed,
       created_at AS "createdAt"`,
    [
      walletId,
      userId,
      imageUrl,
      extractedText,
      extractedTitle,
      extractedTotal,
      extractedCurrency,
      extractedDate,
    ]
  );

  const ocrDraft = ocrDraftResult.rows[0];

  return {
    ocrDraft,
    extractedData: {
      title: extractedTitle,
      totalAmount: extractedTotal,
      currency: extractedCurrency,
      billDate: extractedDate,
      categoryId: guessedCategoryId,
    },
    rawOcrText: extractedText,
    supportedArabCurrencies: ARAB_CURRENCY_CODES,
    review: {
      message:
        "OCR extracted the data but no bill was created yet. Confirm or edit the data first.",
      confirmEndpoint: `/api/bills/ocr/${ocrDraft.ocrId}/confirm`,
      editableFields: [
        "title",
        "totalAmount",
        "currency",
        "categoryId",
        "billDate",
      ],
    },
  };
};

export const confirmOcrBillService = async ({
  ocrId,
  walletId,
  userId,
  title,
  totalAmount,
  currency,
  categoryId,
  billDate,
}: {
  ocrId: number;
  walletId: number;
  userId: number;
  title: string;
  totalAmount: number;
  currency: string;
  categoryId: number | null;
  billDate: string | null;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!title || title.trim().length === 0) {
      throw new Error("INVALID_TITLE");
    }

    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) < 0) {
      throw new Error("INVALID_TOTAL_AMOUNT");
    }

    const walletResult = await client.query(
      `SELECT currency
       FROM family_wallet
       WHERE wallet_id = $1`,
      [walletId]
    );

    const walletCurrency = walletResult.rows[0]?.currency || "MAD";
    const finalCurrency = normalizeCurrencyInput(currency, walletCurrency);

    await assertCategoryExists(categoryId, client);

    const ocrResult = await client.query(
      `SELECT *
       FROM bill_ocr_draft
       WHERE ocr_id = $1
         AND wallet_id = $2
         AND user_id = $3
       LIMIT 1`,
      [ocrId, walletId, userId]
    );

    if (ocrResult.rows.length === 0) {
      throw new Error("OCR_NOT_FOUND");
    }

    const ocrDraft = ocrResult.rows[0];

    if (ocrDraft.confirmed) {
      throw new Error("OCR_ALREADY_CONFIRMED");
    }

    const billResult = await client.query(
      `INSERT INTO bill (
         wallet_id,
         created_by,
         category_id,
         title,
         total_amount,
         currency,
         source,
         image_url,
         status,
         bill_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'OCR', $7, 'PENDING', $8)
       RETURNING
         bill_id AS "billId",
         wallet_id AS "walletId",
         created_by AS "createdBy",
         category_id AS "categoryId",
         title,
         total_amount AS "totalAmount",
         currency,
         source,
         image_url AS "imageUrl",
         status,
         bill_date AS "billDate",
         created_at AS "createdAt"`,
      [
        walletId,
        userId,
        categoryId,
        title.trim(),
        Number(totalAmount),
        finalCurrency,
        ocrDraft.image_url,
        billDate,
      ]
    );

    const bill = billResult.rows[0];

    const updatedOcrResult = await client.query(
      `UPDATE bill_ocr_draft
       SET confirmed = true,
           bill_id = $1
       WHERE ocr_id = $2
       RETURNING
         ocr_id AS "ocrId",
         bill_id AS "billId",
         image_url AS "imageUrl",
         extracted_text AS "extractedText",
         extracted_title AS "extractedTitle",
         extracted_total AS "extractedTotal",
         extracted_currency AS "extractedCurrency",
         extracted_bill_date AS "extractedBillDate",
         confirmed,
         created_at AS "createdAt"`,
      [bill.billId, ocrId]
    );

    await client.query("COMMIT");

    return {
      bill,
      ocr: updatedOcrResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};






type BillItemInput = {
  name: string;
  quantity?: number;
  unitPrice: number;
};

export const createBillService = async ({
  walletId,
  userId,
  title,
  totalAmount,
  currency,
  categoryId,
  billDate,
  items,
}: {
  walletId: number;
  userId: number;
  title: string;
  totalAmount: number;
  currency: string;
  categoryId: number | null;
  billDate: string | null;
  items: BillItemInput[];
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (Number.isNaN(totalAmount) || totalAmount < 0) {
      throw new Error("INVALID_TOTAL_AMOUNT");
    }

    await assertCategoryExists(categoryId, client);

    const finalCurrency = String(currency).trim().toUpperCase();

    const billResult = await client.query(
      `INSERT INTO bill (
         wallet_id,
         created_by,
         category_id,
         title,
         total_amount,
         currency,
         source,
         image_url,
         status,
         bill_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'MANUAL', NULL, 'PENDING', $7)
       RETURNING
         bill_id AS "billId",
         wallet_id AS "walletId",
         created_by AS "createdBy",
         category_id AS "categoryId",
         title,
         total_amount AS "totalAmount",
         currency,
         source,
         image_url AS "imageUrl",
         status,
         bill_date AS "billDate",
         created_at AS "createdAt"`,
      [
        walletId,
        userId,
        categoryId,
        title,
        totalAmount,
        finalCurrency,
        billDate,
      ]
    );

    const bill = billResult.rows[0];

    const insertedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice);

      if (!item.name || quantity <= 0 || unitPrice < 0 || Number.isNaN(unitPrice)) {
        throw new Error("INVALID_ITEMS");
      }

      const totalPrice = Number((quantity * unitPrice).toFixed(2));

      const itemResult = await client.query(
        `INSERT INTO bill_item (
           bill_id,
           name,
           quantity,
           unit_price,
           total_price
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING
           item_id AS "itemId",
           bill_id AS "billId",
           name,
           quantity,
           unit_price AS "unitPrice",
           total_price AS "totalPrice"`,
        [
          bill.billId,
          item.name,
          quantity,
          unitPrice,
          totalPrice,
        ]
      );

      insertedItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    return {
      bill,
      items: insertedItems,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


export const getBillsService = async ({
  walletId,
  categoryId,
  status,
  source,
  fromDate,
  toDate,
  limit,
}: {
  walletId: number;
  categoryId: number | null;
  status: string | null;
  source: string | null;
  fromDate: string | null;
  toDate: string | null;
  limit: number;
}) => {
  const values: any[] = [walletId];
  let paramIndex = 2;

  let whereClause = `WHERE b.wallet_id = $1`;

  if (categoryId) {
    whereClause += ` AND b.category_id = $${paramIndex}`;
    values.push(categoryId);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND b.status = $${paramIndex}`;
    values.push(status);
    paramIndex++;
  }

  if (source) {
    whereClause += ` AND b.source = $${paramIndex}`;
    values.push(source);
    paramIndex++;
  }

  if (fromDate) {
    whereClause += ` AND b.bill_date >= $${paramIndex}`;
    values.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    whereClause += ` AND b.bill_date <= $${paramIndex}`;
    values.push(toDate);
    paramIndex++;
  }

  const safeLimit = Number.isNaN(limit) || limit <= 0 ? 20 : Math.min(limit, 100);

  values.push(safeLimit);

  const result = await pool.query(
    `SELECT
       b.bill_id AS "billId",
       b.wallet_id AS "walletId",
       b.created_by AS "createdBy",
       u.full_name AS "createdByName",
       b.category_id AS "categoryId",
       c.name AS "categoryName",
       c.is_harmful AS "isHarmful",
       b.title,
       b.total_amount AS "totalAmount",
       b.currency,
       b.source,
       b.image_url AS "imageUrl",
       b.status,
       b.bill_date AS "billDate",
       b.created_at AS "createdAt"
     FROM bill b
     LEFT JOIN app_user u ON u.user_id = b.created_by
     LEFT JOIN category c ON c.category_id = b.category_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT $${paramIndex}`,
    values
  );

  return result.rows;
};

export const getBillsSummaryService = async ({
  walletId,
}: {
  walletId: number;
}) => {
  const totalResult = await pool.query(
    `SELECT
       COALESCE(SUM(total_amount), 0) AS "totalExpenses",
       COUNT(*) AS "totalBills"
     FROM bill
     WHERE wallet_id = $1`,
    [walletId]
  );

  const monthlyResult = await pool.query(
    `SELECT
       COALESCE(SUM(total_amount), 0) AS "monthlyExpenses",
       COUNT(*) AS "monthlyBills"
     FROM bill
     WHERE wallet_id = $1
       AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`,
    [walletId]
  );

  const byCategoryResult = await pool.query(
    `SELECT
       c.category_id AS "categoryId",
       c.name AS "categoryName",
       c.is_harmful AS "isHarmful",
       COALESCE(SUM(b.total_amount), 0) AS "totalAmount",
       COUNT(b.bill_id) AS "billCount"
     FROM bill b
     LEFT JOIN category c ON c.category_id = b.category_id
     WHERE b.wallet_id = $1
     GROUP BY c.category_id, c.name, c.is_harmful
     ORDER BY COALESCE(SUM(b.total_amount), 0) DESC`,
    [walletId]
  );

  const recentResult = await pool.query(
    `SELECT
       b.bill_id AS "billId",
       b.title,
       b.total_amount AS "totalAmount",
       b.currency,
       b.source,
       b.status,
       b.bill_date AS "billDate",
       b.created_at AS "createdAt",
       u.full_name AS "createdByName",
       c.name AS "categoryName"
     FROM bill b
     LEFT JOIN app_user u ON u.user_id = b.created_by
     LEFT JOIN category c ON c.category_id = b.category_id
     WHERE b.wallet_id = $1
     ORDER BY b.created_at DESC
     LIMIT 5`,
    [walletId]
  );

  const splitsResult = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN bs.status = 'PAID' THEN bs.amount_due ELSE 0 END), 0) AS "paidAmount",
       COALESCE(SUM(CASE WHEN bs.status = 'UNPAID' THEN bs.amount_due ELSE 0 END), 0) AS "unpaidAmount",
       COUNT(*) FILTER (WHERE bs.status = 'PAID') AS "paidSplits",
       COUNT(*) FILTER (WHERE bs.status = 'UNPAID') AS "unpaidSplits"
     FROM bill_split bs
     JOIN bill b ON b.bill_id = bs.bill_id
     WHERE b.wallet_id = $1`,
    [walletId]
  );

  const total = totalResult.rows[0];
  const monthly = monthlyResult.rows[0];
  const splitStats = splitsResult.rows[0];

  return {
    totalExpenses: Number(total.totalExpenses),
    totalBills: Number(total.totalBills),

    monthlyExpenses: Number(monthly.monthlyExpenses),
    monthlyBills: Number(monthly.monthlyBills),

    paidAmount: Number(splitStats.paidAmount),
    unpaidAmount: Number(splitStats.unpaidAmount),
    paidSplits: Number(splitStats.paidSplits),
    unpaidSplits: Number(splitStats.unpaidSplits),

    // لا يوجد budget table عندنا حاليًا، لذلك نرجعها null
    monthlyBudget: null,
    remainingBudget: null,
    budgetUsedPercentage: null,

    spendingByCategory: byCategoryResult.rows.map((row) => ({
      categoryId: row.categoryId ? Number(row.categoryId) : null,
      categoryName: row.categoryName || "Uncategorized",
      isHarmful: row.isHarmful || false,
      totalAmount: Number(row.totalAmount),
      billCount: Number(row.billCount),
    })),

    recentTransactions: recentResult.rows.map((row) => ({
      billId: Number(row.billId),
      title: row.title,
      totalAmount: Number(row.totalAmount),
      currency: row.currency,
      source: row.source,
      status: row.status,
      billDate: row.billDate,
      createdAt: row.createdAt,
      createdByName: row.createdByName,
      categoryName: row.categoryName || "Uncategorized",
    })),
  };
};