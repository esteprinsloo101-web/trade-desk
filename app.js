/* Trade Desk — static SA trade job pipeline demo
   Mokoena Plumbing · Bloemfontein · localStorage · ZAR
   Not legal or tax advice */

(function () {
  "use strict";

  const STORAGE_KEY = "trade-desk-v4";

  /* PLATFORM_BAR_2026_09_11 */
  const SCIENCE_TIPS = [
  {
    "h": "Deposit-before-parts",
    "body": "This week: no parts buy until deposit logged. Count cancelled vs completed jobs.",
    "method": "Method: rule experiment \u00b7 Limit: emergency call-outs differ"
  },
  {
    "h": "Quote speed",
    "body": "Time from lead to sent quote for 5 jobs. Cut one delay step.",
    "method": "Method: stopwatch sample \u00b7 Limit: complex jobs skew"
  },
  {
    "h": "Reorder point check",
    "body": "Raise reorder on your top 2 stockouts by +2 units for a fortnight.",
    "method": "Method: buffer tweak \u00b7 Limit: cash tied in stock"
  }
];
  const PURPOSE_MODULE_PRESETS = {
  "trade": {
    "jobs": true,
    "money": true,
    "quotes": true,
    "customers": true,
    "stock": true,
    "contacts": true,
    "science": true
  },
  "household": {
    "jobs": false,
    "money": true,
    "quotes": false,
    "customers": false,
    "stock": false,
    "contacts": true,
    "science": true
  },
  "farm": {
    "jobs": true,
    "money": true,
    "quotes": true,
    "customers": true,
    "stock": true,
    "contacts": true,
    "science": true
  },
  "rentals": {
    "jobs": true,
    "money": true,
    "quotes": true,
    "customers": true,
    "stock": false,
    "contacts": true,
    "science": true
  },
  "stokvel": {
    "jobs": false,
    "money": true,
    "quotes": false,
    "customers": false,
    "stock": false,
    "contacts": true,
    "science": true
  },
  "flood": {
    "jobs": false,
    "money": false,
    "quotes": false,
    "customers": false,
    "stock": false,
    "contacts": true,
    "science": true
  },
  "decisions": {
    "jobs": true,
    "money": true,
    "quotes": true,
    "customers": true,
    "stock": false,
    "contacts": false,
    "science": true
  }
};

  const TZ = "Africa/Johannesburg";

  const STAGES = ["Lead", "Quoted", "Deposit", "Doing", "Done", "Paid"];

  const PROCESS_TYPES = {
    new_quote: {
      label: "New quote",
      icon: "📝",
      defaultCadenceDays: 0,
      leadDays: 3,
      disclaimer: "Not a binding quote. Confirm price yourself before sending.",
      steps: [
        { key: "scope", title: "Confirm scope", body: "Check customer request, site access and materials needed.", checks: ["Scope clear enough to price"] },
        { key: "price", title: "Set price (ZAR)", body: "Enter your labour + parts estimate. App does not invent pricing.", input: "amount" },
        { key: "send", title: "Send quote", body: "Open WhatsApp / email link and send yourself. Mark when sent.", checks: ["Quote sent to customer"] },
      ],
    },
    deposit_chase: {
      label: "Deposit chase",
      icon: "💸",
      defaultCadenceDays: 3,
      leadDays: 2,
      disclaimer: "You Approve the chase tone. App does not auto-message without you.",
      steps: [
        { key: "review", title: "Review deposit due", body: "Confirm deposit amount and days outstanding." },
        { key: "chase", title: "Send chase", body: "Open payment / WhatsApp link. Keep tone polite.", checks: ["Chase sent"] },
        { key: "confirm", title: "Log outcome", body: "Mark if paid or still waiting.", checks: ["Logged for follow-up"] },
      ],
    },
    job_day: {
      label: "Job day run",
      icon: "🔧",
      defaultCadenceDays: 0,
      leadDays: 1,
      disclaimer: "Photo notes are ops evidence stubs — not insurance claims.",
      steps: [
        { key: "before", title: "Before photos", body: "Capture before state (demo: tick slots).", checks: ["Before — overview", "Before — fault detail"] },
        { key: "work", title: "Do the work", body: "Complete the job. Note parts used.", input: "note" },
        { key: "after", title: "After photos", body: "Capture after state.", checks: ["After — overview", "After — close-up"] },
        { key: "confirm", title: "Mark job done", body: "Ready for invoice step.", checks: ["Customer signed off / work complete"] },
      ],
    },
    invoice: {
      label: "Invoice",
      icon: "🧾",
      defaultCadenceDays: 0,
      leadDays: 2,
      disclaimer: "Not tax advice. Confirm VAT fields if you are a vendor.",
      steps: [
        { key: "review", title: "Review totals", body: "Confirm labour, parts and deposit already paid." },
        { key: "send", title: "Send invoice", body: "Open bank / PayFast / WhatsApp payment note and send yourself.", checks: ["Invoice sent"] },
        { key: "confirm", title: "Confirm issued", body: "Mark invoice as issued in the pipeline.", checks: ["Invoice logged"] },
      ],
    },
    stock_reorder: {
      label: "Stock reorder",
      icon: "📦",
      defaultCadenceDays: 14,
      leadDays: 5,
      disclaimer: "Supplier pricing is your responsibility.",
      steps: [
        { key: "check", title: "Check lows", body: "Review parts below reorder point." },
        { key: "order", title: "Place order", body: "Open supplier link / WhatsApp and order.", checks: ["Order placed"] },
        { key: "confirm", title: "Log expected", body: "Confirm expected delivery logged.", checks: ["Reorder logged"] },
      ],
    },
    custom: {
      label: "Custom process",
      icon: "◎",
      defaultCadenceDays: 30,
      leadDays: 5,
      disclaimer: "Demo process — adapt to your trade.",
      steps: [
        { key: "do", title: "Do the work", body: "Follow your own steps." },
        { key: "confirm", title: "Confirm done", body: "Mark complete.", checks: ["Work completed"] },
      ],
    },
  };

  const DEFAULT_MODULES = {
    jobs: true,
    money: true,
    quotes: true,
    customers: true,
    stock: true,
    contacts: true,
    science: true,
  };

  function seed() {
    const today = startOfDay(new Date());
    return {
      modules: { ...DEFAULT_MODULES },
      profile: { onboarded: false, city: "", purpose: "", updatedAt: null },
      business: { name: "Mokoena Plumbing", city: "Bloemfontein", owner: "Thabo Mokoena" },
      customers: [
        { id: "c1", name: "Prinsloo Household", phone: "082 111 2200", suburb: "Universitas", jobs: 4 },
        { id: "c2", name: "Westdene Flat 12", phone: "083 444 5511", suburb: "Westdene", jobs: 2 },
        { id: "c3", name: "Langenhoven Park Body Corp", phone: "051 000 1122", suburb: "Langenhoven Park", jobs: 6 },
        { id: "c4", name: "New lead — Du Plessis", phone: "072 888 9900", suburb: "Fichardt Park", jobs: 0 },
      ],
      jobs: [
        { id: "j1", title: "Geyser drip — Prinsloo", customerId: "c1", stage: "Doing", amount: 2850, deposit: 800, depositPaid: true, dueAt: isoDate(today), trade: "Plumbing" },
        { id: "j2", title: "DB board trip — Flat 12", customerId: "c2", stage: "Quoted", amount: 1650, deposit: 500, depositPaid: false, dueAt: isoDate(addDays(today, 1)), trade: "Electrical" },
        { id: "j3", title: "Toilet cistern — Body Corp", customerId: "c3", stage: "Deposit", amount: 980, deposit: 300, depositPaid: false, dueAt: isoDate(addDays(today, -1)), trade: "Plumbing" },
        { id: "j4", title: "Kitchen tap replace", customerId: "c1", stage: "Done", amount: 720, deposit: 0, depositPaid: true, dueAt: isoDate(addDays(today, -2)), trade: "Plumbing" },
        { id: "j5", title: "Outside light — Du Plessis", customerId: "c4", stage: "Lead", amount: 0, deposit: 0, depositPaid: false, dueAt: isoDate(addDays(today, 2)), trade: "Electrical" },
        { id: "j6", title: "Blocked drain — Westdene", customerId: "c2", stage: "Paid", amount: 1450, deposit: 400, depositPaid: true, dueAt: isoDate(addDays(today, -9)), trade: "Plumbing" },
      ],
      quotes: [
        { id: "q1", jobId: "j2", title: "DB board trip quote", amount: 1650, status: "sent", sentAt: isoDate(addDays(today, -1)) },
        { id: "q2", jobId: "j5", title: "Outside light estimate", amount: 890, status: "draft", sentAt: null },
        { id: "q3", jobId: "j1", title: "Geyser drip quote", amount: 2850, status: "accepted", sentAt: isoDate(addDays(today, -5)) },
      ],
      invoices: [
        { id: "i1", jobId: "j4", title: "Kitchen tap — INV-104", amount: 720, status: "unpaid", dueAt: isoDate(addDays(today, 5)) },
        { id: "i2", jobId: "j6", title: "Blocked drain — INV-101", amount: 1450, status: "paid", dueAt: isoDate(addDays(today, -7)) },
      ],
      cashLog: [
        { id: "k1", at: isoDate(today), label: "Deposit — Body Corp cistern", amount: 0, note: "awaiting" },
        { id: "k2", at: isoDate(addDays(today, -1)), label: "Cash — emergency tap washer", amount: 350, note: "cash" },
        { id: "k3", at: isoDate(addDays(today, -2)), label: "EFT — blocked drain INV-101", amount: 1450, note: "eft" },
        { id: "k4", at: isoDate(addDays(today, -3)), label: "Parts — Builders Warehouse", amount: -620, note: "out" },
      ],
      stock: [
        { id: "s1", name: "½\" ball valve", qty: 2, reorderAt: 4, unit: "ea", supplier: "Builders" },
        { id: "s2", name: "20mm Flexi hose", qty: 6, reorderAt: 4, unit: "ea", supplier: "Builders" },
        { id: "s3", name: "Geyser T&P valve", qty: 1, reorderAt: 2, unit: "ea", supplier: "Plumblink" },
        { id: "s4", name: "PVC cement 250ml", qty: 3, reorderAt: 2, unit: "tin", supplier: "Builders" },
        { id: "s5", name: "20A breaker", qty: 1, reorderAt: 3, unit: "ea", supplier: "Voltex" },
      ],
      contacts: [
        { id: "ct1", name: "Builders Warehouse", role: "Supplier", phone: "051 400 0000", link: "https://www.builders.co.za/" },
        { id: "ct2", name: "Plumblink Bloem", role: "Supplier", phone: "051 430 0000", link: "https://www.plumblink.co.za/" },
        { id: "ct3", name: "Sipho — helper", role: "Labour", phone: "073 200 1100", link: "https://wa.me/27732001100" },
        { id: "ct4", name: "Voltex", role: "Electrical parts", phone: "051 000 3344", link: "https://www.voltex.co.za/" },
      ],
      processes: seedProcesses(today),
      history: [],
      jobsFilter: "all",
    };
  }

  function seedProcesses(today) {
    return [
      {
        id: "pr-quote-j5", type: "new_quote", title: "Quote — outside light Du Plessis",
        nextDue: isoDate(addDays(today, 0)), cadenceDays: 30, leadDays: 3, module: "quotes",
        accountLinks: [{ label: "WhatsApp customer", url: "https://wa.me/27728889900" }],
        meta: { jobId: "j5", amount: 890 },
      },
      {
        id: "pr-dep-j3", type: "deposit_chase", title: "Chase deposit — Body Corp cistern",
        nextDue: isoDate(addDays(today, -1)), cadenceDays: 3, leadDays: 2, module: "jobs",
        accountLinks: [
          { label: "WhatsApp body corp", url: "https://wa.me/27510001122" },
          { label: "FNB pay note", url: "https://www.fnb.co.za/" },
        ],
        meta: { jobId: "j3", amount: 300 },
      },
      {
        id: "pr-job-j1", type: "job_day", title: "Job day — geyser drip Prinsloo",
        nextDue: isoDate(today), cadenceDays: 365, leadDays: 1, module: "jobs",
        accountLinks: [{ label: "Nav — Universitas", url: "https://maps.google.com/?q=Universitas+Bloemfontein" }],
        meta: { jobId: "j1" },
      },
      {
        id: "pr-inv-j4", type: "invoice", title: "Invoice — kitchen tap",
        nextDue: isoDate(addDays(today, 0)), cadenceDays: 30, leadDays: 2, module: "money",
        accountLinks: [{ label: "Bank / PayFast stub", url: "https://www.payfast.co.za/" }],
        meta: { jobId: "j4", amount: 720, invoiceId: "i1" },
      },
      {
        id: "pr-stock", type: "stock_reorder", title: "Reorder low parts (valves / breakers)",
        nextDue: isoDate(addDays(today, 2)), cadenceDays: 14, leadDays: 5, module: "stock",
        accountLinks: [
          { label: "Builders", url: "https://www.builders.co.za/" },
          { label: "Voltex", url: "https://www.voltex.co.za/" },
        ],
        meta: {},
      },
      {
        id: "pr-dep-j2", type: "deposit_chase", title: "Deposit due — DB board Flat 12",
        nextDue: isoDate(addDays(today, 1)), cadenceDays: 3, leadDays: 2, module: "jobs",
        accountLinks: [{ label: "WhatsApp Flat 12", url: "https://wa.me/27834445511" }],
        meta: { jobId: "j2", amount: 500 },
      },
    ];
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function isoDate(d) {
    const x = new Date(d);
    return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0");
  }
  function parseISO(s) { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
  function daysUntil(iso) {
    return Math.round((startOfDay(parseISO(iso)) - startOfDay(new Date())) / 86400000);
  }
  function fmtDate(iso) {
    try {
      return parseISO(iso).toLocaleDateString("en-ZA", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", year: "numeric" });
    } catch { return iso; }
  }
  function fmtMoney(n) { return "R" + Number(n).toLocaleString("en-ZA"); }
  function todayLabel() {
    return new Date().toLocaleDateString("en-ZA", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
  }
  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function customerName(id) {
    const c = state.customers.find((x) => x.id === id);
    return c ? c.name : "—";
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const data = JSON.parse(raw);
      data.modules = { ...DEFAULT_MODULES, ...(data.modules || {}) };
      if (!data.profile) data.profile = { onboarded: false, city: "", purpose: "", updatedAt: null };
      if (!Array.isArray(data.processes) || !data.processes.length) data.processes = seedProcesses(startOfDay(new Date()));
      if (!Array.isArray(data.history)) data.history = [];
      if (!data.jobsFilter) data.jobsFilter = "all";
      return data;
    } catch { return seed(); }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  let state = load();
  let currentView = "today";

  function processDue(p) { return daysUntil(p.nextDue); }
  function processInQueue(p) {
    if (p.paused) return false;
    const m = state.modules;
    if (p.module && m[p.module] === false) return false;
    const lead = p.leadDays != null ? p.leadDays : (PROCESS_TYPES[p.type] || PROCESS_TYPES.custom).leadDays;
    return processDue(p) <= lead;
  }
  function buildQueue() {
    const items = [];
    (state.processes || []).filter(processInQueue).forEach((p) => {
      const due = processDue(p);
      const def = PROCESS_TYPES[p.type] || PROCESS_TYPES.custom;
      items.push({
        id: "q-" + p.id, processId: p.id, module: p.module || "jobs",
        title: p.title,
        meta: (def.label || p.type) + " · due " + fmtDate(p.nextDue) + (p.accountLinks && p.accountLinks.length ? " · link" : ""),
        severity: due < 0 ? "red" : due <= 1 ? "amber" : "green",
        due, icon: def.icon || "◎",
      });
    });
    items.sort((a,b) => a.due - b.due || a.title.localeCompare(b.title));
    return items;
  }
  function buildReminders() {
    const q = buildQueue().slice(0, 5);
    const base = new Date();
    return q.map((item, i) => {
      const fire = new Date(base);
      fire.setHours(7 + i, i === 0 ? 0 : 30, 0, 0);
      if (fire < base) fire.setDate(fire.getDate() + 1);
      const time = fire.toLocaleTimeString("en-ZA", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
      const day = fire.toLocaleDateString("en-ZA", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
      return { when: day + " · " + time, title: item.title, src: item.module };
    });
  }

  function $(sel) { return document.querySelector(sel); }
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function showView(name) {
    currentView = name;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const el = document.getElementById("view-" + name);
    if (el) el.classList.add("active");
    const primary = ["today", "jobs", "money", "more"];
    document.querySelectorAll("#bottom-nav button").forEach((b) => {
      if (primary.includes(name)) b.classList.toggle("active", b.dataset.nav === name);
      else b.classList.toggle("active", b.dataset.nav === "more");
    });
    render();
    window.scrollTo(0, 0);
  }
  function openModal(title, html) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    $("#modal").classList.add("open");
    $("#modal").setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    $("#modal").classList.remove("open");
    $("#modal").setAttribute("aria-hidden", "true");
  }
  function renderNavVisibility() {
    document.querySelectorAll("#bottom-nav button[data-mod]").forEach((btn) => {
      btn.classList.toggle("hidden-nav", !state.modules[btn.dataset.mod]);
    });
    if (!state.modules.jobs && currentView === "jobs") showView("today");
    if (!state.modules.money && currentView === "money") showView("today");
  }

  function renderHistoryPanel(el, limit) {
    if (!el) return;
    const hist = (state.history || []).slice(0, limit || 8);
    if (!hist.length) {
      el.innerHTML = '<div class="empty">No completions yet — run a process from the queue</div>';
      return;
    }
    el.innerHTML = hist.map((h) => `
      <div class="history-item">
        <div><strong>${esc(h.title)}</strong> · done</div>
        <div class="h-meta">${fmtDate(h.completedAt)} · next ${fmtDate(h.nextDueSet)}${h.note ? " · " + esc(h.note) : ""}</div>
      </div>`).join("");
  }

  function renderToday() {
    $("#today-date").textContent = todayLabel();
    const queue = buildQueue();
    $("#today-count").innerHTML = '<span class="dot"></span> ' + queue.length + " due";
    const todayCash = state.cashLog.filter((k) => k.at === isoDate(new Date()) && k.amount > 0).reduce((s,k) => s + k.amount, 0);
    $("#kpi-cash").textContent = fmtMoney(todayCash);
    $("#kpi-open").textContent = String(state.jobs.filter((j) => !["Paid","Lead"].includes(j.stage) || j.stage === "Lead").filter((j) => j.stage !== "Paid").length);
    const root = $("#today-queue");
    if (!queue.length) {
      root.innerHTML = '<div class="empty">Nothing due — all processes ahead of lead window. Add one below.</div>';
    } else {
      root.innerHTML = queue.map((item) => `
        <button type="button" class="row sev-${item.severity}" data-process="${item.processId}">
          <div class="row-icon">${item.icon}</div>
          <div class="row-body">
            <div class="row-title">${esc(item.title)}</div>
            <div class="row-meta">${esc(item.meta)}</div>
          </div>
          <div class="row-right">
            <span class="badge ${item.severity === "red" ? "danger" : item.severity === "amber" ? "warn" : "ok"}">${item.due < 0 ? "Overdue" : item.due === 0 ? "Today" : item.due + "d"}</span>
          </div>
        </button>`).join("");
    }
    const rem = buildReminders();
    const rp = $("#reminder-panel");
    rp.innerHTML = rem.length ? rem.map((r) => `
      <div class="reminder-item">
        <div class="r-time">${esc(r.when)}</div>
        <div class="r-body">${esc(r.title)}<div class="r-src">${esc(r.src)}</div></div>
      </div>`).join("") : '<div class="empty">No scheduled reminders</div>';
    renderHistoryPanel($("#history-panel"), 5);
  }

  function renderJobs() {
    const strip = $("#stage-strip");
    const filter = state.jobsFilter || "all";
    strip.innerHTML = `<button type="button" class="stage-chip ${filter === "all" ? "on" : ""}" data-stage-filter="all">All <span class="n">${state.jobs.length}</span></button>` +
      STAGES.map((s) => {
        const n = state.jobs.filter((j) => j.stage === s).length;
        return `<button type="button" class="stage-chip ${filter === s ? "on" : ""}" data-stage-filter="${s}">${s} <span class="n">${n}</span></button>`;
      }).join("");
    const list = filter === "all" ? state.jobs : state.jobs.filter((j) => j.stage === filter);
    $("#jobs-list").innerHTML = list.map((j) => {
      const sev = j.stage === "Doing" ? "amber" : j.stage === "Deposit" || daysUntil(j.dueAt) < 0 ? "red" : j.stage === "Paid" ? "green" : "teal";
      return `
        <div class="card mb-12 sev-${sev}">
          <div class="card-head">
            <h3>${esc(j.title)}</h3>
            <span class="badge ${j.stage === "Paid" ? "ok" : j.stage === "Doing" ? "warn" : "info"}">${esc(j.stage)}</span>
          </div>
          <p style="font-size:13px;color:var(--text-dim);margin-bottom:8px">${esc(customerName(j.customerId))} · ${esc(j.trade)} · due ${fmtDate(j.dueAt)}</p>
          <div class="env-head"><span>${j.amount ? fmtMoney(j.amount) : "TBD"}</span><span class="env-amt">dep ${fmtMoney(j.deposit)} ${j.depositPaid ? "✓" : "due"}</span></div>
          <div class="btn-row">
            <button type="button" class="btn btn-ghost btn-sm" data-advance-job="${j.id}">Advance stage</button>
            ${relatedProcessBtn(j.id)}
          </div>
        </div>`;
    }).join("") || '<div class="empty">No jobs in this stage</div>';
  }

  function relatedProcessBtn(jobId) {
    const p = state.processes.find((x) => x.meta && x.meta.jobId === jobId && processInQueue(x));
    if (!p) return "";
    return `<button type="button" class="btn btn-primary btn-sm" data-process="${p.id}">Run process</button>`;
  }

  function renderMoney() {
    const weekAgo = isoDate(addDays(new Date(), -7));
    const inn = state.cashLog.filter((k) => k.at >= weekAgo && k.amount > 0).reduce((s,k) => s + k.amount, 0);
    const owed = state.invoices.filter((i) => i.status !== "paid").reduce((s,i) => s + i.amount, 0) +
      state.jobs.filter((j) => j.stage === "Deposit" && !j.depositPaid).reduce((s,j) => s + j.deposit, 0);
    $("#money-in").textContent = fmtMoney(inn);
    $("#money-owed").textContent = fmtMoney(owed);
    $("#cash-log").innerHTML = state.cashLog.map((k) => `
      <div class="ledger-row">
        <div><strong>${esc(k.label)}</strong><div class="h-meta">${fmtDate(k.at)} · ${esc(k.note)}</div></div>
        <div class="ledger-amt ${k.amount >= 0 ? "pos" : "neg"}">${k.amount >= 0 ? "+" : ""}${fmtMoney(k.amount)}</div>
      </div>`).join("");
    const openInv = state.invoices.filter((i) => i.status !== "paid").length;
    $("#inv-badge").textContent = openInv + " open";
    $("#invoices-list").innerHTML = state.invoices.map((i) => `
      <div class="row ${i.status === "paid" ? "paid" : "sev-amber"}">
        <div class="row-icon">🧾</div>
        <div class="row-body">
          <div class="row-title">${esc(i.title)}</div>
          <div class="row-meta">due ${fmtDate(i.dueAt)}</div>
        </div>
        <div class="row-right">
          <div class="amount">${fmtMoney(i.amount)}</div>
          <span class="badge ${i.status === "paid" ? "ok" : "warn"}">${i.status}</span>
        </div>
      </div>`).join("");
  }

  function renderMore() {
    const items = [
      { id: "quotes", mod: "quotes", icon: "📝", title: "Quotes", meta: "Draft · sent · accepted" },
      { id: "customers", mod: "customers", icon: "👥", title: "Customers", meta: "Leads · repeats" },
      { id: "stock", mod: "stock", icon: "📦", title: "Stock / parts", meta: "Reorder points" },
      { id: "contacts", mod: "contacts", icon: "☎", title: "Contacts", meta: "Suppliers · helpers" },
      { id: "science", mod: "science", icon: "🔬", title: "Science Desk", meta: "Weekly tips · methods" },
      { id: "settings", mod: null, icon: "⚙", title: "Settings", meta: "Modules · processes" },
    ];
    $("#more-grid").innerHTML = items.filter((i) => !i.mod || state.modules[i.mod]).map((i) => `
      <button type="button" class="more-item" data-nav="${i.id}">
        <div class="mi-icon">${i.icon}</div>
        <div class="mi-body"><div class="mi-title">${i.title}</div><div class="mi-meta">${i.meta}</div></div>
        <div class="mi-chevron">›</div>
      </button>`).join("");
  }

  function renderQuotes() {
    $("#quotes-list").innerHTML = state.quotes.map((q) => `
      <div class="row sev-${q.status === "accepted" ? "green" : q.status === "sent" ? "amber" : "teal"}">
        <div class="row-icon">📝</div>
        <div class="row-body">
          <div class="row-title">${esc(q.title)}</div>
          <div class="row-meta">${q.sentAt ? "sent " + fmtDate(q.sentAt) : "draft"} · ${fmtMoney(q.amount)}</div>
        </div>
        <div class="row-right"><span class="badge ${q.status === "accepted" ? "ok" : q.status === "sent" ? "warn" : "muted"}">${esc(q.status)}</span></div>
      </div>`).join("");
  }

  function renderCustomers() {
    $("#customers-list").innerHTML = state.customers.map((c) => `
      <div class="row">
        <div class="row-icon">👤</div>
        <div class="row-body">
          <div class="row-title">${esc(c.name)}</div>
          <div class="row-meta">${esc(c.suburb)} · ${esc(c.phone)} · ${c.jobs} jobs</div>
        </div>
      </div>`).join("");
  }

  function renderStock() {
    $("#stock-list").innerHTML = state.stock.map((s) => {
      const low = s.qty <= s.reorderAt;
      return `
        <div class="row sev-${low ? "red" : "teal"}">
          <div class="row-icon">📦</div>
          <div class="row-body">
            <div class="row-title">${esc(s.name)}</div>
            <div class="row-meta">${esc(s.supplier)} · reorder ≤ ${s.reorderAt}</div>
          </div>
          <div class="row-right"><span class="badge ${low ? "danger" : "ok"}">${s.qty} ${esc(s.unit)}</span></div>
        </div>`;
    }).join("");
  }

  function renderContacts() {
    $("#contacts-list").innerHTML = state.contacts.map((c) => `
      <div class="row">
        <div class="row-icon">☎</div>
        <div class="row-body">
          <div class="row-title">${esc(c.name)}</div>
          <div class="row-meta">${esc(c.role)} · ${esc(c.phone)}</div>
          ${c.link ? `<span class="account-chip">link</span>` : ""}
        </div>
        <div class="row-right">${c.link ? `<button type="button" class="btn btn-ghost btn-sm" data-open-url="${esc(c.link)}">Open</button>` : ""}</div>
      </div>`).join("");
  }

  function renderSettings() {
    const settingsView = document.getElementById("view-settings");
    if (settingsView && !document.getElementById("profile-card")) {
      const card = document.createElement("div");
      card.className = "card mb-12";
      card.id = "profile-card";
      card.innerHTML = '<div class="card-head"><h3>Location &amp; purpose</h3><span class="badge teal">adapt</span></div><p id="profile-summary" style="font-size:15px;color:var(--text-dim);margin-bottom:10px"></p><button type="button" class="btn btn-ghost btn-block" id="btn-redo-onboard">Change city / purpose</button>';
      const first = settingsView.querySelector(".card, .toggle-list, #module-toggles");
      if (first) {
        const wrap = first.closest(".card") || first;
        settingsView.insertBefore(card, wrap);
      } else settingsView.insertBefore(card, settingsView.firstChild);
      document.getElementById("btn-redo-onboard").addEventListener("click", function () { state.profile.onboarded = false; save(); showOnboarding(); });
    }
    const ps = document.getElementById("profile-summary");
    if (ps && state.profile) ps.textContent = (state.profile.city || "—") + " · " + (state.profile.purpose || "—");

    const labels = {
      jobs: "Jobs pipeline", money: "Money / day cash", quotes: "Quotes",
      customers: "Customers", stock: "Stock / parts", contacts: "Contacts", science: "Science Desk"
    };
    $("#module-toggles").innerHTML = Object.keys(DEFAULT_MODULES).map((k) => `
      <label class="toggle-row">
        <div><div class="t-label">${labels[k] || k}</div><div class="t-meta">Show in nav / More</div></div>
        <div class="switch"><input type="checkbox" data-mod-toggle="${k}" ${state.modules[k] ? "checked" : ""} /><span class="slider"></span></div>
      </label>`).join("");
    $("#process-list").innerHTML = state.processes.map((p) => {
      const def = PROCESS_TYPES[p.type] || PROCESS_TYPES.custom;
      return `
        <button type="button" class="row btn-like" data-edit-process="${p.id}">
          <div class="row-icon">${def.icon || "◎"}</div>
          <div class="row-body">
            <div class="row-title">${esc(p.title)}</div>
            <div class="row-meta">${esc(def.label)} · next ${fmtDate(p.nextDue)} · every ${p.cadenceDays}d</div>
          </div>
          <div class="row-right"><span class="badge muted">edit</span></div>
        </button>`;
    }).join("") || '<div class="empty">No processes</div>';
    renderHistoryPanel($("#history-list-full"), 20);
  }

  function render() {
    renderNavVisibility();
    if (currentView === "science") renderScience();
    renderToday();
    if (state.modules.jobs) renderJobs();
    if (state.modules.money) renderMoney();
    renderMore();
    if (state.modules.quotes) renderQuotes();
    if (state.modules.customers) renderCustomers();
    if (state.modules.stock) renderStock();
    if (state.modules.contacts) renderContacts();
    renderSettings();
  }

  
  /* PLATFORM_BAR_2026_09_11 helpers */
  function renderScience() {
    const root = document.getElementById("science-tips");
    if (!root) return;
    root.innerHTML = SCIENCE_TIPS.map((t) =>
      '<div class="science-tip"><h4>' + esc(t.h) + '</h4><p>' + esc(t.body) + '</p><div class="method">' + esc(t.method) + '</div></div>'
    ).join("");
  }

  function applyPurposeModules(purpose) {
    const preset = PURPOSE_MODULE_PRESETS[purpose];
    if (!preset || !state.modules) return;
    Object.keys(state.modules).forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(preset, k)) state.modules[k] = !!preset[k];
    });
  }

  function updateBrandLocation() {
    const sub = document.querySelector(".brand-text p");
    if (!sub || !state.profile) return;
    const city = state.profile.city || "";
    const purpose = state.profile.purpose || "";
    if (city || purpose) sub.textContent = [city, purpose].filter(Boolean).join(" · ");
  }

  function showOnboarding() {
    const el = document.getElementById("onboard");
    if (!el) return;
    const city = document.getElementById("ob-city");
    const purpose = document.getElementById("ob-purpose");
    if (city && state.profile) city.value = state.profile.city || "Bloemfontein";
    if (purpose && state.profile) purpose.value = state.profile.purpose || "trade";
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
  }

  function hideOnboarding() {
    const el = document.getElementById("onboard");
    if (!el) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
  }

  function completeOnboarding() {
    const city = (document.getElementById("ob-city") && document.getElementById("ob-city").value || "").trim();
    const purpose = (document.getElementById("ob-purpose") && document.getElementById("ob-purpose").value) || "";
    if (!city) { toast("Enter your city / region"); return; }
    if (!purpose) { toast("Choose what you run"); return; }
    state.profile = { onboarded: true, city: city, purpose: purpose, updatedAt: new Date().toISOString() };
    applyPurposeModules(purpose);
    save();
    hideOnboarding();
    updateBrandLocation();
    render();
    toast("Saved · modules adapted");
  }

  function maybeOnboard() {
    if (!state.profile) state.profile = { onboarded: false, city: "", purpose: "", updatedAt: null };
    if (!state.profile.onboarded) showOnboarding();
    else updateBrandLocation();
  }


  /* ── ProcessRunner ── */
  let prState = null;
  function getProcess(id) { return (state.processes || []).find((p) => p.id === id); }
  function prPhases(proc) {
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    return ["start", ...(def.steps || []).map((_, i) => "step:" + i), "done", "nextdue"];
  }
  function openProcessRunner(processId) {
    const proc = getProcess(processId);
    if (!proc) { toast("Process not found"); return; }
    prState = { processId, phaseIndex: 0, answers: {}, checks: {} };
    $("#process-runner").classList.add("open");
    $("#process-runner").setAttribute("aria-hidden", "false");
    renderProcessRunner();
  }
  function closeProcessRunner() {
    prState = null;
    $("#process-runner").classList.remove("open");
    $("#process-runner").setAttribute("aria-hidden", "true");
  }
  function suggestNextDue(proc) {
    const days = Number(proc.cadenceDays) || (PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom).defaultCadenceDays || 30;
    return isoDate(addDays(new Date(), Math.max(1, days || 30)));
  }
  function renderAccountLinks(proc) {
    const links = proc.accountLinks || [];
    if (!links.length) return `<div class="pr-card"><p style="font-size:12px;color:var(--muted)">No account link yet — add one in Settings.</p></div>`;
    return `<div class="pr-card"><h4>Account links</h4>` + links.map((a) =>
      `<button type="button" class="pr-link-btn" data-open-link="${esc(a.url)}"><span>Open · ${esc(a.label)}</span><span>↗</span></button>`
    ).join("") + `</div>`;
  }
  function renderProcessRunner() {
    if (!prState) return;
    const proc = getProcess(prState.processId);
    if (!proc) return closeProcessRunner();
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    const phases = prPhases(proc);
    const phase = phases[prState.phaseIndex];
    $("#pr-title").textContent = proc.title;
    $("#pr-badge").textContent = (prState.phaseIndex + 1) + "/" + phases.length;
    $("#pr-stepper").innerHTML = phases.map((_, i) =>
      `<span class="${i < prState.phaseIndex ? "done" : i === prState.phaseIndex ? "on" : ""}"></span>`).join("");
    const body = $("#pr-body");
    const actions = $("#pr-actions");
    let html = "", act = "";
    if (phase === "start") {
      html = `
        <div class="pr-phase-label">Start</div>
        <div class="pr-title">${esc(proc.title)}</div>
        <div class="pr-meta">${esc(def.label)} · due ${fmtDate(proc.nextDue)} · cadence every ${proc.cadenceDays || "—"} days</div>
        <div class="pr-card"><h4>What happens</h4>
          <p>Guided process (${def.steps.length} steps). On complete you confirm next due — item returns to Today when due approaches.</p>
          <p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(def.disclaimer || "")}</p>
        </div>
        ${renderAccountLinks(proc)}
        ${proc.meta && proc.meta.amount ? `<div class="pr-card"><h4>Amount</h4><p>${fmtMoney(proc.meta.amount)}</p></div>` : ""}`;
      act = `<button type="button" class="btn btn-ghost" id="pr-cancel">Cancel</button>
             <button type="button" class="btn btn-primary" id="pr-next">Start →</button>`;
    } else if (phase.startsWith("step:")) {
      const si = Number(phase.split(":")[1]);
      const step = def.steps[si];
      const showLinks = ["send", "chase", "order", "account"].includes(step.key) || si === 1;
      html = `
        <div class="pr-phase-label">Step ${si + 1} of ${def.steps.length}</div>
        <div class="pr-title">${esc(step.title)}</div>
        <div class="pr-meta">${esc(step.body)}</div>
        ${showLinks ? renderAccountLinks(proc) : ""}
        ${step.checks ? `<div class="pr-card">${step.checks.map((c, i) =>
          `<label class="pr-check"><input type="checkbox" data-pr-check="${si}-${i}" ${prState.checks[si+"-"+i] ? "checked" : ""} /><span>${esc(c)}</span></label>`
        ).join("")}</div>` : ""}
        ${step.input === "amount" ? `<div class="form-row"><label>Amount (ZAR)</label><input type="number" id="pr-amount" inputmode="decimal" value="${esc(prState.answers.amount || (proc.meta && proc.meta.amount) || "")}" /></div>` : ""}
        ${step.input === "note" || step.key === "work" ? `<div class="form-row"><label>Notes</label><textarea id="pr-note" placeholder="Parts used, issues…">${esc(prState.answers.note || "")}</textarea></div>` : ""}
        ${step.key === "before" || step.key === "after" ? `<div class="photo-slots">${(step.checks||[]).map((c,i) =>
          `<div class="photo-slot ${prState.checks[si+"-"+i] ? "done" : ""}" data-photo-slot="${si}-${i}">📷 ${esc(c)}</div>`).join("")}</div>` : ""}
        <p style="font-size:11px;color:var(--muted);margin-top:8px">${esc(def.disclaimer || "")}</p>`;
      act = `<button type="button" class="btn btn-ghost" id="pr-back">Back</button>
             <button type="button" class="btn btn-primary" id="pr-next">Continue →</button>`;
    } else if (phase === "done") {
      html = `<div class="pr-done-hero"><div class="big">✓</div><h4>Marked done</h4>
        <p class="pr-meta">${esc(proc.title)} complete for this cycle.</p></div>
        <div class="pr-card"><h4>Next</h4><p>Set next due so this returns to Today automatically.</p></div>`;
      act = `<button type="button" class="btn btn-ghost" id="pr-back">Back</button>
             <button type="button" class="btn btn-primary" id="pr-next">Set next due →</button>`;
    } else if (phase === "nextdue") {
      const suggested = prState.suggestedNext || suggestNextDue(proc);
      prState.suggestedNext = suggested;
      html = `
        <div class="pr-phase-label">Next due</div>
        <div class="pr-title">When should this return?</div>
        <div class="pr-meta">Suggested from cadence. Confirm or adjust.</div>
        <div class="form-row"><label>Next due date</label><input type="date" id="pr-next-due" value="${suggested}" /></div>
        <div class="form-row"><label>Cadence (days)</label><input type="number" id="pr-cadence" value="${proc.cadenceDays || 30}" min="1" /></div>
        <div class="form-row"><label>Note (optional)</label><input type="text" id="pr-final-note" placeholder="e.g. Sent via WhatsApp" value="${esc(prState.answers.note || "")}" /></div>
        <div class="pr-card"><p style="font-size:12px;color:var(--muted)">Reappears in Today within lead window (${proc.leadDays != null ? proc.leadDays : def.leadDays} days).</p></div>`;
      act = `<button type="button" class="btn btn-ghost" id="pr-back">Back</button>
             <button type="button" class="btn btn-primary" id="pr-finish">Confirm &amp; close</button>`;
    }
    body.innerHTML = html;
    actions.innerHTML = act;
    $("#pr-cancel")?.addEventListener("click", closeProcessRunner);
    $("#pr-back")?.addEventListener("click", () => { if (prState.phaseIndex > 0) { prState.phaseIndex--; renderProcessRunner(); } });
    $("#pr-next")?.addEventListener("click", () => {
      if (!validatePrStep(proc, phase, def)) return;
      capturePrAnswers();
      prState.phaseIndex++;
      renderProcessRunner();
    });
    $("#pr-finish")?.addEventListener("click", () => finishProcess(proc));
    body.querySelectorAll("[data-pr-check]").forEach((el) => {
      el.addEventListener("change", () => { prState.checks[el.getAttribute("data-pr-check")] = el.checked; });
    });
    body.querySelectorAll("[data-photo-slot]").forEach((el) => {
      el.addEventListener("click", () => {
        const k = el.getAttribute("data-photo-slot");
        prState.checks[k] = !prState.checks[k];
        const cb = body.querySelector(`[data-pr-check="${k}"]`);
        if (cb) cb.checked = !!prState.checks[k];
        el.classList.toggle("done", !!prState.checks[k]);
      });
    });
    body.querySelectorAll("[data-open-link]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-open-link");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }
  function validatePrStep(proc, phase, def) {
    if (!phase.startsWith("step:")) return true;
    const si = Number(phase.split(":")[1]);
    const step = def.steps[si];
    if (step.checks) {
      for (let i = 0; i < step.checks.length; i++) {
        if (!prState.checks[si + "-" + i]) { toast("Tick all confirmations to continue"); return false; }
      }
    }
    return true;
  }
  function capturePrAnswers() {
    const note = document.getElementById("pr-note");
    if (note) prState.answers.note = note.value.trim();
    const amt = document.getElementById("pr-amount");
    if (amt) prState.answers.amount = amt.value.trim();
  }
  function finishProcess(proc) {
    const nextEl = document.getElementById("pr-next-due");
    const cadEl = document.getElementById("pr-cadence");
    const noteEl = document.getElementById("pr-final-note");
    const nextDue = (nextEl && nextEl.value) || suggestNextDue(proc);
    const cadence = Math.max(1, Number(cadEl && cadEl.value) || proc.cadenceDays || 30);
    const note = (noteEl && noteEl.value.trim()) || prState.answers.note || "";
    proc.nextDue = nextDue;
    proc.cadenceDays = cadence;
    proc.lastCompletedAt = isoDate(new Date());

    if (proc.type === "new_quote" && proc.meta && proc.meta.jobId) {
      const job = state.jobs.find((j) => j.id === proc.meta.jobId);
      if (job) {
        job.stage = "Quoted";
        if (prState.answers.amount) job.amount = Number(prState.answers.amount) || job.amount;
      }
      const q = state.quotes.find((x) => x.jobId === proc.meta.jobId);
      if (q) { q.status = "sent"; q.sentAt = isoDate(new Date()); if (prState.answers.amount) q.amount = Number(prState.answers.amount); }
    }
    if (proc.type === "deposit_chase" && proc.meta && proc.meta.jobId) {
      const job = state.jobs.find((j) => j.id === proc.meta.jobId);
      if (job) {
        job.depositPaid = true;
        if (job.stage === "Deposit" || job.stage === "Quoted") job.stage = "Doing";
        state.cashLog.unshift({ id: uid("k"), at: isoDate(new Date()), label: "Deposit — " + job.title, amount: job.deposit, note: "deposit" });
      }
    }
    if (proc.type === "job_day" && proc.meta && proc.meta.jobId) {
      const job = state.jobs.find((j) => j.id === proc.meta.jobId);
      if (job) job.stage = "Done";
    }
    if (proc.type === "invoice" && proc.meta) {
      if (proc.meta.jobId) {
        const job = state.jobs.find((j) => j.id === proc.meta.jobId);
        if (job && job.stage === "Done") job.stage = "Done";
      }
      if (proc.meta.invoiceId) {
        const inv = state.invoices.find((i) => i.id === proc.meta.invoiceId);
        if (inv) inv.status = "unpaid";
      } else if (proc.meta.jobId) {
        const job = state.jobs.find((j) => j.id === proc.meta.jobId);
        if (job && !state.invoices.find((i) => i.jobId === job.id)) {
          state.invoices.unshift({ id: uid("i"), jobId: job.id, title: job.title + " — INV", amount: job.amount, status: "unpaid", dueAt: nextDue });
        }
      }
    }
    if (proc.type === "stock_reorder") {
      state.stock.forEach((s) => { if (s.qty <= s.reorderAt) s.qty = s.reorderAt + 4; });
    }

    state.history = state.history || [];
    state.history.unshift({ id: uid("h"), processId: proc.id, title: proc.title, type: proc.type, completedAt: isoDate(new Date()), nextDueSet: nextDue, note });
    if (state.history.length > 50) state.history.length = 50;
    save();
    closeProcessRunner();
    render();
    toast("Done · next due " + fmtDate(nextDue));
  }

  function openAddProcessModal(editId) {
    const editing = editId ? getProcess(editId) : null;
    const types = Object.keys(PROCESS_TYPES).map((k) =>
      `<option value="${k}" ${editing && editing.type === k ? "selected" : ""}>${esc(PROCESS_TYPES[k].label)}</option>`).join("");
    openModal(editing ? "Edit process" : "Add recurring process", `
      <div class="form-row"><label>Title</label><input type="text" id="np-title" value="${editing ? esc(editing.title) : ""}" placeholder="e.g. Chase deposit — Job X" /></div>
      <div class="form-row"><label>Process type</label><select id="np-type">${types}</select></div>
      <div class="form-row"><label>Next due</label><input type="date" id="np-due" value="${editing ? editing.nextDue : isoDate(addDays(new Date(), 1))}" /></div>
      <div class="form-row"><label>Cadence (days)</label><input type="number" id="np-cadence" min="1" value="${editing ? editing.cadenceDays : 7}" /></div>
      <div class="form-row"><label>Lead days</label><input type="number" id="np-lead" min="0" value="${editing ? editing.leadDays : 3}" /></div>
      <div class="form-row"><label>Account link label</label><input type="text" id="np-link-label" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].label) : ""}" placeholder="e.g. WhatsApp" /></div>
      <div class="form-row"><label>Account link URL</label><input type="url" id="np-link-url" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].url) : ""}" placeholder="https://…" /></div>
      <div class="btn-row"><button type="button" class="btn btn-primary btn-block" id="np-save">${editing ? "Save" : "Add process"}</button></div>
      ${editing ? `<button type="button" class="btn btn-danger btn-block" id="np-run" style="margin-top:8px">Run wizard now</button>
                   <button type="button" class="btn btn-ghost btn-block" id="np-delete" style="margin-top:8px">Delete process</button>` : ""}
      <p style="font-size:11px;color:var(--muted);margin-top:10px">Not legal/tax advice. Links open in a new tab.</p>`);
    setTimeout(() => {
      $("#np-save")?.addEventListener("click", () => {
        const title = $("#np-title").value.trim();
        const type = $("#np-type").value;
        const nextDue = $("#np-due").value || isoDate(addDays(new Date(), 1));
        const cadenceDays = Math.max(1, Number($("#np-cadence").value) || 7);
        const leadDays = Math.max(0, Number($("#np-lead").value) || 3);
        const label = $("#np-link-label").value.trim();
        const url = $("#np-link-url").value.trim();
        if (!title) { toast("Enter a title"); return; }
        const links = label && url ? [{ label, url }] : label ? [{ label, url: "#" }] : url ? [{ label: "Open account", url }] : [];
        const moduleGuess = type === "invoice" || type === "deposit_chase" ? "money" : type === "stock_reorder" ? "stock" : type === "new_quote" ? "quotes" : "jobs";
        if (editing) {
          Object.assign(editing, { title, type, nextDue, cadenceDays, leadDays, module: moduleGuess, accountLinks: links.length ? links : editing.accountLinks || [] });
        } else {
          state.processes.unshift({ id: uid("pr"), type, title, nextDue, cadenceDays, leadDays, module: moduleGuess, accountLinks: links, meta: {} });
        }
        save(); closeModal(); render(); toast(editing ? "Process updated" : "Process added");
      });
      $("#np-run")?.addEventListener("click", () => { closeModal(); openProcessRunner(editing.id); });
      $("#np-delete")?.addEventListener("click", () => {
        if (!confirm("Delete this process?")) return;
        state.processes = state.processes.filter((p) => p.id !== editing.id);
        save(); closeModal(); render(); toast("Process deleted");
      });
    }, 0);
  }

  function advanceJob(id) {
    const job = state.jobs.find((j) => j.id === id);
    if (!job) return;
    const i = STAGES.indexOf(job.stage);
    if (i < 0 || i >= STAGES.length - 1) { toast("Already at " + job.stage); return; }
    job.stage = STAGES[i + 1];
    if (job.stage === "Deposit") job.depositPaid = false;
    if (job.stage === "Doing") job.depositPaid = true;
    if (job.stage === "Paid") {
      state.cashLog.unshift({ id: uid("k"), at: isoDate(new Date()), label: "Paid — " + job.title, amount: Math.max(0, job.amount - (job.depositPaid ? job.deposit : 0)), note: "job paid" });
      const inv = state.invoices.find((x) => x.jobId === job.id);
      if (inv) inv.status = "paid";
    }
    save(); render(); toast("Advanced → " + job.stage);
  }

  function resetDemo() {
    if (!confirm("Reset all Trade Desk demo data?")) return;
    state = seed();
    save();
    showView("today");
    toast("Demo reset");
  }

  document.getElementById("bottom-nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-nav]");
    if (btn) showView(btn.dataset.nav);
  });
  document.getElementById("main").addEventListener("click", (e) => {
    const back = e.target.closest(".back-link[data-nav]");
    if (back) { showView(back.dataset.nav); return; }
    const more = e.target.closest(".more-item[data-nav]");
    if (more) { showView(more.dataset.nav); return; }
    const procBtn = e.target.closest("[data-process]");
    if (procBtn) { openProcessRunner(procBtn.getAttribute("data-process")); return; }
    const editProc = e.target.closest("[data-edit-process]");
    if (editProc) { openAddProcessModal(editProc.getAttribute("data-edit-process")); return; }
    const stage = e.target.closest("[data-stage-filter]");
    if (stage) { state.jobsFilter = stage.getAttribute("data-stage-filter"); save(); render(); return; }
    const adv = e.target.closest("[data-advance-job]");
    if (adv) { advanceJob(adv.getAttribute("data-advance-job")); return; }
    const openUrl = e.target.closest("[data-open-url]");
    if (openUrl) { window.open(openUrl.getAttribute("data-open-url"), "_blank", "noopener,noreferrer"); return; }
    const modToggle = e.target.closest("[data-mod-toggle]");
    if (modToggle) {
      state.modules[modToggle.dataset.modToggle] = !!modToggle.checked;
      save(); render();
      toast((modToggle.checked ? "Enabled " : "Hidden ") + modToggle.dataset.modToggle);
    }
  });
  $("#btn-reset").addEventListener("click", resetDemo);
  $("#btn-reset-2").addEventListener("click", resetDemo);
  $("#btn-info").addEventListener("click", () => {
    openModal("About Trade Desk", `<p><strong>Trade Desk</strong> is a mobile-first demo for a solo SA plumber / electrician / handyman job pipeline.</p>
      <p>Lead → Quoted → Deposit → Doing → Done → Paid. Tap due processes for guided wizards.</p>
      <p>Sample: Mokoena Plumbing, Bloemfontein. ZAR demo data in localStorage.</p>
      <p style="font-size:12px;color:var(--muted)">Not legal or tax advice. Does not send WhatsApp / invoices for you — you Approve and send.</p>`);
  });
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  $("#pr-close").addEventListener("click", closeProcessRunner);
  $("#btn-add-process")?.addEventListener("click", () => openAddProcessModal());
  $("#btn-add-process-today")?.addEventListener("click", () => openAddProcessModal());

  document.getElementById("ob-save") && document.getElementById("ob-save").addEventListener("click", completeOnboarding);
  maybeOnboard();
  render();
})();
