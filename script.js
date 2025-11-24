/* -------------------------
   TRIAL DATA (edit here)
   -------------------------*/
const TRIAL = {
  metrics: { users: 152, projections: 324, active: 18 },

  careers: {
    "software engineer": { base: 90000, growth: 4500 },
    "designer": { base: 60000, growth: 3000 },
    "manager": { base: 80000, growth: 4000 },
    "teacher": { base: 45000, growth: 2000 },
    "analyst": { base: 65000, growth: 2500 }
  },

  cities: {
    "New York": { rent: 1600, groceries: 400, transport: 130, misc: 300 },
    "San Francisco": { rent: 2100, groceries: 450, transport: 120, misc: 350 },
    "Austin": { rent: 1000, groceries: 300, transport: 80, misc: 200 },
    "Seattle": { rent: 1400, groceries: 350, transport: 100, misc: 240 }
  }
};

/* -------------------------
   Helpers & query
   -------------------------*/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* -------------------------
   Animated counters
   -------------------------*/
function animateCount(el, to, ms = 900) {
  if (!el) return;
  const start = 0;
  const startTime = performance.now();
  function step(now) {
    const t = clamp((now - startTime) / ms, 0, 1);
    el.textContent = Math.floor(start + (to - start) * t);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* -------------------------
   Sticky navbar shadow
   -------------------------*/
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

/* -------------------------
   Theme toggle
   -------------------------*/
const darkToggle = $('#darkToggle');
const saved = localStorage.getItem('futurelens_theme');
if (saved === 'dark') document.body.classList.add('dark');
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('futurelens_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

/* -------------------------
   Smooth scrolling for anchor links
   -------------------------*/
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* -------------------------
   Reveal on scroll
   -------------------------*/
function reveal() {
  $$('.reveal').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight - 80) el.classList.add('visible');
  });
}
window.addEventListener('load', reveal);
window.addEventListener('scroll', reveal);

/* -------------------------
   Init metrics
   -------------------------*/
window.addEventListener('load', () => {
  animateCount($('#m-users'), TRIAL.metrics.users);
  animateCount($('#m-projections'), TRIAL.metrics.projections);
  animateCount($('#m-active'), TRIAL.metrics.active);
});

/* -------------------------
   Populate city selects
   -------------------------*/
function populateCities() {
  const keys = Object.keys(TRIAL.cities);
  const a = $('#cityA'), b = $('#cityB');
  if (!a || !b) return;
  a.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
  b.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
}
populateCities();

/* -------------------------
   Chart helpers (Chart.js)
   -------------------------*/
let careerChart, salaryChart, colChart, loanChart;
function makeLineChart(ctx, labels, datasets, opts = {}) {
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: { mode: 'index', intersect: false } },
      scales: { x: { display: true }, y: { display: true, beginAtZero: false } },
      interaction: { mode: 'nearest', intersect: true },
      ...opts
    }
  });
}
function makeBarChart(ctx, labels, datasets, opts = {}) {
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: { mode: 'index', intersect: false } },
      scales: { x: { stacked: false }, y: { beginAtZero: true } },
      ...opts
    }
  });
}

/* -------------------------
   Career projection
   -------------------------*/
function initCareer() {
  const careerInput = $('#careerInput');
  const yearsInput = $('#yearsInput');
  const locationInput = $('#locationInput');
  const btn = $('#careerBtn');
  const out = $('#careerResult');
  const ctx = document.getElementById('careerChart').getContext('2d');

  btn.addEventListener('click', () => {
    const careerRaw = careerInput.value.trim();
    const years = parseInt(yearsInput.value, 10);
    const location = locationInput.value.trim();
    if (!careerRaw || isNaN(years) || !location) {
      out.innerHTML = 'Please complete all fields.';
      return;
    }

    const key = careerRaw.toLowerCase();
    const known = TRIAL.careers[key];
    const data = known ? known : { base: 50000, growth: 1500 };

    // projection for next 10 years (including current)
    const labels = Array.from({length: 11}, (_, i) => `+${i}y`);
    const values = labels.map((_, i) => data.base + data.growth * (i + years));

    out.innerHTML = `<strong>${careerRaw}</strong> — ${location}<br>
      Starting estimate: <strong>$${(data.base + data.growth * years).toLocaleString()}</strong><br>
      Growth per year: <strong>$${data.growth.toLocaleString()}</strong>`;

    // draw chart (destroy old)
    if (careerChart) careerChart.destroy();
    careerChart = makeLineChart(ctx, labels, [{
      label: 'Projected salary',
      data: values,
      borderColor: '#4a3aff',
      backgroundColor: 'rgba(74,58,255,0.08)',
      tension: 0.3,
      pointRadius: 4,
      borderWidth: 2
    }]);
  });
}
initCareer();

