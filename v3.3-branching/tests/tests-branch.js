// Checks for v3.3 branching canon. usage: node tests-branch.js <library-v3.3.js> <library-v3.2.js> <plot-essentials.txt> <story-cards.json> <harness.js>
const fs = require("fs");
const [LIB, LIB32, PE_PATH, CARDS_PATH, HARNESS] = process.argv.slice(2);
const { makeSandbox, playTurn } = require(HARNESS);
const PE = fs.readFileSync(PE_PATH, "utf8").replace(/\$\{[^}]*\}/g, " ");
const CARDS = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
const opts = { plotEssentials: PE };
let fails = 0, oks = 0;
const check = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL:", name, extra === undefined ? "" : JSON.stringify(extra).slice(0, 400)); } else { oks++; console.log("ok   ", name); } };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TR = (h) => h.sb.state.tracker;
const dateOf = (h) => { const t = TR(h); return MONTHS[t.idx % 12] + " " + t.day + ", " + Math.floor(t.idx / 12); };
const UNDERWAY = "October 2004.\n\nThe sedan smells of new leather. You are four.\n" + "The city outside the tinted windows is a blur of brownstone buildings and yellow cabs. ".repeat(24);
const fresh = (lib) => { const h = makeSandbox(lib || LIB); h.sb.story = UNDERWAY; h.sb.info.maxChars = 64000; return h; };
const at = (date, lib) => { const h = fresh(lib); playTurn(h, "\n> /date " + date + "\n", "ignored", opts); return h; };
const turn = (h, action, reply) => playTurn(h, action === null ? null : "\n> " + action + "\n", reply, opts);
const PLAIN = "\nThe room is quiet.\n";
const note = (ctx) => (ctx.match(/\[Status \(for the narrator[^\n]*/) || [""])[0];
const section = (ctx, label, next) => { const s = note(ctx); const a = s.indexOf(label); if (a < 0) return ""; const rest = s.slice(a); const ends = next.map((x) => rest.indexOf(x, 1)).filter((x) => x > 0); return rest.slice(0, ends.length ? Math.min(...ends) : rest.length); };
const KILL_HL = "\nYou drive your fist through Homelander's skull. Homelander is dead.\n";

// 1. With nothing changed, the note is byte-identical between v3.2 and v3.3 (strict and branch alike)
{
  let same = 0, total = 0, firstDiff = null;
  const dates = ["March 15, 2006", "June 4, 2019", "June 23, 2019", "October 15, 2020", "June 9, 2022", "September 22, 2023", "January 6, 2025", "October 4, 2025", "April 5, 2026"];
  for (const d of dates) for (const scene of ["You look around.", "You find Butcher and Hughie at the electronics store while Homelander smiles on TV."]) {
    const a = note(turn(at(d, LIB32), scene, PLAIN).ctx), b = note(turn(at(d), scene, PLAIN).ctx);
    const c = at(d); turn(c, "/canon strict", "x"); const s = note(turn(c, scene, PLAIN).ctx);
    total++; if (a === b && a === s) same++; else if (!firstDiff) firstDiff = { d, scene, a: a.slice(0, 200), b: b.slice(0, 200) };
  }
  check("no changes: v3.3 note == v3.2 note in both modes (" + total + " cases)", same === total, firstDiff);
}
// 2. /canon command and default
{
  const h = at("June 4, 2019");
  turn(h, "/canon", "x");
  check("/canon reports branch by default", /^Canon mode: branch\./.test(h.sb.state.message), h.sb.state.message);
  turn(h, "/canon strict", "x");
  check("/canon strict switches", /^Canon mode: strict\./.test(h.sb.state.message) && TR(h).canon === "strict");
  turn(h, "/status", "x");
  check("/status shows the mode", /Canon: strict\./.test(h.sb.state.message), h.sb.state.message);
  turn(h, "/canon branch", "x");
  check("/canon branch switches back", TR(h).canon === "branch");
}
// 3. Jack kills Homelander in March 2010: the change is recorded with its day
const killHL = () => { const h = at("March 10, 2010"); const r = turn(h, "You fly at Homelander and crush his skull.", KILL_HL); return [h, r]; };
{
  const [h, r] = killHL();
  const c = TR(h).changes.find((x) => x.n === "Homelander");
  check("the kill is recorded as a story death", !!c && c.k === "dead" && !c.canon, TR(h).changes);
  check("...with its day", !!c && c.d === Math.round(Date.UTC(2010, 2, 10) / 864e5), c && c.d);
  check("...and the player is told", /\[Tracker\] Changed in this story: Homelander is dead\./.test(r.out), r.out);
}
// 4. Branch mode after the kill: canon that needs Homelander is gone, the rest stays
{
  const [h] = killHL();
  turn(h, "/date June 23, 2019", "x");
  const r = turn(h, "You look around.", PLAIN);
  const today = section(r.ctx, "Canon today:", ["Canon this past week:", "Earlier:", "Right now", "Dead by now", "Ages now", "Canon locks"]);
  const week = section(r.ctx, "Canon this past week:", ["Earlier:", "Right now", "Dead by now", "Ages now", "Canon locks"]);
  check("June 23, 2019: no canon line names Homelander (Stillwell's murder is gone)", !/Homelander/.test(today + week), { today, week });
  check("...but other canon of the week stays (Ashley fired / Mallory / Edgar's bonus)", /Stillwell/.test(today + week), { today, week });
  check("...the Seven line is tagged, not dropped", /The Seven now: Homelander \(leader\)[^.]*(?:\.|\)) ?[^]*?\(In this story Homelander is dead/.test(note(r.ctx)) || /In this story Homelander is dead/.test(section(r.ctx, "The Seven now:", ["Vought:"])), section(r.ctx, "The Seven now:", ["Vought:"]));
  check("...and the change line is there", /Changed in this story \(true now[^)]*\): Homelander died in March 2010/.test(note(r.ctx)), note(r.ctx).slice(-400));
  check("...Homelander stays in the dead list", /Dead by now[^.]*Homelander \(died March 2010 in this story\)/.test(note(r.ctx)), section(r.ctx, "Dead by now", ["Ages now", "Canon locks"]));
}
// 5. Branch mode: skip stops skip the events that need Homelander
{
  const [h] = killHL();
  turn(h, "/date June 1, 2019", "x");
  // June 2022 and the 2024-2026 items need Homelander; the Godolkin massacre item names him too (he arrests the students), so a
  // 2-year skip from October 2020 and from August 2023 finds nothing to stop on
  const want = ["June 5, 2019", "June 21, 2019", "September 30, 2020", "October 17, 2020", "October 17, 2022", "August 30, 2023", "August 30, 2025", "October 6, 2025"];
  const got = [];
  for (let k = 0; k < want.length; k++) { turn(h, "/skip 2 years", "x"); got.push(dateOf(h)); }
  check("stops after Homelander's death: " + want.join(" > "), JSON.stringify(got) === JSON.stringify(want), got);
  turn(h, "/skip 2 years", "x");
  check("...then no stop is left: a full 2-year skip lands on October 6, 2027", dateOf(h) === "October 6, 2027", dateOf(h));
  const s = at("June 1, 2019"); turn(s, "/skip 2 years", "x"); turn(s, "/skip 2 years", "x"); turn(s, "/skip 2 years", "x"); turn(s, "/skip 2 years", "x"); turn(s, "/skip 2 years", "x");
  turn(s, "/skip 2 years", "x");
  check("(control) with Homelander alive the sixth stop is June 16, 2022", dateOf(s) === "June 16, 2022", dateOf(s));
}
// 6. Branch mode: the June 5 news loses only the Homelander clause; the July 1 item is gone entirely
{
  const [h] = killHL();
  turn(h, "/date June 5, 2019", "x");
  const r = turn(h, "You look around.", PLAIN);
  const news = section(r.ctx, "NEWS (", []);
  check("June 5 news still tells Robin Ward and Flight 37's week", /Robin Ward/.test(news) && /Starlight/.test(news), news);
  check("...without Homelander's TV demand", !/Homelander/.test(news), news);
  turn(h, "/news", "x");
  check("/news on July 2, 2019 lists no Stillwell item when Homelander died in 2010", (() => { const [g] = killHL(); turn(g, "/date July 2, 2019", "x"); turn(g, "/news", "x"); return !/Stillwell/.test(g.sb.state.message) && /Robin Ward/.test(g.sb.state.message); })());
  check("...but it does when he died after her (July 2, 2019)", (() => { const g = at("July 2, 2019"); turn(g, "You fly at Homelander and crush his skull.", KILL_HL); turn(g, "/news", "x"); return /Stillwell/.test(g.sb.state.message); })());
}
// 7. Strict mode keeps the old behavior: tagged lines, every stop
{
  const h = at("March 10, 2010");
  turn(h, "/canon strict", "x");
  turn(h, "You fly at Homelander and crush his skull.", KILL_HL);
  turn(h, "/date June 23, 2019", "x");
  const r = turn(h, "You look around.", PLAIN);
  const today = section(r.ctx, "Canon today:", ["Canon this past week:", "Earlier:", "Right now", "Dead by now"]);
  check("strict: Stillwell's murder still shows, tagged", /Homelander[^]*\(In this story Homelander is dead/.test(today), today);
  turn(h, "/date June 22, 2019", "x");
  turn(h, "/skip 2 years", "x");
  check("strict: /skip still stops on July 1, 2019", dateOf(h) === "July 1, 2019", dateOf(h));
}
// 8. Saving someone: Stillwell lives, so Ashley's promotion (which depends on her death) is gone, and the July 1 news drops her clause
{
  const h = at("June 23, 2019");
  const r0 = turn(h, "You shield Stillwell from Homelander and fly her out of the house.", "\nYou shield Stillwell with your body and go through the window with her. Homelander screams behind you. Madelyn Stillwell survives.\n");
  check("the rescue is recorded", TR(h).changes.some((c) => c.n === "Madelyn Stillwell" && c.k === "alive"), { changes: TR(h).changes, out: r0.out });
  turn(h, "/skip 2 weeks", "x");
  check("the July 1 stop still lands (the rest of that news stands)", dateOf(h) === "July 1, 2019", dateOf(h));
  const r = turn(h, "You look around.", PLAIN);
  const today = section(r.ctx, "Canon today:", ["Canon this past week:", "Earlier:", "Right now", "Dead by now"]);
  check("July 1: Ashley's promotion is gone", !/Ashley Barrett Senior VP/.test(today), today);
  const nw = section(r.ctx, "NEWS (", []);
  check("July 1 news has no Stillwell clause but keeps the military one", !/Stillwell/.test(nw) && /military/.test(nw), nw);
  check("the change line says she lives", /Madelyn Stillwell is alive \(survived June 2019\)/.test(note(r.ctx)), note(r.ctx).slice(-300));
}
// 9. Story cards: Homelander's own schedule stops at his death; a line about a saved person goes too
{
  const [h] = killHL();
  const card = CARDS.find((c) => c.title === "Homelander");
  h.sb.storyCards = [{ keys: card.keys, entry: card.value }];
  turn(h, "/date October 20, 2020", "x");
  turn(h, "You look around.", PLAIN);
  const e = h.sb.storyCards[0].entry;
  check("Homelander's card keeps his 2011 line and loses 2019/2020 ones", !/June 23, 2019: he kills Madelyn Stillwell/.test(e) && !/Stormfront's lover/.test(e), e.slice(e.indexOf("Canon schedule"), e.indexOf("Canon schedule") + 300));
  check("...no future line either", !/2022|2025|2026/.test(e.slice(e.indexOf("Canon schedule"))), e.slice(e.indexOf("Canon schedule")));
}
// 10. The clock no longer jumps years ahead on canon words (v3.3 fix)
{
  const h = at("June 5, 2019");
  turn(h, "You turn on the TV.", "\nOn the news: A-Train killed a young woman, Robin Ward, in Queens.\n");
  check("'A-Train killed Robin Ward' on June 5, 2019 stays in June 2019", dateOf(h) === "June 5, 2019", dateOf(h));
  const g = at("June 12, 2019");
  turn(g, "You turn on the TV.", "\nOn the news, Homelander killed the hijackers on Flight 37, they say.\n");
  check("'Homelander killed the hijackers' stays in June 2019", /June \d+, 2019/.test(dateOf(g)), dateOf(g));
  const k = at("June 17, 2022");
  turn(k, "You turn on the TV.", "\nThe news: Starlight quit the Seven on a livestream, and Homelander killed a protester in the street on camera.\n");
  check("June 2022 protester news stays in June 2022", /June \d+, 2022/.test(dateOf(k)), dateOf(k));
  const v = at("May 10, 2019");
  turn(v, "Some time passes.", "\nJune 2019.\n\nOn the news, everyone is talking about Robin Ward.\n");
  check("a vague skip told by the next stop's news still lands on it (June 5, 2019)", dateOf(v) === "June 5, 2019", dateOf(v));
}
// 11. A retried kill is forgotten
{
  const h = at("March 10, 2010");
  const raw = "\n> You fly at Homelander and crush his skull.\n";
  turn(h, "You fly at Homelander and crush his skull.", KILL_HL);
  check("before the retry: Homelander is dead", TR(h).changes.some((c) => c.n === "Homelander"));
  // the same action again, with the same action count: a retry
  h.sb.history.pop(); h.sb.history.pop();
  h.run("input", raw);
  h.run("context", PE + "\n\nRecent Story:\n" + h.sb.story.slice(-8000) + "\n[Author's note: Style: grounded.]\n");
  h.run("output", "\nHomelander catches your fist and laughs.\n");
  check("after the retry: no change is left", !TR(h).changes.some((c) => c.n === "Homelander"), TR(h).changes);
}
console.log(oks + " passed, " + fails + " failed");
process.exit(fails ? 1 : 0);
