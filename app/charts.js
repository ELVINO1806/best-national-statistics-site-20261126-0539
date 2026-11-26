// Angka Nusantara — chart builders. Every chart on the site is an inline
// SVG built here from the data in data.js. No chart library, no network.

// Escape text that goes inside SVG markup.
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Shared frame: viewBox scales to any width, so the same SVG works on a
// phone and on a desktop. Returns the opening tag plus a <title>.
function frame(width, height, title) {
  return (
    `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}" ` +
    `preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">` +
    `<title>${esc(title)}</title>`
  );
}

const AXIS = '#8a8378';
const GRID = '#e3ddd0';
const LABEL = '#57534a';

// A vertical bar chart. `points` is [{label, value}]. `format` turns a
// value into its axis label. Bars below zero (the 2020 GDP dip) hang down
// from the zero line instead of up from it.
export function barChart(points, options) {
  const width = options.width || 640;
  const height = options.height || 320;
  const color = options.color || '#1b5e3b';
  const negColor = options.negColor || '#b3402a';
  const format = options.format || ((v) => String(v));
  const padL = 52;
  const padR = 12;
  const padT = 30;
  const padB = 34;
  const values = points.map((p) => p.value);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const zeroY = padT + ((max - 0) / span) * plotH;
  const slot = plotW / points.length;
  const barW = Math.min(44, slot * 0.62);
  let out = frame(width, height, options.title || 'Bar chart');
  // Gridlines and value labels on the left.
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const v = min + (span * t) / ticks;
    const y = padT + ((max - v) / span) * plotH;
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
    out += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="${LABEL}">${esc(format(v))}</text>`;
  }
  out += `<line x1="${padL}" y1="${zeroY.toFixed(1)}" x2="${width - padR}" y2="${zeroY.toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  points.forEach((p, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    const y = p.value >= 0 ? padT + ((max - p.value) / span) * plotH : zeroY;
    const h = Math.abs(p.value) / span * plotH;
    const fill = p.value >= 0 ? color : negColor;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(h, 1).toFixed(1)}" rx="3" fill="${fill}"><title>${esc(p.label)}: ${esc(format(p.value))}</title></rect>`;
    out += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#1c1917">${esc(format(p.value))}</text>`;
    out += `<text x="${(x + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="12" fill="${LABEL}">${esc(p.label)}</text>`;
  });
  return out + '</svg>';
}

// A line chart with dots and a soft area fill under the line.
export function lineChart(points, options) {
  const width = options.width || 640;
  const height = options.height || 320;
  const color = options.color || '#1b5e3b';
  const format = options.format || ((v) => String(v));
  const padL = 52;
  const padR = 18;
  const padT = 30;
  const padB = 34;
  const values = points.map((p) => p.value);
  let max = Math.max(...values);
  let min = Math.min(...values);
  if (max === min) {
    max += 1;
    min -= 1;
  }
  const pad = (max - min) * 0.12;
  max += pad;
  min -= pad;
  const span = max - min;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const xAt = (i) => padL + (plotW * i) / (points.length - 1 || 1);
  const yAt = (v) => padT + ((max - v) / span) * plotH;
  let out = frame(width, height, options.title || 'Line chart');
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const v = min + (span * t) / ticks;
    const y = yAt(v);
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
    out += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="${LABEL}">${esc(format(v))}</text>`;
  }
  const line = points.map((p, i) => `${xAt(i).toFixed(1)},${yAt(p.value).toFixed(1)}`).join(' ');
  const area = `${padL},${(height - padB).toFixed(1)} ${line} ${xAt(points.length - 1).toFixed(1)},${(height - padB).toFixed(1)}`;
  out += `<polygon points="${area}" fill="${color}" opacity="0.12"/>`;
  out += `<polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  points.forEach((p, i) => {
    out += `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(p.value).toFixed(1)}" r="4" fill="#fffdf8" stroke="${color}" stroke-width="2.5"><title>${esc(p.label)}: ${esc(format(p.value))}</title></circle>`;
    out += `<text x="${xAt(i).toFixed(1)}" y="${(yAt(p.value) - 10).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#1c1917">${esc(format(p.value))}</text>`;
    out += `<text x="${xAt(i).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="12" fill="${LABEL}">${esc(p.label)}</text>`;
  });
  return out + '</svg>';
}

// A horizontal bar list for rankings, such as the largest provinces.
export function rankBars(rows, options) {
  const width = options.width || 640;
  const rowH = options.rowHeight || 44;
  const height = rows.length * rowH + 16;
  const color = options.color || '#1b5e3b';
  const format = options.format || ((v) => String(v));
  const max = Math.max(...rows.map((r) => r.value));
  const labelW = 150;
  const valueW = 64;
  let out = frame(width, height, options.title || 'Ranked bars');
  rows.forEach((r, i) => {
    const y = 8 + i * rowH;
    const barW = ((width - labelW - valueW - 16) * r.value) / max;
    out += `<text x="0" y="${y + 20}" font-size="13" font-weight="600" fill="#1c1917">${esc(r.name)}</text>`;
    out += `<rect x="${labelW}" y="${y + 6}" width="${Math.max(barW, 2).toFixed(1)}" height="18" rx="3" fill="${color}"><title>${esc(r.name)}: ${esc(format(r.value))}</title></rect>`;
    out += `<text x="${(labelW + barW + 8).toFixed(1)}" y="${y + 20}" font-size="13" font-weight="600" fill="#1c1917">${esc(format(r.value))}</text>`;
  });
  return out + '</svg>';
}
