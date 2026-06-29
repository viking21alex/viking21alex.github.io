# AI Industry Knowledge Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a browser-ready AI industry knowledge graph covering nine domains, directed upstream/downstream relationships, products, bottlenecks, and globally listed companies.

**Architecture:** Replace the monolithic HTML and duplicated embedded arrays with a static shell, a single browser-readable normalized catalog, focused CSS, and focused application logic. Keep the project dependency-free so it runs through the existing local static server.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in test runner.

---

### Task 1: Catalog contract and validation

**Files:**
- Create: `tests/catalog.test.mjs`
- Create: `data/catalog.js`

- [ ] Write a failing Node test that evaluates `catalog.js` in a VM and asserts nine domains; required storage nodes (`dram`, `nand-flash`, `enterprise-ssd`, `storage-systems`); unique IDs; valid relationships; no private-company IDs; and valid ticker/exchange fields.
- [ ] Run `node tests/catalog.test.mjs` and confirm it fails because `data/catalog.js` does not exist.
- [ ] Create `window.AI_CHAIN_DATA = { meta, domains, nodes, relationships, companies }`, with normalized records and explicit `null` values for undisclosed financial fields.
- [ ] Run the test and confirm all catalog assertions pass.

### Task 2: Page structure and concepts

**Files:**
- Create: `assets/styles.css`
- Replace: `dashboard.html`
- Test: `tests/dashboard-structure.test.mjs`

- [ ] Write a failing structure test asserting navigation for `overview`, `relations`, `nodes`, and `companies`, plus visible definitions for “产业地图”“产业节点”“瓶颈”.
- [ ] Run `node tests/dashboard-structure.test.mjs` and confirm failure against the old page.
- [ ] Replace the HTML with a semantic shell loading `data/catalog.js`, `assets/styles.css`, and `assets/app.js`.
- [ ] Implement responsive tokens, cards, flow bands, relationship columns, drawers, tables, badges, empty states, and a mobile breakpoint at 760px.
- [ ] Run the structure test and confirm it passes.

### Task 3: Views and interactions

**Files:**
- Create: `assets/app.js`
- Test: `tests/app-contract.test.mjs`

- [ ] Write a failing contract test asserting exported browser functions for rendering overview, relationships, nodes, and companies, plus search/filter state.
- [ ] Run `node tests/app-contract.test.mjs` and confirm failure because the app file is absent.
- [ ] Implement overview statistics and nine-domain flow; a selected-node relationship explorer; searchable/filterable node cards and detail drawer; and paginated company table/detail modal.
- [ ] Ensure missing financial data renders as “未披露”, market cap includes an as-of date, and source links use `rel="noopener noreferrer"`.
- [ ] Run all Node tests and confirm they pass.

### Task 4: Documentation and browser acceptance

**Files:**
- Modify: `README.md`
- Modify: `docs/methodology.md`

- [ ] Document the nine-domain taxonomy, strict listed-company inclusion rule, financial-data policy, source priority, and local server command.
- [ ] Run `node tests/catalog.test.mjs && node tests/dashboard-structure.test.mjs && node tests/app-contract.test.mjs`.
- [ ] Open `http://127.0.0.1:4173/dashboard.html`, verify all four views, search for SSD, open an SSD relationship view, filter listed companies, open a company detail, and verify no browser console errors.
- [ ] Verify at a mobile viewport that navigation, relationship columns, and company table remain usable.

## Execution note

The directory is not a Git repository, so worktree and commit steps cannot be performed. The user explicitly authorized inline execution without further review gates.
