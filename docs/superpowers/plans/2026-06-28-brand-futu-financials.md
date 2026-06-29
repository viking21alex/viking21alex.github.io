# Alex's AI CHAIN MAP and Futu Financials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved brand and add a Futu-only financial synchronization pipeline with explicit unsupported-market states.

**Architecture:** Keep company master data in `catalog.js`; generate a separate company-to-Futu mapping and financial override bundle. A Python sync command reads the mapping, queries local Futu OpenD when available, and atomically writes browser-readable financial overrides.

**Tech Stack:** HTML, vanilla JavaScript, Node.js tests, Python 3.8+, Futu OpenAPI SDK.

---

### Task 1: Brand contract

**Files:**
- Create: `tests/brand.test.mjs`
- Modify: `dashboard.html`
- Modify: `data/catalog.js`

- [ ] Write a failing test asserting the browser title, visible header brand and catalog title equal `Alex's AI CHAIN MAP`.
- [ ] Run `node tests/brand.test.mjs` and confirm failure against the old title.
- [ ] Update the three brand surfaces while keeping the Chinese subtitle.
- [ ] Run the test and confirm it passes.

### Task 2: Futu market mapping

**Files:**
- Create: `tests/futu-mapping.test.mjs`
- Create: `scripts/build-futu-symbols.mjs`
- Create: `data/futu-symbols.json`

- [ ] Write a failing test that requires every catalog company to have either a valid Futu code or `unsupported-market`.
- [ ] Run the test and confirm the mapping file is missing.
- [ ] Implement deterministic mapping for NASDAQ/NYSE, HKEX, SSE, SZSE and TSE; classify all other exchanges as unsupported.
- [ ] Generate `data/futu-symbols.json` and run the test to confirm full company coverage.

### Task 3: Financial synchronization

**Files:**
- Create: `tests/futu-sync.test.mjs`
- Create: `scripts/sync_futu_financials.py`
- Create: `data/financials.js`

- [ ] Write a failing test asserting all companies have a Futu financial status and the browser bundle exposes `window.FUTU_FINANCIALS`.
- [ ] Run the test and confirm the financial bundle is missing.
- [ ] Implement `--dry-run` to generate supported/unmapped/unsupported records without importing the Futu SDK.
- [ ] Implement live mode using `OpenQuoteContext`, annual income statements, main indicators and market snapshots; write through a temporary file and atomic replace.
- [ ] Run dry-run and the test to confirm valid output without OpenD.

### Task 4: Browser merge and status UI

**Files:**
- Modify: `dashboard.html`
- Modify: `assets/app.js`
- Modify: `tests/app-contract.test.mjs`
- Modify: `README.md`

- [ ] Add failing assertions for loading `financials.js`, merging overrides, displaying source/status and retaining “未披露”.
- [ ] Run the app contract test and confirm failure.
- [ ] Load and merge financial overrides before first render; add company-table status and detail-source fields.
- [ ] Document Futu OpenD setup, SDK installation, dry-run and live sync commands.
- [ ] Run all tests and verify the page in the browser.

## Execution note

The target directory is not a Git repository, so worktree and commit steps are unavailable. The user approved inline implementation.
