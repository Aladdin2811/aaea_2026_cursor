import { createClient } from "@supabase/supabase-js";

const STB_URL = "https://www.stb.com.tn/en/stock-exchange/exchange-rate/";

function normalizeSpaces(s) {
  return s.replace(/\s+/g, " ").trim();
}

function parseFrenchStyleNumber(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(",", ".").replace(/[^\d.\-]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDateToIso(raw) {
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (!m) return null;
  const dd = m[1];
  const mm = m[2];
  let yyyy = m[3];
  if (yyyy.length === 2) {
    yyyy = `20${yyyy}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function stripTags(html) {
  return normalizeSpaces(html.replace(/<[^>]+>/g, " "));
}

function parseAchatRates(html) {
  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
  let usd = null;
  let eur = null;
  let rateDate = null;

  for (const row of rows) {
    const rowText = stripTags(row).toUpperCase();
    if (!rowText.includes("USD") && !rowText.includes("EUR")) continue;

    const cells = [...row.matchAll(/<td[\s\S]*?<\/td>/gi)].map((m) =>
      stripTags(m[0]),
    );
    if (cells.length < 5) continue;

    const codeCell = cells.find((c) => /\b(USD|EUR)\b/i.test(c)) ?? "";
    const code = codeCell.toUpperCase().includes("USD")
      ? "USD"
      : codeCell.toUpperCase().includes("EUR")
        ? "EUR"
        : null;
    if (!code) continue;

    // STB table order: Code | Unit | Selling | Purchasing | Date
    const purchasingCost = parseFrenchStyleNumber(cells[3]);
    const isoDay = parseDateToIso(cells[4] ?? "");
    if (purchasingCost == null || !isoDay) continue;

    if (code === "USD") usd = purchasingCost;
    if (code === "EUR") eur = purchasingCost;
    rateDate = isoDay;
  }

  return { usd, eur, rateDate };
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const argAttempt = process.argv.find((a) => a.startsWith("--attempt="));
  const attemptNo = Number(
    argAttempt?.split("=")[1] ?? process.env.EXCHANGE_ATTEMPT_NO ?? "1",
  );

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const res = await fetch(STB_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch STB page: HTTP ${res.status}`);
  }
  const html = await res.text();
  const { usd, eur, rateDate } = parseAchatRates(html);
  const targetDay = rateDate ?? new Date().toISOString().slice(0, 10);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("capture_exchange_rate_attempt", {
    p_target_day: targetDay,
    p_attempt_no: attemptNo,
    p_usd: usd,
    p_eur: eur,
    p_source: "STB_ACHAT",
  });

  if (error) throw error;

  const first = Array.isArray(data) ? data[0] : null;
  console.log(
    JSON.stringify(
      {
        target_day: targetDay,
        usd,
        eur,
        attempt_no: attemptNo,
        status: first?.status ?? null,
        message: first?.message ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
