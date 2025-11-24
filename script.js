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
   Utilities & DOM helpers
   -------------------------*/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* -------------------------
   Metrics counters
   -------------------------*/
function animateCount(id, to, ms = 900) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const duration = ms;
  const startTime = performance.now();
  function step(now) {
    const t = clamp((now - startTime) / duration, 0, 1);
    const val = Math.floor(start + (to - start) * t);
    el.textContent = val;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* -------------------------
   Sticky navbar shadow
   -------------------------*/
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

/* -------------------------
   Dark mode toggle
   -------------------------*/
const darkToggle = document.getElementById('darkToggle');
const currentTheme = localStorage.getItem('futurelens_theme');
if (currentTheme === 'dark') document.body.classList.add('dark');
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
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* -------------------------
   Reveal on scroll
   -------------------------*/
function revealOnScroll() {
  $$('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}
window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', revealOnScroll);

/* -------------------------
   Initialize metric counters
   -------------------------*/
window.addEventListener('load', () => {
  animateCount('m-users', TRIAL.metrics.users);
  animateCount('m-projections', TRIAL.metrics.projections);
  animateCount('m-active', TRIAL.metrics.active);
});

/* -------------------------
   Populate city selects
   -------------------------*/
function populateCities() {
  const keys = Object.keys(TRIAL.cities);
  const a = $('#cityA');
  const b = $('#cityB');
  if (!a || !b) return;
  a.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
  b.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
}
populateCities();

/* -------------------------
   Chart helpers (Chart.js)
   -------------------------*/
let careerChart, salaryChart, colChart, loanChart;

function makeLineChart(ctx, labels, data, label, color) {
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label, data, fill: false, tension: 0.3, borderWidth: 2 }]},
    options: {
      plugins: { tooltip: { mode: 'index', intersect: false } },
      hover: { mode: 'nearest', intersect: true },
      scales: {
        x: { display: true },
        y: { display: true, beginAtZero: false }
      }
    }
  });
}

/* -------------------------
   Career projection logic
   -------------------------*/
function projectCareerUI() {
  const careerInput = $('#careerInput');
  const yearsInput = $('#yearsInput');
  const locationInput = $('#locationInput');
  const btn = $('#careerBtn');
  const out = $('#careerResult');

  // create empty chart placeholder
  const ctxCareer = document.getElementById('careerChart').getContext('2d');

  btn.addEventListener('click', () => {
    const careerRaw = careerInput.value.trim();
    const years = parseInt(yearsInput.value, 10);
    const location = locationInput.value.trim();
    if (!careerRaw || isNaN(years) || !location) {
      out.innerHTML = 'Please fill all fields.';
      return;
    }

    const key = careerRaw.toLowerCase();
    const known = TRIAL.careers[key];
    const careerData = known ? known : { base: 50000, growth: 1500 };

    // build year-by-year projection (10 years)
    const yearsArr = Array.from({length: 11}, (_, i) => i);
    const salaryArr = yearsArr.map(i => careerData.base + careerData.growth * (i + years));

    out.innerHTML = `<strong>${careerRaw}</strong> — ${location}<br>
      Starting estimate: $${(careerData.base + careerData.growth * years).toLocaleString()}<br>
      Growth per year: $${careerData.growth.toLocaleString()}`;

    // destroy previous chart
    if (careerChart) careerChart.destroy();
    careerChart = makeLineChart(ctxCareer, yearsArr.map(y => `+${y}y`), salaryArr, 'Projected Salary', '#4a3aff');
  });
}
projectCareerUI();

/* -------------------------
   Salary growth example chart
   -------------------------*/
function initSalaryExample() {
  const ctx = document.getElementById('salaryChart').getContext('2d');
  // Example dataset using trial careers applied over 10 years
  const labels = Array.from({length:11}, (_,i) => `${i}y`);
  const dataset = labels.map((_, i) => {
    // average of careers base + growth*i
    const vals = Object.values(TRIAL.careers).map(c => c.base + c.growth * i);
    const avg = Math.round(vals.reduce((s,a) => s+a,0) / vals.length);
    return avg;
  });
  if (salaryChart) salaryChart.destroy();
  salaryChart = makeLineChart(ctx, labels, dataset, 'Avg projected salary', '#22c55e');
}

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
    if (!a || !b) { out.innerHTML = 'Choose two cities.'; return; }
    const A = TRIAL.cities[a];
    const B = TRIAL.cities[b];

    const categories = ['rent','groceries','transport','misc'];
    const dataA = categories.map(c => A[c]);
    const dataB = categories.map(c => B[c]);

    out.innerHTML = `<strong>${a}</strong> total ≔ $${(dataA.reduce((s,x)=>s+x,0)).toLocaleString()} / mo<br>
                     <strong>${b}</strong> total ≔ $${(dataB.reduce((s,x)=>s+x,0)).toLocaleString()} / mo`;

    if (colChart) colChart.destroy();
    colChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories.map(c=>c.charAt(0).toUpperCase()+c.slice(1)),
        datasets: [
          { label: a, data: dataA, backgroundColor: 'rgba(74,58,255,0.8)' },
          { label: b, data: dataB, backgroundColor: 'rgba(34,197,94,0.85)' }
        ]
      },
      options: { plugins: { tooltip:{mode:'index'} }, responsive:true, scales:{y:{beginAtZero:true}}}
    });
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
    if (isNaN(P) || isNaN(annualR) || isNaN(years) || P<=0) {
      out.innerHTML = 'Please enter valid loan amount, interest, and term.';
      return;
    }
    const r = annualR / 100 / 12;
    const n = years * 12;
    const monthly = (P * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    const totalInterest = total - P;

    out.innerHTML = `Monthly payment: <strong>$${monthly.toFixed(2)}</strong><br>
                     Total paid: $${total.toFixed(2)} (Interest: $${totalInterest.toFixed(2)})`;

    // Chart: remaining principal by year
    const remaining = [];
    let balance = P;
    for (let i=1;i<=n;i++){
      const interest = balance * r;
      const principal = monthly - interest;
      balance = Math.max(0, balance - principal);
      if (i % 12 === 0) remaining.push(Math.round(balance));
    }
    const labels = remaining.map((_,i)=>`${i+1}y`);
    if (loanChart) loanChart.destroy();
    loanChart = new Chart(ctx, {
      type:'line',
      data:{labels, datasets:[{label:'Remaining principal', data:remaining, borderWidth:2}]},
      options:{plugins:{tooltip:{mode:'index'}}, scales:{y:{beginAtZero:true}}}
    });
  });
}
initLoan();

/* -------------------------
   Small accessible dropdown keyboard fix
   -------------------------*/
$$('.dropbtn').forEach(btn => {
  btn.addEventListener('keydown', e=>{
    if(e.key === 'Enter' || e.key === ' ') btn.parentElement.classList.toggle('open');
  });
});

/* -------------------------
   Initialize example charts on load
   -------------------------*/
window.addEventListener('load', () => {
  initSalaryExample();
});
