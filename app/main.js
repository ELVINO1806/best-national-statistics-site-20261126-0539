// Angka Nusantara — page behaviour. Runs on every page: the mobile menu,
// the summary-page search filter, the chart toggles, and the one sortable
// table. Charts are drawn by charts.js from the data in data.js.
import { barChart, lineChart, rankBars } from './charts.js';
import {
  POPULATION_SERIES,
  PROVINCES,
  GDP_GROWTH_SERIES,
  INFLATION_SERIES,
  STUNTING_SERIES,
  SCHOOLING_SERIES,
  EXPECTED_SCHOOLING_SERIES,
  PISA_SCORES,
} from './data.js';

const page = document.body.dataset.page || 'summary';
const oneDecimal = (v) => v.toFixed(1);
const withPct = (v) => `${v.toFixed(1)}%`;
const withMillion = (v) => `${v.toFixed(1)}m`;

// --- Mobile menu -----------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close menu' : 'Menu';
  });
}

// --- Summary page: live filter over the stat cards -------------------------
const filterInput = document.getElementById('statFilter');
if (filterInput) {
  const cards = [...document.querySelectorAll('.stat-card')];
  const emptyNote = document.getElementById('filterEmpty');
  filterInput.addEventListener('input', () => {
    const q = filterInput.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const hit = q === '' || card.textContent.toLowerCase().includes(q);
      card.hidden = !hit;
      if (hit) shown++;
    }
    if (emptyNote) emptyNote.hidden = shown !== 0;
  });
}

// --- Chart helpers ---------------------------------------------------------
function drawInto(id, svg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = svg;
}

function setPressed(group, activeButton) {
  for (const b of group.querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b === activeButton));
  }
}

// A toggle group: buttons carry data-view, and the handler redraws the
// chart named by the group's data-chart-for with the chosen dataset.
function wireToggle(groupId, render) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    setPressed(group, button);
    render(button.dataset.view);
  });
}

// --- Population page -------------------------------------------------------
if (page === 'population') {
  const toPoints = (series) => series.map((d) => ({ label: String(d.year), value: d.value }));
  const renderPopulation = (view) => {
    if (view === 'growth') {
      const growth = POPULATION_SERIES.slice(1).map((d, i) => ({
        label: String(d.year),
        value: ((d.value - POPULATION_SERIES[i].value) / POPULATION_SERIES[i].value) * 100,
      }));
      drawInto(
        'populationChart',
        barChart(growth, { title: 'Yearly population growth, percent', format: withPct, color: '#b45309' }),
      );
    } else {
      drawInto(
        'populationChart',
        lineChart(toPoints(POPULATION_SERIES), { title: 'Population of Indonesia, millions', format: withMillion }),
      );
    }
  };
  renderPopulation('total');
  wireToggle('populationToggle', renderPopulation);
  drawInto(
    'provinceChart',
    rankBars(PROVINCES.map((p) => ({ name: p.name, value: p.value })), {
      title: 'Largest provinces by population, millions',
      format: withMillion,
    }),
  );

  // Sortable province table: one button flips between largest-first and
  // smallest-first. The table body is rebuilt from the data each time.
  const sortButton = document.getElementById('provinceSort');
  const provinceBody = document.getElementById('provinceBody');
  let ascending = false;
  const renderProvinces = () => {
    const rows = [...PROVINCES].sort((a, b) => (ascending ? a.value - b.value : b.value - a.value));
    provinceBody.innerHTML = rows
      .map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.value.toFixed(1)}</td></tr>`)
      .join('');
    sortButton.textContent = ascending ? 'Sort: smallest first (click for largest)' : 'Sort: largest first (click for smallest)';
  };
  if (sortButton && provinceBody) {
    renderProvinces();
    sortButton.addEventListener('click', () => {
      ascending = !ascending;
      renderProvinces();
    });
  }
}

// --- Economy page ----------------------------------------------------------
if (page === 'economy') {
  const toPoints = (series) => series.map((d) => ({ label: String(d.year), value: d.value }));
  const renderEconomy = (view) => {
    if (view === 'inflation') {
      drawInto(
        'economyChart',
        barChart(toPoints(INFLATION_SERIES), { title: 'Consumer-price inflation, December year on year, percent', format: withPct, color: '#b45309' }),
      );
    } else {
      drawInto(
        'economyChart',
        barChart(toPoints(GDP_GROWTH_SERIES), { title: 'Real GDP growth, percent year on year', format: withPct }),
      );
    }
  };
  renderEconomy('growth');
  wireToggle('economyToggle', renderEconomy);
}

// --- Health page -----------------------------------------------------------
if (page === 'health') {
  const toPoints = (series) => series.map((d) => ({ label: String(d.year), value: d.value }));
  const renderStunting = (view) => {
    const chart =
      view === 'line'
        ? lineChart(toPoints(STUNTING_SERIES), { title: 'Children under five who are stunted, percent', format: withPct, color: '#b3402a' })
        : barChart(toPoints(STUNTING_SERIES), { title: 'Children under five who are stunted, percent', format: withPct, color: '#b3402a' });
    drawInto('stuntingChart', chart);
  };
  renderStunting('bar');
  wireToggle('stuntingToggle', renderStunting);
}

// --- Education page --------------------------------------------------------
if (page === 'education') {
  const toPoints = (series) => series.map((d) => ({ label: String(d.year), value: d.value }));
  const renderSchooling = (view) => {
    if (view === 'expected') {
      drawInto(
        'schoolingChart',
        lineChart(toPoints(EXPECTED_SCHOOLING_SERIES), { title: 'Expected years of schooling', format: oneDecimal, color: '#b45309' }),
      );
    } else {
      drawInto(
        'schoolingChart',
        lineChart(toPoints(SCHOOLING_SERIES), { title: 'Mean years of schooling, people aged 25 and over', format: oneDecimal }),
      );
    }
  };
  renderSchooling('mean');
  wireToggle('schoolingToggle', renderSchooling);
  drawInto(
    'pisaChart',
    barChart(PISA_SCORES.map((s) => ({ label: s.subject, value: s.value })), {
      title: 'PISA 2022 scores, 15-year-olds',
      format: (v) => String(Math.round(v)),
      color: '#1b5e3b',
    }),
  );
}