/* -------------------------
   Salary growth example
   -------------------------*/
function initSalaryExample() {
  const ctx = document.getElementById('salaryChart').getContext('2d');
  const labels = Array.from({length: 11}, (_, i) => `${i}y`);
  const dataset = labels.map((_, i) => {
    const vals = Object.values(TRIAL.careers).map(c => c.base + c.growth * i);
    return Math.round(vals.reduce((s,a) => s + a, 0) / vals.length);
  });

  if (salaryChart) salaryChart.destroy();
  salaryChart = makeLineChart(ctx, labels, [{
    label: 'Average projected salary (trial careers)',
    data: dataset,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
    tension: 0.3,
    pointRadius: 3,
    borderWidth: 2
  }]);
}
initSalaryExample();

/* -------------------------
   Cost of living comparator
   -------------------------*/
function initCOL() {
  const btn = $('#colBtn');
  const out = $('#colResult');
  const ctx = document.getElementById('colChart').getContext('2d');

  btn.addEventListener('click', () => {
    const a = $('#cityA').value;
    const b = $('#cityB').value;
    if (!a || !b) { out.innerHTML = 'Select two cities.'; return; }
    const A = TRIAL.cities[a], B = TRIAL.cities[b];
    const cats = ['rent','groceries','transport','misc'];
    const dataA = cats.map(c => A[c]);
    const dataB = cats.map(c => B[c]);

    out.innerHTML = `<strong>${a}</strong> ≈ $${dataA.reduce((s,x)=>s+x,0).toLocaleString()} / mo<br>
                     <strong>${b}</strong> ≈ $${dataB.reduce((s,x)=>s+x,0).toLocaleString()} / mo`;

    if (colChart) colChart.destroy();
    colChart = makeBarChart(ctx, cats.map(c => c[0].toUpperCase() + c.slice(1)), [
      { label: a, data: dataA, backgroundColor: 'rgba(74,58,255,0.85)' },
      { label: b, data: dataB, backgroundColor: 'rgba(34,197,94,0.85)' }
    ]);
  });
}
initCOL();

/* -------------------------
   Loan calculator
   -------------------------*/
function initLoan() {
  const btn = $('#loanBtn');
  const out = $('#loanResult');
  const ctx = document.getElementById('loanChart').getContext('2d');

  btn.addEventListener('click', () => {
    const P = parseFloat($('#loanAmount').value);
    const annualR = parseFloat($('#loanRate').value);
    const years = parseInt($('#loanYears').value, 10);
    if (isNaN(P) || isNaN(annualR) || isNaN(years) || P <= 0 || years <= 0) {
      out.innerHTML = 'Enter a valid loan amount, rate, and term.';
      return;
    }

    const r = annualR / 100 / 12;
    const n = years * 12;
    const monthly = (P * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    const interest = total - P;

    out.innerHTML = `Monthly payment: <strong>$${monthly.toFixed(2)}</strong><br>Total paid: <strong>$${total.toFixed(2)}</strong> (Interest: $${interest.toFixed(2)})`;

    // remaining balance each year
    const remaining = [];
    let bal = P;
    for (let i = 1; i <= n; i++) {
      const interestMonth = bal * r;
      const principal = monthly - interestMonth;
      bal = Math.max(0, bal - principal);
      if (i % 12 === 0) remaining.push(Math.round(bal));
    }
    const labels = remaining.map((_, i) => `${i+1}y`);

    if (loanChart) loanChart.destroy();
    loanChart = makeLineChart(ctx, labels, [{
      label: 'Remaining principal',
      data: remaining,
      borderColor: '#fb923c',
      backgroundColor: 'rgba(251,146,60,0.08)',
      tension: 0.3,
      pointRadius: 3,
      borderWidth: 2
    }]);
  });
}
initLoan();

/* -------------------------
   Small accessibility: keyboard open for dropdowns
   -------------------------*/
$$('.dropbtn').forEach(btn => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') btn.parentElement.classList.toggle('open');
  });
});
