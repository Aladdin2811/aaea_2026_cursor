import { supabase } from "../lib/supabase";

export type AccountTypeEmbed = {
  id: number;
  account_type_name: string | null;
};

export type GeneralAccountEmbed = {
  id: number;
  general_account_name: string | null;
  general_account_code: string | null;
};

export type BabEmbed = {
  id: number;
  bab_name: string | null;
  bab_code: string | null;
};

export type BandRow = {
  id: number;
  band_name: string | null;
  band_code: string | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  description: string | null;
  havebudget: boolean | null;
  haveprograms: boolean | null;
  directexchange: boolean | null;
  salariesdirectpaid: boolean | null;
  band_journal_show: boolean | null;
  status: boolean | null;
  /** ترتيب العرض */
  sort: number | null;
  /** طبيعة الحساب */
  nature_of_account: number | null;
};

export type BandWithRelations = BandRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
};
export type CreateBandInput = Partial<Omit<BandRow, "id">> & {
  id?: number;
};
export type UpdateBandInput = Partial<Omit<BandRow, "id">>;

const selectBandEmbed = `
  id, 
  band_name, 
  band_code, 
  account_type_id, 
  general_account_id, 
  bab_id, 
  description, 
  havebudget, 
  haveprograms, 
  directexchange, 
  salariesdirectpaid, 
  band_journal_show, 
  status,
  sort,
  nature_of_account,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code )
`;

function parseNumericId(
  value: number | string,
  fieldLabel = "المعرّف",
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

/**
 * جلب البنود المرتبطة بـ `bab_id`
 */
export async function getAll(
  babId: number | string,
): Promise<BandWithRelations[]> {
  const id = parseNumericId(babId, "الباب");

  const { data, error } = await supabase
    .from("band")
    .select(selectBandEmbed)
    .eq("bab_id", id)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات البنود");
  }
  return (data as unknown as BandWithRelations[] | null) ?? [];
}

export async function getForSelect(
  babId: number | string,
): Promise<BandWithRelations[]> {
  const id = parseNumericId(babId, "الباب");

  const { data, error } = await supabase
    .from("band")
    .select(selectBandEmbed)
    .eq("bab_id", id)
    .eq("status", true)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات البنود");
  }
  return (data as unknown as BandWithRelations[] | null) ?? [];
}

export async function getById(id: number | string): Promise<BandWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from("band")
    .select(selectBandEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات البند");
  }
  return data as unknown as BandWithRelations;
}

export async function createBand(input: CreateBandInput): Promise<BandWithRelations> {
  const payload = { ...input };
  delete payload.id;
  const { data, error } = await supabase
    .from("band")
    .insert(payload)
    .select(selectBandEmbed)
    .single();
  if (error) {
    console.error(error);
    throw new Error("لا يمكن إضافة البند");
  }
  return data as unknown as BandWithRelations;
}

export async function updateBand(
  id: number | string,
  patch: UpdateBandInput,
): Promise<BandWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");
  const { data, error } = await supabase
    .from("band")
    .update(patch)
    .eq("id", rowId)
    .select(selectBandEmbed)
    .single();
  if (error) {
    console.error(error);
    throw new Error("لا يمكن تعديل البند");
  }
  return data as unknown as BandWithRelations;
}

export async function deleteBand(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم البند");
  const { data, error } = await supabase.from("band").delete().eq("id", rowId);
  if (error) {
    console.error(error);
    throw new Error("لا يمكن حذف البند");
  }
  return data;
}

export type JournalFilter = { field: string; value: unknown };

/**
 * تستخدم في لوحة المؤشرات: إجمالي إيرادات البند
 */
