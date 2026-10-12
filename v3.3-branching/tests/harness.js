// Minimal AI Dungeon scripting sandbox for the tracker library
const fs = require("fs");
const vm = require("vm");

function makeSandbox(libPath) {
  const lib = fs.readFileSync(libPath, "utf8");
  const logs = [];
  const sb = { state: {}, history: [], info: { actionCount: 0, maxChars: 0 }, log: (m) => { logs.push(String(m)); if (/Tracker error/.test(String(m))) { console.log("SCRIPT ERROR:", m); process.exitCode = 1; } }, console };
  vm.createContext(sb);
  vm.runInContext(lib, sb);
  const run = (hook, text) => { sb.state = JSON.parse(JSON.stringify(sb.state)); return vm.runInContext("Tracker", sb)(hook, text); };
  return { sb, run };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmt = (i) => MONTHS[i % 12] + " " + Math.floor(i / 12);
const idxOf = (month, year) => year * 12 + (MONTHS.indexOf(month));

// One full turn: input -> context -> output. `action` is the raw player text as AI Dungeon hands it to the input hook
// (e.g. "\n> You 2 years pass.\n"), or null for a Continue. `aiText` is what the AI wrote.
function playTurn(h, action, aiText, opts = {}) {
  const { sb, run } = h;
  sb.info.actionCount += 1;
  let inText = null;
  if (action !== null) {
    const r = run("input", action);
    inText = r[0];
    sb.history.push({ text: inText, type: /^\s*>\s*You say/.test(action) ? "say" : /^\s*>/.test(action) ? "do" : "story" });
    sb.story = (sb.story || "") + inText;
  } else {
    // a Continue: the last history entry is the AI's own text
  }
  const pe = opts.plotEssentials || "";
  const an = opts.authorsNote || "[Author's note: Style: grounded.]";
  const ctx = pe + "\n\nRecent Story:\n" + (sb.story || "").slice(-8000) + "\n" + an + "\n";
  const c = run("context", ctx);
  const o = run("output", aiText);
  const outText = o[0];
  sb.history.push({ text: outText, type: "continue" });
  sb.story = (sb.story || "") + outText;
  return { inText, ctx: c[0], out: outText, idx: sb.state.tracker.idx, date: fmt(sb.state.tracker.idx) };
}

module.exports = { makeSandbox, playTurn, fmt, idxOf, MONTHS };
