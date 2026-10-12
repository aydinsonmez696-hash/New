// Note size, strict vs branch, after three story changes (Homelander killed March 2010, Stillwell saved June 2019, A-Train killed May 2016)
const fs = require("fs");
const [LIB, PE_PATH, HARNESS] = process.argv.slice(2);
const { makeSandbox, playTurn } = require(HARNESS);
const PE = fs.readFileSync(PE_PATH, "utf8").replace(/\$\{[^}]*\}/g, " ");
const opts = { plotEssentials: PE };
const UNDERWAY = "October 2004.\n\nThe sedan smells of new leather. You are four.\n" + "The city outside the tinted windows is a blur of brownstone buildings and yellow cabs. ".repeat(24);
const turn = (h, action, reply) => playTurn(h, "\n> " + action + "\n", reply, opts);
const note = (ctx) => (ctx.match(/\[Status \(for the narrator[^\n]*/) || [""])[0];
const SCENES = { quiet: "You walk home through the Bronx. Rain starts.", seven: "Homelander smiles at the crowd outside Vought Tower while A-Train and The Deep pose for photos.", boys: "Butcher lights a cigarette while Hughie checks the bug. Frenchie and Mother's Milk argue in the back." };
const dates = ["June 5, 2019", "June 23, 2019", "July 1, 2019", "October 15, 2020", "June 9, 2022", "September 22, 2023", "November 12, 2024", "January 6, 2025", "October 4, 2025", "February 15, 2026", "April 5, 2026"];
const build = (mode) => { const h = makeSandbox(LIB); h.sb.story = UNDERWAY; h.sb.info.maxChars = 64000;
  turn(h, "/canon " + mode, "x");
  turn(h, "/date March 10, 2010", "x"); turn(h, "You fly at Homelander and crush his skull.", "\nYou drive your fist through Homelander's skull. Homelander is dead.\n");
  turn(h, "/date May 12, 2016", "x"); turn(h, "You snap A-Train's neck.", "\nYou snap A-Train's neck. A-Train is dead.\n");
  turn(h, "/date June 23, 2019", "x"); turn(h, "/alive Madelyn Stillwell", "x");
  return h; };
console.log("date               scene  strict  branch   diff");
let ts = 0, tb = 0, n = 0;
for (const d of dates) for (const sc of Object.keys(SCENES)) {
  const sizes = {};
  for (const mode of ["strict", "branch"]) { const h = build(mode); turn(h, "/date " + d, "x"); sizes[mode] = note(turn(h, SCENES[sc], "\nThe room is quiet.\n").ctx).length; }
  ts += sizes.strict; tb += sizes.branch; n++;
  console.log(d.padEnd(18), sc.padEnd(6), String(sizes.strict).padStart(6), String(sizes.branch).padStart(7), String(sizes.branch - sizes.strict).padStart(6));
}
console.log("average note: strict " + Math.round(ts / n) + ", branch " + Math.round(tb / n) + " (" + Math.round((tb - ts) / n) + ")");
