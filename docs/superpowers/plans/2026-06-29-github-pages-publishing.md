# GitHub Pages Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the static AI industry-chain site as a public GitHub repository with a working GitHub Pages root URL.

**Architecture:** Keep `dashboard.html` as the application and add a minimal relative redirect at `index.html`. Publish the existing history on the conventional `main` branch, create the empty GitHub repository through the authenticated browser, push through Git, and configure Pages from `main / root`.

**Tech Stack:** Static HTML, Node.js contract tests, Git, GitHub, GitHub Pages.

---

### Task 1: GitHub Pages root entry

**Files:**
- Create: `tests/github-pages.test.mjs`
- Create: `index.html`

- [ ] **Step 1: Write the failing contract test**

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /url=dashboard\.html/);
assert.match(html, /href="dashboard\.html"/);
console.log("github pages entry: ok");
```

- [ ] **Step 2: Run the test and verify the missing entry fails**

Run: `node tests/github-pages.test.mjs`

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Add the minimal relative redirect**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=dashboard.html">
  <title>Alex's AI CHAIN MAP</title>
</head>
<body>
  <p>正在进入 <a href="dashboard.html">Alex's AI CHAIN MAP</a>…</p>
</body>
</html>
```

- [ ] **Step 4: Run the entry test and full test suite**

Run: `node tests/github-pages.test.mjs`

Expected: `github pages entry: ok`

Run: `Get-ChildItem tests -Filter *.mjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }`

Expected: all test files exit successfully.

- [ ] **Step 5: Commit the entry**

```powershell
git add -- index.html tests/github-pages.test.mjs
git commit -m "feat: add GitHub Pages entry"
```

### Task 2: Publish repository

**Files:**
- Modify Git branch metadata and remote configuration only.

- [ ] **Step 1: Rename the local branch**

Run: `git branch -M main`

Expected: `git branch --show-current` prints `main`.

- [ ] **Step 2: Create the empty public repository**

In the authenticated GitHub creation form, set repository name to `alex-ai-chain-map`, keep visibility `Public`, leave README, `.gitignore`, and license disabled, then create the repository.

Expected repository URL: `https://github.com/viking21alex/alex-ai-chain-map`

- [ ] **Step 3: Add the remote and push**

```powershell
git remote add origin https://github.com/viking21alex/alex-ai-chain-map.git
git push -u origin main
```

Expected: local `main` tracks `origin/main`.

### Task 3: Enable and verify GitHub Pages

**Files:**
- Modify GitHub repository settings only.

- [ ] **Step 1: Configure Pages deployment**

Open repository Settings → Pages. Under “Build and deployment”, choose “Deploy from a branch”, select `main` and `/(root)`, then save.

Expected: GitHub reports the Pages source as `main / root`.

- [ ] **Step 2: Verify publication**

Open `https://github.com/viking21alex/alex-ai-chain-map` and confirm the repository is public and contains `index.html`.

Open `https://viking21alex.github.io/alex-ai-chain-map/` and confirm it redirects to `dashboard.html` once deployment is ready.

- [ ] **Step 3: Verify local repository state**

```powershell
git status -sb
git remote -v
git log --oneline -3
```

Expected: clean `main` tracking `origin/main` with the Pages entry commit present.
