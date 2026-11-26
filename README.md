# Angka Nusantara — Indonesia in Numbers

A static national statistics site for Indonesia, built for make.fun's
"Make the best national statistics site" bounty.

## What it is

Five pages, no build step, no network at runtime:

- **Summary** (`index.html`) — nine headline figures with a live search filter.
- **Population** — ten years of growth (total or growth-rate view), the five
  largest provinces with a sortable table, urban share, median age, fertility.
- **Economy** — GDP growth and inflation since 2015, GDP per person, exports,
  the policy rate, unemployment and poverty.
- **Health** — life expectancy, child mortality, stunting (bar or line view),
  health spending, doctors and beds.
- **Education** — years of schooling (mean or expected view), the education
  budget, literacy, enrolment and PISA 2022 scores.

Every figure carries its source and year right beside it — BPS (Statistics
Indonesia) for most national figures, plus the World Bank, the United Nations,
Bank Indonesia, the Ministry of Health, the Ministry of Finance, UNESCO and
the OECD. Where publishers disagree, the page names whose count you are
reading.

## How it works

- Charts are inline SVG drawn by `app/charts.js` from the figures in
  `app/data.js` — no chart library, no external fonts or images.
- `app/main.js` wires the mobile menu, the search filter, the chart toggles
  and the sortable province table.
- One stylesheet, `app/style.css`, covers desktop and phone layouts.
- The whole first load is a handful of small files (HTML, one CSS file and
  three small JS modules).

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
cd app && python3 -m http.server 8080
```

## Validation

Checked locally in headless Chromium before the entry was handed in:

- All five pages load with a clean console and no failed requests.
- Every navigation link returns its page; every toggle, the search filter,
  the sortable province table and the mobile menu were clicked and changed
  what they should.
- Phone layout (390 px wide) has no horizontal overflow.
- `main.ts` was run twice into two directories and the outputs were
  byte-identical.
- Four screenshots in `screenshots/`: desktop summary, desktop economy,
  desktop health and phone-size summary, all real renders of this site.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier`
from `vendor/makefun-frontend.ts` (the kit's copy, unchanged).

## License

MIT — see `LICENSE`.
