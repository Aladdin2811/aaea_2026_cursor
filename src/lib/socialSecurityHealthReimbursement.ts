/** أدوات حساب تعويض المصروفات الصحية (الضمان الاجتماعي) — منطق صافي بدون I/O. */

export function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function parseAmount(v: string | number | null | undefined): number {
  if (v == null) return NaN;
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  const s = String(v).trim().replace(/\s/g, "").replace(",", ".");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function parsePercentageField(
  v: string | number | null | undefined,
): number | null {
  const n = parseAmount(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

export type CurrencyNameRow = {
  id: number;
  social_security_currency_name: string | null;
};

/** تقدير معرّف عملة الدينار التونسي والجنيه المصري من أسماء العملات في الإعدادات. */
export function resolveTndAndEgpCurrencyIds(
  currencies: CurrencyNameRow[],
): { tndId: number | null; egpId: number | null } {
  let tndId: number | null = null;
  let egpId: number | null = null;
  for (const c of currencies) {
    const raw = c.social_security_currency_name ?? "";
    const n = raw.toLowerCase();
    if (
      tndId == null &&
      (n.includes("تونس") || n.includes("tnd") || raw.includes("د.ت"))
    ) {
      tndId = c.id;
    }
    if (
      egpId == null &&
      (n.includes("مصر") || n.includes("egp") || n.includes("جنيه"))
    ) {
      egpId = c.id;
    }
  }
  return { tndId, egpId };
}

/**
 * تحويل سقف مخزّن بعملة معيّنة إلى ما يعادله بالدينار التونسي.
 * يُفترض أن `egpToTndRate` = عدد وحدات الدينار التونسي لكل 1 وحدة من الجنيه المصري.
 */
export function convertLimitToTnd(
  amount: number,
  currencyId: number | null,
  tndId: number | null,
  egpId: number | null,
  egpToTndRate: number | null,
): number {
  if (!Number.isFinite(amount)) return NaN;
  if (currencyId == null || tndId == null) return amount;
  if (currencyId === tndId) return amount;
  if (
    egpId != null &&
    currencyId === egpId &&
    egpToTndRate != null &&
    Number.isFinite(egpToTndRate) &&
    egpToTndRate > 0
  ) {
    return amount * egpToTndRate;
  }
  return amount;
}

export type BandPercentageMatchRow = {
  social_security_band_id: number | null;
  social_security_category_id: number | null;
  social_security_classification_id: number | null;
  band_percentage: string | number | null;
};

export type PickBandPercentageResult = {
  /** النسبة كعدد بين 0 و 100 (مثلاً 70 يعني 70٪) */
  percent: number | null;
  /** يوجد صفوف نسب تتطلب اختيار تصنيف (عضو/مستفيد) */
  needsClassificationChoice: boolean;
  /** أكثر من احتمال بدون معيار كافٍ */
  ambiguous: boolean;
};

export function pickBandPercentageRow(
  rows: BandPercentageMatchRow[],
  bandId: number,
  categoryId: number | null,
  classificationId: number | null,
): PickBandPercentageResult {
  const byBand = rows.filter((r) => r.social_security_band_id === bandId);
  const candidates =
    categoryId == null
      ? byBand
      : byBand.filter((r) => r.social_security_category_id === categoryId);

  if (candidates.length === 0) {
    return { percent: null, needsClassificationChoice: false, ambiguous: false };
  }

  const hasNonNullClass = candidates.some(
    (c) => c.social_security_classification_id != null,
  );
  const hasNullClass = candidates.some(
    (c) => c.social_security_classification_id == null,
  );

  if (classificationId != null) {
    const exact = candidates.filter(
      (c) => c.social_security_classification_id === classificationId,
    );
    if (exact.length === 1) {
      return {
        percent: parsePercentageField(exact[0].band_percentage),
        needsClassificationChoice: hasNonNullClass,
        ambiguous: false,
      };
    }
    if (exact.length > 1) {
      return {
        percent: null,
        needsClassificationChoice: true,
        ambiguous: true,
      };
    }
    if (hasNullClass) {
      const fallback = candidates.find(
        (c) => c.social_security_classification_id == null,
      );
      if (fallback) {
        return {
          percent: parsePercentageField(fallback.band_percentage),
          needsClassificationChoice: hasNonNullClass,
          ambiguous: false,
        };
      }
    }
    return {
      percent: null,
      needsClassificationChoice: hasNonNullClass,
      ambiguous: false,
    };
  }

  if (hasNullClass) {
    const nullRows = candidates.filter(
      (c) => c.social_security_classification_id == null,
    );
    if (nullRows.length === 1) {
      return {
        percent: parsePercentageField(nullRows[0].band_percentage),
        needsClassificationChoice: hasNonNullClass && hasNullClass,
        ambiguous: false,
      };
    }
    if (nullRows.length > 1) {
      return {
        percent: null,
        needsClassificationChoice: hasNonNullClass,
        ambiguous: true,
      };
    }
  }

  if (candidates.length === 1) {
    return {
      percent: parsePercentageField(candidates[0].band_percentage),
      needsClassificationChoice: false,
      ambiguous: false,
    };
  }

  return {
    percent: null,
    needsClassificationChoice: hasNonNullClass,
    ambiguous: true,
  };
}

export type BandLimitMatchRow = {
  social_security_band_id: number | null;
  social_security_category_id: number | null;
  social_security_situation_id: number | null;
  social_security_classification_id: number | null;
  social_security_band_limit: string | number | null;
  social_security_currency_id: number | null;
  social_security_notes: string | null;
};

export function filterApplicableBandLimits(
  limits: BandLimitMatchRow[],
  bandId: number,
  categoryId: number | null,
  situationId: number | null,
  classificationId: number | null,
): BandLimitMatchRow[] {
  return limits.filter((l) => {
    if (l.social_security_band_id !== bandId) return false;
    if (
      categoryId == null &&
      l.social_security_category_id != null
    ) {
      return false;
    }
    if (
      categoryId != null &&
      l.social_security_category_id != null &&
      l.social_security_category_id !== categoryId
    ) {
      return false;
    }
    if (
      situationId != null &&
      l.social_security_situation_id != null &&
      l.social_security_situation_id !== situationId
    ) {
      return false;
    }
    if (
      classificationId != null &&
      l.social_security_classification_id != null &&
      l.social_security_classification_id !== classificationId
    ) {
      return false;
    }
    if (
      classificationId == null &&
      l.social_security_classification_id != null
    ) {
      return false;
    }
    return true;
  });
}

/** أشد سقف (أصغر قيمة بالدينار التونسي) بين الصفوف المطابقة. */
export function minCapTndFromLimits(
  applicable: BandLimitMatchRow[],
  tndId: number | null,
  egpId: number | null,
  egpToTndRate: number | null,
): number | null {
  let best: number | null = null;
  for (const l of applicable) {
    const raw = parseAmount(l.social_security_band_limit);
    if (!Number.isFinite(raw)) continue;
    const tnd = convertLimitToTnd(
      raw,
      l.social_security_currency_id,
      tndId,
      egpId,
      egpToTndRate,
    );
    if (!Number.isFinite(tnd)) continue;
    if (best == null || tnd < best) best = tnd;
  }
  return best;
}

export type LimitFrequencyHint = "none" | "annual" | "biennial";

export function inferLimitFrequencyFromNotes(
  notes: string | null | undefined,
): LimitFrequencyHint {
  if (notes == null || notes.trim() === "") return "none";
  const n = notes.replace(/\s/g, "");
  if (/سنتين|سنتان|2سنة|٢سنة|كلّ?سنتين|كل2سنة/i.test(n)) return "biennial";
  if (/سنة|مرة|مرّة|سنوي|كلّ?سنة|1سنة|١سنة/i.test(n)) return "annual";
  return "none";
}

export function isContractorEmployee(jobNatureName: string | null | undefined) {
  const s = (jobNatureName ?? "").toLowerCase();
  return s.includes("متعاقد") || s.includes("contractor");
}

export type ComputeReimbursementInput = {
  grossAmount: number;
  isNetAmount: boolean;
  bandPercent: number | null;
  capTnd: number | null;
  contractorRepaymentPercent: number | null;
  isContractor: boolean;
};

/** يعيد المبلغ النهائي بالدينار التونسي بعد النسبة والسقف ونسبة المتعاقد إن وُجدت. */
export function computeFinalReimbursementTnd(input: ComputeReimbursementInput): {
  afterPercentTnd: number;
  cappedTnd: number;
  finalTnd: number;
} {
  const cap =
    input.capTnd != null && Number.isFinite(input.capTnd) && input.capTnd >= 0
      ? input.capTnd
      : Number.POSITIVE_INFINITY;

  let afterPercent: number;
  if (input.isNetAmount) {
    afterPercent = input.grossAmount;
  } else if (
    input.bandPercent != null &&
    Number.isFinite(input.bandPercent) &&
    input.bandPercent >= 0
  ) {
    afterPercent = (input.grossAmount * input.bandPercent) / 100;
  } else {
    afterPercent = input.grossAmount;
  }

  const capped = Math.min(afterPercent, cap);

  let final = capped;
  if (input.isContractor) {
    const p = input.contractorRepaymentPercent;
    if (p != null && Number.isFinite(p) && p >= 0) {
      final = (capped * p) / 100;
    }
  }

  return {
    afterPercentTnd: afterPercent,
    cappedTnd: capped,
    finalTnd: final,
  };
}
