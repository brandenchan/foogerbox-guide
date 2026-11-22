// FoogerBox guide data and panel drawings, shared by the guide app
// (docs/index.html) and the README images (docs/build_images.js).
// Knob values are positions 0..1; toggles are 0 up, 1 middle, 2 down.
// Readouts use the Moog MF-101S / MF-103S plugins' own units.
(function (root) {
  // Which pedal this guide describes. "filter": the filter edition (the
  // firmware's default build; switch 1 and the right footswitch unused).
  // "full": filter, phaser and ring mod on switch 1 (make EDITION=full).
  const EDITION = "filter";
  const SHOWN = EDITION === "full" ? ["filter", "phaser", "ring"] : ["filter"];
  const COL = {filter: "var(--filter)", phaser: "var(--phaser)", ring: "var(--ring)"};
  const DIAL = [20, 20.02, 20.71, 24.85, 39.01, 74.8, 150.12, 290.33, 529.27, 910.37, 1487.57, 2326.34, 3504.62, 5113.68, 7259.09, 10061.52, 13657.64];
  const hz = f => f >= 1000 ? (f / 1000).toFixed(f >= 10000 ? 0 : 1) + " kHz" : (f >= 10 ? Math.round(f) : f.toFixed(f >= 1 ? 1 : 2)) + " Hz";
  const hzShort = f => f >= 1000 ? (f / 1000).toFixed(1).replace(/\.0$/, "") + "k" : (f >= 10 ? Math.round(f) : f.toFixed(1)) + "";
  const sgn = (d, unit) => Math.abs(d) < 0.05 ? "0" + unit : (d > 0 ? "+" : "−") + Math.abs(d).toFixed(Math.abs(d) < 10 ? 1 : 0).replace(/\.0$/, "") + unit;
  const db21 = k => sgn((2 * k - 1) * 21, " dB");
  const ten = k => (k * 10).toFixed(1).replace(/\.0$/, "");
  const cutoff = k => { const x = k * 16, i = Math.min(15, Math.floor(x)), t = x - i; return hz(Math.exp(Math.log(DIAL[i]) * (1 - t) + Math.log(DIAL[i + 1]) * t)); };
  const ringOct = (k, r) => { const L = Math.log2; const lo = L(0.6) + (L(30) - L(0.6)) * r, hi = L(80) + (L(4000) - L(80)) * r; return [lo, hi, lo + (hi - lo) * k]; };
  const lvl = k => sgn(k < 0.5 ? (k - 0.5) * 48 : (k - 0.5) * 12, " dB");

  const FX = {
    filter: {name: "Filter", sub: "MF-101 style", t1: 0, short: ["DRIVE", "CUTOFF", "RESONANCE", "ENVELOPE", "MIX", "OUTPUT"],
      t: [["ENV SPEED", ["SMOOTH", "MEDIUM", "FAST"]], ["TYPE", ["4-POLE", "2-POLE", "BANDPASS"]]],
      fmt: [db21, cutoff, ten, k => Math.abs(2 * k - 1) < 0.01 ? "OFF" : sgn((2 * k - 1) * 10, ""), ten, db21],
      blurb: "A resonant Moog ladder filter with an envelope: warm tone shaping, auto-wah that follows your playing, and saturated growl.",
      tap: "Not used", led: "Glows with your playing (the envelope)",
      ctl: [["Knob 1", "Drive", "How hard you hit the filter. Adds grit and volume, and makes the envelope react more. 0 dB at noon."],
        ["Knob 2", "Cutoff", "Brightness. Left is dark and bassy, right wide open. Most of the action is between 9 and 3 o'clock."],
        ["Knob 3", "Resonance", "A singing peak at the cutoff. Subtle below 3, vocal around 5-7, whistles on its own from about 9."],
        ["Knob 4", "Envelope", "Off at noon. Right: playing harder opens the filter (wah). Left: playing harder closes it."],
        ["Knob 5", "Mix", "Dry (left) to all filter (right). Halfway keeps your low end solid under the effect."],
        ["Knob 6", "Output", "Volume, 0 dB at noon. Match bypass after changing drive."],
        ["Switch 2", "Envelope speed", "Up smooth, middle medium, down fast."],
        ["Switch 3", "Filter type", "Up 4-pole (deep, smooth), middle 2-pole (brighter, vocal), down bandpass (thin, quacky)."]]},
    phaser: {name: "Phaser", sub: "MF-103 style", t1: 1, short: ["DRIVE", "SWEEP", "RESONANCE", "LFO AMOUNT", "RATE", "OUTPUT"],
      t: [["LFO RANGE", ["LO", "HI", "LFO OFF"]], ["STAGES", ["6", "12", "12 INVERT"]]],
      fmt: [db21, ten, ten, ten, (k, p) => p.t[0] === 2 ? "—" : hz((p.t[0] ? 1 : 0.01) + ((p.t[0] ? 250 : 2.5) - (p.t[0] ? 1 : 0.01)) * k ** 3), db21],
      blurb: "A 6 or 12-stage phaser: slow swirls, deep jet sweeps, rotary-speaker warble and audio-rate grit.",
      tap: "Sets the rate (knob 5)", led: "Blinks with the sweep",
      ctl: [["Knob 1", "Drive", "Input level into the phaser. Above noon it adds warmth and grit."],
        ["Knob 2", "Sweep", "Where the notches sit: low is throaty, high is airy. With the LFO off, this is the sound."],
        ["Knob 3", "Resonance", "Sharper, more vocal peaks between the notches."],
        ["Knob 4", "LFO amount", "How far the sweep moves. Fully left it stands still."],
        ["Knob 5", "Rate", "Speed of the sweep: 0.01-2.5 Hz on Lo, 1-250 Hz on Hi. Tap tempo overrides it."],
        ["Knob 6", "Output", "Volume, 0 dB at noon. Runs louder than bypass: start around 10 o'clock."],
        ["Switch 2", "LFO range", "Up Lo (slow), middle Hi (fast, up to audio rate), down LFO off (a fixed notch)."],
        ["Switch 3", "Stages", "Up 6 (classic), middle 12 (deeper), down 12 with inverted resonance (hollow)."]]},
    ring: {name: "Ring mod", sub: "MF-102 style", t1: 2, short: ["DRIVE", "FREQUENCY", "MIX", "LFO AMOUNT", "LFO RATE", "OUTPUT"],
      t: [["RANGE", ["LO", "HI", "HI"]], ["LFO WAVE", ["SINE", "SQUARE", "TRIANGLE"]]],
      fmt: [db21, (k, p) => { const r = p.t[0] === 0 ? [0.6, 80] : [30, 4000]; return hz(r[0] + (r[1] - r[0]) * k ** 3); }, ten, ten,
        k => hz(0.1 + 24.9 * k ** 3), db21],
      blurb: "Multiplies your sound with a second tone: choppy tremolo, bells, clang and talking robots.",
      tap: "Sets the LFO rate (knob 5)", led: "Blinks with the LFO",
      ctl: [["Knob 1", "Drive", "Input level into the ring modulator. Above noon it adds grit. 0 dB at noon."],
        ["Knob 2", "Frequency", "Pitch of the second tone (the carrier). Low settings chop, high settings clang."],
        ["Knob 3", "Mix", "Dry (left) to all ring mod (right). The dry sound stays strong until past noon."],
        ["Knob 4", "LFO amount", "How far the LFO bends the carrier's pitch, up to an octave either way. Fully left is off."],
        ["Knob 5", "LFO rate", "Speed of the wobble, 0.1-25 Hz. Tap tempo overrides it."],
        ["Knob 6", "Output", "Volume, 0 dB at noon."],
        ["Switch 2", "Range", "Up Lo: 0.6-80 Hz, a choppy tremolo. Middle or down Hi: 30 Hz-4 kHz, bells and robots."],
        ["Switch 3", "LFO waveform", "Up sine, middle square (jumps between two pitches), down triangle."]]},
  };

  // Levels were set on a bass line (and strummed chords for the Omnichord
  // preset) to land near bypass volume; see docs/EXPERIMENTS.md.
  const PRESETS = [
    {id: "bass-auto-wah", fx: "filter", name: "Bass auto-wah", for: "Bass, guitar", k: [0.65, 0.37, 0.6, 0.85, 1, 0.44], t: [1, 1], text: "The classic envelope filter: each note blooms open and closes as it fades.", tip: "Drive sets how far it opens. Sticks open: less. Barely moves: more."},
    {id: "synth-strum", fx: "filter", name: "Synth strum", for: "Omnichord, keys", k: [0.65, 0.42, 0.65, 1, 1, 0.42], t: [0, 0], text: "Every strum opens a resonant filter like a synth's filter envelope, then it settles as the chord rings out.", tip: "If it stays bright between strums, turn drive down a little."},
    {id: "funk-quack", fx: "filter", name: "Funk quack", for: "Bass, funk guitar", k: [0.65, 0.42, 0.55, 0.85, 1, 0.62], t: [2, 2], text: "A tight vocal quack on every pluck. Made for slap and staccato lines.", tip: "Dig in: the harder you play, the bigger the quack."},
    {id: "synth-squelch", fx: "filter", name: "Synth squelch", for: "Bass, synth lines", k: [0.62, 0.34, 0.72, 0.9, 1, 0.45], t: [2, 0], text: "Resonant and rubbery: every note snaps the filter open like a synth-bass envelope.", tip: "More resonance is wilder, but past about 8 it whistles between notes."},
    {id: "grind", fx: "filter", name: "Grind", for: "Bass, synth lines", k: [0.85, 0.5, 0.35, 0.5, 1, 0.2], t: [0, 0], text: "Saturated and dark: a fuzzy synth-bass growl.", tip: "Drive adds a lot of volume; keep output low."},
    {id: "telephone", fx: "filter", name: "Telephone", for: "Any", k: [0.62, 0.6, 0.5, 0.5, 1, 0.47], t: [0, 2], text: "Thin, mid-focused and a little gritty, like an old radio or a phone line. No movement.", tip: "Cutoff moves the band. On chords, bring output down a touch."},
    {id: "slow-swirl", fx: "phaser", name: "Slow swirl", for: "Omnichord, keys, guitar", k: [0.5, 0.5, 0.4, 0.6, 0.3, 0.33], t: [0, 0], text: "The classic: a gentle, wide phase that turns over every 12 seconds.", tip: "Raise the rate for more motion; noon is about one sweep in 3 seconds."},
    {id: "deep-12-stage", fx: "phaser", name: "Deep 12-stage", for: "Guitar, bass", k: [0.5, 0.45, 0.7, 0.8, 0.35, 0.36], t: [0, 1], text: "Twice the stages: a deeper, more dramatic jet sweep.", tip: "Resonance makes it more vocal; above 8 it gets intense."},
    {id: "rotary-warble", fx: "phaser", name: "Rotary warble", for: "Omnichord, keys, guitar", k: [0.5, 0.55, 0.35, 0.45, 0.25, 0.33], t: [1, 0], text: "A fast shimmer, about 5 Hz, like a spinning speaker.", tip: "Rate a little lower for a slow-speed chorale."},
    {id: "fixed-notch", fx: "phaser", name: "Fixed notch", for: "Bass, guitar", k: [0.55, 0.6, 0.65, 0, 0.5, 0.33], t: [2, 1], text: "No movement: a fixed nasal tone, like a wah pedal left half down.", tip: "Sweep picks the vowel."},
    {id: "tap-tempo-throb", fx: "phaser", name: "Tap-tempo throb", for: "Any", k: [0.5, 0.5, 0.6, 0.9, 0.6, 0.29], t: [0, 2], text: "A deep, hollow pulse locked to the song.", tip: "Tap the right footswitch on the beat; the sweep follows your taps."},
    {id: "audio-rate-grit", fx: "phaser", name: "Audio-rate grit", for: "Guitar, noise", k: [0.6, 0.5, 0.5, 0.5, 0.7, 0.26], t: [1, 0], text: "The sweep runs at audio rate: metallic, ring-mod-like overtones.", tip: "Turn the rate knob slowly for sci-fi effects."},
    {id: "choppy-tremolo", fx: "ring", name: "Choppy tremolo", for: "Guitar, Omnichord", k: [0.5, 0.408, 0.6, 0, 0.3, 0.48], t: [0, 0], text: "A low carrier chops the sound into a stuttering tremolo.", tip: "Frequency sets the chop speed."},
    {id: "metallic-bell", fx: "ring", name: "Metallic bell", for: "Omnichord, single notes", k: [0.5, 0.47, 0.7, 0, 0.3, 0.51], t: [1, 0], text: "Clangorous, bell-like overtones. Try slow single notes.", tip: "Every note gives a different chime: that is the charm."},
    {id: "robot-wobble", fx: "ring", name: "Robot wobble", for: "Bass, voice", k: [0.5, 0.287, 1, 0.32, 0.287, 0.49], t: [1, 0], text: "A talking-robot tone with a slow wobble.", tip: "LFO amount to zero for a steady robot."},
    {id: "two-note-warble", fx: "ring", name: "Two-note warble", for: "Guitar, effects", k: [0.5, 0.43, 0.8, 0.65, 0.354, 0.52], t: [1, 1], text: "The square LFO flips the carrier between two pitches: a sci-fi alarm.", tip: "Tap tempo locks the flips to the beat."},
  ];

  // Words shared by the app and the README, per edition.
  const TEXT_FULL = {
    lede: "Three classic Moog-style effects in one pedal: a filter, a phaser and a ring modulator. Switch 1 picks the effect; the knobs and the other two switches then shape it.",
    steps: ["Instrument into the right jack, amp from the left, 9 V in the middle.",
      "Press the left footswitch: the left LED lights, the effect is on.",
      "Flip switch 1 to pick filter, phaser or ring mod.",
      "Dial in a preset for that effect: the cards show every knob and switch.",
      "Match your bypass volume with knob 6."],
    legend: [["A", "Output", "to your amp"], ["B", "Power", "9 V DC, centre negative. Needed even when off."],
      ["C", "Input", "from your instrument"], ["D", "Knobs", "change with the effect. 1 is drive, 6 is output."],
      ["E", "Switch 1", "the effect: up filter, middle phaser, down ring mod"], ["F", "Switches 2 and 3", "options for that effect"],
      ["G", "Left LED", "effect on"], ["H", "Right LED", "envelope or sweep"],
      ["I", "Left footswitch", "on / off"], ["J", "Right footswitch", "tap tempo"]],
    tips: [["Drive sets the wah's reach.", "Filter stays open: less drive. Barely moves: more drive."],
      ["Whistling? Less resonance.", "From about 9 the filter sings on its own. Usable, but loud."],
      ["Hot sources need less drive.", "Line-level gear like an Omnichord hits harder than a guitar. Start drive below noon."],
      ["The phaser runs hot.", "Wet and dry add up. Start its output around 10 o'clock."],
      ["Tap to sync.", "Two or more taps on the right footswitch set the phaser or ring mod speed. Turn the rate knob to take over again."],
      ["LEDs flashing, no sound? Replug.", "Holding the left footswitch for 2 seconds enters update mode. Unplug the power and plug it back in."],
      ["The knobs are the memory.", "Nothing is saved. Photograph a setting you like."],
      ["Lo range chops, Hi range rings.", "Below about 20 Hz the ring mod is a choppy tremolo; above, it makes new, clangy pitches."]],
    about: "FoogerBox firmware for the Cleveland Music Co. Hothouse. The filter and phaser are tuned against Moog's MF-101S and MF-103S plugins, and the figures on the preset cards read in those plugins' units. Inspired by the Moogerfooger MF-101, MF-102 and MF-103; not affiliated with Moog Music. Moog and Moogerfooger are trademarks of Moog Music Inc.",
  };

  const TEXT_FILTER = {
    lede: "A classic Moog-style filter in a pedal: a resonant ladder filter with an envelope that follows your playing. More effects are coming in a later update.",
    steps: ["Instrument into the right jack, amp from the left, 9 V in the middle.",
      "Press the left footswitch: the left LED lights, the filter is on.",
      "Dial in a preset: the cards show every knob and switch.",
      "Play harder and softer: the right LED glows with the envelope.",
      "Match your bypass volume with knob 6."],
    legend: [["A", "Output", "to your amp"], ["B", "Power", "9 V DC, centre negative. Needed even when off."],
      ["C", "Input", "from your instrument"], ["D", "Knobs", "the filter's six controls"],
      ["E", "Switch 1", "not used yet"], ["F", "Switches 2 and 3", "envelope speed and filter type"],
      ["G", "Left LED", "filter on"], ["H", "Right LED", "glows with your playing"],
      ["I", "Left footswitch", "on / off"], ["J", "Right footswitch", "not used yet"]],
    tips: [["Drive sets the wah's reach.", "Filter stays open: less drive. Barely moves: more drive."],
      ["Whistling? Less resonance.", "From about 9 the filter sings on its own. Usable, but loud."],
      ["Hot sources need less drive.", "Line-level gear like an Omnichord hits harder than a guitar. Start drive below noon."],
      ["LEDs flashing, no sound? Replug.", "Holding the left footswitch for 2 seconds enters update mode. Unplug the power and plug it back in."],
      ["The knobs are the memory.", "Nothing is saved. Photograph a setting you like."],
      ["Spare controls.", "Switch 1 and the right footswitch do nothing yet. They are kept for effects coming in a later update."]],
    about: "FoogerBox firmware for the Cleveland Music Co. Hothouse. The filter is tuned against Moog's MF-101S plugin, and the figures on the preset cards read in its units. Inspired by the Moogerfooger MF-101; not affiliated with Moog Music. Moog and Moogerfooger are trademarks of Moog Music Inc.",
  };
  const TEXT = EDITION === "full" ? TEXT_FULL : TEXT_FILTER;

  const KX = [70, 160, 250], KY = [120, 240], TY = 352, FSX = [80, 240];
  const rad = a => a * Math.PI / 180;
  const r1 = v => Math.round(v * 10) / 10;
  function knob(x, y, k, label, val, col) {
    let s = "";
    for (let i = 0; i <= 10; i++) {
      const a = rad(-150 + 30 * i), q0 = i % 5 ? 33 : 31, q1 = 38;
      s += `<line class="dm" x1="${r1(x + q0 * Math.sin(a))}" y1="${r1(y - q0 * Math.cos(a))}" x2="${r1(x + q1 * Math.sin(a))}" y2="${r1(y - q1 * Math.cos(a))}"/>`;
    }
    s += `<circle class="kb" cx="${x}" cy="${y}" r="26"/><circle class="dm" cx="${x}" cy="${y}" r="18"/>`;
    const a = rad(-150 + 300 * (k == null ? 0.5 : k));
    s += `<line class="pt${k == null ? " idle" : ""}" x1="${r1(x + 7 * Math.sin(a))}" y1="${r1(y - 7 * Math.cos(a))}" x2="${r1(x + 24 * Math.sin(a))}" y2="${r1(y - 24 * Math.cos(a))}"/>`;
    s += `<text class="lb" x="${x}" y="${y + 52}" text-anchor="middle">${label}</text>`;
    if (val) s += `<text class="vl" x="${x}" y="${y + 69}" text-anchor="middle" style="fill:${col}">${val}</text>`;
    return s;
  }
  function toggle(x, y, pos, label, val, col, unused) {
    const dy = pos == null ? 0 : [-20, 0, 20][pos];
    let s = `<rect class="dm" x="${x - 9}" y="${y - 28}" width="18" height="56" rx="9"/><circle class="${unused ? "dm" : "ln"}" cx="${x}" cy="${y}" r="9"/>`;
    s += `<line class="pt${unused ? " idle" : ""}" x1="${x}" y1="${y}" x2="${x}" y2="${y + dy}"/><circle class="ball${unused ? " idle" : ""}" cx="${x}" cy="${y + dy}" r="6.5"/>`;
    s += `<text class="lb" x="${x}" y="${y + 50}" text-anchor="middle">${label}</text>`;
    if (val) s += `<text class="vl" x="${x}" y="${y + 67}" text-anchor="middle" style="fill:${col}">${val}</text>`;
    return s;
  }
  const badge = (x, y, t) => `<circle class="bd" cx="${x}" cy="${y}" r="11"/><text class="bt" x="${x}" y="${y + 4.5}" text-anchor="middle">${t}</text>`;

  // The pedal face. fx null = the whole pedal with lettered parts (A-J);
  // otherwise the control panel of one effect, with a preset p set on it.
  function face(fx, p, full) {
    const F = fx && FX[fx], col = fx ? COL[fx] : "var(--ink)";
    let s = `<rect class="ln" x="20" y="40" width="280" height="540" rx="18"/>`;
    if (full) {
      // Top-mounted jacks seen from the front: a flat nut on the top edge.
      s += [70, 250].map(x => `<rect class="ln" x="${x - 20}" y="31" width="40" height="9" rx="2"/><rect class="dm" x="${x - 12}" y="26" width="24" height="5" rx="1"/>`).join("");
      s += `<rect class="ln" x="149" y="32" width="22" height="8" rx="2"/>`;
      s += `<text class="sm" x="70" y="64" text-anchor="middle">OUT</text><text class="sm" x="160" y="64" text-anchor="middle">9V DC</text><text class="sm" x="250" y="64" text-anchor="middle">IN</text>`;
    }
    for (let i = 0; i < 6; i++) {
      const x = KX[i % 3], y = KY[i < 3 ? 0 : 1];
      s += knob(x, y, p ? p.k[i] : null, F ? F.short[i] : "KNOB " + (i + 1), p ? F.fmt[i](p.k[i], p) : "", col);
    }
    if (EDITION === "full") s += toggle(KX[0], TY, F ? F.t1 : null, F ? "EFFECT" : "SWITCH 1", F ? F.name.toUpperCase() : "", col);
    else s += toggle(KX[0], TY, null, "SWITCH 1", F ? "NOT USED" : "", "var(--dim)", true);
    for (let j = 0; j < 2; j++) {
      const pos = p ? p.t[j] : null, T = F && F.t[j];
      s += toggle(KX[j + 1], TY, pos, T ? T[0] : "SWITCH " + (j + 2), p && T ? T[1][pos] : "", col);
    }
    if (full) {
      s += `<circle class="glow" cx="${FSX[0]}" cy="452" r="13"/><circle class="led" cx="${FSX[0]}" cy="452" r="6"/><circle class="dm" cx="${FSX[1]}" cy="452" r="6"/>`;
      s += FSX.map(x => `<circle class="fs" cx="${x}" cy="520" r="26"/>`).join("");
      s += badge(34, 24, "A") + badge(134, 26, "B") + badge(286, 24, "C") + badge(300, 182, "D") + badge(34, 352, "E") + badge(288, 352, "F") + badge(56, 452, "G") + badge(264, 452, "H") + badge(118, 552, "I") + badge(202, 552, "J");
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 600">${s}</svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 72 300 352">${s}</svg>`;
  }

  // Panel drawing styles, for use inside a standalone SVG file.
  const SVG_STYLE = `.ln{stroke:var(--ink);fill:none;stroke-width:2}.fs{stroke:var(--ink);fill:none;stroke-width:2.5}.dm{stroke:var(--dim);fill:none;stroke-width:1.3}.kb{fill:#221d18;stroke:var(--ink);stroke-width:2}.pt{stroke:var(--ink);stroke-width:3.5;stroke-linecap:round}.pt.idle{stroke:var(--dim)}.ball{fill:var(--ink)}.ball.idle{fill:var(--dim)}.lb{font:600 14px "Barlow Semi Condensed","Arial Narrow",Arial,sans-serif;fill:var(--ink);letter-spacing:.03em}.sm{font:500 13px "Barlow Semi Condensed","Arial Narrow",Arial,sans-serif;fill:var(--dim);letter-spacing:.03em}.vl{font:600 14px "Barlow Semi Condensed","Arial Narrow",Arial,sans-serif}.bd{fill:var(--led)}.bt{font:600 13px Barlow,Arial,sans-serif;fill:#fff}.led{fill:var(--led)}.glow{fill:var(--led);opacity:.25}`;
  const PALETTE = {"--ink": "#efe4cc", "--dim": "#a3967f", "--led": "#ff4a2e", "--filter": "#f3a541", "--phaser": "#5cc8ab", "--ring": "#b9a2ff", "--bg": "#14110e"};

  const api = {EDITION, SHOWN, FX, PRESETS, TEXT, COL, face, SVG_STYLE, PALETTE};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FoogerBox = api;
})(this);
