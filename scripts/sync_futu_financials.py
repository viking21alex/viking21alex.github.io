#!/usr/bin/env python3
"""Generate Futu-only financial overrides for Alex's AI CHAIN MAP."""

import argparse
import json
import math
import os
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAPPING_PATH = ROOT / "data" / "futu-symbols.json"
OUTPUT_PATH = ROOT / "data" / "financials.js"


def empty_record(entry, status, message):
    return {
        "source": "Futu OpenAPI",
        "status": status,
        "futuCode": entry.get("futuCode"),
        "period": None,
        "currency": None,
        "revenue": None,
        "grossMargin": None,
        "netIncome": None,
        "aiRevenueShare": None,
        "marketCap": None,
        "marketCapAsOf": None,
        "syncedAt": None,
        "message": message,
    }


def write_bundle(companies):
    payload = {
        "source": "Futu OpenAPI",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "companies": companies,
    }
    content = "window.FUTU_FINANCIALS = " + json.dumps(
        payload, ensure_ascii=False, indent=2
    ) + ";\n"
    temporary = OUTPUT_PATH.with_suffix(".js.tmp")
    temporary.write_text(content, encoding="utf-8")
    os.replace(str(temporary), str(OUTPUT_PATH))


def dry_run(mapping):
    records = {}
    for company_id, entry in mapping["companies"].items():
        if entry["status"] == "unsupported-market":
            records[company_id] = empty_record(
                entry, "unsupported-market", "富途不覆盖该交易所"
            )
        elif entry.get("futuCode"):
            records[company_id] = empty_record(
                entry, "ready-to-sync", "等待连接 Futu OpenD 同步"
            )
        else:
            records[company_id] = empty_record(
                entry, "symbol-unmapped", "缺少富途证券代码映射"
            )
    return records


def safe_number(value):
    try:
        number = float(value)
        return None if math.isnan(number) or math.isinf(number) else number
    except (TypeError, ValueError):
        return None


def parse_report(response):
    if not isinstance(response, dict):
        return {}
    structures = response.get("structure_list") or response.get("structureList") or []
    reports = response.get("report_list") or response.get("reportList") or []
    if not reports:
        return {}
    names = {
        str(item.get("field_id", item.get("fieldId"))): item.get(
            "display_name", item.get("displayName", "")
        )
        for item in structures
    }
    report = sorted(
        reports,
        key=lambda item: item.get("date_time", item.get("dateTime", 0)),
        reverse=True,
    )[0]
    values = {}
    for item in report.get("item_list", report.get("itemList", [])):
        key = str(item.get("field_id", item.get("fieldId")))
        values[names.get(key, key)] = safe_number(item.get("data"))
    return {
        "period": report.get("period_text", report.get("periodText")),
        "currency": report.get("currency_code", report.get("currencyCode")),
        "date": report.get("date_time_str", report.get("dateTimeStr")),
        "values": values,
    }


def find_value(values, candidates):
    lowered = {str(key).lower(): value for key, value in values.items()}
    for candidate in candidates:
        if candidate.lower() in lowered:
            return lowered[candidate.lower()]
    for key, value in lowered.items():
        if any(candidate.lower() in key for candidate in candidates):
            return value
    return None


def format_amount(value, currency):
    if value is None:
        return None
    units = [(1e12, "万亿"), (1e9, "十亿"), (1e8, "亿"), (1e6, "百万")]
    for divisor, label in units:
        if abs(value) >= divisor:
            return f"{value / divisor:.2f}{label} {currency or ''}".strip()
    return f"{value:,.0f} {currency or ''}".strip()


