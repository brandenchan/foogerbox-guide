#!/usr/bin/env node
// Builds the user guide's static outputs from guide.js, the same data the
// guide app (index.html) renders, for the edition set in guide.js:
//   img/pedal.svg, img/panel-<effect>.svg, img/presets/<id>.svg
//   README.md (the user guide, for GitHub)
// Images get the panel's dark background and inlined colours so they read on
// GitHub in light and dark mode.  Run after editing guide.js:
//   node build_docs.js
const fs = require("fs");
const path = require("path");
const {EDITION, SHOWN, FX, PRESETS, TEXT, face, SVG_STYLE, PALETTE} = require("./guide.js");

const DOCS = __dirname, ROOT = __dirname;
const APP = "https://brandenchan.github.io/foogerbox-guide/";
const shown = PRESETS.filter(p => SHOWN.includes(p.fx));

function standalone(svg) {
  const [, x, y, w, h] = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/).map(Number);
  const s = svg.replace(/<svg ([^>]*)>/, (m, attrs) =>
    `<svg ${attrs} width="${w}" height="${h}"><style>${SVG_STYLE}</style>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="var(--bg)"/>`);
  return s.replace(/var\((--[a-z0-9]+)\)/g, (m, name) => PALETTE[name] || m) + "\n";
}

fs.rmSync(path.join(DOCS, "img"), {recursive: true, force: true});  // drop images of removed presets or effects
fs.mkdirSync(path.join(DOCS, "img", "presets"), {recursive: true});
const img = (file, svg) => fs.writeFileSync(path.join(DOCS, "img", file), standalone(svg));
img("pedal.svg", face(null, null, true));
for (const fx of SHOWN) img(`panel-${fx}.svg`, face(fx, null, false));
for (const p of shown) img(`presets/${p.id}.svg`, face(p.fx, p, false));

// README.md: the guide in GitHub's terms (Markdown and a little HTML).
const SW1 = ["up", "middle", "down"];
const cell = p => `<td valign="top" width="50%"><b>${p.name}</b><br><sub>${p.for}</sub><br><br>${p.text}<br><br>` +
  `<img src="img/presets/${p.id}.svg" width="300" alt="${p.name}: panel settings"><br><sub>${p.tip}</sub></td>`;
const pairs = list => list.reduce((rows, p, i) => (i % 2 ? rows[rows.length - 1].push(p) : rows.push([p]), rows), []);
const md = [];
md.push(`# FoogerBox`, ``,
  TEXT.lede.replace(/\ba (filter|phaser|ring modulator)\b/g, "a **$1**") + ` Built on the Cleveland Music Co. Hothouse.`, ``,
  `**[Open the guide app](${APP})** · [PDF guide](FoogerBox-Guide.pdf)`, ``,
  `## In two minutes`, ``, ...TEXT.steps.map((t, i) => `${i + 1}. ${t}`), ``,
  `## The pedal`, ``,
  `<table><tr><td valign="top"><img src="img/pedal.svg" width="280" alt="The pedal with lettered parts"></td><td valign="top">`, ``,
  `| | | |`, `|-|-|-|`, ...TEXT.legend.map(([l, b, t]) => `| **${l}** | **${b}** | ${t} |`), ``,
  `</td></tr></table>`, ``);
for (const fx of SHOWN) {
  const F = FX[fx], list = PRESETS.filter(p => p.fx === fx);
  md.push(`## ${F.name}`, ``, `*${F.sub}*` + (EDITION === "full" ? ` · **Switch 1 ${SW1[F.t1]}**` : ""), ``, F.blurb, ``,
    `<img src="img/panel-${fx}.svg" width="300" alt="${F.name} controls">`, ``,
    `**Tap tempo:** ${F.tap}. **Right LED:** ${F.led}.`, ``,
    `| Control | | What it does |`, `|-|-|-|`, ...F.ctl.map(([c, n, t]) => `| ${c} | **${n}** | ${t} |`), ``,
    `### ${F.name} presets`, ``, `<table>`, ...pairs(list).map(r => `<tr>${r.map(cell).join("")}</tr>`), `</table>`, ``);
}
md.push(`## Good to know`, ``, ...TEXT.tips.flatMap(([h, t]) => [`**${h}**  `, `${t}`, ``]),
  `---`, ``, `<sub>${TEXT.about}</sub>`, ``,
  `<sub>This README, the images and the [guide app](${APP}) all come from \`guide.js\`; \`node build_docs.js\` regenerates the README and images.</sub>`, ``);
fs.writeFileSync(path.join(ROOT, "README.md"), md.join("\n"));
console.log(`${EDITION} edition: wrote ${1 + SHOWN.length + shown.length} images and README.md`);
