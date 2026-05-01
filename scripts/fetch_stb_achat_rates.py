#!/usr/bin/env python3
import argparse
import json
import os
import re
import sys
from datetime import date
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

STB_URL = "https://www.stb.com.tn/en/stock-exchange/exchange-rate/"


def normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_tags(html: str) -> str:
    no_tags = re.sub(r"<[^>]+>", " ", html, flags=re.IGNORECASE)
    return normalize_spaces(unescape(no_tags))


def parse_french_style_number(raw: str):
    if not raw:
        return None
    cleaned = re.sub(r"[^\d,.\-]", "", raw).replace(",", ".").strip()
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_date_to_iso(raw: str):
    m = re.search(r"(\d{2})/(\d{2})/(\d{2,4})", raw)
    if not m:
        return None
    dd, mm, yy = m.group(1), m.group(2), m.group(3)
    if len(yy) == 2:
        yy = f"20{yy}"
    return f"{yy}-{mm}-{dd}"


def parse_achat_rates(html: str):
    rows = re.findall(r"<tr[\s\S]*?</tr>", html, flags=re.IGNORECASE)
    usd = None
    eur = None
    rate_date = None

    for row in rows:
        row_text = strip_tags(row).upper()
        if "USD" not in row_text and "EUR" not in row_text:
            continue

        cells_html = re.findall(r"<td[\s\S]*?</td>", row, flags=re.IGNORECASE)
        cells = [strip_tags(cell) for cell in cells_html]
        if len(cells) < 5:
            continue

        code_cell = next((c for c in cells if re.search(r"\b(USD|EUR)\b", c, re.IGNORECASE)), "")
        code_upper = code_cell.upper()
        if "USD" in code_upper:
            code = "USD"
        elif "EUR" in code_upper:
            code = "EUR"
        else:
            continue

        purchasing_cost = parse_french_style_number(cells[3] if len(cells) > 3 else "")
        iso_day = parse_date_to_iso(cells[4] if len(cells) > 4 else "")
        if purchasing_cost is None or not iso_day:
            continue

        if code == "USD":
            usd = purchasing_cost
        else:
            eur = purchasing_cost
        rate_date = iso_day

    return usd, eur, rate_date


def http_get_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def call_rpc_capture(
    supabase_url: str,
    service_role_key: str,
    attempt_no: int,
    target_day: str,
    usd,
    eur,
):
    rpc_url = f"{supabase_url.rstrip('/')}/rest/v1/rpc/capture_exchange_rate_attempt"
    payload = json.dumps(
        {
            "p_target_day": target_day,
            "p_attempt_no": attempt_no,
            "p_usd": usd,
            "p_eur": eur,
            "p_source": "STB_ACHAT_PYTHON",
        }
    ).encode("utf-8")

    req = Request(
        rpc_url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
        },
    )
    with urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8", errors="replace"))


def main():
    parser = argparse.ArgumentParser(description="Fetch STB ACHAT rates and save to Supabase.")
    parser.add_argument("--attempt", type=int, default=1, help="Attempt number: 1, 2, or 3")
    args = parser.parse_args()

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_role_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")

    html = http_get_text(STB_URL)
    usd, eur, rate_date = parse_achat_rates(html)
    target_day = rate_date or date.today().isoformat()

    rpc_data = call_rpc_capture(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        attempt_no=args.attempt,
        target_day=target_day,
        usd=usd,
        eur=eur,
    )
    first = rpc_data[0] if isinstance(rpc_data, list) and rpc_data else {}
    print(
        json.dumps(
            {
                "target_day": target_day,
                "usd": usd,
                "eur": eur,
                "attempt_no": args.attempt,
                "status": first.get("status"),
                "message": first.get("message"),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"Network error: {exc}", file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