def live_sync(mapping, host, port, request_delay):
    try:
        from futu import (
            F10Type,
            FinancialStatementsType,
            OpenQuoteContext,
            RET_OK,
        )
    except ImportError as error:
        raise RuntimeError(
            "缺少富途 Python SDK，请先运行: python -m pip install futu-api"
        ) from error

    quote = OpenQuoteContext(host=host, port=port)
    try:
        ret, _ = quote.get_global_state()
        if ret != RET_OK:
            raise RuntimeError("无法连接已登录的 Futu OpenD")
        records = {}
        for company_id, entry in mapping["companies"].items():
            if entry["status"] == "unsupported-market":
                records[company_id] = empty_record(
                    entry, "unsupported-market", "富途不覆盖该交易所"
                )
                continue
            code = entry.get("futuCode")
            if not code:
                records[company_id] = empty_record(
                    entry, "symbol-unmapped", "缺少富途证券代码映射"
                )
                continue
            try:
                ret, income_raw = quote.get_financials_statements(
                    code,
                    statement_type=FinancialStatementsType.INCOME,
                    financial_type=F10Type.ANNUAL,
                    num=1,
                )
                if ret != RET_OK:
                    raise PermissionError(str(income_raw))
                ret, indicator_raw = quote.get_financials_statements(
                    code,
                    statement_type=FinancialStatementsType.MAIN_INDEX,
                    financial_type=F10Type.ANNUAL,
                    num=1,
                )
                if ret != RET_OK:
                    indicator_raw = {}
                income = parse_report(income_raw)
                indicators = parse_report(indicator_raw)
                values = income.get("values", {})
                indicator_values = indicators.get("values", {})
                revenue = find_value(values, [
                    "营业总收入", "营业收入", "营业额", "Total Revenue", "Revenue"
                ])
                gross_profit = find_value(values, ["毛利", "Gross Profit"])
                net_income = find_value(values, [
                    "净利润", "归母净利润", "Net Income", "Net Profit"
                ])
                gross_margin = find_value(indicator_values, [
                    "毛利率", "Gross Margin", "Gross Profit Margin"
                ])
                if gross_margin is None and revenue and gross_profit is not None:
                    gross_margin = gross_profit / revenue * 100
                ret, snapshot = quote.get_market_snapshot([code])
                market_cap = None
                market_cap_as_of = None
                if ret == RET_OK and hasattr(snapshot, "empty") and not snapshot.empty:
                    row = snapshot.iloc[0]
                    market_cap = safe_number(
                        row.get("total_market_val", row.get("market_val"))
                    )
                    market_cap_as_of = str(
                        row.get("update_time", datetime.now().date().isoformat())
                    )
                currency = income.get("currency") or indicators.get("currency")
                records[company_id] = {
                    **empty_record(entry, "ok", "同步成功"),
                    "period": income.get("period") or indicators.get("period"),
                    "currency": currency,
                    "revenue": format_amount(revenue, currency),
                    "grossMargin": (
                        f"{gross_margin:.2f}%" if gross_margin is not None else None
                    ),
                    "netIncome": format_amount(net_income, currency),
                    "marketCap": format_amount(market_cap, currency),
                    "marketCapAsOf": market_cap_as_of,
                    "syncedAt": datetime.now(timezone.utc).isoformat(),
                }
            except PermissionError as error:
                records[company_id] = empty_record(
                    entry, "permission-denied", str(error)[:240]
                )
            except Exception as error:
                records[company_id] = empty_record(
                    entry, "fetch-error", str(error)[:240]
                )
            finally:
                if request_delay > 0:
                    time.sleep(request_delay)
        return records
    finally:
        quote.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=11111)
    parser.add_argument(
        "--request-delay",
        type=float,
        default=3.1,
        help="每家公司同步后的等待秒数；默认 3.1 秒以规避富途接口频率限制",
    )
    args = parser.parse_args()
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    records = (
        dry_run(mapping)
        if args.dry_run
        else live_sync(mapping, args.host, args.port, args.request_delay)
    )
    write_bundle(records)
    counts = {}
    for record in records.values():
        counts[record["status"]] = counts.get(record["status"], 0) + 1
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
