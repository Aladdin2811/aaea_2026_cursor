// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function stripTags(html: string): string {
  return normalizeSpaces(html.replace(/<[^>]+>/g, " "));
}

function parseFrenchStyleNumber(raw: string): number | null {
  const cleaned = raw.replace(",", ".").replace(/[^\d.\-]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDateToIso(raw: string): string | null {
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (!m) return null;
  const dd = m[1];
  const mm = m[2];
  const yy = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${yy}-${mm}-${dd}`;
}

function parseStbAchat(html: string): {
  usd: number | null;
  eur: number | null;
  rateDate: string | null;
} {
  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
  let usd: number | null = null;
  let eur: number | null = null;
  let rateDate: string | null = null;

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

    const purchasing = parseFrenchStyleNumber(cells[3] ?? "");
    const isoDay = parseDateToIso(cells[4] ?? "");
    if (purchasing == null || !isoDay) continue;

    if (code === "USD") usd = purchasing;
    if (code === "EUR") eur = purchasing;
    rateDate = isoDay;
  }

  return { usd, eur, rateDate };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const attemptNo = Number(body?.attempt_no ?? 1) || 1;

    const stbUrl = "https://www.stb.com.tn/en/stock-exchange/exchange-rate/";
    const response = await fetch(stbUrl);
    if (!response.ok) {
      throw new Error(`STB HTTP ${response.status}`);
    }
    const html = await response.text();
    const { usd, eur, rateDate } = parseStbAchat(html);
    const targetDay = rateDate ?? new Date().toISOString().slice(0, 10);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await admin.rpc("capture_exchange_rate_attempt", {
      p_target_day: targetDay,
      p_attempt_no: attemptNo,
      p_usd: usd,
      p_eur: eur,
      p_source: "STB_ACHAT_MANUAL",
    });
    if (error) throw error;

    const first = (data as any[] | null)?.[0] ?? {
      status: "unknown",
      message: "تم التنفيذ",
    };

    return new Response(
      JSON.stringify({ status: first.status, message: first.message }),
      { status: 200, headers },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ status: "error", message }), {
      status: 500,
      headers,
    });
  }
});