export async function getBandRevenues(filterArray: JournalFilter[]): Promise<{
  band_id: number;
  band_name: string | null;
  total_revenues: number;
}> {
  const rawId = filterArray.find((f) => f.field === "band_id")?.value;
  if (rawId == null) {
    throw new Error("فلتر band_id مطلوب");
  }
  const bandId = parseNumericId(rawId as number | string, "البند");

  const { data: bandData, error: bandError } = await supabase
    .from("band")
    .select("id, band_name")
    .eq("id", bandId)
    .single();

  if (bandError) {
    console.error(bandError);
    throw new Error("لا يمكن الحصول على بيانات البند");
  }
  if (!bandData) {
    throw new Error("البند غير موجود");
  }

  let query = supabase.from("journal_details").select(
    `
    band_id,
    year_id,
    journal_main_id,
    band_name:band(band_name),
    closing_entry:journal_main(closing_entry),
    dollars_debit,
    dollars_credit
  `,
  );

  for (const f of filterArray) {
    query = query.eq(f.field, f.value as string | number | boolean);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الإيرادات");
  }

  const list =
    (data as unknown as Array<{
      dollars_credit: number | null;
      dollars_debit: number | null;
      closing_entry: { closing_entry?: boolean } | null;
    }> | null) ?? [];

  const filteredData = list.filter(
    (row) => !row.closing_entry || row.closing_entry.closing_entry !== true,
  );

  const totalRevenues = filteredData.reduce(
    (acc, row) => acc + (row.dollars_credit || 0) - (row.dollars_debit || 0),
    0,
  );

  return {
    band_id: bandData.id,
    band_name: bandData.band_name,
    total_revenues: totalRevenues,
  };
}

type ProjectsContributionRow = {
  band_id: number;
  year_id: number | null;
  band_name: string | null;
  projectsContributions: number;
};

/**
 * تستخدم في لوحة المؤشرات: مساهمات المشروعات حسب السنة
 */
export async function getBandProjectsContributions(
  filterArray: JournalFilter[],
): Promise<ProjectsContributionRow[]> {
  const rawId = filterArray.find((f) => f.field === "band_id")?.value;
  if (rawId == null) {
    throw new Error("فلتر band_id مطلوب");
  }
  const bandId = parseNumericId(rawId as number | string, "البند");

  const { data: bandData, error: bandError } = await supabase
    .from("band")
    .select("id, band_name")
    .eq("id", bandId)
    .single();

  if (bandError) {
    console.error(bandError);
    throw new Error("لا يمكن الحصول على بيانات البند");
  }
  if (!bandData) {
    throw new Error("البند غير موجود");
  }

  let query = supabase.from("journal_details").select(
    `
    band_id,
    year_id,
    journal_main_id,
    closing_entry:journal_main(closing_entry),
    dollars_debit,
    dollars_credit
  `,
  );

  for (const f of filterArray) {
    query = query.eq(f.field, f.value as string | number | boolean);
  }
  query = query.eq("band_id", bandId);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المساهمات في مشروعات");
  }

  const list =
    (data as unknown as Array<{
      band_id: number;
      year_id: number | null;
      dollars_credit: number | null;
      dollars_debit: number | null;
      closing_entry: { closing_entry?: boolean } | null;
    }> | null) ?? [];

  const filteredData = list.filter(
    (row) => !row.closing_entry || row.closing_entry.closing_entry !== true,
  );

  if (filteredData.length === 0) {
    const yearRaw = filterArray.find((f) => f.field === "year_id")?.value;
    return [
      {
        band_id: bandData.id,
        band_name: bandData.band_name,
        year_id: yearRaw == null ? null : (yearRaw as number),
        projectsContributions: 0,
      },
    ];
  }

  const grouped = filteredData.reduce<Record<string, ProjectsContributionRow>>(
    (acc, row) => {
      const key = String(row.year_id ?? "null");
      if (!acc[key]) {
        acc[key] = {
          band_id: row.band_id,
          year_id: row.year_id,
          band_name: bandData.band_name,
          projectsContributions: 0,
        };
      }
      acc[key].projectsContributions +=
        (row.dollars_credit || 0) - (row.dollars_debit || 0);
      return acc;
    },
    {},
  );

  return Object.values(grouped);
}
