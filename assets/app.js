(() => {
  "use strict";

  const data = window.AI_CHAIN_DATA;
  const futuFinancials = window.FUTU_FINANCIALS || { source: "Futu OpenAPI", companies: {} };
  const financialStatusLabel = {
    ok: "已同步",
    "ready-to-sync": "待同步",
    "unsupported-market": "富途不覆盖",
    "symbol-unmapped": "代码未映射",
    "permission-denied": "无数据权限",
    "fetch-error": "同步失败",
  };

  data.companies.forEach((company) => {
    const override = futuFinancials.companies?.[company.id];
    if (!override) return;
    company.futu = override;
    company.financial = {
      period: override.period,
      currency: override.currency,
      revenue: override.revenue,
      grossMargin: override.grossMargin,
      netIncome: override.netIncome,
      aiRevenueShare: override.aiRevenueShare,
      marketCap: override.marketCap,
      marketCapAsOf: override.marketCapAsOf,
      status: override.message,
    };
  });
  const $ = (selector) => document.querySelector(selector);
  const app = $("#app");
  const toolbar = $("#toolbar");
  const searchInput = $("#searchInput");
  const filters = $("#filters");
  const resultCount = $("#resultCount");
  const drawer = $("#drawer");
  const overlay = $("#overlay");
  const pageSize = 24;

  const state = {
    view: "overview",
    query: "",
    domain: "",
    region: "",
    exchange: "",
    selectedNode: "enterprise-ssd",
    companyPage: 1,
  };

  const domainById = new Map(data.domains.map((domain) => [domain.id, domain]));
  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const fmt = (value) => value === null || value === undefined || value === "" ? "未披露" : esc(value);
  const fmtFin = (value, field, currency) => {
    if (value === null || value === undefined || value === "") return "未披露";
    if (field === "grossMargin" || field === "aiRevenueShare") return esc(value) + "%";
    if (field === "revenue" || field === "netIncome" || field === "marketCap") {
      const num = Number(value);
      const sep = Math.abs(num) >= 1000 ? num.toLocaleString("en-US") : (num % 1 === 0 ? String(num) : num.toFixed(1));
      const sym = { USD: "$", CNY: "¥", HKD: "HK$", TWD: "NT$", KRW: "₩", EUR: "€", CHF: "SFr", SEK: "kr", JPY: "¥", GBP: "£" }[currency] || currency;
      return sym + sep + "百万";
    }
    return esc(value);
  };
  const bottleneckLabel = { critical: "关键瓶颈", high: "高壁垒", medium: "一般壁垒" };

  function companyMatchesNode(company, nodeId) {
    return company.nodeIds.includes(nodeId);
  }

  function getUpstream(nodeId) {
    return data.relationships.filter((relation) => relation.to === nodeId)
      .map((relation) => nodeById.get(relation.from)).filter(Boolean);
  }

  function getDownstream(nodeId) {
    return data.relationships.filter((relation) => relation.from === nodeId)
      .map((relation) => nodeById.get(relation.to)).filter(Boolean);
  }

  function setToolbar({ showSearch = true, filterHtml = "", count = "" } = {}) {
    toolbar.hidden = !showSearch && !filterHtml && !count;
    $(".search").hidden = !showSearch;
    filters.innerHTML = filterHtml;
    resultCount.textContent = count;
    searchInput.value = state.query;
  }

  function stat(label, value) {
    return `<div class="stat"><b>${esc(value)}</b><small>${esc(label)}</small></div>`;
  }

  function renderOverview() {
    state.query = "";
    setToolbar({ showSearch: false, count: `更新 ${data.meta.updatedAt}` });
    const domainCards = data.domains.map((domain) => {
      const domainNodes = data.nodes.filter((node) => node.domainId === domain.id);
      const domainCompanies = data.companies.filter((company) =>
        company.nodeIds.some((id) => nodeById.get(id)?.domainId === domain.id));
      return `<article class="domain-card" data-action="domain" data-id="${domain.id}" style="--domain:${domain.color}">
        <span class="num">0${domain.order}</span>
        <h3>${esc(domain.name)}</h3><div class="en">${esc(domain.nameEn)}</div>
        <p>${esc(domain.description)}</p>
        <div class="domain-meta"><span>${domainNodes.length} 节点</span><span>·</span><span>${domainCompanies.length} 上市公司</span></div>
      </article>`;
    }).join("");
    app.innerHTML = `<div class="section-head"><div><h2>九大产业板块</h2>
      <p>板块是研究分类，不是强制的单向层级。点击任一板块进入节点库，也可在“关系探索”中查看真实依赖。</p></div></div>
      <div class="flow-note"><b>产业主流程：</b>材料与设备 → 芯片设计与制造 → 计算 / 存储 / 网络系统 → 电力与冷却设施 → 软件、数据、模型 → 行业应用。跨板块关系以 250 条有向边表达。</div>
      <div class="domain-grid">${domainCards}</div>`;
  }

  function relationButton(node) {
    const domain = domainById.get(node.domainId);
    return `<button class="relation-node" data-action="relation-node" data-id="${node.id}">
      <b>${esc(node.name)}</b><small>${esc(domain?.name || "")} · ${esc(node.type)}</small></button>`;
  }

  function renderRelations() {
    const node = nodeById.get(state.selectedNode) || data.nodes[0];
    state.selectedNode = node.id;
    const upstream = getUpstream(node.id);
    const downstream = getDownstream(node.id);
    const companies = data.companies.filter((company) => companyMatchesNode(company, node.id));
    const options = data.domains.map((domain) => {
      const nodes = data.nodes.filter((item) => item.domainId === domain.id);
      return `<optgroup label="${esc(domain.name)}">${nodes.map((item) =>
        `<option value="${item.id}" ${item.id === node.id ? "selected" : ""}>${esc(item.name)}</option>`).join("")}</optgroup>`;
    }).join("");
    setToolbar({
      showSearch: false,
      filterHtml: `<select id="relationSelect" class="relation-picker" aria-label="选择产业节点">${options}</select>`,
      count: `${upstream.length} 上游 · ${downstream.length} 下游 · ${companies.length} 公司`,
    });
    app.innerHTML = `<div class="section-head"><div><h2>上下游关系探索器</h2>
      <p>左侧是直接投入，中间是当前节点的技术与产出物，右侧是直接下游用途。点击任一关联节点继续追踪。</p></div></div>
      <div class="relation-grid">
        <section class="relation-col"><h3>← 上游投入 (${upstream.length})</h3>${upstream.length ? upstream.map(relationButton).join("") : '<div class="empty">暂无直接上游</div>'}</section>
        <section class="relation-col focus">
          <span class="badge ${node.bottleneck}">${bottleneckLabel[node.bottleneck]}</span>
          <h2 class="focus-title">${esc(node.name)}</h2><div class="focus-en">${esc(node.nameEn)}</div>
          <p>${esc(node.summary)}</p>
          <h3>核心技术</h3><div class="chip-row">${node.technologies.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div>
          <h3>直接产出物</h3><ul class="output-list">${node.outputs.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <button class="relation-node" data-action="open-node" data-id="${node.id}"><b>打开完整节点档案 →</b></button>
          <div class="company-mini">相关上市公司：${companies.slice(0, 8).map((company) => esc(company.name)).join("、") || "未收录"}${companies.length > 8 ? ` 等 ${companies.length} 家` : ""}</div>
        </section>
        <section class="relation-col"><h3>下游用途 → (${downstream.length})</h3>${downstream.length ? downstream.map(relationButton).join("") : '<div class="empty">暂无直接下游</div>'}</section>
      </div>`;
  }

  function nodeCard(node) {
    const domain = domainById.get(node.domainId);
    const companyCount = data.companies.filter((company) => companyMatchesNode(company, node.id)).length;
    return `<article class="node-card" data-action="open-node" data-id="${node.id}" style="--domain:${domain?.color || "#888"}">
      <div class="badges"><span class="badge">${esc(domain?.name)}</span><span class="badge ${node.bottleneck}">${bottleneckLabel[node.bottleneck]}</span></div>
      <h3>${esc(node.name)}</h3><div class="en">${esc(node.nameEn)}</div>
      <p>${esc(node.summary)}</p>
      <div class="domain-meta"><span>${node.outputs.length} 类产出</span><span>·</span><span>${companyCount} 家上市公司</span></div>
    </article>`;
  }

  function renderNodes() {
    const domainOptions = data.domains.map((domain) =>
      `<option value="${domain.id}" ${state.domain === domain.id ? "selected" : ""}>${esc(domain.name)}</option>`).join("");
    const matches = applySearchAndFilters(data.nodes, "nodes");
    setToolbar({
      filterHtml: `<select id="domainFilter"><option value="">全部板块</option>${domainOptions}</select>`,
      count: `匹配 ${matches.length} / ${data.nodes.length} 个节点`,
    });
    app.innerHTML = `<div class="section-head"><div><h2>产业节点库</h2>
      <p>每个节点同时记录技术、产品、产出物、瓶颈、上下游和上市公司；“卡口”已归入瓶颈属性。</p></div></div>
      ${matches.length ? `<div class="card-grid">${matches.map(nodeCard).join("")}</div>` : '<div class="empty">没有匹配的产业节点</div>'}`;
  }

  function companyRow(company) {
    const nodeNames = company.nodeIds.slice(0, 3).map((id) => nodeById.get(id)?.name).filter(Boolean);
    const financial = company.financial;
    return `<tr data-action="open-company" data-id="${company.id}">
      <td><b>${esc(company.name)}</b><div class="muted">${esc(company.nameEn)}</div></td>
      <td><span class="ticker">${esc(company.ticker)}</span><div class="muted">${esc(company.exchange)}</div></td>
      <td>${esc(company.region)}</td><td>${esc(nodeNames.join("、"))}${company.nodeIds.length > 3 ? ` 等 ${company.nodeIds.length} 项` : ""}</td>
      <td>${fmtFin(financial.revenue, "revenue", financial.currency)}</td><td>${fmtFin(financial.grossMargin, "grossMargin", financial.currency)}</td><td>${fmtFin(financial.netIncome, "netIncome", financial.currency)}</td>
      <td>${fmtFin(financial.aiRevenueShare, "aiRevenueShare", financial.currency)}</td><td>${fmtFin(financial.marketCap, "marketCap", financial.currency)}${financial.marketCapAsOf ? `<div class="muted">${esc(financial.marketCapAsOf)}</div>` : ""}</td>
      <td><span class="badge">${esc(financialStatusLabel[company.futu?.status] || "未同步")}</span>
        <div class="muted">${company.futu?.syncedAt ? esc(company.futu.syncedAt.slice(0, 10)) : esc(company.futu?.futuCode || "")}</div></td>
    </tr>`;
  }

  function renderCompanies() {
    const regions = [...new Set(data.companies.map((company) => company.region))].sort();
    const exchanges = [...new Set(data.companies.map((company) => company.exchange))].sort();
    const domainOptions = data.domains.map((domain) =>
      `<option value="${domain.id}" ${state.domain === domain.id ? "selected" : ""}>${esc(domain.name)}</option>`).join("");
    const regionOptions = regions.map((region) =>
      `<option value="${esc(region)}" ${state.region === region ? "selected" : ""}>${esc(region)}</option>`).join("");
    const exchangeOptions = exchanges.map((exchange) =>
      `<option value="${esc(exchange)}" ${state.exchange === exchange ? "selected" : ""}>${esc(exchange)}</option>`).join("");
    const matches = applySearchAndFilters(data.companies, "companies");
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    state.companyPage = Math.min(state.companyPage, pages);
    const start = (state.companyPage - 1) * pageSize;
    const page = matches.slice(start, start + pageSize);
    setToolbar({
      filterHtml: `<select id="domainFilter"><option value="">全部板块</option>${domainOptions}</select>
        <select id="regionFilter"><option value="">全部国家/地区</option>${regionOptions}</select>
        <select id="exchangeFilter"><option value="">全部交易所</option>${exchangeOptions}</select>`,
      count: `匹配 ${matches.length} / ${data.companies.length} 家上市公司`,
    });
    app.innerHTML = `<div class="section-head"><div><h2>全球上市公司库</h2>
      <p>仅收录主营或形成商业收入的直接相关上市公司。财务指标没有可靠披露时明确显示“未披露”，不作推算。</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>公司</th><th>代码 / 交易所</th><th>地区</th><th>产业节点</th><th>营收</th><th>毛利率</th><th>净利润</th><th>AI收入占比</th><th>市值 / 日期</th><th>数据状态</th></tr></thead>
      <tbody>${page.map(companyRow).join("")}</tbody></table></div>
      <div class="pagination"><button data-action="page" data-page="${state.companyPage - 1}" ${state.companyPage <= 1 ? "disabled" : ""}>上一页</button>
      <span>${state.companyPage} / ${pages}</span><button data-action="page" data-page="${state.companyPage + 1}" ${state.companyPage >= pages ? "disabled" : ""}>下一页</button></div>`;
  }

  function applySearchAndFilters(records, kind) {
    const query = state.query.trim().toLowerCase();
    return records.filter((record) => {
      const text = kind === "nodes"
        ? [record.name, record.nameEn, record.summary, record.type, ...record.technologies, ...record.outputs].join(" ")
        : [record.name, record.nameEn, record.ticker, record.exchange, record.region, record.role, record.description, ...record.products].join(" ");
      if (query && !text.toLowerCase().includes(query)) return false;
      if (state.domain) {
        if (kind === "nodes" && record.domainId !== state.domain) return false;
        if (kind === "companies" && !record.nodeIds.some((id) => nodeById.get(id)?.domainId === state.domain)) return false;
      }
      if (kind === "companies" && state.region && record.region !== state.region) return false;
      if (kind === "companies" && state.exchange && record.exchange !== state.exchange) return false;
      return true;
    });
  }

  function openDrawer(html) {
    drawer.innerHTML = `<button class="drawer-close" data-action="close" aria-label="关闭">×</button>${html}`;
    overlay.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function openNode(id) {
    const node = nodeById.get(id);
    if (!node) return;
    const domain = domainById.get(node.domainId);
    const upstream = getUpstream(id);
    const downstream = getDownstream(id);
    const companies = data.companies.filter((company) => companyMatchesNode(company, id));
    openDrawer(`<span class="badge ${node.bottleneck}">${bottleneckLabel[node.bottleneck]}</span>
      <h2>${esc(node.name)}</h2><div class="subtitle">${esc(node.nameEn)} · ${esc(domain?.name)} · ${esc(node.type)}</div>
      <div class="drawer-section"><p>${esc(node.summary)}</p></div>
      <div class="drawer-section"><h3>核心技术</h3><div class="chip-row">${node.technologies.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div></div>
      <div class="drawer-section"><h3>代表产品 / 直接产出物</h3><ul class="output-list">${node.outputs.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>
      <div class="drawer-section"><h3>上下游</h3><div class="kv"><div><small>上游投入</small>${upstream.map((item) => esc(item.name)).join("、") || "暂无"}</div><div><small>下游用途</small>${downstream.map((item) => esc(item.name)).join("、") || "暂无"}</div></div></div>
      <div class="drawer-section"><h3>全球上市公司 (${companies.length})</h3><div class="chip-row">${companies.map((company) => `<button class="relation-node" data-action="open-company" data-id="${company.id}">${esc(company.name)} <small>${esc(company.ticker)} · ${esc(company.exchange)}</small></button>`).join("") || "暂无"}</div></div>
      <div class="drawer-section"><h3>研究说明</h3><p class="muted">${esc(node.source)}</p></div>`);
  }

  function openCompany(id) {
    const company = data.companies.find((item) => item.id === id);
    if (!company) return;
    const financial = company.financial;
    const nodes = company.nodeIds.map((nodeId) => nodeById.get(nodeId)).filter(Boolean);
    openDrawer(`<span class="badge">${esc(company.role)}</span><h2>${esc(company.name)}</h2>
      <div class="subtitle">${esc(company.nameEn)} · ${esc(company.ticker)} · ${esc(company.exchange)}</div>
      <div class="drawer-section"><p>${esc(company.description)}</p></div>
      <div class="drawer-section"><h3>基本情况</h3><div class="kv"><div><small>国家/地区</small>${esc(company.region)}</div><div><small>上市状态</small>已上市</div><div><small>证券代码</small>${esc(company.ticker)}</div><div><small>核验日期</small>${esc(company.verifiedAt)}</div></div></div>
      <div class="drawer-section"><h3>产品与技术</h3><div class="chip-row">${company.products.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div></div>
      <div class="drawer-section"><h3>对应产业节点</h3>${nodes.map((node) => `<button class="relation-node" data-action="relation-node" data-id="${node.id}"><b>${esc(node.name)}</b><small>${esc(domainById.get(node.domainId)?.name)}</small></button>`).join("")}</div>
      <div class="drawer-section"><h3>最新财务快照</h3><div class="kv"><div><small>财年 / 币种</small>${fmt(financial.period)} / ${fmt(financial.currency)}</div><div><small>营收</small>${fmtFin(financial.revenue, "revenue", financial.currency)}</div><div><small>毛利率</small>${fmtFin(financial.grossMargin, "grossMargin", financial.currency)}</div><div><small>净利润</small>${fmtFin(financial.netIncome, "netIncome", financial.currency)}</div><div><small>AI相关收入占比</small>${fmtFin(financial.aiRevenueShare, "aiRevenueShare", financial.currency)}</div><div><small>市值 / 日期</small>${fmtFin(financial.marketCap, "marketCap", financial.currency)} / ${fmt(financial.marketCapAsOf)}</div></div><p class="muted">${esc(financial.status)}</p></div>
      <div class="drawer-section"><h3>财务数据来源</h3><div class="kv"><div><small>数据源</small>Futu OpenAPI</div><div><small>数据状态</small>${esc(financialStatusLabel[company.futu?.status] || "未同步")}</div><div><small>富途代码</small>${fmt(company.futu?.futuCode)}</div><div><small>同步时间</small>${fmt(company.futu?.syncedAt)}</div></div><p class="muted">${esc(company.futu?.message || "暂无富途同步记录")}</p></div>
      <div class="drawer-section"><h3>官方来源</h3><a class="source-link" href="${esc(company.source)}" target="_blank" rel="noopener noreferrer">${esc(company.source)}</a></div>`);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  }

  function renderCurrent() {
    document.querySelectorAll(".nav-btn").forEach((button) =>
      button.classList.toggle("active", button.dataset.view === state.view));
    ({ overview: renderOverview, relations: renderRelations, nodes: renderNodes, companies: renderCompanies }[state.view] || renderOverview)();
    app.focus({ preventScroll: true });
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action], .nav-btn");
    if (!target) return;
    if (target.classList.contains("nav-btn")) {
      state.view = target.dataset.view;
      state.query = ""; state.domain = ""; state.region = ""; state.exchange = ""; state.companyPage = 1;
      renderCurrent();
      return;
    }
    const { action, id } = target.dataset;
    if (action === "domain") { state.view = "nodes"; state.domain = id; renderCurrent(); }
    if (action === "relation-node") { state.selectedNode = id; state.view = "relations"; closeDrawer(); renderCurrent(); }
    if (action === "open-node") openNode(id);
    if (action === "open-company") openCompany(id);
    if (action === "close") closeDrawer();
    if (action === "page") { state.companyPage = Number(target.dataset.page); renderCompanies(); }
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    state.companyPage = 1;
    if (state.view === "nodes") renderNodes();
    if (state.view === "companies") renderCompanies();
  });

  filters.addEventListener("change", (event) => {
    if (event.target.id === "relationSelect") { state.selectedNode = event.target.value; renderRelations(); }
    if (event.target.id === "domainFilter") { state.domain = event.target.value; state.companyPage = 1; renderCurrent(); }
    if (event.target.id === "regionFilter") { state.region = event.target.value; state.companyPage = 1; renderCompanies(); }
    if (event.target.id === "exchangeFilter") { state.exchange = event.target.value; state.companyPage = 1; renderCompanies(); }
  });
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); searchInput.focus();
    }
  });

  $("#heroStats").innerHTML =
    stat("产业板块", data.domains.length) +
    stat("产业节点", data.nodes.length) +
    stat("上下游关系", data.relationships.length) +
    stat("上市公司", data.companies.length);
  renderCurrent();
})();
