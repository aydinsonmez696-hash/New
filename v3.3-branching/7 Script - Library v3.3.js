/* =====================================================================
   THE BOYS: JACK TRACKER  v3.2
   Keeps the story's date, the Seven's lineup and canon events on schedule,
   and tells the AI every turn. Plot Essentials lists the character options;
   the script keeps only the one in play: the custom character if the player
   described one at the start, otherwise Jack Summers. For Jack,
   it also tracks his age, size and exact power levels. Custom characters
   get the date, the Seven and events only. When the story changes canon
   (kills a canon character, saves one canon kills, puts the player
   character in the Seven or the Boys), the script notices and keeps the
   rest of the world in line with it: nothing for the player to type.

   INSTALL (in YOUR OWN scenario, on the AI Dungeon website):
   Scenario editor > Scripts tab > Enable scripts > Edit scripts.
   1. LIBRARY tab: delete everything, paste this whole file.
   2. INPUT tab: delete everything, paste:
        const modifier = (text) => {
          const [newText, stop] = Tracker("input", text);
          return { text: newText, stop };
        };
        modifier(text);
   3. CONTEXT tab: delete everything, paste:
        const modifier = (text) => {
          const [newText] = Tracker("context", text);
          return { text: newText };
        };
        modifier(text);
   4. OUTPUT tab: delete everything, paste:
        const modifier = (text) => {
          const [newText] = Tracker("output", text);
          return { text: newText };
        };
        modifier(text);
   Save.

   HOW IT WORKS
   - The date is kept to the day ("Tuesday, June 4, 2019"); a new story
     starts on the day its start answer names, or on the 1st.
   - Time skips you type move the date: "2 years pass", "a year passes",
     "another six months pass", "the next two years...", "after a month",
     "you turn 18", "your 18th birthday", "fast forward to June 2019" (the
     1st) or "to June 4, 2019"; and by days: "3 days pass", "two weeks
     pass", "a week later", "the next morning", "sleep until morning",
     "skip to next week", "skip to Friday". A month or year skip keeps the
     day of the month.
   - "Time passes" / "some time passes" lets the AI pick how long (up to 5
     years); "keep living your life" / "life goes on" / "life continues",
     up to 6 months; "days pass", up to a week; "weeks go by", up to four
     weeks; "your birthday arrives" lands on Jack's next birthday unless the
     story has set up a later one.
   - When the AI's own text moves the story to a later month (a date line,
     "It's March 2016", "You turn sixteen in September 2016", "You're
     eighteen", "Six months later"), the tracker follows it, and a day the
     AI dates ("June 4, 2019.") or narrates ("The next morning", "Three
     days later") moves the day. It never rewrites a later date or age
     down to its own; it only fixes text that goes BACKWARD (an age or
     year earlier than the story has reached).
   - A skip never jumps over a big canon day: it stops on that day, and
     /skip (or "continue the skip") goes on from there.
   - A date line shows only when the month changes, on its own line.
     Date lines that repeat the current month are removed.
   - If a turn opens by repeating the end of the last one, the repeat is cut.
   - Retry is safe: a retried turn starts again from the same date.
   - While Jack is under 18, sexual content involving him is kept out.
   - "You turn 18" and age fixes apply to Jack, and to a custom character
     whose age the player gave.
   - v2.8.4: Seven joins and exits, retirements and Compound V going public
     can no longer show up before their canon dates; future-dated story-card
     items stay hidden from the AI until their month; early canon already
     written into a story is hidden from the AI too. What the player's own
     actions cause stands.
   - v2.8.5: lighter on context. Each story card's canon history shows only
     what has happened by the story's month (it fills in as time passes), so
     future canon no longer takes up room in the context.
   - v2.9: Jack's past changed: an ordinary Compound V baby whose body adapted
     to it in a way nobody understands. No trust and no stop at 18.
   - v3.0: much lighter on context, built for custom characters. Plot
     Essentials puts the player's character first and no longer carries
     Jack's profile (the note gives it, only to Jack players); a custom
     character's own powers are repeated at the end every turn; locks and
     the dead list only name people the story is near; news isn't sent twice.
   - v3.1: grown Jack is funny again; canon secrets stay in the note during a
     news month; old Plot Essentials no longer get a second Jack profile; a
     "]" in a Powers answer can't break the note; more "no powers" answers
     are understood; small fixes.
   - v3.2: the date keeps the day of the month, and the AI is told the
     weekday and day. Day skips ("3 days pass", "the next morning", "skip
     to Friday") move it, and so do the days the AI dates or narrates;
     weeks are counted as days, no longer rounded into months; skips stop
     ON the day of a big canon event. A story from v3.1 is set to the
     middle of its month until a real day turns up.

   - v3.3: branching canon (sandbox). Canon is the default future, not a
     promise: when the story kills someone early or saves someone canon
     kills, every canon event, agenda line, news clause and card line that
     depends on them is dropped, its day stops being a skip stop, and the
     AI is told what changed instead. Everything the player never touched
     still happens on schedule. /canon strict restores the old behavior.
     Also: a reply's canon words can no longer move the date past the next
     canon stop ("A-Train killed Robin Ward" no longer jumps to 2026).

   COMMANDS (type one as a Story action, nothing else on the line; none are
   needed to play, the script keeps track by itself)
   /date              shows the date ("It's Tuesday, June 4, 2019.") and
                      Jack's age
   /status            shows the script version, the date, and which size of
                      note the AI is getting
   /date June 4, 2010 sets the date (also: /date 4 June 2010; /date June
                      2010 sets the 1st)
   /skip 2 years      moves the date forward (also: /skip 6 months, /skip 2
                      weeks, /skip 3 days); a bare /skip continues a skip
                      that a canon stop paused
   /fact <text>       when YOUR story changes canon, say so once and the AI is
                      told every turn from then on. Examples:
                        /fact Jack joined the Seven in June 2018, in the open seat
                        /fact Translucent died in March 2016; Jack killed him
   /facts             lists your facts
   /forget 2          removes fact 2 (/forget all removes every fact)
   /changes           lists what the script has noticed your story changed
   /dead Butcher      only if the script missed it: marks someone dead now
   /alive Robin       only if the script missed it: marks someone alive
   /news              lists the public canon news of the past year
   /canon             shows the canon mode; /canon branch or /canon strict
                      sets it for this adventure (see v3.3 above)
   /private off       removes Jack's private adult details from the note in
                      THIS adventure (/private on restores them); the AI gets
                      them only once he is 18, never before
   The answer appears as a [Tracker] line. That turn's AI text is blanked and
   [Tracker] lines are hidden from the AI, so just keep playing after it.
   ===================================================================== */

const TRACKER_VERSION = "3.3";
const TRACKER_CONFIG = {
  start: { year: 2004, month: 10 },   // story starts October 2004
  birth: { year: 1999, month: 9 },    // Jack was born September 1999
  maxVagueJumpMonths: 60,             // longest skip the AI may pick on "time passes" (what the AI is told)
  maxEvidenceMonths: 120,             // furthest the AI's own text can move the date in one turn (dates or ages written later than that are ignored)
  compactBelowChars: 36000,           // with less context than this, the status note uses its short form
  minimalBelowChars: 14000,           // with less than this: date, Jack and the lineup only
  tinyJackBelowChars: 14000,          // with less than this: Jack's powers in a few words
  cardHistory: true,                  // story cards show their canon history up to the story's month (Lite: false)
  maxFacts: 12,                       // how many /fact lines the note carries
  maxFactChars: 240,                  // longest single /fact
  maxChanges: 40,                     // how many story changes (deaths, survivals, memberships) the script keeps
  canonMode: "branch"                 // "branch": the story's changes branch the world (v3.3); "strict": canon happens on its day regardless
};

function Tracker(hook, text) {
  try {
    return TrackerCore(hook, text);
  } catch (error) {
    log("Tracker error: " + (error && error.stack ? error.stack : error));
    return [text, false];
  }
}

function TrackerCore(hook, text) {
  const C = TRACKER_CONFIG;
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  const SEASONS = { spring: 4, summer: 7, fall: 10, autumn: 10, winter: 1 };
  const NUM_WORDS = {
    a: 1, an: 1, one: 1, another: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
    nineteen: 19, twenty: 20, few: 3, several: 3, couple: 2
  };
  const AGE_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one",
    "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six",
    "twenty-seven", "twenty-eight", "twenty-nine", "thirty"];

  // ---------- date math (months counted from year 0) ----------
  const toIdx = (y, m) => y * 12 + (m - 1);
  const yearOf = (i) => Math.floor(i / 12);
  const monthOf = (i) => (i % 12) + 1;
  const fmt = (i) => MONTHS[monthOf(i) - 1] + " " + yearOf(i);
  const birthIdx = toIdx(C.birth.year, C.birth.month);
  const ageAt = (i) => Math.floor((i - birthIdx) / 12);
  // The day of the month (v3.2). Day arithmetic uses day numbers (days since January 1, 1970), never month keys,
  // so a day skip rolls over months and years by itself.
  const DY = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 864e5);          // day number: days since Jan 1, 1970
  const dim = (i) => new Date(Date.UTC(yearOf(i), monthOf(i), 0)).getUTCDate(); // days in month i
  const dayNo = (i, d) => DY(yearOf(i), monthOf(i), Math.min(Math.max(1, d), dim(i)));
  const fromDayNo = (n) => { const t = new Date(n * 864e5); return { i: toIdx(t.getUTCFullYear(), t.getUTCMonth() + 1), d: t.getUTCDate() }; };
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = (n) => WEEKDAYS[(((n + 4) % 7) + 7) % 7];
  const fmtDay = (i, d) => MONTHS[monthOf(i) - 1] + " " + d + ", " + yearOf(i);   // "June 4, 2019"
  const fmtNo = (n) => { const x = fromDayNo(n); return fmtDay(x.i, x.d); };

  // ---------- state ----------
  if (!state.tracker || typeof state.tracker.idx !== "number") {
    state.tracker = { idx: toIdx(C.start.year, C.start.month), day: 1, turn: null, recentSkips: [] };
  }
  const T = state.tracker;
  // A tracker from v3.1 kept only the month: its story is under way and the day is unknown. It gets the middle of the
  // month, marked as a guess (T.dayGuess) until a real day turns up (/date or a typed date with a day, a date with a
  // day in a reply, the start answer); meanwhile the note says "mid-June 2019" instead of a weekday and a day.
  if (typeof T.day !== "number" || !(T.day >= 1)) { T.day = 15; T.dayGuess = true; }
  T.day = Math.min(Math.floor(T.day), dim(T.idx));
  // A skip paused by a canon stop waits for its day (T.pendingDay, a day number); v3.1 kept the month in T.pending
  if ("pending" in T) { if (typeof T.pending === "number") T.pendingDay = dayNo(T.pending, 1); delete T.pending; }
  const today = () => dayNo(T.idx, T.day);
  const setToday = (n) => { const x = fromDayNo(n); T.idx = x.i; T.day = x.d; };
  const setMonth = (i) => { T.idx = i; T.day = Math.min(T.day, dim(i)); };   // a move by months keeps the day of the month
  // The date in words: "June 4, 2019", or "mid-June 2019" while the day is only a guess
  const dayPart = (d) => (d <= 10 ? "early " : d <= 20 ? "mid-" : "late ");
  const dateText = (i, d) => (T.dayGuess ? dayPart(d) + fmt(i) : fmtDay(i, Math.min(d, dim(i))));
  const textNo = (n) => { const x = fromDayNo(n); return dateText(x.i, x.d); };
  // The date as the note and /date give it: "Tuesday, June 4, 2019" (or "mid-June 2019")
  const nowText = (i) => {
    i = typeof i === "number" ? i : T.idx;
    return T.dayGuess ? dayPart(T.day) + fmt(i) : weekday(dayNo(i, T.day)) + ", " + fmtDay(i, Math.min(T.day, dim(i)));
  };
  T.recentSkips = T.recentSkips || [];
  if (!Array.isArray(T.facts)) T.facts = [];   // what the player's story changed (/fact)
  if (!Array.isArray(T.changes)) T.changes = [];   // what the script saw the story change: { n: who, k: dead|alive|member|left, at: month, turn }
  if (!T.seenYou || typeof T.seenYou !== "object") T.seenYou = {};   // canon-doomed people seen with the player character in the month they die
  if (typeof T.private !== "boolean") T.private = true;   // Jack's 18+ details in the note from his 18th birthday; /private off removes them
  state.memory = state.memory || {};
  // Jack mode: on unless the Context hook has seen that the player picked someone else
  const isJack = () => T.jack !== false;
  // The character in play: Jack's birth month, or a custom character's (from the age they gave at the start), or null
  const curBirth = () => (isJack() ? birthIdx : (typeof T.customBirth === "number" ? T.customBirth : null));
  const charAge = (i) => { const b = curBirth(); return b === null ? null : Math.floor((i - b) / 12); };
  const charName = () => (isJack() ? "Jack" : (T.customName || "The player character"));
  const ageLine = (i) => { const a = charAge(i); return a === null ? "" : "; " + charName() + " is now " + a; };

  // ---------- character pick ----------
  // Plot Essentials lists every character option between ">> Name" lines, ending with ">> End of options".
  // AI Dungeon's character menu adds "CHARACTER INFORMATION ... Character: <option>" after Plot Essentials.
  // Keep only the option in play: the menu's pick if there is one, else the custom character if the player
  // described one, else Jack. Without an options list, look for Jack's card.
  const OPTIONS_HEAD = /^PLAYER CHARACTER \([^\n]*\n/m;
  // "Label: answer" lines in an option. A blank answer, or a placeholder AI Dungeon never filled, counts as empty.
  const fieldOf = (body, label) => {
    const m = body.match(new RegExp("^" + label + ":[ \\t]*([^\\n]*)$", "mi"));
    const v = m ? m[1].trim() : "";
    return v === "" || /^\$\{/.test(v) ? "" : v;
  };
  const dropBlankFields = (body) => body.replace(/^[A-Za-z][A-Za-z ]*:[ \t]*(?:\$\{[^}\n]*\})?[ \t]*(?:\n|$)/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  // The start date, age and name from the questions answered at the start, read off an option's text
  const startFields = (raw, isCustom) => {
    let startIdx = null, startDay = null;
    // "June 2019", "2019", and with a day (v3.2): "June 4, 2019", "June 4 2019", "4 June 2019"
    const sm = fieldOf(raw, "Starts in").match(/(?:\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?)?(?:\b([A-Za-z]+),?\s+(?:of\s+)?(?:(\d{1,2})(?:st|nd|rd|th)?,?\s+)?)?\b((?:19|20)\d\d)\b/);
    if (sm) {
      const y = parseInt(sm[4], 10);
      if (y >= 1990 && y <= 2030) {
        startIdx = toIdx(y, (sm[2] && parseMonthWord(sm[2])) || 1);
        startDay = dayIn(sm[1] || sm[3], sm[2], startIdx);
      }
    }
    const am = fieldOf(raw, "Age at start").match(/\d{1,3}/);
    const age = am ? parseInt(am[0], 10) : null;
    const nm = isCustom ? raw.match(/^Name:[ \t]*([^.\n]+)/mi) : null;
    const name = nm ? nm[1].trim() : "";
    const pw = isCustom ? fieldOf(raw, "Powers").replace(/\[/g, "(").replace(/\]/g, ")") : "";
    const powers = pw.length > 320 ? pw.slice(0, 320).replace(/\s+\S*$/, "") + "..." : pw;
    return { startIdx, startDay, age, name: /^\$\{/.test(name) ? "" : name.replace(/[\[\]]/g, ""), powers };
  };
  const applyCharacterPick = (ctx) => {
    const none = { ctx, jack: true, startIdx: null, startDay: null, age: null, name: "" };
    const m = ctx.match(/CHARACTER INFORMATION[\s\S]{0,600}?\nCharacter:[ \t]*([^\n]*)/i);
    const pick = m ? m[1].trim().toLowerCase() : "";
    const head = ctx.search(OPTIONS_HEAD);
    const end = head < 0 ? -1 : ctx.indexOf("\n>> End of options", head);
    if (head < 0 || end < 0) {
      // A one-character scenario: the PLAYER CHARACTER block itself is the character, with the start answers on
      // "Label: answer" lines (Jack: "Starts in"; a custom character: Name, Looks, Powers, Starts in, Age at start...)
      const at = ctx.search(/^PLAYER CHARACTER\b[^\n]*\n/m);
      if (at < 0) {
        none.jack = pick ? /^jack summers\b/.test(pick) : /JACK SUMMERS \(the player/.test(ctx);
        return none;
      }
      const from = ctx.indexOf("\n", at) + 1;
      let stop = ctx.indexOf("\n\n", from);
      if (stop < 0) stop = ctx.length;
      const raw = ctx.slice(from, stop);
      const jack = pick ? /^jack summers\b/.test(pick) : /JACK SUMMERS \(the player/.test(raw);
      let body = dropBlankFields(raw);
      if (!jack && !/^The player's own character/.test(body)) body = "The player's own character.\n" + body;
      ctx = ctx.slice(0, at) + "PLAYER CHARACTER\n" + body + ctx.slice(stop);
      if (jack) ctx = ctx.replace(/^You are [^\n\[]{1,60}, \[[^\]\n]{1,30}\]\n[^\n]*\n?/gm, "");
      return Object.assign({ ctx, jack }, startFields(raw, !jack));
    }
    const options = ctx.slice(head, end + 1).split(/^>> /m).slice(1).map((p) => {
      const nl = p.indexOf("\n");
      return { name: (nl < 0 ? p : p.slice(0, nl)).trim(), body: nl < 0 ? "" : p.slice(nl + 1).trim() };
    });
    const named = (re) => options.find((o) => re.test(o.name));
    const custom = named(/^custom character$/i);
    // The player described someone when any custom-only question has an answer (the old single question also counts)
    // (a name alone doesn't: with nothing else filled in, the story is Jack's)
    const described = !!custom && (["Looks", "Powers", "Background", "Opening scene", "Age at start"].some((f) => fieldOf(custom.body, f) !== "") ||
      (() => {
        const d = custom.body.replace(/^The player's own character\.?[ \t]*(?::[ \t]*)?/i, "")
          .replace(/^(?:Name|Gender|Looks|Powers|Starts in|Age at start|Background|Opening scene):[^\n]*\n?/gmi, "").trim();
        return d !== "" && !/^\$\{/.test(d);
      })());
    const chosen = (pick && (options.find((o) => o.name.toLowerCase() === pick) ||
      options.find((o) => pick.startsWith(o.name.toLowerCase())))) ||
      (!pick && described ? custom : null) || named(/^jack summers$/i) || options[0];
    const raw = chosen ? chosen.body : "";
    let body = dropBlankFields(raw);
    if (chosen && chosen === custom && !/^The player's own character/.test(body)) body = "The player's own character.\n" + body;
    const lineEnd = ctx.indexOf("\n", end + 1);
    ctx = ctx.slice(0, head) + "PLAYER CHARACTER\n" + body +
      (lineEnd < 0 ? "\n" : ctx.slice(lineEnd));
    const jack = !!chosen && /^jack summers$/i.test(chosen.name);
    // AI Dungeon also writes its own "You are <name>, [gender]" summary; for Jack, his option text is the one to follow
    if (jack) ctx = ctx.replace(/^You are [^\n\[]{1,60}, \[[^\]\n]{1,30}\]\n[^\n]*\n?/gm, "");
    return Object.assign({ ctx, jack }, startFields(raw, chosen === custom));
  };

  // ---------- turns, Retry and Continue ----------
  // A turn is one player action (or one Continue) plus the AI output that answers it.
  // AI Dungeon reports the same action count when a turn is retried, so a retry
  // rolls the date back to where that turn started instead of counting a skip twice.
  const count = (typeof info !== "undefined" && info && Number.isInteger(info.actionCount)) ? info.actionCount : null;
  // base/baseDay: the date before the turn; start/startDay: where the typed action put it (the reply starts from there);
  // baseGuess/guess: whether the day was only a guess then
  const newTurn = (mode) => ({ base: T.idx, baseDay: T.day, baseGuess: !!T.dayGuess, mode: mode || "none", start: T.idx, startDay: T.day, guess: !!T.dayGuess, ctx: null, out: null });
  // A turn saved by v3.1 has no days: it starts on the tracked day
  const fillTurn = (t) => {
    if (typeof t.start !== "number") t.start = T.idx;
    if (typeof t.base !== "number") t.base = t.start;
    if (typeof t.startDay !== "number") t.startDay = T.day;
    if (typeof t.baseDay !== "number") t.baseDay = t.startDay;
    if (typeof t.guess !== "boolean") t.guess = !!T.dayGuess;
    if (typeof t.baseGuess !== "boolean") t.baseGuess = t.guess;
    return t;
  };
  // Back to where the turn started (a retried turn lands on exactly the same day)
  const restoreTurn = (t) => { T.idx = t.start; T.day = Math.min(t.startDay, dim(t.start)); T.dayGuess = t.guess; };
  const syncTurn = (slot) => {
    let t = T.turn;
    if (!t) t = T.turn = newTurn("none");
    fillTurn(t);
    const seen = t[slot];
    if (seen === null || seen === undefined) {       // first time this hook runs in this turn
      t[slot] = count === null ? -1 : count;
      restoreTurn(t);
      return t;
    }
    if (count !== null && seen === count) {           // Retry: same turn again
      restoreTurn(t);
      return t;
    }
    t = T.turn = newTurn("none");                     // Continue: a new turn with no typed skip
    t[slot] = count === null ? -1 : count;
    return t;
  };

  // ---------- Jack by age ----------
  const SIZE = {
    4: "4'0\", 75 lbs", 5: "4'3\", 85 lbs", 6: "4'6\", 95 lbs", 7: "4'9\", 115 lbs",
    8: "5'1\", 135 lbs", 9: "5'4\", 155 lbs", 10: "5'7\", 175 lbs", 11: "5'10\", 195 lbs",
    12: "6'1\", 220 lbs", 13: "6'3\", 240 lbs", 14: "6'5\", 260 lbs", 15: "6'7\", 280 lbs",
    16: "6'9\", 300 lbs", 17: "6'10\", 325 lbs", 18: "6'11\", 350 lbs"
  };
  const sizeFor = (a) => SIZE[Math.max(4, Math.min(18, a))];
  const voiceFor = (a) => (a <= 12 ? "a boy's voice" : a === 13 ? "his voice is cracking"
    : a <= 16 ? "his voice is deepening" : a === 17 ? "a deep, smooth voice" : "a deep voice, smooth as a river");
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // Strength in lbs by age: [arms, legs, what that means]. Full power at 18.
  const STRENGTH = {
    4: [500, 1250, "a grown man is light, a car far too heavy"],
    5: [700, 1750, "a grown man is light, a car far too heavy"],
    6: [1000, 2500, "a motorcycle is easy, a car too heavy"],
    7: [1500, 3750, "a motorcycle is easy, a car too heavy"],
    8: [2200, 5500, "he can lift one end of a car"],
    9: [3300, 8250, "he can lift a small car"],
    10: [4800, 12000, "he can lift an SUV"],
    11: [7000, 17500, "he can lift a pickup truck"],
    12: [10000, 25000, "he can lift a small box truck"],
    13: [18000, 45000, "he can lift a loaded box truck"],
    14: [35000, 87500, "he can lift a city bus"],
    15: [65000, 162500, "he can lift a semi truck with a load"],
    16: [120000, 300000, "he can lift a fully loaded semi, not yet a tank"],
    17: [220000, 550000, "he can lift a 70-ton tank"],
    18: [400000, 1000000, "he can lift an empty 747, about 400,000 lbs; a tank is easy"]
  };
  // Running
  const SPEED = { 4: "40 mph", 5: "40 mph", 6: "60 mph", 7: "60 mph", 8: "100 mph", 9: "100 mph", 10: "200 mph",
    11: "200 mph", 12: "300 mph", 13: "400 mph", 14: "400 mph", 15: "Mach 1", 16: "Mach 2", 17: "Mach 4", 18: "Mach 6" };
  // Flying (he has flown since birth: he floated as a baby)
  const FLY = { 4: "about 20 mph, rooftop height, and he tires fast", 5: "about 40 mph, low", 6: "about 60 mph", 7: "about 80 mph",
    8: "about 100 mph", 9: "about 150 mph", 10: "about 250 mph", 11: "about 400 mph", 12: "Mach 1", 13: "Mach 2", 14: "Mach 4",
    15: "Mach 6", 16: "Mach 10", 17: "Mach 16", 18: "Mach 24" };
  const FLY_MACH = { 12: 1, 13: 2, 14: 4, 15: 6, 16: 10, 17: 16, 18: 24 };
  // How long he holds his breath while active
  const BREATH = { 4: "5 minutes", 5: "6 minutes", 6: "8 minutes", 7: "10 minutes", 8: "15 minutes", 9: "20 minutes", 10: "30 minutes",
    11: "45 minutes", 12: "an hour", 13: "2 hours", 14: "3 hours", 15: "5 hours", 16: "8 hours", 17: "12 hours", 18: "24 hours" };
  const spaceFor = (a) => (a < 14 ? "" : a <= 15 ? "he can reach the edge of space for a few minutes"
    : a <= 17 ? "he can go into open space for as long as his breath lasts, though the cold and radiation wear on him"
    : "deep space can't hurt him (vacuum, cold, radiation); only his breath limits him there");
  // X-ray vision: nothing blocks it, lead included
  const xrayFor = (a) => (a <= 6 ? "through a wall or two" : a <= 9 ? "through a whole house" : a <= 12 ? "through a whole building"
    : a <= 15 ? "across a city block" : a <= 17 ? "across a few blocks" : "across several city blocks, farther than Homelander's");
  const sensesFor = (a) => (a <= 8 ? "far sharper than any human's (he hears heartbeats across a room)"
    : a <= 12 ? "far sharper than any human's (he hears a conversation a block away)"
    : a <= 15 ? "sharp enough to pick one voice out of a crowd blocks away" : a <= 17 ? "as sharp as an adult Homelander's"
    : "sharper than Homelander's");
  // Blood control, his long-range power (in place of heat vision): his own blood, then other people's
  const bloodFor = (a) => (a <= 6 ? "needles and darts of his own blood, thrown across a room; he stops his own bleeding at will; he feels other people's heartbeats but can't move their blood yet"
    : a <= 9 ? "steel-hard blades and whips of his own blood that reach across a big room; by touch he can stop someone's bleeding or lock their hand in place"
    : a <= 12 ? "spears and volleys of blood needles across a street, and he pulls spent blood back in; a few steps away he can lock someone's arm or leg or stop their bleeding"
    : a <= 15 ? "dozens of blood spears at once out to a city block, cutting car doors and engine blocks; anyone in the same room he can lock in place or slow their heart until they pass out"
    : a <= 17 ? "about a hundred blood weapons at once out to a few blocks, cutting armored vehicles; several people at once across a street he can lock in place, stop their bleeding or slow their hearts"
    : "a field of hundreds of blood spears out to about half a mile, cutting tank armor; anyone he can see he can lock in place, stop their bleeding or slow their heart");
  // Personality at his age (the grown one is in Plot Essentials)
  const mindFor = (a) => (a <= 8 ? "Right now he's a quiet, watchful kid who takes in everything and says little; his humor is rare and dry."
    : a <= 12 ? "Right now he's a sharp, curious kid with a dry wit, always reading and asking questions."
    : a <= 15 ? "Right now he's a teenager growing into his swagger: funny, sharp, curious; he fights hard but doesn't maim."
    : a <= 17 ? "Right now he's nearly the man he'll be: funny, cocky, sharp, starting to dress well; his fighting is turning brutal."
    : "");
  // Who Jack is, sent only when the player is Jack (it used to sit in Plot Essentials, where every player paid for it)
  const jackWho = (i, a, tiny) => {
    const v = i >= D(2020, 10) ? "" : ", or that Compound V exists";
    if (tiny) return "Jack Summers: silver hair, molten-gold eyes, gold-tinted blood; a Compound V baby whose body adapted like nobody else's (secret).";
    return "Who he is: Jack Summers (the player, \"you\"), born September 1999; silver hair, molten-gold eyes, gold-tinted blood. Secret (only Stan Edgar, Jonah Vogelbaum and a few of Vogelbaum's scientists know): an ordinary Compound V baby whose body adapted to it like nobody else's; every power came in at once and keeps growing, and nobody knows why, so it can't be copied. Vogelbaum's scientists tested him in a guarded facility upstate until Edgar placed him at Red River Institute in 2004. Not Project Odessa: no tie to Homelander or Marie Moreau. He doesn't know why he's different, who his parents were" + v + "." +
      (typeof T.startAt === "number" && T.startAt > D(2004, 10) && ageAt(T.startAt) >= 18 ? " Before this story he grew up on schedule: Red River until 18, then on his own in New York, under no Vought contract." : "");
  };
  const JACK_BLOOD = "Blood control works through his palms and fingertips (the skin seals at once); what he forms glints gold and refills as fast as he heals; on others it never makes bodies explode and works less on stronger Supes; nobody can control his blood. He feels pain. Never: freeze breath, telepathy, healing others.";
  const JACK_GROWN = "Personality: a genuinely funny smartass: dark, deadpan jokes in almost every scene, even mid-fight, often packed with expert detail (\"Right ventricle's collapsing, seven ribs shattered, and I can see your marrow. You're cooked, broski.\"); never stiff or brooding. Hungry to know everything; sophisticated but messy (bespoke suit, no jacket, sleeves rolled, cigarette and tequila); knows his worth; never signs away his freedom, keeps his word, never hurts innocents; only real anger stops the jokes.";
  const JACK_FIGHT = "Fighting style: brutal with people who've earned it (he takes them apart and talks them through what's failing); precise, every style he's seen, blood at range; people just doing a job get disabled, not dismembered.";
  // Shorter versions for small contexts
  const JACK_GROWN_SHORT = "Grown: a genuinely funny smartass, dark deadpan jokes even mid-fight; hungry to know everything; sophisticated but messy; never signs away his freedom, keeps his word, never hurts innocents.";
  const JACK_FIGHT_SHORT = "Fighting style: brutal with people who've earned it; people just doing a job get disabled.";
  const toughFor = (a) => (a <= 7 ? "bullets and blades can wound him" : a <= 9 ? "bullets can wound him"
    : a <= 14 ? "bullets bruise him, heavy weapons wound him" : a <= 17 ? "heavy weapons and Supe-level blows wound him"
    : "small arms bounce off, but heavy weapons, explosions and blows from top Supes like Homelander can cut him and break bones");
  const healFor = (a) => (a <= 8 ? "cuts close in seconds, deep wounds in minutes, broken bones in about an hour"
    : a <= 12 ? "deep wounds close in about a minute, broken bones in minutes, and a lost finger grows back in hours"
    : a <= 17 ? "deep wounds close in seconds, bones knit in under a minute, and a lost finger, eye or organ regrows in minutes"
    : "most injuries heal in seconds; organs, limbs and eyes regrow in about a minute; bigger damage takes longer");
  const endFor = (a) => (a < 18 ? "damage faster than he can heal can still kill him" : "only destroying his head kills him");
  // Adult look: 18 and up only, never sent to the AI while Jack is a minor
  const ADULT_LOOK = "Adult look: towering, built like a Greek sculpture with 8% natural body fat, insanely chiseled and defined, perfect proportions " +
    "that are neither too bulky nor too tall; gorgeous shoulder-length silver hair, straight, that flows with the wind; molten-gold irises; amazingly handsome; " +
    "his voice is deep yet smooth like a river.";
  // Private details: 18 and up only, never sent while Jack is a minor; /private off removes them for the adventure.
  const ADULT_PRIVATE = "Below the belt (bring it up only when the scene calls for it): his cock is a monstrous 22 inches long and 3 inches wide, with a full, heavy ball sack.";
  // The same in a few words, for the smallest contexts
  const BLOOD_TINY = { 6: "needles across a room", 9: "blades and whips across a big room", 12: "spears across a street", 15: "spears out to a block", 17: "a hundred weapons out to a few blocks", 18: "hundreds of spears out to half a mile" };
  const powersTiny = (age) => {
    const a = Math.max(4, Math.min(18, age));
    const [arms, legs] = STRENGTH[a];
    const blood = BLOOD_TINY[[6, 9, 12, 15, 17, 18].find((k) => a <= k)];
    return "arms " + commas(arms) + " lbs, legs " + commas(legs) + " lbs; runs " + (/^Mach/.test(SPEED[a]) ? SPEED[a] : "about " + SPEED[a]) +
      "; flies " + FLY[a].replace(/,.*$/, "") + "; holds his breath " + BREATH[a] + "; X-ray " + xrayFor(a).replace(/,.*$/, "") +
      "; sharp senses and night vision; blood control (" + blood + "); heals fast; " + endFor(a);
  };
  const ADULT_LOOK_SHORT = "Adult look: towering, Greek-sculpture build, straight shoulder-length silver hair, molten-gold irises, very handsome, a deep smooth voice.";
  // His powers at an age (4 to 18; they stop growing at 18). `short` leaves out the asides for a small context.
  const powersFor = (age, short) => {
    const a = Math.max(4, Math.min(18, age));
    const [arms, legs, means] = STRENGTH[a];
    const parts = [
      "arms lift and hit with up to " + commas(arms) + " lbs and legs push and kick with up to " + commas(legs) + " lbs" + (short ? "" : " (" + means + ")"),
      "runs up to " + (/^Mach/.test(SPEED[a]) ? SPEED[a] : "about " + SPEED[a]),
      "flies up to " + FLY[a] + (a >= 18 ? ", never faster" : "") + (a >= 12 && !short ? " (his sonic boom breaks windows; hypersonic only high up, where his shockwave can't wreck what's below)" : ""),
      "holds his breath " + BREATH[a] + " while active"
    ];
    const sp = spaceFor(a);
    if (sp) parts.push(sp);
    parts.push("X-ray vision " + xrayFor(a) + (short ? "" : " (nothing blocks it, lead included)"),
      "all five senses " + sensesFor(a) + ", with night vision (total darkness looks like daylight)",
      "blood control: " + bloodFor(a),
      "durability (his weakest power): " + toughFor(a),
      "regeneration (his strongest): " + healFor(a) + "; " + endFor(a));
    return parts.join("; ");
  };

  // ---------- canon schedule ----------
  // Dates follow the TV timeline (The Boys seasons 1-5 and Gen V), from The Boys Wiki and the episodes themselves.
  // v3.2: canon is kept to the day. A table keyed by day numbers holds each row from its day until the next row's.
  const D = toIdx;
  const DS = (s) => DY(+s.slice(0, 4), +s.slice(5, 7), +s.slice(8, 10));   // "2019-05-20" to a day number
  // The Seven from a day on; each entry holds until the next one
  const ROSTERS = [
    [DY(1990, 1, 1), "Homelander (leader, from 1999), Black Noir, Lamplighter, Translucent, Mister Marathon"],
    [DY(2004, 6, 1), "Homelander (leader), Black Noir, Lamplighter, Translucent, Mister Marathon, Queen Maeve (drafted from Godolkin in 2004, the newest member). That's six: the seventh seat is open and nobody is lined up for it. The Deep is a Godolkin student, not a member"],
    [DY(2010, 6, 1), "Homelander (leader), Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon, The Deep (drafted from Godolkin in June 2010)"],
    [DY(2015, 5, 31), "Homelander (leader), Queen Maeve, Black Noir, Translucent, Lamplighter, The Deep, A-Train (drafted May 31, 2015 after beating Mister Marathon in a race; Marathon is out)"],
    [DY(2019, 5, 15), "Homelander (leader), Queen Maeve, Black Noir, The Deep, A-Train, Translucent. Lamplighter has just retired (Vought announced it); his seat is open"],
    [DY(2019, 5, 24), "Homelander (leader), Queen Maeve, Black Noir, The Deep, A-Train, Translucent, Starlight (the newest, in the retired Lamplighter's seat since May 24)"],
    [DY(2019, 5, 28), "Homelander (leader), Queen Maeve, Black Noir, The Deep, A-Train, Starlight. Translucent's seat is empty (dead; Vought tells the public he's on a classified mission)"],
    [DY(2019, 6, 22), "Homelander (leader), Queen Maeve, Black Noir, A-Train, Starlight. Two empty seats: Translucent (dead; the public is told he's on a classified mission) and The Deep (sent to Sandusky, Ohio, on \"sabbatical\")"],
    [DY(2019, 6, 24), "Homelander (leader), Queen Maeve, Black Noir, Starlight, and A-Train (out of action after a heart attack Vought keeps quiet). Two empty seats: Translucent (dead; the public is told he's on a classified mission) and The Deep (exiled to Sandusky, Ohio)"],
    [DY(2020, 9, 30), "Homelander (leader), Queen Maeve, Black Noir, Starlight, Stormfront (joined September 30), and A-Train (recovering, out of action). Translucent's death is public now (blamed on a Supe-terrorist). The Deep is still exiled"],
    [DY(2020, 10, 3), "Homelander (leader), Queen Maeve, Black Noir, Starlight, Stormfront, A-Train (back at work). The Deep is still exiled"],
    [DY(2020, 10, 5), "Homelander (leader), Queen Maeve, Black Noir, Starlight, Stormfront. Homelander has thrown A-Train out (Vought calls it a retirement from October 8); Shockwave is lined up for the seat. The Deep is still exiled"],
    [DY(2020, 10, 12), "Homelander (leader), Queen Maeve, Black Noir, Stormfront. Starlight is held in Vought Tower as a traitor; A-Train is out; The Deep is still exiled"],
    [DY(2020, 10, 14), "Homelander (leader), Queen Maeve, Stormfront, and Black Noir (in a coma). Starlight is held as a traitor; A-Train is out; Shockwave, lined up for his seat, died at the hearing"],
    [DY(2020, 10, 16), "Homelander (leader), Queen Maeve, Starlight (reinstated), Black Noir (in a coma). Stormfront is maimed and disowned; A-Train is promised his seat back; The Deep is refused"],
    [DY(2021, 8, 7), "Homelander (leader), Queen Maeve, Black Noir, Starlight, A-Train (back since August 2021)"],
    [DY(2022, 6, 1), "Homelander and Starlight (co-captains since June 1), Queen Maeve, Black Noir, A-Train"],
    [DY(2022, 6, 4), "Homelander and Starlight (co-captains), Queen Maeve, Black Noir, A-Train, The Deep and Supersonic (both joined June 4)"],
    [DY(2022, 6, 6), "Homelander and Starlight (co-captains), Queen Maeve, Black Noir, A-Train, The Deep. Supersonic is dead (secretly killed by Homelander; Vought calls it an overdose)"],
    [DY(2022, 6, 8), "Homelander and Starlight (co-captains), Black Noir, A-Train, The Deep. Queen Maeve is secretly held by Vought (the public is told she's at a wellness retreat)"],
    [DY(2022, 6, 9), "Homelander (leader), A-Train, The Deep, Black Noir (secretly missing). Starlight quit on June 8. Queen Maeve is secretly held by Vought (the public is told she's at a wellness retreat)"],
    [DY(2022, 6, 15), "Homelander (leader), A-Train, The Deep, and Black Noir in name (secretly dead). Queen Maeve is presumed dead (secretly alive and powerless, in hiding). Starlight quit"],
    [DY(2022, 7, 15), "Homelander (leader), The Deep, A-Train, Black Noir (secretly a new man in the suit, Black Noir II; the public doesn't know the first one died). Ryan lives with Homelander but isn't a member"],
    [DY(2024, 11, 9), "Homelander (leader), The Deep, A-Train, Black Noir II, and from November 9 Sister Sage and Firecracker"],
    [DY(2024, 12, 26), "Homelander (leader), Firecracker, The Deep, Black Noir II. A-Train is gone (exposed as the Boys' informant; the public is told he's on a mission overseas); Sister Sage has been thrown out"],
    [DY(2025, 1, 7), "Homelander (leader), Sister Sage (back as his right hand), Firecracker, The Deep, Black Noir II. A-Train has deserted (the public is told he's on a secret mission overseas)"],
    [DY(2026, 2, 13), "Homelander (leader), Sister Sage, Firecracker, The Deep, Black Noir II. A-Train is dead (Homelander killed him February 12; Vought blames the Starlighters); Soldier Boy, just thawed, has been offered a place"],
    [DY(2026, 2, 15), "Homelander (leader), Soldier Boy (presented February 15 as Homelander's father and number two), Sister Sage, Firecracker, The Deep, Black Noir II"],
    [DY(2026, 3, 13), "Homelander (leader), Soldier Boy, Sister Sage, The Deep, Black Noir II. Firecracker is dead"],
    [DY(2026, 3, 16), "Homelander (leader), Soldier Boy, The Deep. Black Noir II is dead (The Deep killed him March 15); Sister Sage has deserted"],
    [DY(2026, 4, 1), "none: Homelander abolished the Seven on April 1; Soldier Boy and The Deep are still at his side"],
    [DY(2026, 4, 2), "none: the Seven is abolished; Soldier Boy is back on ice; The Deep clings to Homelander"],
    [DY(2026, 4, 6), "none. The Seven no longer exists"]
  ];
  // Who runs Vought
  const BOSSES = [
    [DY(1990, 1, 1), "Stan Edgar is CEO. Madelyn Stillwell, Senior VP of Hero Management, runs the Seven and manages Homelander, who takes her orders and resents it"],
    [DY(2019, 6, 24), "Stan Edgar is CEO and now deals with the Seven himself; Madelyn Stillwell is dead"],
    [DY(2019, 7, 1), "Stan Edgar is CEO and deals with the Seven himself. Ashley Barrett has Stillwell's old title, but Homelander ignores her"],
    [DY(2022, 6, 6), "Stan Edgar has been forced out (June 6); Homelander answers to no one, and the board hasn't named a new CEO"],
    [DY(2022, 6, 7), "Ashley Barrett is CEO in name only. Homelander runs Vought by fear and answers to no one. Stan Edgar is out"],
    [DY(2025, 10, 2), "Sister Sage has taken over as CEO. Homelander rules Vought and, through President Calhoun, the country"],
    [DY(2026, 3, 15), "Sister Sage has deserted. Homelander rules Vought and, through President Calhoun, the country"],
    [DY(2026, 4, 1), "Homelander rules Vought and the country; Ashley Barrett is President"],
    [DY(2026, 4, 6), "Stan Edgar is CEO again and is cleaning house"],
    [DY(2026, 4, 20), "Stan Edgar is CEO again and has fired every hero who backed Homelander"]
  ];
  // The state of the world
  const WORLD = [
    [DY(1990, 1, 1), "Homelander, public since 1999, is America's favorite hero; since 9/11 the Seven stay home as symbols and never deploy abroad. The public believes Supes are born with their powers."],
    [DY(2012, 1, 24), "The public believes Supes are born with their powers. Secret: Vought is hiding Becca Butcher, who vanished on January 24, pregnant by Homelander; he doesn't know."],
    [DY(2012, 4, 15), "The public believes Supes are born with their powers. Secret: Vought is hiding Becca Butcher and her child by Homelander, who doesn't know. Secret: Grace Mallory's Boys spy on and blackmail Supes for the CIA."],
    [DY(2015, 5, 22), "The public believes Supes are born with their powers. Secret: Vought is hiding Becca Butcher and Homelander's son, Ryan. The Boys have disbanded."],
    [DY(2019, 5, 24), "The public believes Supes are born with their powers. Secret: Vought is hiding Becca Butcher and Homelander's son, Ryan. Secret: Billy Butcher is rebuilding the Boys to hunt the Seven, with no official backing."],
    [DY(2019, 6, 24), "Supes are cleared for the military, and Supe-terrorists (secretly created by Homelander) are the new scare. Madelyn Stillwell is dead and Billy Butcher is wanted for it; the Boys are fugitives. The public still believes Supes are born. Secret: Homelander has found Becca Butcher and his son, Ryan, in Vought's compound and visits when he likes."],
    [DY(2020, 10, 17), "The public knows Vought makes Supes with Compound V (Vought blames rogue scientists). Stormfront is disgraced as a Nazi. Victoria Neuman leads the new federal effort to police Supes; the Boys are cleared. Stan Edgar keeps Homelander on a short leash. Secret: the CIA is hiding Ryan with Grace Mallory."],
    [DY(2022, 6, 17), "Homelander controls Vought and no longer hides his temper; his base loves it. He killed a protester on camera and faces a murder charge. Starlight has left the Seven and leads the Starlighters against him; the Boys work against him. Ryan lives with Homelander. The public thinks Soldier Boy and Queen Maeve are dead (he's on ice; she's alive, powerless, in hiding). Victoria Neuman is Robert Singer's running mate."],
    [DY(2025, 1, 7), "President Calhoun rules by martial law for Homelander: Supes are deputized, Starlighters are rounded up into Freedom Camps, Robert Singer is in prison, and VNN is state TV. Starlight leads an underground resistance; Billy Butcher is at large with a virus that kills Supes."],
    [DY(2026, 4, 7), "Homelander is dead and disowned by everyone who served him. Robert Singer is President again and Vought under Stan Edgar is cleaning house. Starlight still works as a hero; the Boys have disbanded."]
  ];
  const at = (table, n) => { let v = table[0][1]; for (const row of table) if (n >= row[0]) v = row[1]; return v; };
  const rosterFor = (n) => at(ROSTERS, n);

  // Canon, day by day: [date, "p" planned or "s" sudden, groups involved, what happens (the whole truth, secrets included),
  // a short line for later lists ("" = none), and optionally what it depends on that its text doesn't name ("!Name": that
  // person's canon death; "Name": that person alive), for branch mode]. From the episodes; days the shows don't pin down are best estimates.
  const CANON = [
    ["2005-03-15", "p", "Vought,GodU", "Secret: Marie Moreau is born to Jackie and Malcolm Moreau through Project Odessa, Vought's covert program at Godolkin's fertility clinic that doses embryos with Compound V. She shows no powers and is written off as a failure.", ""],
    ["2005-07-01", "p", "Vought,GodU", "Secret: Stan Edgar shuts down Project Odessa after its last child, Marie Moreau, shows no powers. Of all its children only she and Homelander survive.", ""],
    ["2005-07-01", "p", "", "Emma Meyer, later the shrinking Supe Little Cricket, is born.", ""],
    ["2005-07-01", "p", "Vought", "Annie January, a child, competes in Vought's kid pageants (Little Miss Hero, Capes for Christ), pushed by her mother, Donna; her rival is Sparkler, the future Firecracker. Later she joins Vought's teen team, the Young Americans.", ""],
    ["2006-07-01", "p", "Church", "Carol Mannheim joins the Church of the Collective; she becomes the counselor who handles its famous recruits.", ""],
    ["2007-06-15", "p", "Vought,Seven,GodU", "Vought Studios opens its movie universe with The Deep: Rising Tide, starring The Deep, still a Godolkin student; Queen Maeve: Her Majesty follows this summer.", "Vought's movie universe opened with The Deep: Rising Tide"],
    ["2007-07-01", "s", "Vought", "Sister Sage (Jessica Bradley) quits Vought's teen team Teenage Kix after less than a year; she resents how Vought treats her for her race.", ""],
    ["2007-12-14", "p", "Vought", "Vought releases Teenage Kix: Home for Kwanzaa, a holiday film starring its teen team.", ""],
    ["2008-07-01", "p", "Vought", "Vought Music Group releases Rock My Kiss by its boy band Super-Sweet, fronted by the teen Supe later known as Supersonic; the video shows off his powers.", "Super-Sweet had a hit with Rock My Kiss"],
    ["2010-06-01", "p", "Seven,Vought,GodU", "At the Vought Hero Draft, The Deep (Kevin Kohler), just graduated from Godolkin under Professor Brinkerhoff, is drafted into the Seven, filling its seventh seat; Vought rolls him out everywhere.", "The Deep joined the Seven"],
    ["2011-12-24", "p", "Vought,Seven", "At Vought's Christmas party in Vought Tower, Becca Butcher, Vought's Senior Director of Digital Marketing, who handles Homelander's social media, introduces her husband, Billy, to Homelander.", ""],
    ["2011-12-28", "s", "Seven,Vought", "Secret: days after the party, Homelander sexually assaults Becca Butcher in a private room at Vought.", ""],
    ["2012-01-24", "p", "Vought", "Becca Butcher is last seen on Vought's security cameras, then vanishes. Secret: pregnant by Homelander, she goes to Vought; Madelyn Stillwell and Jonah Vogelbaum hide her under an NDA, and Homelander isn't told.", "Becca Butcher, a Vought marketing director, vanished"],
    ["2012-04-15", "p", "Boys,Gov", "With Becca presumed dead, CIA officer Grace Mallory tells Billy Butcher Homelander sexually assaulted her; sure he killed her, Butcher founds the Boys with her, a deniable CIA unit that spies on and blackmails Supes. Mother's Milk joins.", ""],
    ["2012-05-15", "p", "Boys,Gov", "Arrested with his friends Cherie and Jay after a botched bank heist, Frenchie, a maker of anti-Supe gadgets, takes Grace Mallory's offer: work for the Boys or 25 years in prison.", ""],
    ["2012-06-02", "p", "", "Mother's Milk and Monique's daughter, Janine, is born.", ""],
    ["2012-09-15", "p", "Vought", "Secret: in a guarded Vought facility Becca Butcher gives birth to Homelander's son, Ryan, with Madelyn Stillwell and Jonah Vogelbaum overseeing. Homelander isn't told; Vought hides mother and son.", ""],
    ["2013-07-01", "p", "", "Victoria Neuman, Stan Edgar's adopted daughter, has a daughter, Zoe; the father is Sameer Shah, a scientist in Edgar's Vought R&D.", ""],
    ["2013-07-01", "p", "Vought", "Supersonic's single You Got Your License to Drive (Me Crazy) becomes a hit.", ""],
    ["2014-03-02", "p", "Seven", "Homelander and Queen Maeve, a couple, are the stars of the Oscars red carpet, then go to an Oscars party, where a producer flirts with Maeve.", "Homelander and Maeve starred on the Oscars red carpet"],
    ["2014-03-04", "s", "Seven", "Secret: Homelander murders the producer who flirted with Queen Maeve at the Oscars party and burns his office.", ""],
    ["2014-07-01", "s", "GodU", "Godolkin University bans the fraternity Gamma Epsilon Delta after a pledge dies.", "Godolkin banned Gamma Epsilon Delta after a pledge died"],
    ["2015-05-11", "p", "Boys,Gov,Seven", "Secret: Grace Mallory's Boys blackmail Lamplighter with compromising photos into spying on the Seven for them; Frenchie is put on his tail.", ""],
    ["2015-05-15", "p", "Seven,Boys,Gov", "Secret: Frenchie leaves his post tailing Lamplighter to save his friend Jay from an overdose; Lamplighter sets fire to Grace Mallory's bed to kill her and burns her two grandchildren to death. He never tells Vought about the Boys.", ""],
    ["2015-05-22", "s", "Boys,Gov", "Grace Mallory disbands the Boys and retires as CIA deputy director. Frenchie never says why he left his post; the members stop speaking. Mother's Milk becomes a juvenile detention counselor; Frenchie drifts back into crime.", ""],
    ["2015-05-31", "p", "Seven,Vought,GodU", "At the Vought Hero Draft A-Train, fresh from Godolkin, beats Mister Marathon in a public race and takes his seat in the Seven, its first Black member; Homelander refuses Marathon a rematch. Stillwell presents A-Train on TV.", "A-Train beat Mister Marathon and took his seat in the Seven"],
    ["2015-05-31", "s", "", "As her parents watch A-Train on the news, Marie Moreau, 10, gets her first period and her blood powers erupt, killing both of them; her little sister, Annabeth, survives, and the two are separated.", ""],
    ["2015-06-15", "p", "Vought", "Marie Moreau, 10, is placed at Red River Institute, Vought's group home for orphaned and abandoned Supe children; she stays there until she starts at Godolkin in 2023.", ""],
    ["2016-07-01", "p", "", "Mother's Milk, now a juvenile detention counselor, marries Monique.", ""],
    ["2017-07-01", "p", "Church", "The documentary Inner Lights Out: Escaping the Church of the Collective wins critical acclaim; the Church answers with 400 separate lawsuits against its filmmaker.", "A documentary exposed the Church of the Collective"],
    ["2019-04-15", "p", "", "Secret: the Shining Light Liberation Army, which killed Kimiko Miyashiro's parents and made her a child soldier in the Philippines, smuggles her into New York, injects her with Compound V and has a Triad cage her under a bodega.", ""],
    ["2019-05-15", "p", "Seven,Vought", "Vought announces that Lamplighter is retiring from the Seven and starts choosing a young Supe for his seat. Secret: Vought is pushing him out.", "Lamplighter retired from the Seven"],
    ["2019-05-20", "s", "Seven,Vought", "High on Compound V, A-Train runs through Robin Ward as she steps off a New York curb holding Hughie Campbell's hands, killing her. He tells the press she stepped into his path while he chased bank robbers.", "A-Train killed Robin Ward; Vought called it an accident during a chase"],
    ["2019-05-24", "p", "Seven,Vought", "At Vought's annual shareholders presentation The Deep introduces Starlight (Annie January) as the Seven's newest member, in the retired Lamplighter's seat.", "Starlight joined the Seven in the retired Lamplighter's seat"],
    ["2019-05-24", "s", "Seven", "Showing Starlight around Seven Tower on her first day, The Deep exposes himself and coerces her into a sex act, threatening to tell Homelander she attacked him if she refuses.", "The Deep sexually coerced Starlight on her first day in the Seven"],
    ["2019-05-24", "p", "Boys", "Billy Butcher, posing as FBI, shows Hughie Campbell CCTV of A-Train laughing about Robin's death and asks him to plant a bug in Seven Tower. Hughie agrees and tells Vought he'll sign the NDA if A-Train apologizes in person.", "Billy Butcher recruited Hughie Campbell"],
    ["2019-05-24", "s", "Seven,Boys", "Starlight sits on a Central Park bench beside Hughie Campbell; as strangers they trade stories of their bad days, and she resolves to stay in the Seven and face her teammates.", "Hughie Campbell and Starlight met by chance in Central Park"],
    ["2019-05-25", "p", "Boys,Seven,Vought", "Hughie signs Vought's NDA at Seven Tower, takes a grudging apology from A-Train and plants Butcher's bug in the Seven's meeting room.", ""],
    ["2019-05-25", "s", "Boys,Seven", "Translucent, who saw the bug planted, attacks Hughie at Bryman Audio; Butcher rams a car through the storefront, Hughie electrocutes Translucent, and they take him captive.", "the Boys captured Translucent"],
    ["2019-05-25", "s", "Seven", "The Baltimore mayor's jet goes down; reports blame engine trouble. Secret: Homelander downed it with his heat vision, killing the mayor, his son and all aboard, because the mayor threatened to expose Compound V.", "the Baltimore mayor's jet crashed, killing everyone aboard"],
    ["2019-05-26", "s", "Boys", "Butcher brings the captive Translucent to his old partner Frenchie, who locks him in an electrified cage under an abandoned restaurant to block Vought's tracker. A special bullet fails to pierce his skin.", "Frenchie rejoined Billy Butcher"],
    ["2019-05-26", "p", "Vought,Gov", "At Stillwell's Vought fundraiser for half the Senate Appropriations Committee, Senator Calhoun, afraid of Homelander, refuses to back Supes in national defense; that night Doppelganger seduces him for compromising photos.", ""],
    ["2019-05-27", "p", "Boys,Seven", "Frenchie packs C-4 inside the caged Translucent. As Homelander tracks him down, a set explosion draws Homelander off; Translucent breaks out, and Hughie detonates the C-4, killing him.", "Hughie Campbell killed Translucent with a bomb placed inside him"],
    ["2019-05-27", "p", "Vought,Gov", "Stillwell confronts Senator Calhoun with Doppelganger's photos; blackmailed, he agrees to support putting Supes in the military.", "Stillwell blackmailed Senator Calhoun into backing Supes in the military"],
    ["2019-05-27", "s", "Seven", "On her first patrol, a team-up with The Deep, Starlight warns him she'll kill him if he touches her again. Later, out of costume, she beats two men attempting a rape; a bystander's video goes viral.", "Starlight, out of costume, stopped an attempted rape caught on video"],
    ["2019-05-27", "p", "Boys", "Butcher visits Mother's Milk at the juvenile detention center where he counsels, tells him they killed Translucent, and brings him back into the Boys.", "Mother's Milk rejoined Billy Butcher"],
    ["2019-05-27", "s", "Seven", "Homelander and Queen Maeve stop a sniper in a high-rise; officially self-defense. Secret: Homelander kills him outright, then fires an assault rifle into Maeve's chest so it looks like a gunfight.", "Homelander and Queen Maeve stopped a high-rise sniper"],
    ["2019-05-28", "p", "Seven,Vought", "After secretly taking Compound V, A-Train beats the young speedster Shockwave in the pay-per-view 'Race of the Century'; afterward he tells the press he's single, breaking his word to his girlfriend Popclaw.", "A-Train beat Shockwave in the pay-per-view 'Race of the Century'"],
    ["2019-05-28", "s", "Boys", "High on Compound V, Popclaw crushes her landlord Aleksy Lutz's skull with her thighs during sex. The Boys, watching through her hacked cameras, burst in and blackmail her into informing on A-Train's V.", "the Boys blackmailed Popclaw over her landlord's death"],
    ["2019-05-28", "s", "Seven,Vought", "The Deep brings Homelander and Stillwell a box a porpoise found on the harbor floor: Translucent's remains, 'COMING FOR YOU' sprayed inside the lid. Homelander calls it a declaration of war.", "Vought found Translucent's remains and kept his death secret"],
    ["2019-06-04", "p", "Boys,Gov", "Butcher shows CIA Deputy Director Susan Raynor photos of A-Train and Popclaw injecting Compound V; she won't act without a sample, and hints she knows what happened to Translucent.", ""],
    ["2019-06-04", "s", "Boys", "Trailing A-Train's V drop from a noodle shop, Mother's Milk, Frenchie and Hughie find a young woman (Kimiko) caged by a Triad cell. Frenchie frees her; she kills her captors and flees. They call her the Female.", "the Boys freed a caged Supe they called the Female"],
    ["2019-06-04", "s", "Seven,Vought", "Hijacked Flight 37 crashes in the Atlantic, killing all 123 aboard, Indira Shetty's husband and daughter among them. Secret: Homelander and Maeve reached it; his heat vision wrecked the controls, and he made Maeve leave everyone to die.", "hijacked Flight 37 crashed in the Atlantic, killing all 123 aboard"],
    ["2019-06-04", "s", "Seven", "The Deep 'rescues' a dolphin from Oceanland in a truck; at a police roadblock it flies through the windshield and is run over.", "The Deep's dolphin 'rescue' from Oceanland ended with the dolphin run over"],
    ["2019-06-04", "s", "Boys,Seven", "The Female kills a nail-salon owner tied to her captors. Frenchie finds her near Penn Station; A-Train attacks her until Frenchie rouses a crowd of fans, and Butcher knocks her out with halothane. The Boys take her.", ""],
    ["2019-06-05", "s", "Seven,Vought,Gov", "As Flight 37 wreckage washes ashore, Homelander tells the press the Seven came too late because they aren't in the military chain of command, and demands Supes in the military. Public support surges.", "Homelander used Flight 37 to demand Supes in the military"],
    ["2019-06-06", "s", "Seven", "Popclaw dies of a heroin overdose in Havana. Secret: A-Train, who sent her there to hide, injects her himself to keep her from talking, then tells Homelander she overdosed.", "Popclaw died of a heroin overdose in Havana"],
    ["2019-06-06", "p", "Seven,Vought", "At Ezekiel's Believe Expo (June 6-10), Homelander leads a Flight 37 remembrance, then leaves his script: he answers to a higher power and won't wait for Congress to protect America. Stillwell is dismayed.", "Homelander vowed at Believe Expo not to wait for Congress"],
    ["2019-06-06", "s", "Seven,Vought", "Told to give a scripted faith testimony at the Believe Expo, Starlight stops the music and tells the crowd the truth about her faith, her compromises and a sexual assault by a fellow hero (The Deep, unnamed).", "Starlight said at Believe Expo that a fellow hero sexually assaulted her"],
    ["2019-06-06", "p", "Boys", "Using Starlight's pass, Hughie corners Ezekiel at the Believe Expo and blackmails him with a sex tape into revealing where Vought's next Compound V shipment is going.", ""],
    ["2019-06-06", "p", "Boys", "Butcher and Mother's Milk hit the V shipment's hospital and find newborns on Compound V drips: Supes are made, not born. Gunmen attack; Butcher kills them with a laser-eyed baby's heat vision and keeps a V sample.", "the Boys found Vought dosing newborns with Compound V"],
    ["2019-06-06", "s", "Seven,Boys", "A-Train traces Frenchie from Popclaw's tape, and Black Noir catches him in an alley. The Female fights Noir and is left gutted in the road, then heals.", ""],
    ["2019-06-20", "p", "Vought,Seven", "Stillwell fires Ashley Barrett for booking Starlight at the Believe Expo. Starlight refuses to be reined in and threatens to expose The Deep's assault and Vought's cover-ups; Stillwell backs off.", "Vought fired Ashley Barrett after Starlight's Believe Expo speech"],
    ["2019-06-21", "p", "Boys", "For visits with his daughter, the telepath Mesmer reads the Female for Mother's Milk: she's Kimiko, kidnapped with her brother and made a V-powered terrorist. Butcher concludes Vought is making super-villains.", ""],
    ["2019-06-21", "s", "Seven,Boys", "Mesmer sells out the Boys, handing Homelander spy-cam photos of Hughie and the others in hope of a good word at Vought.", "Mesmer sold out the Boys to Homelander"],
    ["2019-06-21", "p", "Boys,Gov", "Butcher gives Raynor a Compound V sample and demands pay, an office and Homelander's prosecution. She agrees to everything but Homelander, fearing what he'd do, and Butcher walks away.", ""],
    ["2019-06-21", "p", "Seven,Vought", "On Stillwell's orders The Deep apologizes to Starlight on TV, saying he thought it was consensual, and Vought sends him on 'sabbatical' to Sandusky, Ohio.", "The Deep apologized to Starlight on TV and left for Sandusky, Ohio"],
    ["2019-06-22", "p", "Seven,Vought", "The Deep moves into an apartment in Sandusky, Ohio, expecting to fight crime; the town has almost none, and he starts writing 'Deeper: A Memoir'.", ""],
    ["2019-06-22", "s", "Boys,Seven", "A-Train seizes Hughie's father and calls Hughie; Hughie trades a vial of Compound V for him, and Kimiko breaks A-Train's leg with a crowbar.", ""],
    ["2019-06-22", "p", "Boys", "Butcher corners Mesmer in a subway station restroom and smashes his head against a sink until he dies.", "Billy Butcher killed Mesmer"],
    ["2019-06-22", "p", "Seven,Vought", "Homelander questions retired Vought scientist Jonah Vogelbaum, who says Becca Butcher conceived Homelander's child eight years ago and that both died in childbirth.", ""],
    ["2019-06-22", "p", "Boys,Gov", "Exposed, Butcher takes Raynor's deal after all: CIA agents shelter Mother's Milk's and Hughie's families, and Butcher hands over a vial of Compound V.", ""],
    ["2019-06-22", "p", "Gov,Vought", "Raynor tells Stillwell the CIA knows Vought lies about how Supes are made and orders her to drop the military deal, or the agency goes public and sinks Vought's stock.", ""],
    ["2019-06-22", "p", "Gov,Seven", "In Syria a Compound V-powered terrorist, Naqib, wipes out a US Navy SEAL team; Raynor sees the footage. Homelander secretly had V given to terrorists so the government would need the Seven.", "a Supe-terrorist, Naqib, wiped out a US Navy SEAL team in Syria"],
    ["2019-06-22", "s", "Boys,Seven", "In a park Starlight confronts Hughie over Translucent and tries to turn him in; Butcher shoots her twice in the chest with a sniper rifle so Hughie can get away. She survives.", ""],
    ["2019-06-23", "s", "Seven,Gov", "In Syria Homelander sends US troops away from a drug warehouse, kills the gang inside with his heat vision and leaves with its Compound V.", ""],
    ["2019-06-23", "p", "Gov,Vought,Seven,Boys", "The Pentagon clears Vought's heroes for military service, a deal worth over $40 billion a year. Secret: Defense Secretary Robert Singer keeps Compound V classified, and the Justice Department brands the Boys fugitives.", "the Pentagon cleared Supes for military service"],
    ["2019-06-23", "p", "Boys", "Butcher takes Hughie to Grace Mallory, the retired CIA officer who founded the Boys. She refuses, then relents: Homelander's weakness is Madelyn Stillwell.", ""],
    ["2019-06-23", "s", "Boys,Vought", "Vought-linked commandos raid the Boys' motel, tranquilize Kimiko and haul her, Frenchie and Mother's Milk to a black site.", ""],
    ["2019-06-23", "s", "Seven", "In Sandusky The Deep learns Vought won't let him leave and has built new marketing around his exile; he shaves his head and body in despair.", ""],
    ["2019-06-23", "p", "Vought", "At a Vought fundraiser Stan Edgar gives Stillwell a bonus, moves her to his floor and all but offers her his job, saying he means to retire to Belize.", ""],
    ["2019-06-23", "s", "Seven,Vought", "Homelander tells Stillwell he made the Supe-terrorists: he and A-Train got Compound V to terrorists, Naqib among them, so Congress would need the Seven. They sleep together.", ""],
    ["2019-06-23", "p", "Boys,Seven", "Hughie lets the commandos take him, picks the lock with wire from his retainer and frees Frenchie and Mother's Milk; they reach Kimiko, and Starlight's blinding light clears the guards.", ""],
    ["2019-06-23", "s", "Seven,Vought,Boys", "Back on Compound V, A-Train catches the fleeing Boys, admits killing Popclaw and has a heart attack. Hughie starts CPR; Starlight saves him and sends Hughie off. Vought hides his condition.", "A-Train had a heart attack; Vought kept it secret"],
    ["2019-06-23", "p", "Boys", "Butcher waits in the dark in Madelyn Stillwell's home, takes her hostage and straps C-4 to her to lure Homelander.", ""],
    ["2019-06-23", "s", "Seven,Vought,Boys", "Homelander arrives holding Stillwell's baby, Teddy; having learned she lied about his son, he kills her with his heat vision. Butcher sets off the C-4, and Homelander pulls him from the blast.", "Vought executive Madelyn Stillwell was killed in her home"],
    ["2019-06-24", "s", "Seven,Boys,Vought", "Homelander brings Butcher to the suburban home where Becca, hidden by Vought for eight years, is raising Homelander's son Ryan. Told Homelander is his father, Ryan's eyes glow red.", "Homelander found Becca Butcher alive, raising his son Ryan"],
    ["2019-06-24", "s", "Boys,Gov", "Butcher wakes on a roadside by a restaurant, jots what he recalls of Becca's house on a placemat ('yellow ranch', 'big pines'), and sees on TV he's wanted nationwide for Stillwell's murder.", "the FBI launched a nationwide manhunt for Billy Butcher"],
    ["2019-06-25", "s", "Boys", "On the run, Butcher drives to his old Royal Marines comrade Jock for help finding Becca; Jock tips off the authorities, and Butcher kills him and burns the body.", ""],
    ["2019-07-01", "p", "Vought,Seven", "Vought names Ashley Barrett Senior VP of Hero Management in Stillwell's place; Stan Edgar now handles the Seven and Homelander himself, and Homelander ignores her.", "Vought named Ashley Barrett SVP of Hero Management", "!Madelyn Stillwell"],
    ["2019-07-01", "p", "Vought", "Stillwell's baby son Teddy, a teleporter, is placed at Vought's Red River Institute.", ""],
    ["2020-09-30", "p", "Vought,Seven", "At Translucent's public funeral Vought announces his death; Homelander blames a Supe-terrorist called El Diablo and vows revenge, and Starlight sings a tribute. Secret: Hughie Campbell killed him in May 2019.", "Vought held Translucent's funeral, blaming Supe-terrorist El Diablo"],
    ["2020-09-30", "p", "Seven,Vought", "Stormfront, picked by Stan Edgar without asking Homelander, announces on a livestream that she joins the Seven; Homelander confronts Edgar. Secret: she is Klara Risinger, born 1919, a Nazi and Frederick Vought's wife.", "Stormfront joined the Seven"],
    ["2020-09-30", "s", "Gov,Boys", "As CIA deputy director Susan Raynor tells the fugitive Boys that Vought is behind the Supe-terrorists, a coup from within, her head explodes. The Boys flee, blaming Vought. Secret: Victoria Neuman did it.", "CIA deputy director Susan Raynor died suddenly"],
    ["2020-09-30", "s", "Boys", "Billy Butcher, missing since June 2019, walks back into the Boys' hideout under a pawn shop; Frenchie called him. Hughie is not glad to see him.", ""],
    ["2020-09-30", "p", "Seven", "Black Noir secretly kills Naqib, the Supe-terrorist who wiped out a Navy SEAL team, in Syria.", ""],
    ["2020-09-30", "s", "Seven,Vought", "Homelander smashes the ears of Blindspot, the blind hero Ashley Barrett pitched for the Seven, and warns her that he alone picks its members.", ""],
    ["2020-09-30", "p", "Boys,Seven", "Hughie asks Starlight for a Compound V sample to leak. She films Gecko, a regenerating Vought lab worker who sells his severed limbs, and blackmails him into stealing one.", ""],
    ["2020-10-01", "p", "Church", "Arrested drunk at a Sandusky water park after being cut from Translucent's funeral photos, The Deep is bailed out by Eagle the Archer and taken into the Church of the Collective by Carol.", "The Deep joined the Church of the Collective"],
    ["2020-10-02", "p", "Gov,Boys", "At Susan Raynor's funeral Butcher cuts a deal with Grace Mallory: the Boys bring in the Supe-terrorist, who may lead to Raynor's killer; she clears their records and finds Becca.", ""],
    ["2020-10-02", "p", "Seven,Vought,Boys", "A-Train, out of his coma, shows up at Stormfront's press day to reclaim his seat. He catches Starlight hiding the V sample Gecko stole; she counters that she can prove he killed Popclaw.", "A-Train returned to Vought after a long absence"],
    ["2020-10-03", "p", "Boys", "Hunting the Supe-terrorist, the Boys find Kimiko's brother Kenji; Kimiko tears the head off a Shining Light member and runs with him. That night she chokes Kenji out and the Boys take him to a yacht offshore.", ""],
    ["2020-10-04", "p", "Boys,Vought,Seven", "A news channel airs the Compound V vial Starlight leaked: Supes are made, not born. Stan Edgar denies knowing of it, blames Madelyn Stillwell and promises an investigation. Secret: Starlight and Hughie leaked it.", "Compound V was exposed: Supes are made with a drug"],
    ["2020-10-04", "s", "Seven", "Homelander pushes Ryan off the roof to make him fly; the boy falls. When Homelander grabs Becca, Ryan's eyes glow and he shoves Homelander away.", ""],
    ["2020-10-04", "s", "Boys,Seven,Vought", "Kenji breaks free and downs a police helicopter; The Deep blocks the Boys with a whale. Stormfront kills Kenji, and Vought hails her for stopping his attack. Secret: she killed the Black residents of an apartment block herself.", "Stormfront killed Supe-terrorist Kenji Miyashiro after a deadly attack"],
    ["2020-10-05", "s", "Seven,Vought", "Homelander throws A-Train out of the Seven because his heart can no longer take superspeed; Vought lines up his rival Shockwave to replace him.", ""],
    ["2020-10-05", "p", "Boys", "Given Becca's location by Grace Mallory, Butcher climbs into the Vought compound and reunites with her after eight years. She will not leave without Ryan, whom he calls a freak, and he goes alone.", ""],
    ["2020-10-06", "s", "Vought,GodU", "Furious that Compound V was put in him, Sam Riordan, held at Sage Grove, kills a guard during a visit from his brother Luke and Cate Dunlap; Cate puts him to sleep. Vought moves him to The Woods.", ""],
    ["2020-10-06", "s", "Seven", "In a TV interview Homelander outs Queen Maeve as a lesbian, having overheard her with Elena; Vought decides to sell the romance.", "Homelander outed Queen Maeve as a lesbian on TV"],
    ["2020-10-06", "p", "Seven,Boys", "Stormfront, accusing Vought of failing to stop Supe-terrorists, rallies her followers in Vought Square. Kimiko moves to kill her; Frenchie holds her back.", "Stormfront rallied her fans in Vought Square"],
    ["2020-10-06", "p", "Boys", "On Mallory's lead, Hughie, Mother's Milk and Starlight find Valerie Hunter, whose brother Myron was murdered by Liberty, a Supe unseen since 1979. She shows them that Liberty is Stormfront.", ""],
    ["2020-10-06", "s", "Seven", "Homelander, who has the shapeshifter Doppelganger play Madelyn Stillwell for him, snaps his neck when he turns into Homelander.", ""],
    ["2020-10-07", "s", "Seven,Vought", "Footage surfaces of Homelander killing an innocent boy in a village while confronting a Supe-terrorist; protesters call him a war criminal.", "Footage of Homelander killing a boy sparked protests"],
    ["2020-10-07", "p", "Church", "The Deep marries Cassandra Schwartz, chosen for him by Carol, and becomes the public face of the Church of the Collective; he has signed his bank account over to Alastair Adana.", "The Deep married Cassandra Schwartz and fronted the Church of the Collective"],
    ["2020-10-07", "p", "Boys", "Grieving Kenji, Kimiko slaughters a Russian mob crew in a bar on kill contracts from Frenchie's friend Cherie; Frenchie follows and she pushes him away.", "A Russian mob crew was massacred in a bar"],
    ["2020-10-08", "s", "Gov,Seven", "Homelander shows up uninvited at Victoria Neuman's rally against Vought and says innocents die in wars; the crowd turns on him and he flies off. Stormfront's memes then win his fans back.", "Homelander crashed Victoria Neuman's rally and was booed"],
    ["2020-10-08", "p", "Seven,Boys,Vought", "Black Noir, tracking Butcher since his break-in at Becca's compound, gasses and beats him, Hughie and Mother's Milk at his Aunt Judy's house. Edgar calls Noir off when Butcher threatens to leak photos of Becca and Ryan.", ""],
    ["2020-10-08", "p", "Seven,Vought", "Ashley Barrett gives A-Train the choice to resign with severance or be fired; Vought announces his retirement from the Seven, and Stormfront mocks him.", "A-Train retired from the Seven"],
    ["2020-10-08", "s", "Seven", "Starlight finds Stormfront's emails to Edgar about Sage Grove Center; each threatens to expose the other. Homelander, grateful for her memes, takes Stormfront to Vought Tower and they become lovers.", ""],
    ["2020-10-09", "p", "Boys,Vought", "The Boys and Starlight break into Sage Grove Center in Pennsylvania, Vought's secret site for testing Compound V on adults, and watch Lamplighter burn a patient to death on Stormfront's order.", ""],
    ["2020-10-09", "s", "Boys,Vought", "A scuffle with Lamplighter frees Cindy, who frees the patients; a riot kills staff and Hughie is impaled. Starlight's push kills a driver who pulls a gun. Stormfront zaps Cindy, who survives and hitchhikes away.", ""],
    ["2020-10-10", "p", "Seven,Church", "For Maeve's promise of good press, The Deep brings her a GoPro from the Flight 37 wreck: it shows Maeve and Homelander leaving the passengers to die. Maeve plans to hold it over Homelander.", ""],
    ["2020-10-10", "p", "Gov,Boys", "Mother's Milk, Frenchie and Kimiko bring Lamplighter to Grace Mallory, who comes to kill him for burning her grandchildren; Frenchie talks her into keeping him as a witness against Vought.", ""],
    ["2020-10-10", "p", "Church,Seven", "Over a meal The Deep sets up, Alastair Adana shows A-Train he knows his secrets, from his heart to his Compound V abuse, and draws him into the Church with the promise of a way back into the Seven.", ""],
    ["2020-10-10", "s", "Seven", "Stormfront tells Homelander she is Klara Risinger, born in Berlin in 1919, Frederick Vought's wife and the first Supe, and wants Supes to rule as a master race with him at the head. He embraces her.", ""],
    ["2020-10-12", "s", "Seven", "Radicalized by Stormfront's broadcasts, Tommy Peterson shoots grocery clerk Kuldeep Singh, taking him for a Supe-terrorist.", "A man shot a grocery clerk he took for a Supe-terrorist"],
    ["2020-10-12", "p", "Seven,Vought", "Vought uses Starlight's mother Donna as bait; Black Noir knocks Starlight out and she is locked in a power-proof cell in Vought Tower. Homelander tells the press she was a mole and is in custody.", "Homelander exposed Starlight as a mole; she was taken into custody"],
    ["2020-10-12", "s", "Church", "Expelled from the Church of the Collective, Eagle the Archer says on the news it demanded he cut off his mother; the Church answers with a compromising video of him.", "Eagle the Archer broke with the Church of the Collective"],
    ["2020-10-13", "p", "Boys,Gov", "Jonah Vogelbaum turns down Mallory and Mother's Milk, so Butcher threatens his daughter and blackmails him over hiding Becca until he agrees to testify against Vought.", ""],
    ["2020-10-13", "p", "Seven", "Homelander and Stormfront show Ryan that his home is a Vought compound and the world outside was hidden from him; angry at Becca's lies, Ryan leaves with them and she is left locked in.", ""],
    ["2020-10-13", "s", "Seven,Boys", "Against orders, Hughie has Lamplighter take him into Vought Tower to free Starlight; in the Seven's meeting room Lamplighter sets himself on fire. Hughie frees Donna January with Lamplighter's severed hand.", "Lamplighter burned himself to death in Vought Tower"],
    ["2020-10-13", "s", "Seven,Boys", "The fire alarm lets Starlight out of her cell. Black Noir is strangling her when Queen Maeve forces an Almond Joy into him, knowing his tree-nut allergy: he falls into a coma. Starlight escapes with Hughie and Donna.", ""],
    ["2020-10-14", "p", "Gov,Vought,Boys", "At Victoria Neuman's congressional hearing on Vought, heads explode on live TV as Jonah Vogelbaum is called to testify: he, Shockwave and others die, and Mallory gets Neuman out. Secret: Neuman did it.", "Heads exploded at a congressional hearing on Vought"],
    ["2020-10-15", "p", "Gov,Vought", "Defense Secretary Robert Singer tells Neuman and Mallory the President has authorized military use of Compound V against Supe-terrorists, and brushes off Neuman's claim that Vought staged the hearing attack.", "The President authorized military use of Compound V"],
    ["2020-10-15", "p", "Seven,Boys,Church,Vought", "Stormfront is exposed as a Nazi born in 1919. Secret: A-Train, who overheard Edgar refuse his return over her racism, gave Hughie and Starlight the Church's files on her, and they leaked them.", "Stormfront was exposed as a Nazi born in 1919"],
    ["2020-10-15", "p", "Boys,Vought,Seven", "Becca escapes to the Boys. Butcher secretly offers Edgar Ryan in exchange for Becca, then raids Homelander's cabin with the Boys on Vought's tracking data, drops the deal and sends Becca off with Ryan.", ""],
    ["2020-10-15", "s", "Seven,Boys", "Stormfront wrecks their car, fights off Maeve, Starlight and Kimiko and chokes Becca; Ryan's heat vision maims her and kills Becca. Maeve's Flight 37 footage stops Homelander, who killed Vought's retrieval team; Butcher leaves with Ryan.", ""],
    ["2020-10-16", "p", "Vought,Seven", "At a Vought press conference Edgar says Stormfront acted alone, blames her for the hearing massacre and puts Compound V's public release on hold. Homelander apologizes to Starlight, and she is reinstated.", "Vought blamed Stormfront for the hearing massacre and reinstated Starlight"],
    ["2020-10-16", "p", "Church,Seven", "Alastair Adana tells A-Train that Edgar will take him back into the Seven; The Deep is refused, curses Adana and quits the Church.", ""],
    ["2020-10-17", "p", "Gov,Boys", "The Boys' charges are dropped, and the White House is creating an Office of Supe Affairs under Congresswoman Victoria Neuman. Secret: Butcher hands Ryan to Grace Mallory, who hides him for the CIA.", "The Boys were cleared; Neuman was named to lead a new Office of Supe Affairs", "!Becca Butcher"],
    ["2020-10-19", "s", "Church,Gov", "Church of the Collective leader Alastair Adana vanishes; the Church says he has disappeared. Secret: while offering Victoria Neuman dirt on a dozen Supes for tax-exempt status, he had his head burst by her.", "Church of the Collective leader Alastair Adana disappeared"],
    ["2020-10-19", "p", "Gov,Boys", "Hughie Campbell asks Victoria Neuman at her campaign office to let him fight Vought the legal way; she hires him for the new Office of Supe Affairs. He does not know she just killed Adana.", ""],
    ["2021-07-07", "p", "Vought", "On VNN's monthly Seven on 7, anchor Cameron Coleman spins for Vought: he backs Homelander, out of sight since the Stormfront affair, and attacks the government's halt to talks on Supes in the military.", "VNN's Cameron Coleman defended Homelander on Seven on 7"],
    ["2021-07-07", "p", "Gov,Boys", "As the Federal Bureau of Superhuman Affairs starts work under director Victoria Neuman, she names Hughie Campbell its senior analyst; VNN's Cameron Coleman mocks the hire.", "Neuman named Hughie Campbell senior analyst of the new FBSA"],
    ["2021-07-07", "p", "Church", "VNN asks where Church of the Collective head Alastair Adana is, missing since October, as Eagle the Archer's tell-all book lays out the Church's secrets.", "Eagle the Archer's tell-all book exposed the Church of the Collective"],
    ["2021-08-07", "p", "Seven,Vought", "A-Train comes out of retirement and is officially back in the Seven, promising fans a comeback race.", "A-Train came out of retirement and rejoined the Seven"],
    ["2021-08-07", "p", "Church", "The Deep goes public with bombshell allegations against the Church of the Collective.", "The Deep made allegations against the Church of the Collective"],
    ["2021-09-07", "p", "Gov,Vought", "FBSA director Victoria Neuman and Vought announce a partnership to police 'bad apple' Supes. Secret: the FBSA arrests only the Supes Vought lets it have.", "The FBSA and Vought partnered to police rogue Supes"],
    ["2021-09-07", "p", "Vought", "Vought says it has bought Sage Grove Center to turn it into a Global Wellness project, calling reports that linked it to Sage Grove false. Secret: it was always Vought's Compound V test site.", "Vought bought Sage Grove Center for a wellness project"],
    ["2021-10-07", "s", "Seven", "VNN reports a 'homicidal hitchhiker' killing in the tri-state area; Black Noir, back on duty, vows to hunt her down.", "Black Noir vowed to catch a 'homicidal hitchhiker'"],
    ["2021-10-07", "p", "Gov", "The FBSA goes after the televangelist Supe Ezekiel; VNN's Cameron Coleman calls it overreach and Hughie Campbell a 'supe-hating lapdog'.", "The FBSA went after Ezekiel"],
    ["2021-11-07", "p", "Gov", "Neuman celebrates the FBSA's first 120 days policing Supes. Defense Secretary Robert Singer is said to be weighing a run for President.", "Neuman hailed the FBSA's first 120 days"],
    ["2021-11-07", "p", "Vought", "Law firm Bremer & Bremer sues Vought on behalf of people exposed to Compound V without their consent; VNN calls them handout-seekers.", "Vought was sued over nonconsensual Compound V exposure"],
    ["2021-12-07", "s", "Seven,Vought", "Homelander breaks into Seven on 7 with an on-air apology for the Stormfront affair: 'I'm listening.'", "Homelander apologized on air for the Stormfront affair"],
    ["2021-12-07", "p", "Gov,Vought,Seven", "Gecko is arrested in a joint Vought and FBSA investigation and tries to drag Starlight into it. Secret: he stole the Compound V sample she leaked in 2020.", "Gecko was arrested in a joint Vought-FBSA case"],
    ["2022-05-15", "p", "Vought", "VNN launches The Cameron Coleman Hour, a new show for its star anchor, Cameron Coleman.", "VNN launched The Cameron Coleman Hour"],
    ["2022-05-31", "p", "Vought,Seven", "Vought premieres Dawn of the Seven, its film of the Seven beating Stormfront, at the Lamplighter Memorial Theater; Starlight poses with her boyfriend, Hughie Campbell, and Homelander says Stormfront fooled him.", "Dawn of the Seven premiered"],
    ["2022-05-31", "p", "Boys,Gov", "With Hughie Campbell's sign-off for the FBSA, Butcher, Frenchie and Kimiko stake out a party where Termite, a shrinking Supe, kills a man from inside his body; Kimiko subdues him and Butcher bags him for the Bureau.", "The Boys caught Termite for the FBSA"],
    ["2022-06-01", "p", "Seven,Vought", "Stan Edgar makes Starlight co-captain of the Seven beside Homelander to prop up his sagging popularity; she accepts. Homelander resents sharing the spotlight.", "Starlight became co-captain of the Seven"],
    ["2022-06-01", "p", "Vought,Gov", "Stan Edgar pitches V24, a Compound V whose powers last 24 hours, to Defense Secretary Robert Singer for the military, part of turning Vought toward defense and pharma; Singer balks at the endless resupply.", "Vought secretly pitched V24 to Defense Secretary Singer"],
    ["2022-06-01", "s", "Gov,Boys", "Victoria Neuman bursts the head of Tony, a childhood friend who calls her Nadia and wants her to go public about Red River; a cleanup crew erases it. Hughie Campbell, who followed them into the alley, sees it.", "Victoria Neuman secretly killed a man in an alley"],
    ["2022-06-01", "p", "Boys,Seven", "Queen Maeve secretly gives Butcher a file on Soldier Boy, Payback's leader, reportedly killed by a secret weapon that might kill Homelander, and three vials of V24.", "Maeve secretly gave Butcher a lead on Soldier Boy and V24"],
    ["2022-06-01", "s", "Seven,Boys", "Homelander drops in on Butcher's apartment and demands to know where Ryan is; he backs off, and the two agree to fight to the death one day.", "Homelander and Butcher agreed to fight to the death someday"],
    ["2022-06-03", "s", "Seven", "Stormfront, maimed since 2020, kills herself in her hospital bed on Homelander's birthday.", "Stormfront killed herself"],
    ["2022-06-03", "s", "Seven,Vought", "Filming a rooftop 'birthday save' of a suicidal woman, Chelsea, Homelander hears Stormfront is dead, tells Chelsea there is no God, only him, and sends her falling to her death.", "Homelander sent a suicidal woman to her death"],
    ["2022-06-03", "s", "Seven,Vought", "On his live birthday special, after a heckler calls him a Nazi sympathizer, Homelander denies the $10 million gift Starlight announces in his name and says he never makes mistakes and is the real hero. His approval rises.", "Homelander snapped on live TV; his approval rose"],
    ["2022-06-03", "p", "Boys,Gov,Vought", "Posing as a would-be parent, Hughie Campbell copies Red River's records and finds 'Nadia' is Victoria Neuman, taken in by Stan Edgar. He tells Butcher she's a Supe and agrees to do things Butcher's way.", "Hughie secretly learned Neuman is a Supe raised by Edgar"],
    ["2022-06-03", "p", "Boys,Payback", "Frenchie and Kimiko corner Crimson Countess backstage at Voughtland, where she sings tributes to Soldier Boy; she insists he died a hero, then flees and kills a bystander with a blast.", "Crimson Countess killed a bystander at Voughtland"],
    ["2022-06-03", "p", "Boys,Payback", "Butcher takes his first V24 (Temp V), shrugs off Gunpowder's bullets and kills him with heat vision; Gunpowder admits Soldier Boy's death was no accident and that Payback was in Nicaragua in 1984 for the CIA under Grace Mallory.", "Butcher killed Gunpowder using Temp V"],
    ["2022-06-04", "p", "Boys,Gov", "Grace Mallory tells the regrouped Boys, Mother's Milk back among them, that Soldier Boy vanished on a 1984 CIA mission in Nicaragua, reportedly killed by a Russian weapon. Butcher cuts Ryan off and seeks passage to Russia via Little Nina.", "The Boys learned of Payback's 1984 Nicaragua mission"],
    ["2022-06-04", "p", "Seven,Vought", "On the American Hero finale Starlight and Homelander name The Deep and Supersonic, Starlight's ex, to the Seven, and Homelander says he and Starlight are a couple, #HomeLight. Secret: he forced The Deep and the romance on her.", "The Deep and Supersonic joined the Seven; #HomeLight announced"],
    ["2022-06-05", "s", "Seven", "A-Train tells Homelander that Starlight, Queen Maeve and Supersonic are gathering heroes to stand up to him; Homelander kills Supersonic in secret.", "Homelander secretly killed Supersonic"],
    ["2022-06-06", "p", "Gov,Vought,Seven", "At a press conference Victoria Neuman names Homelander a whistleblower and accuses Stan Edgar of corruption; Edgar is put on leave, and Homelander says Supes should run Vought. Secret: Neuman turned on Edgar to protect her daughter, Zoe.", "Neuman accused Stan Edgar of corruption; Edgar left Vought"],
    ["2022-06-06", "s", "Seven,Gov", "Homelander turns up at Victoria Neuman's home, shows he knows she's the head-popper, praises her for dumping Edgar and calls her his weapon. He gives her Compound V, and she injects her daughter, Zoe.", "Neuman secretly gave her daughter Compound V"],
    ["2022-06-06", "p", "Boys,Payback", "In Moscow Kimiko kills a man for Little Nina to pay the Boys' way; they raid a military lab, Hughie on his first V24, and find Soldier Boy alive in a sealed pod. His blast strips Kimiko's powers and he escapes.", "The Boys freed Soldier Boy from a Russian lab"],
    ["2022-06-07", "p", "Vought,Seven", "Vought's board makes Ashley Barrett CEO at a meeting Homelander runs; he holds the real power, and The Deep heads Crime Analytics. Vought says Supersonic died of an overdose. Secret: Homelander killed him.", "Ashley Barrett became Vought's CEO; Supersonic's death called an overdose"],
    ["2022-06-07", "s", "Payback", "An explosion kills 19 people in Midtown Manhattan. Secret: it is Soldier Boy, back from Russia; he then gets his old suit and Crimson Countess's address from The Legend, his old producer.", "An explosion killed 19 in Midtown Manhattan"],
    ["2022-06-07", "s", "Seven,Vought", "At a community-center apology A-Train arranged, Blue Hawk loses his temper and throws people around, crippling A-Train's brother, Nathan Franklin; on TV Blue Hawk says he stood up to Antifa.", "Blue Hawk crippled A-Train's brother at a community event"],
    ["2022-06-07", "s", "Seven,Vought,Boys", "Smelling Butcher on Queen Maeve, who slept with him, Homelander confronts her; Black Noir attacks her and they lock her in Vought Tower's basement. Vought says she's at a wellness retreat in Malibu.", "Vought said Queen Maeve went to a Malibu wellness retreat"],
    ["2022-06-07", "p", "Payback,Boys", "The Boys leave Crimson Countess at her chimp sanctuary as bait; Soldier Boy kills her for selling him out. Butcher strikes a deal: he'll help Soldier Boy hunt Payback if Soldier Boy helps kill Homelander. Hughie joins in.", "Crimson Countess was killed"],
    ["2022-06-08", "s", "Seven,Payback", "Homelander and The Deep find footage of Soldier Boy killing Crimson Countess; Black Noir, who helped sell him to the Russians in 1984, cuts out his Vought tracking chip and vanishes.", "Black Noir secretly went missing"],
    ["2022-06-08", "s", "Boys", "Little Nina abducts Kimiko and Cherie and makes Frenchie choose which dies; the powerless Kimiko frees herself and kills Nina's men, but Nina escapes.", "Kimiko killed Little Nina's men; Nina escaped"],
    ["2022-06-08", "p", "Gov,Seven", "Victoria Neuman shows Starlight her head-popping power and offers her an alliance against Homelander; Starlight turns her down.", "Neuman secretly offered Starlight an alliance"],
    ["2022-06-08", "p", "Payback,Boys,Seven", "At Herogasm, the TNT Twins' yearly Supe orgy at their house in Montpelier, Vermont, Soldier Boy corners the Twins, who say Black Noir sold him out too; his blast levels the house, killing them and several guests.", "A blast at Herogasm killed the TNT Twins and several guests"],
    ["2022-06-08", "s", "Seven", "At Herogasm A-Train, after apologizing to Hughie Campbell for Robin, drags Blue Hawk across the floor at super-speed, killing him for crippling his brother, then collapses as his heart fails.", "Blue Hawk died at Herogasm"],
    ["2022-06-08", "p", "Seven,Payback,Boys", "Homelander comes to Herogasm to kill Soldier Boy, stepping on and killing the shrunken Termite; Soldier Boy, Butcher and Hughie, both on V24, pin him down, but he escapes before Soldier Boy's power-stripping blast.", "Soldier Boy, Butcher and Hughie nearly beat Homelander"],
    ["2022-06-08", "s", "Seven,Starlighters", "After the carnage at Herogasm, Starlight livestreams that she quits the Seven, accusing Homelander and Vought of lies and revealing that Soldier Boy is alive; her supporters rally as Starlighters.", "Starlight quit the Seven on a livestream, accusing Homelander"],
    ["2022-06-10", "p", "Seven,Vought", "A-Train wakes from surgery with Blue Hawk's heart and can run again; Ashley Barrett tells him Vought's story is that Soldier Boy killed Blue Hawk, and he goes along with it.", "Vought blamed Blue Hawk's death on Soldier Boy"],
    ["2022-06-12", "s", "Payback,Boys", "Closing in on Mindstorm, Soldier Boy trips a trap and Mindstorm locks Butcher in a waking nightmare; on the road, Soldier Boy shoots dead a priest and a nun he and Hughie Campbell meet.", "Soldier Boy shot a priest and a nun"],
    ["2022-06-13", "p", "Payback,Boys", "Hughie Campbell gets Mindstorm to free Butcher's mind in return for his freedom; Mindstorm then says Vought dumped Soldier Boy to make way for his son, and Soldier Boy beats him to death with his shield.", "Soldier Boy killed Mindstorm"],
    ["2022-06-13", "p", "Seven,Gov", "After a rally where Homelander calls Starlight a wolf in sheep's clothing, Victoria Neuman offers him a pact: she gives him Ryan's hiding place, and he'll remove Lamar Bishop, front-runner to be Robert Singer's running mate.", "Neuman and Homelander secretly made a pact"],
    ["2022-06-13", "s", "Starlighters,Seven,Vought", "Sneaking into Vought Tower for Compound V for Kimiko, Starlight finds V24 kills after three to five doses; cornered by Homelander, she records his threats and admissions and posts them for her 190 million viewers.", "Starlight posted a recording of Homelander threatening her"],
    ["2022-06-13", "p", "Boys", "With Compound V Starlight took from Vought, Frenchie injects Kimiko at her request; her wounds heal and her powers return.", "Kimiko took Compound V again and got her powers back"],
    ["2022-06-13", "s", "Seven,Payback", "Soldier Boy calls Homelander: he gave sperm for Vogelbaum's 1980 experiment, which produced a boy in spring 1981. Homelander realizes Soldier Boy is his father.", "Homelander learned Soldier Boy is his father"],
    ["2022-06-14", "s", "Vought,Seven,Boys", "With a search warrant coming, Ashley Barrett and The Deep gas Queen Maeve and truck her out of Vought Tower; she breaks free and makes it to Mother's Milk's house.", "Queen Maeve escaped Vought's custody"],
    ["2022-06-14", "p", "Seven,Gov", "On Victoria Neuman's tip, Homelander finds Ryan at Grace Mallory's safe house, wins him over and takes him to Vought Tower; Mallory can't stop him.", "Homelander took Ryan from Grace Mallory's safe house"],
    ["2022-06-14", "s", "Seven,Payback", "Black Noir returns to Homelander; asked if he always knew Soldier Boy was his father, Noir admits it, and Homelander punches through his gut and kills him. The death is kept secret.", "Homelander secretly killed Black Noir"],
    ["2022-06-14", "p", "Seven,Gov", "Lamar Bishop, front-runner to be Robert Singer's running mate, drowns in his pool. Secret: The Deep drowned him on Homelander's order, Homelander's side of his pact with Victoria Neuman.", "Lamar Bishop, Singer's likely running mate, drowned"],
    ["2022-06-14", "p", "Boys,Payback,Seven", "Butcher and Soldier Boy storm Vought Tower to kill Homelander; when Soldier Boy turns on Ryan, Butcher, the Boys and Starlight fight him. Queen Maeve, an eye lost to Homelander, goes out a window with him as he blasts and loses her powers.", "Soldier Boy attacked Vought Tower; Queen Maeve stopped him"],
    ["2022-06-14", "s", "Payback,Gov", "After the blast, Soldier Boy is taken into CIA custody and put back in cryo-sleep under Grace Mallory's watch; the public thinks he is dead.", "Soldier Boy was secretly put back on ice"],
    ["2022-06-14", "s", "Seven,Boys", "As Butcher and Homelander square off in the wrecked tower, Ryan says he wants to go with Homelander, ending the fight; Butcher collapses, bleeding from the nose after too much V24.", "Ryan chose Homelander over Butcher"],
    ["2022-06-15", "p", "Vought,Seven", "Vought mourns Queen Maeve as a hero who died stopping Soldier Boy at Vought Tower. Secret: she lives, one-eyed and powerless, and leaves to hide with Elena; Ashley Barrett deletes footage of the Boys helping her.", "Queen Maeve died stopping Soldier Boy, Vought said"],
    ["2022-06-15", "s", "Boys", "A doctor tells Butcher that V24 is killing him: he has 12 to 18 months to live.", "Butcher learned V24 is killing him"],
    ["2022-06-15", "s", "Boys,Starlighters", "Annie January throws away her Vought Starlight costume and joins the Boys; Mother's Milk sets the team's rules for her.", "Starlight secretly joined the Boys"],
    ["2022-06-15", "p", "Gov", "Robert Singer, running for President, names Congresswoman Victoria Neuman his running mate after Lamar Bishop's death. Secret: she is a Supe in a pact with Homelander.", "Singer picked Victoria Neuman as his running mate"],
    ["2022-06-16", "s", "Seven,Starlighters", "At a rally of his fans Homelander presents his son, Ryan, who flies beside him; when a Starlighter's thrown can hits Ryan, Homelander kills the man on camera. The crowd cheers, and Ryan smiles.", "Homelander killed a protester on camera; his crowd cheered"],
    ["2022-07-15", "p", "Seven,Vought", "Vought secretly puts a new man in Black Noir's suit: Black Noir II, an actor Supe who can fly, talks nonstop in private and falls asleep at bad moments. The public never learns the first Noir died.", "Vought secretly put a new man in Black Noir's suit"],
    ["2022-07-15", "p", "Seven,Gov", "Homelander is charged with murder in New York for killing the protester; he stays free awaiting trial as his fans, the Hometeamers, rally to him.", "Homelander was charged with murder for killing a protester"],
    ["2023-08-28", "p", "GodU", "Godolkin University's fall term opens. Marie Moreau, 18, arrives from Red River and rooms with Emma Meyer; Dean Indira Shetty says she could be its first top-ranked freshman. Luke Riordan (Golden Boy) is No. 1.", "Godolkin University's fall term began"],
    ["2023-08-29", "s", "GodU", "At Skyscraper Club in the city, Andre Anderson's magnetism trick goes wrong and leaves a woman bleeding out; Marie Moreau saves her with her blood powers, and phone videos of it spread.", "Godolkin freshman Marie Moreau saved a bleeding woman at a club"],
    ["2023-08-30", "s", "GodU", "Richard Brinkerhoff expels Marie to shield the upperclassmen. That evening Luke Riordan (Golden Boy), haunted by visions of his brother Sam and the Woods, burns Brinkerhoff to death, then flies up and explodes, killing himself.", "Golden Boy killed Professor Brinkerhoff and himself"],
    ["2023-08-31", "p", "Vought,GodU", "Vought calls Golden Boy's rampage a drug-fueled psychotic break and credits Marie Moreau with stopping him. As classes start, Godolkin takes her back, lets her audit junior crimefighting classes and puts her in its top 10.", "Vought blamed Golden Boy's rampage on drugs and hailed Marie Moreau"],
    ["2023-09-01", "p", "GodU,Vought", "On TV Marie takes sole credit for stopping Golden Boy, hiding Jordan's part. Secret: led by Luke's hidden recording, Andre finds Brinkerhoff's file on Sam and tracks down the Woods; Cate saves him from guards and collapses.", ""],
    ["2023-09-02", "p", "GodU", "Shetty hosts a memorial gala for Brinkerhoff. During it Emma Meyer, shrunk, sneaks into the Woods for Andre and finds Luke's brother Sam Riordan held there.", "Godolkin held a memorial gala for Professor Brinkerhoff"],
    ["2023-09-02", "s", "GodU", "Alarms catch Emma in the Woods; she kills a guard and hides. Sam breaks free, kills more guards and escapes with her, and Emma hides him at an abandoned drive-in.", ""],
    ["2023-09-03", "p", "Vought,GodU", "Tek Knight tapes his Vought+ show The Whole Truth at Godolkin on Golden Boy's death and makes Marie reveal Jordan's part. Secret: sent to frame a student, he is blackmailed off campus by Shetty and says Golden Boy just snapped.", "Tek Knight's The Whole Truth said Golden Boy simply snapped"],
    ["2023-09-03", "s", "GodU", "That night Sam attacks Dr. Edison Cardosa, who experimented on him, at Cardosa's home; Marie, Andre, Jordan, Emma and Cate subdue him. Cate then secretly wipes the friends' memories of Sam and the Woods.", ""],
    ["2023-09-16", "s", "GodU", "Marie, Jordan, Andre and Emma wake after a party missing days of memory. Sam, at large and killing the guards sent after him, finds them; Cate admits she wiped them all and restores Andre's memories.", ""],
    ["2023-09-17", "s", "GodU", "Cate's seizure traps Marie, Jordan and Andre in her mind, where they see Shetty and Brinkerhoff experiment on Sam and Luke and Cate wipe Luke. Awake, they hear from Cate that Shetty tests on other children; Sam joins them.", ""],
    ["2023-09-17", "p", "GodU", "In the Woods, Dr. Edison Cardosa's Supe-killing virus, injected two days earlier, kills Betsy, a captive young Supe; Dean Indira Shetty orders him to make it contagious.", ""],
    ["2023-09-21", "p", "Gov,GodU", "Victoria Neuman holds a campaign town hall at Godolkin, aired live by VNN's Cameron Coleman. Secret: backstage she tells Marie she controls blood too and urges her to chase power; Marie tells her of the Woods and Shetty's virus.", "Victoria Neuman held a town hall at Godolkin"],
    ["2023-09-21", "s", "GodU", "Polarity has a seizure live on VNN before the town hall, and his powers wreck the ambulance taking him to hospital, Andre with him. At the town hall students chant 'Supe lives matter' and riot.", "Students rioted at Neuman's Godolkin town hall: 'Supe lives matter'"],
    ["2023-09-21", "p", "Gov,GodU", "In the city, Dean Indira Shetty asks Grace Mallory to help spread her Supe-killing virus worldwide; Mallory refuses and has her watched.", ""],
    ["2023-09-21", "s", "GodU", "At Shetty's house Cate makes Dean Indira Shetty confess the Woods, Thomas Godolkin's founding of the school to study Supes, and her plan to kill every Supe, then cut her own throat; Cate stops Marie saving her.", "Godolkin's Dean Indira Shetty died"],
    ["2023-09-21", "p", "Gov", "In a parking garage Dr. Edison Cardosa, fearing Shetty's plan, hands Victoria Neuman the last sample of his Supe-killing virus; she pops his head so no one else can make it.", ""],
    ["2023-09-22", "p", "GodU", "Cate Dunlap and Sam Riordan free the Woods' captives and lead them in killing non-Supes across Godolkin's campus. Marie, Jordan, Emma and Andre, in his father's Polarity suit, fight them; Marie bursts Cate's arm.", "Escaped Supes massacred people at Godolkin University"],
    ["2023-09-22", "s", "Vought", "Ashley Barrett, at Godolkin meeting its trustees, offers a Seven seat to whoever kills the rogue Supes, tells Marie Moreau Vought is considering her, then calls in Homelander.", ""],
    ["2023-09-22", "s", "Seven,GodU", "Homelander lands at Godolkin, calls Marie Moreau an animal for attacking her own kind and burns her with his heat vision. Secret: Marie, Jordan, Emma and Andre vanish into Elmira, sealed in a room with no doors.", "Homelander ended the Godolkin attack; four students were taken"],
    ["2023-09-22", "p", "Vought,GodU", "Vought's news blames the massacre on Marie Moreau, Jordan Li, Emma Meyer and Andre Anderson and hails Cate Dunlap and Sam Riordan as the New Guardians of Godolkin.", "Vought hailed Cate Dunlap and Sam Riordan as the Guardians of Godolkin"],
    ["2023-09-24", "p", "Boys", "Billy Butcher walks the wrecked Woods under Godolkin, hunting the Supe-killing virus made there.", ""],
    ["2024-11-05", "p", "Gov", "Robert Singer is elected President with Victoria Neuman as Vice President; Congress is to certify the result on January 6.", "Singer elected President, Neuman Vice President"],
    ["2024-11-05", "p", "Boys,Gov", "On Singer's secret order, Grace Mallory's Boys try to poison Victoria Neuman at her election-night hotel; her daughter Zoe, a Supe, kills the Secret Service agents helping them and cuts off Kimiko's arm.", "The Boys failed to poison Victoria Neuman"],
    ["2024-11-06", "p", "Seven", "Homelander recruits Sister Sage, the smartest person alive, as his strategist; she pitches him a plan to take real power.", ""],
    ["2024-11-06", "p", "Seven,Starlighters", "A New York court finds Homelander not guilty of murdering a Starlighter protester; his Hometeamers and the Starlighters face off outside the courthouse.", "Homelander acquitted of murder"],
    ["2024-11-06", "p", "Seven,Starlighters", "Three Hometeamers, Todd among them, are found dead in a courthouse riot and Starlighters are blamed. Secret: The Deep and Black Noir II beat them to death for Homelander; Sage started the riot and A-Train planted the bodies.", "Three Hometeamers died in a riot; Starlighters were blamed"],
    ["2024-11-06", "s", "Boys", "Hughie's father, Hugh Campbell Sr., has a stroke and lies in a coma; Hughie's mother, Daphne, who left when he was six, returns holding his power of attorney.", ""],
    ["2024-11-08", "s", "Boys,Seven", "Tailing Sister Sage to TruthCon, where she recruits the far-right Supe podcaster Firecracker for Homelander, the Boys are ambushed by Firecracker and Splinter; Butcher, just thrown off the team, kills Splinter.", ""],
    ["2024-11-08", "p", "Seven,Vought", "Ryan's first public mission, a rescue staged by Vought and Sage, goes wrong: startled when Homelander shows up off script, he kills Koy, the stuntman playing the criminal.", "Homelander's son Ryan made his debut as a hero"],
    ["2024-11-08", "s", "Starlighters,Boys,Seven", "A-Train secretly gives Hughie and Annie footage that clears the Starlighters accused of the Hometeamer murders; Annie makes it public and steps up as the movement's leader.", "Starlight cleared her followers of the Hometeamer murders"],
    ["2024-11-09", "p", "Seven,Vought", "At a Vought rally Homelander introduces Sister Sage and Firecracker as the Seven's newest members and parades Ryan on stage.", "Sister Sage and Firecracker joined the Seven"],
    ["2024-11-09", "s", "Vought,Seven", "Homelander hands Sister Sage the running of Vought, leaving CEO Ashley Barrett a figurehead, and lasers staffer Anika for having talked to Starlight.", ""],
    ["2024-11-09", "p", "Boys,Seven,Gov", "Hughie and MM bug a secret meeting where Sage offers Neuman the presidency by removing Singer; Homelander senses Hughie and kills bystanders chasing him; A-Train saves him and agrees to spy for MM.", ""],
    ["2024-11-10", "s", "Seven,Vought", "Homelander returns to the Vought lab that raised him and kills its staff, burning one man alive, then seals its director, Barbara, in his old room with the bodies.", ""],
    ["2024-11-10", "p", "Seven,Vought,Starlighters", "On a six-hour live VNN special staged by Sister Sage outside Starlight House, Firecracker reveals that Annie January once had an abortion.", "Firecracker revealed Starlight's past abortion on live TV"],
    ["2024-11-10", "s", "Starlighters,Gov", "Annie January beats Firecracker nearly to death on live TV; President-elect Singer cuts ties with her and many Starlighters turn away.", "Starlight beat Firecracker on live TV; Singer cut ties with her"],
    ["2024-11-10", "s", "Boys", "Ezekiel attacks Butcher and Frenchie as they search Firecracker's trailer; Butcher blacks out and Ezekiel is torn apart by new powers from Butcher's Temp V tumor, a kill Butcher credits to Joe Kessler.", "Ezekiel was killed"],
    ["2024-11-10", "p", "Boys", "Hughie gets a vial of Compound V, stolen by A-Train, to save his dying father but can't use it; his mother, Daphne, injects it and Hugh Campbell Sr. wakes from his coma.", ""],
    ["2024-11-11", "p", "Boys,Vought,Gov", "Butcher and MM take Stan Edgar out of prison to find Neuman's Supe-virus lab at his old farm; among V-mutated animals they find its scientist, Sameer Shah, whom Butcher secretly kidnaps, faking his death.", ""],
    ["2024-11-11", "s", "Gov,Vought", "Victoria Neuman kills the driver taking Stan Edgar back to prison and frees him.", "Stan Edgar got out of prison"],
    ["2024-11-11", "p", "Seven,Vought,GodU", "VNN anchor Cameron Coleman is dead. Secret: framed by Ashley Barrett as the leak to shield A-Train, he is beaten to death by the Seven; Homelander vows they'll be 'wrathful gods' and Cate Dunlap and Sam Riordan pledge to him.", "VNN anchor Cameron Coleman died"],
    ["2024-11-11", "s", "Boys", "Hugh Campbell Sr., his mind failing from the V, phases through walls and kills patients and staff at his hospital; Hughie ends his life with his consent.", "Hughie Campbell's father died"],
    ["2024-11-11", "s", "Boys", "Out of guilt, Frenchie turns himself in to the police and confesses to murders he committed years ago.", ""],
    ["2024-11-12", "p", "Seven,Vought,Gov", "At a fundraiser in Tek Knight's mansion, Homelander, Sister Sage and Neuman court rich backers to help topple President-elect Singer; Neuman wins them over after Sage is shot.", "Tek Knight hosted a fundraiser for Homelander's backers"],
    ["2024-11-12", "p", "Boys,Seven", "Tek Knight dies at his mansion. Secret: the Boys free Hughie, caught posing as Webweaver at his party; MM shoots Sister Sage in the head (she heals); Tek admits Homelander plans internment camps in his prisons; his butler strangles him.", "Tek Knight was found dead at his mansion"],
    ["2024-11-12", "s", "Boys", "Forcing his captive Sameer Shah to make a virus strong enough to kill Homelander, one that would kill every Supe, Butcher realizes Joe Kessler is a hallucination born of his tumor.", ""],
    ["2024-12-25", "s", "Seven,Boys", "A-Train vanishes; Vought says he is deployed overseas on a secret mission. Secret: exposed as the Boys' informant, he cuts out his tracker and flees the country with his family.", "A-Train left the Seven, said to be deployed overseas"],
    ["2024-12-25", "s", "Seven", "Hunting the mole, Homelander kills Webweaver, then expels Sister Sage from the Seven when she admits she knew A-Train was the leak and used him to feed the Boys false information.", ""],
    ["2024-12-25", "p", "Boys,Seven", "Butcher returns to lead the Boys; in an apartment Sage visited they find a plan to kill Singer on January 6, and a shapeshifter flees. The Deep and Black Noir II, sent to kill them, are beaten off with A-Train's help.", ""],
    ["2024-12-25", "s", "Boys", "Sameer Shah stabs Kimiko with the virus and escapes; Frenchie, out of jail through Grace Mallory, cuts off her leg to stop it spreading.", ""],
    ["2024-12-25", "s", "Seven,Vought,Boys", "On Vought's live Avenue V Christmas Special, Ryan breaks script to call out Vought and tells kids to love and trust their parents, then walks off; Butcher, watching from a bar, collapses.", "Ryan went off script on Vought's live Christmas special"],
    ["2024-12-25", "p", "Boys,Starlighters,Seven", "A shapeshifter in the plot against Singer drugs Annie January at a bar, chains her up and takes her place, then seduces Hughie and steals his laptop.", ""],
    ["2025-01-06", "s", "Seven,Gov", "Homelander exposes Vice President-elect Victoria Neuman as a Supe on live TV and threatens her daughter, Zoe; Congress certifies Robert Singer's election anyway.", "Homelander outed Neuman as a Supe; Congress certified Singer"],
    ["2025-01-06", "p", "Boys,Gov,Seven,Starlighters", "A shapeshifter posing as Annie January tries to kill Singer in a bunker where the Boys and the Secret Service guard him, killing agents; Hughie unmasks her and the real Annie, broken free, kills her.", "An attempt on President-elect Singer's life failed"],
    ["2025-01-06", "s", "Boys,Gov,Seven", "At the CIA hospital where Butcher lies, Ryan hears Homelander's crimes and that he is meant to kill him; when Grace Mallory moves to lock him up, he shoves her into a wall, killing her, and runs.", ""],
    ["2025-01-06", "s", "Seven,Vought", "Homelander has Ashley Barrett list Vought staff who could incriminate the Seven, and Firecracker, The Deep and Black Noir II kill them; Ashley, on the list herself, injects Compound V and her head starts to mutate.", ""],
    ["2025-01-06", "s", "Boys,Gov", "Victoria Neuman is killed. Secret: as she seeks the Boys' protection, Butcher, whose tumor now gives him tentacles, tears her apart, takes the virus and drives off; her daughter Zoe is sent to Red River.", "Vice President-elect Victoria Neuman was killed"],
    ["2025-01-06", "p", "Gov,Seven", "President-elect Robert Singer is arrested for conspiring to murder Neuman. Secret: Sister Sage framed him with footage taken out of context, the plan she had worked since November.", "President-elect Singer was arrested over Neuman's murder"],
    ["2025-01-06", "p", "Gov,Seven,Vought", "Speaker Steven Calhoun becomes President, pledges loyalty to Homelander, declares martial law and deputizes Supes nationwide under him; Homelander blames the Starlighters and vows to hunt them down.", "Calhoun became President and declared martial law", "!Victoria Neuman"],
    ["2025-01-06", "s", "Boys,Starlighters,GodU,Gov", "Fleeing New York, the Boys are seized by deputized Supes: Cindy stops Hughie, Love Sausage takes MM, Cate Dunlap mind-controls Frenchie away while Sam Riordan holds Kimiko, who screams her first word. Annie regains her powers and flies off.", "The Boys were arrested as Starlighters; Starlight escaped"],
    ["2025-01-07", "p", "Seven,Payback,Gov", "President Calhoun takes Homelander to a secret lab where Soldier Boy, his father, lies frozen in a cryo tank.", ""],
    ["2025-01-07", "p", "Gov,Starlighters,Seven,Vought", "Under martial law Starlighters are branded terrorists and Supe deputies round them up into numbered Freedom Camps in private prisons; VNN becomes state TV and the FBSA is powerless.", "Freedom Camps opened for Starlighters"],
    ["2025-09-14", "s", "GodU,Vought", "In Elmira, Andre Anderson drops dead using his powers to rip open a steel door to free his friends; Cipher's experiments had pushed his powers too far. Vought keeps the death quiet.", "Andre Anderson died in Elmira"],
    ["2025-09-21", "p", "GodU,Vought", "Freed from Elmira through Cate Dunlap, Emma Meyer and Jordan Li return to Godolkin on move-in day and publicly back Vought's account of The Woods to stay out of prison. Dean Cipher, Elmira's former doctor, welcomes students.", "Emma Meyer and Jordan Li returned to Godolkin"],
    ["2025-09-21", "s", "GodU,Starlighters", "Marie Moreau, on the run since escaping Elmira, is filmed beating Hometeamers; Starlight saves her from the Supe tracker Dogknott and asks her to go back to Godolkin to spy on Project Odessa. Marie refuses.", "Marie Moreau was filmed fighting Hometeamers"],
    ["2025-09-21", "s", "GodU,Vought", "Emma Meyer and Jordan Li find Marie Moreau; when Cate Dunlap uses her powers on Marie to learn what Starlight said, Jordan throws Cate into a fuse box. Cate lands in hospital; Vought blames Starlighters.", "Cate Dunlap was hospitalized; Vought blamed Starlighters"],
    ["2025-09-22", "p", "GodU,Vought", "Dean Cipher reinstates Marie Moreau at Godolkin and starts training her privately. Polarity joins the faculty to learn how Andre died; with Emma Meyer he finds Project Odessa records: dead infants and one survivor, Marie.", "Marie Moreau returned to Godolkin"],
    ["2025-09-30", "s", "GodU,Vought", "At Godolkin's 60th-anniversary ceremony, top-ranked Jordan Li reveals that Andre Anderson died in Elmira and says they, not Starlighters, hurt Cate Dunlap. Students boo.", "Jordan Li revealed Andre Anderson's death at Godolkin's anniversary"],
    ["2025-10-01", "p", "GodU,Vought", "Vought airs a pay-per-view fight, Marie Moreau vs. Jordan Li, at the Vought International Hotel & Spa. Secret: Cipher takes over Jordan's body; Marie wins by controlling Jordan's blood. Cate Dunlap is locked in Elmira.", "Marie Moreau beat Jordan Li in a Vought pay-per-view fight"],
    ["2025-10-02", "p", "Vought,Seven", "Sister Sage takes over as Vought's CEO from Ashley Barrett, sidelined since injecting Compound V. Homelander rules Vought and, through President Calhoun, the country.", "Sister Sage became Vought's CEO"],
    ["2025-10-02", "p", "GodU,Vought", "Marie Moreau, Jordan Li and Emma Meyer break into Elmira to free Cate Dunlap and are caught; Cipher shows Marie her captive sister, Annabeth. Cate frees them; finding Annabeth with her throat cut, Marie restarts her heart.", ""],
    ["2025-10-03", "s", "GodU,Vought", "The group escapes Elmira with Cate Dunlap and Annabeth Moreau, helped by Sam Riordan; Zoe Neuman kills Cipher's man Vikor and takes them to Stan Edgar's bunker. Edgar says Marie and Homelander are Odessa's only successes.", ""],
    ["2025-10-03", "s", "GodU,Vought", "Cipher tells Polarity he means to purge weak Supes, starting at Godolkin; Polarity subdues him and throws him out a window.", ""],
    ["2025-10-04", "s", "GodU", "Marie Moreau heals Polarity's brain, then the burned man Cipher hid: Thomas Godolkin, kept alive by V-One since a 1967 lab fire, who was puppeting 'Cipher', the human Doug Brightbill. Thomas starts his purge plan.", ""],
    ["2025-10-04", "s", "Seven,GodU,Vought", "Driving the injured Doug Brightbill to a doctor, Polarity is ambushed by Black Noir II, who stabs Doug through the car roof and takes Polarity to a Vought cell.", ""],
    ["2025-10-05", "p", "GodU,Vought", "Thomas Godolkin, the founder thought dead for 60 years, appears to students by broadcast, resets all rankings and opens a seminar where he makes students fight. Secret: Sister Sage, who knew he lived, frees Polarity.", "Founder Thomas Godolkin turned out to be alive"],
    ["2025-10-05", "s", "GodU,Starlighters", "Marie Moreau's friends free the seminar's students; Thomas Godolkin seizes control of Marie until Polarity breaks his hold, and Marie kills him, exploding his head. Polarity stays behind for Vought to blame.", "Student Marie Moreau killed Thomas Godolkin"],
    ["2025-10-05", "s", "GodU,Starlighters", "Now fugitives, Marie Moreau, Annabeth Moreau, Emma Meyer, Jordan Li, Cate Dunlap and Sam Riordan are found by Starlight, who brings them into her resistance; A-Train is with her.", ""],
    ["2026-01-12", "p", "Gov", "Ashley Barrett, a Supe since injecting Compound V and married to the preacher Oh Father, becomes President Calhoun's Vice President.", "Ashley Barrett became Vice President"],
    ["2026-02-08", "p", "Starlighters,Vought,Seven", "At Vought's annual shareholders meeting Starlight hacks the screens and plays video of Homelander abandoning Flight 37; Black Noir II attacks her and she escapes. Sister Sage stops Homelander from killing the room.", "Starlight leaked the Flight 37 video at Vought's shareholders meeting"],
    ["2026-02-09", "p", "Vought,Gov,Seven", "Sister Sage floods the media to call the Flight 37 video AI, with Vice President Ashley Barrett, Firecracker and The Deep. Homelander has it leaked that Hughie Campbell, Mother's Milk and Frenchie will be executed in three days.", "Vought called the Flight 37 video AI; three Boys were set for execution"],
    ["2026-02-10", "p", "Boys", "In London Billy Butcher visits his dying father, Sam Butcher, whom he blames for his family's misery, and kills him with his tentacles.", ""],
    ["2026-02-12", "p", "Boys,Starlighters,Seven", "At dawn Butcher, Kimiko and Starlight raid Freedom Camp 47 through a tunnel dug by the Worm; Homelander is waiting. Mother's Milk kills the guard Love Sausage, Homelander kills prisoner Ivy, and the three Boys get out.", "The Boys broke three prisoners out of Freedom Camp 47"],
    ["2026-02-12", "s", "Seven,Boys", "A-Train snatches Hughie Campbell from Homelander's lasers during the escape; Homelander chases him into the woods and snaps his neck. Vought blames the Starlighters.", "A-Train was killed; Vought blamed the Starlighters"],
    ["2026-02-13", "p", "Church,Seven,Vought", "Oh Father preaches at A-Train's memorial, calling him a martyr and the Starlighters demons.", "Oh Father led A-Train's memorial"],
    ["2026-02-13", "p", "Seven,Payback,Gov", "Homelander thaws Soldier Boy from cryo-sleep and offers him a cleared name and a deputy's place in the Seven to hunt down Butcher; President Calhoun grants Soldier Boy a full pardon.", "Soldier Boy was thawed and pardoned"],
    ["2026-02-14", "p", "Boys,Payback,Vought", "The Boys test their Supe virus at the Teenage Kix mansion: Frenchie's release kills Jetstreak, Rock Hard and other members. Soldier Boy, hunting them there, collapses, then wakes in a body bag, immune through V-One.", "Teenage Kix members died at their mansion"],
    ["2026-02-15", "p", "Seven,Payback,Vought", "Vought relaunches Soldier Boy, 'held by Russia since 1984', with the Democratic Medal of Patriotic Freedom, blaming Starlighters for his near-death; he joins the Seven and Homelander announces he is his father.", "Soldier Boy joined the Seven; Homelander called him his father"],
    ["2026-02-16", "s", "Boys", "Sameer Shah, told by Butcher that Homelander killed Victoria Neuman and her daughter, finds Zoe Neuman alive and learns Butcher killed Neuman; he destroys the Boys' virus stock and flees with Zoe.", ""],
    ["2026-02-16", "p", "Seven,Vought,Boys", "Homelander's Supes, The Deep, Black Noir II, Cindy and Dogknott, attack Stan Edgar's bunker; Maverick, told Hughie killed his father, opens it. Black Noir II seizes the fleeing Edgar; The Deep delivers him to Homelander.", ""],
    ["2026-02-16", "s", "Boys,Starlighters", "In the bunker fight Cindy, aiming at Hughie Campbell, crushes Maverick instead; Starlight, thinking Hughie dead, snaps Cindy's neck, then flies off.", ""],
    ["2026-02-16", "s", "Seven,Boys", "Ryan confronts Homelander at a Vought facility over raping his mother; Homelander beats him nearly to death. Butcher finds him.", ""],
    ["2026-02-26", "p", "Boys,Seven,Payback", "At abandoned Fort Harmony both the Boys and Homelander hunt V-One, but Bombsight took the vials; a rage parasite turns the Boys on each other. Soldier Boy traps Homelander in a uranium chamber and kills Quinn, its source.", ""],
    ["2026-03-01", "p", "Church,Seven", "At his church, Samaritan's Embrace, Oh Father declares it the Democratic Church of America and proclaims Homelander the Prophet of the Lord.", "Oh Father proclaimed Homelander Prophet of the Democratic Church"],
    ["2026-03-12", "s", "Seven", "Jealous that Black Noir II joined a stage play, The Deep kills its director, Adam Bourke, with an eel sent up the toilet, and the play shuts down.", ""],
    ["2026-03-12", "p", "Seven,Payback", "Sent by the captive Stan Edgar, Homelander and Soldier Boy raid Mister Marathon's Los Angeles mansion for V-One; Soldier Boy kills Malchemical, Marathon kills celebrity guests by accident, and Homelander stomps his head in.", "Mister Marathon was killed in Los Angeles"],
    ["2026-03-12", "s", "Seven", "Homelander learns Firecracker doubts he is God and slept with Soldier Boy; in his Vought Tower office he impales her on an eagle statue.", "Firecracker died"],
    ["2026-03-15", "p", "Seven,Vought", "Vought's Bering Sea oil pipeline off Alaska bursts during The Deep's PSA about it, killing vast numbers of sea creatures. Secret: Black Noir II sabotaged it to get back at The Deep.", "Vought's Bering Sea oil pipeline burst"],
    ["2026-03-15", "s", "Seven", "In Vought's podcast room The Deep strangles Black Noir II with a mic cord and stabs him in the throat.", "Black Noir II died"],
    ["2026-03-15", "p", "Vought,Seven,Boys,Gov", "Sister Sage chloroforms Vice President Ashley Barrett so Ashley's second mind can read Soldier Boy, then cuts out her tracking chip, leaves Vought and the Seven, and joins Butcher's team.", "Sister Sage left Vought and the Seven"],
    ["2026-03-15", "p", "Boys,Starlighters,Church", "Hughie Campbell and Starlight hide a virus bomb in the Homelander statue at Oh Father's megachurch; Oh Father catches and beats Starlight but lets them go when Hughie threatens to set it off.", ""],
    ["2026-03-16", "s", "Seven,Payback,Boys", "Bombsight comes for Golden Geisha, the Boys' bait; Soldier Boy, called by Sage, beats him and burns the V out of him for the last V-One, then hands it to Homelander, who injects it as the Boys watch.", ""],
    ["2026-04-01", "s", "Seven,Gov", "In the Oval Office President Calhoun balks at Homelander's demands; told by Ashley Barrett that Calhoun is no true believer, Homelander crushes his head. Ashley Barrett becomes President.", "President Calhoun died; Ashley Barrett became President"],
    ["2026-04-01", "s", "Seven", "Homelander abolishes the Seven, effective immediately.", "Homelander abolished the Seven"],
    ["2026-04-02", "s", "Seven,Payback", "When Soldier Boy says he is leaving and that Homelander is no god, Homelander chokes him out and puts him back in cryo-sleep.", ""],
    ["2026-04-02", "p", "Church,Vought,Starlighters,Boys", "Oh Father test-screens a film declaring Homelander God at Vought Studios and sends Sheline and Dogknott to kill the doubters; Starlight and Mother's Milk kill both Supes and get the survivors out.", ""],
    ["2026-04-02", "s", "Boys,Church", "Investigating Oh Father, Butcher and Hughie Campbell are caught by his acolyte Synapse, a psychic shapeshifter; Hughie distracts him and Butcher kills him. Synapse has told Homelander where Sage is.", ""],
    ["2026-04-03", "s", "Boys,Seven", "Homelander attacks the Boys' base, a disused school in Erie, Pennsylvania. Frenchie hides Kimiko and Sister Sage, lures him into the uranium room, irradiating both of them, and is mortally hurt; he dies in Kimiko's arms.", ""],
    ["2026-04-04", "s", "Boys", "The Boys bury Frenchie. Sister Sage goads Kimiko into testing her new blast on her; it burns the Compound V out of Sage, who walks away to an ordinary life.", ""],
    ["2026-04-05", "s", "Seven", "Homelander flies Gunter Van Ellis, the world's richest man, into space and leaves him there.", ""],
    ["2026-04-05", "p", "Seven,Gov,Church", "Live from the White House at 4 p.m. on Easter Sunday, Homelander declares himself God in a speech written by Oh Father and threatens to destroy unbelievers.", "Homelander declared himself God live from the White House"],
    ["2026-04-05", "p", "GodU,Starlighters", "Talked out of the White House raid by Starlight, Marie Moreau, Emma Meyer and Jordan Li take the people rescued from Vought Studios to Canada.", ""],
    ["2026-04-05", "s", "Boys,Church,Gov", "Inside the White House, Hughie Campbell lures Oh Father away by mimicking Butcher; Mother's Milk gags him with a gold ball gag, Ashley Barrett's gift, and Oh Father's sonic scream blows his head apart.", "Oh Father died"],
    ["2026-04-05", "s", "Starlighters,Boys,Seven", "Starlight rams The Deep out of the White House and blasts him into the ocean, where sharks circle and an octopus impales him.", "The Deep died"],
    ["2026-04-05", "p", "Boys,Seven", "As Homelander finishes his speech, Ryan helps Butcher pin him in the Oval Office and Kimiko's blast strips the powers of all three. Homelander begs; Butcher drives his crowbar into his skull as the cameras roll.", "Billy Butcher killed Homelander on live TV"],
    ["2026-04-06", "p", "Gov", "Congress unanimously impeaches President Ashley Barrett, who refused to resign, and removes her from office; Robert Singer, freed, is President again.", "Ashley Barrett was impeached; Robert Singer is President again"],
    ["2026-04-06", "p", "Vought", "Stan Edgar, freed after months as Homelander's prisoner, retakes Vought as interim CEO.", "Stan Edgar returned as Vought's CEO"],
    ["2026-04-06", "s", "Boys,Vought", "Rejected by Ryan and grieving his dog Terror, Butcher plants the Supe virus in Vought Tower's sprinklers to kill the Supes arriving Monday morning; Hughie Campbell, failing to talk him down, shoots him dead.", "Billy Butcher died at Vought Tower"],
    ["2026-04-06", "p", "Gov,Starlighters", "The Freedom Camps are opened.", "The Freedom Camps were opened"],
    ["2026-04-20", "p", "Gov", "President Robert Singer relaunches the Federal Bureau of Superhuman Affairs.", "The FBSA was relaunched"],
    ["2026-04-20", "p", "Vought", "Vought, under Stan Edgar, fires every hero who backed Homelander.", "Vought fired every hero who backed Homelander"]
  ];
  // What each canon group is doing and planning between those days, as the group itself knows it: [from, to (both
  // included), group, text]. A planned event shows here beforehand as the group's preparation; a sudden one never does.
  const AGENDA = [
    ["2004-10-01", "2006-06-30", "Church", "Alastair Adana's Church of the Collective, a rich self-help religion his grandfather founded, recruits celebrities and faded Supes with promises of renewal and keeps their secrets on file."],
    ["2004-10-01", "2005-06-30", "GodU", "Godolkin trains and ranks young Supes; terms run late August to May, Hero Draft each late May. Brinkerhoff coaches the stars, The Deep among them. Secret: its clinic fronts Project Odessa."],
    ["2004-10-01", "2012-04-14", "Gov", "Washington keeps Supes out of the military; Vought lobbies. At the CIA Grace Mallory, who lost her men in Nicaragua in 1984 working with Payback, distrusts Vought and its Supes."],
    ["2004-10-01", "2019-05-19", "Payback", "Defunct since 1984. Soldier Boy, thought dead, is secretly a Russian lab prisoner. Black Noir is in the Seven; Crimson Countess, Gunpowder, Mindstorm and the TNT Twins live apart."],
    ["2004-10-01", "2007-05-31", "Seven", "Homelander leads Queen Maeve (new in 2004), Black Noir, Translucent, Lamplighter, Mister Marathon; one seat open. Vought-picked saves, films, PR; no military role. Homelander and Maeve are a couple."],
    ["2004-10-01", "2005-03-14", "Vought", "Stan Edgar is CEO; Madelyn Stillwell, SVP of Hero Management, runs the Seven and handles Homelander. Compound V is secret; Supes are sold as born. Secret: Project Odessa runs at Godolkin."],
    ["2005-03-15", "2005-06-30", "Vought", "Stan Edgar is CEO; Madelyn Stillwell runs the Seven and handles Homelander. Secret: Odessa's newest baby, Marie Moreau, shows no powers, and Edgar is shutting the program down."],
    ["2005-07-01", "2007-05-31", "GodU", "Godolkin trains and ranks young Supes for Vought careers; terms run late August to May, Hero Draft each late May. Professor Brinkerhoff coaches the stars, The Deep among them."],
    ["2005-07-01", "2006-12-31", "Vought", "Edgar is CEO; Stillwell runs the Seven and handles Homelander. Compound V stays secret; Supes are sold as born through films, merchandise, teen teams and kid pageants."],
    ["2006-07-01", "2017-06-30", "Church", "Alastair Adana's Church of the Collective recruits celebrities and faded Supes with promises of renewal and keeps their secrets on file; Carol Mannheim handles famous recruits."],
    ["2007-01-01", "2007-05-31", "Vought", "Vought Studios is about to launch a movie universe: The Deep: Rising Tide in June, then Queen Maeve: Her Majesty this summer. Edgar is CEO; Stillwell runs the Seven."],
    ["2007-06-01", "2007-08-31", "GodU", "Summer break. Student The Deep stars in Vought's The Deep: Rising Tide. Professor Brinkerhoff coaches Godolkin's stars; fall term starts in late August."],
    ["2007-06-01", "2007-08-31", "Seven", "Same six (Homelander, Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon); Maeve promotes her film Queen Maeve: Her Majesty, out this summer. Homelander and Maeve are a couple."],
    ["2007-06-01", "2007-08-31", "Vought", "Vought Studios' movie universe is launching: The Deep: Rising Tide is in theaters and Queen Maeve: Her Majesty opens this summer. Edgar is CEO; Stillwell runs the Seven."],
    ["2007-09-01", "2010-04-30", "GodU", "Godolkin trains and ranks young Supes for Vought careers; terms run late August to May, Hero Draft each late May. Professor Brinkerhoff coaches the stars, The Deep among them."],
    ["2007-09-01", "2010-04-30", "Seven", "Homelander leads Queen Maeve (new in 2004), Black Noir, Translucent, Lamplighter, Mister Marathon; one seat open. Vought-picked saves, films, PR; no military role. Homelander and Maeve are a couple."],
    ["2007-09-01", "2010-04-30", "Vought", "Edgar is CEO; Stillwell runs the Seven (one seat open). Vought sells Supes as born through films, music (Super-Sweet), teen teams (Teenage Kix, Young Americans) and kid pageants."],
    ["2010-05-01", "2010-05-31", "GodU", "The Deep graduates; at the Hero Draft (about June 1) Vought will put him in the Seven. Professor Brinkerhoff coaches Godolkin's stars."],
    ["2010-05-01", "2010-05-31", "Seven", "Homelander, Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon; at the Hero Draft (about June 1) Godolkin's The Deep fills the seventh seat. Homelander and Maeve are a couple."],
    ["2010-05-01", "2010-05-31", "Vought", "Preparing the Hero Draft (about June 1), where Godolkin's The Deep will fill the Seven's open seat. Edgar is CEO; Stillwell runs the Seven. Compound V stays secret."],
    ["2010-06-01", "2014-06-30", "GodU", "Godolkin trains and ranks young Supes for Vought careers; terms run late August to May, Hero Draft each late May. Professor Brinkerhoff coaches the top-ranked students."],
    ["2010-06-01", "2011-11-30", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon and The Deep (new in 2010). Vought-picked saves, films, PR; no military role. Homelander and Maeve are a couple."],
    ["2010-06-01", "2011-11-30", "Vought", "Rolling out The Deep, the Seven's newest member. Edgar is CEO; Stillwell runs the Seven and handles Homelander. Compound V stays secret; Supes are sold as born."],
    ["2011-12-01", "2011-12-23", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. All due at Vought's Christmas party in Vought Tower, December 24. Homelander and Maeve are a couple."],
    ["2011-12-01", "2011-12-23", "Vought", "Vought's Christmas party at Vought Tower is set for December 24. Edgar is CEO; Stillwell runs the Seven; Becca Butcher, Senior Director of Digital Marketing, handles Homelander's social media."],
    ["2011-12-24", "2011-12-27", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon and The Deep (new in 2010). Vought-picked saves, films, PR; no military role. Homelander and Maeve are a couple."],
    ["2011-12-24", "2012-01-23", "Vought", "Edgar is CEO; Stillwell runs the Seven and handles Homelander; Becca Butcher, Senior Director of Digital Marketing, handles his social media. Compound V stays secret."],
    ["2011-12-28", "2012-01-23", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Secret: Homelander sexually assaulted Becca Butcher, who handles his social media, in late December."],
    ["2012-01-24", "2012-04-30", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Becca Butcher, who handled Homelander's social media, has vanished; he doesn't know where she went."],
    ["2012-01-24", "2012-09-14", "Vought", "Secret: Stillwell and Jonah Vogelbaum hide Becca Butcher, pregnant by Homelander, in a guarded Vought facility under an NDA; Homelander isn't told. Edgar is CEO."],
    ["2012-04-15", "2012-05-14", "Boys", "Grace Mallory's new deniable CIA unit: Billy Butcher and Mother's Milk spy on and blackmail Supes. Butcher, sure Homelander killed Becca, wants him most."],
    ["2012-04-15", "2015-05-21", "Gov", "CIA deputy director Grace Mallory runs the Boys, a deniable unit (Billy Butcher, Mother's Milk, Frenchie from May 2012) that spies on and blackmails Supes."],
    ["2012-05-01", "2014-01-31", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon and The Deep (new in 2010). Vought-picked saves, films, PR; no military role. Homelander and Maeve are a couple."],
    ["2012-05-15", "2015-04-30", "Boys", "Mallory's CIA unit, Butcher, Mother's Milk and Frenchie, spies on and blackmails Supes to keep them in line; Butcher's real target is Homelander."],
    ["2012-09-15", "2015-04-30", "Vought", "Secret: Becca Butcher raises Homelander's son, Ryan, in a guarded Vought compound; Stillwell keeps both from Homelander. Edgar is CEO; Stillwell runs the Seven."],
    ["2014-02-01", "2014-03-01", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Homelander and Queen Maeve, a couple, are set for the Oscars red carpet and an Oscars party on March 2."],
    ["2014-03-02", "2014-03-04", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Homelander and Queen Maeve are the stars of the Oscars red carpet (March 2)."],
    ["2014-03-05", "2014-04-30", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Secret: on March 4 Homelander murdered a producer who flirted with Maeve at the Oscars party, and burned his office."],
    ["2014-05-01", "2015-04-30", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, Mister Marathon and The Deep (new in 2010). Vought-picked saves, films, PR; no military role."],
    ["2014-07-01", "2015-04-30", "GodU", "Gamma Epsilon Delta is banned after a pledge's death. A-Train (Reggie Franklin), Brinkerhoff's speedster, is in his final year. Terms late August to May; Hero Draft late May."],
    ["2015-05-01", "2015-05-10", "Boys", "Mallory's unit (Butcher, Mother's Milk, Frenchie) is preparing to blackmail Lamplighter with compromising photos into spying on the Seven. Mother's Milk carries a ring for Monique."],
    ["2015-05-01", "2015-05-30", "GodU", "A-Train graduates; at the Hero Draft on May 31 he races Mister Marathon in public. Professor Brinkerhoff coaches Godolkin's stars."],
    ["2015-05-01", "2015-05-10", "Seven", "Homelander leads Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Vought-picked saves, PR. Hero Draft May 31: Mister Marathon races Godolkin's A-Train in public."],
    ["2015-05-01", "2015-05-30", "Vought", "Preparing the Hero Draft (May 31), with a public race between Mister Marathon and Godolkin's A-Train. Secret: Becca Butcher and Ryan stay hidden from Homelander."],
    ["2015-05-11", "2015-05-14", "Boys", "Mallory's unit has blackmailed Lamplighter with photos into spying on the Seven; Frenchie tails him. Mother's Milk carries a ring for Monique."],
    ["2015-05-11", "2015-05-14", "Seven", "Homelander, Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Hero Draft May 31: Marathon races A-Train. Secret: the CIA's Boys blackmail Lamplighter into spying on the team."],
    ["2015-05-15", "2015-05-21", "Boys", "Lamplighter, out to kill Mallory, burned her two grandchildren to death; the team is reeling. Frenchie hides that he left his post to save Jay from an overdose."],
    ["2015-05-15", "2015-05-30", "Seven", "Homelander, Maeve, Noir, Translucent, Lamplighter, Mister Marathon, The Deep. Hero Draft May 31: Marathon races A-Train. Secret: Lamplighter burned Mallory's grandchildren to death trying to kill her."],
    ["2015-05-22", "2019-05-19", "Boys", "Disbanded; the members don't speak. Mallory has retired to the woods (birdwatching); Mother's Milk counsels kids in juvenile detention; Frenchie is back in crime; Butcher has dropped out of sight."],
    ["2015-05-22", "2018-12-31", "Gov", "Grace Mallory has retired from the CIA after her grandchildren's deaths; her Supe unit is shut down. Washington still keeps Supes out of the military."],
    ["2015-05-31", "2019-05-19", "GodU", "A-Train has gone to the Seven. Godolkin trains and ranks young Supes; terms run late August to May, Hero Draft each late May. Brinkerhoff coaches the stars."],
    ["2015-05-31", "2015-06-30", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, The Deep and A-Train (new in 2015). Vought-picked saves, films, endorsements, PR; no military role. Mister Marathon is out."],
    ["2015-05-31", "2015-06-30", "Vought", "Rolling out A-Train, the Seven's first Black member, after he beat Mister Marathon. Edgar is CEO; Stillwell runs the Seven. Secret: Becca and Ryan stay hidden from Homelander."],
    ["2015-07-01", "2019-05-14", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, Lamplighter, The Deep and A-Train (new in 2015). Vought-picked saves, films, endorsements, PR; no military role."],
    ["2015-07-01", "2019-05-14", "Vought", "Edgar is CEO; Stillwell runs the Seven and lobbies to get Supes into the military. Red River houses Marie Moreau. Secret: Becca Butcher and Ryan stay hidden from Homelander."],
    ["2017-07-01", "2019-05-19", "Church", "Alastair Adana's Church fights the acclaimed 2017 documentary Inner Lights Out with 400 lawsuits; it still recruits celebrities and faded Supes. Carol Mannheim handles famous recruits."],
    ["2019-01-01", "2019-05-19", "Gov", "Defense Secretary Robert Singer resists Vought's push to put Supes in the military; Susan Raynor is CIA deputy director. Grace Mallory is retired."],
    ["2019-05-15", "2019-05-19", "Seven", "Homelander, Queen Maeve, Black Noir, Translucent, The Deep, A-Train. Lamplighter has 'retired'; a successor is to be unveiled May 24. A-Train secretly takes Compound V to stay fastest."],
    ["2019-05-15", "2019-05-19", "Vought", "Choosing Lamplighter's successor to unveil at the May 24 shareholders meeting; Stillwell courts cities (Baltimore next) and the Pentagon. Secret: Becca and Ryan stay hidden."],
    ["2019-05-20", "2019-05-20", "Boys", "Disbanded since 2015. Billy Butcher works alone, still fixed on Homelander and his wife Becca's disappearance; Mother's Milk counsels in juvenile detention; Frenchie is back in crime."],
    ["2019-05-20", "2019-12-31", "Church", "Alastair Adana's Church of the Collective recruits celebrities and faded Supes; Carol Mannheim handles famous recruits."],
    ["2019-05-20", "2019-05-31", "GodU", "Godolkin's school year ends with the late-May Hero Draft. Brinkerhoff coaches the stars."],
    ["2019-05-20", "2019-05-25", "Gov", "The Senate weighs Vought's push to put Supes in national defense. Defense Secretary Robert Singer resists. CIA Deputy Director Susan Raynor wants leverage on Vought."],
    ["2019-05-20", "2019-12-31", "Payback", "Defunct since 1984. Soldier Boy, thought dead, is secretly a Russian lab prisoner. Black Noir is in the Seven; Crimson Countess, Gunpowder, Mindstorm and the TNT Twins live apart."],
    ["2019-05-20", "2019-05-20", "Seven", "Homelander leads Queen Maeve, Black Noir, Translucent, The Deep and A-Train, who secretly takes Compound V. Lamplighter's successor is to be unveiled May 24."],
    ["2019-05-20", "2019-05-23", "Vought", "Stillwell runs Hero Management for Stan Edgar. Vought offers Hughie Campbell $45,000 for an NDA; Stillwell pitches Nubian Prince to Baltimore's mayor and readies the May 24 shareholders presentation."],
    ["2019-05-21", "2019-05-23", "Boys", "Butcher, alone, is digging into A-Train's killing of Robin Ward and watching her boyfriend, Hughie Campbell, whom Vought is pressing to sign a $45,000 NDA."],
    ["2019-05-21", "2019-05-23", "Seven", "A-Train says Robin Ward stepped into his path mid-chase; he faces Shockwave in a pay-per-view race (May 28). Annie January (Starlight) joins at Vought's shareholders presentation (May 24)."],
    ["2019-05-24", "2019-05-24", "Boys", "Butcher, posing as FBI, is recruiting Hughie to plant a bug in Seven Tower; Hughie is to sign Vought's NDA there if A-Train apologizes in person (set for May 25)."],
    ["2019-05-24", "2019-05-25", "Seven", "Starlight (Annie January) is the newest member; at Homelander's weekly meeting The Deep mocks her and she stands firm. The Seven work Vought's PR schedule."],
    ["2019-05-24", "2019-05-25", "Vought", "Fresh off the shareholders presentation, Stillwell lobbies for a military contract and plans a fundraiser for half the Senate Appropriations Committee (May 26). Ashley Barrett handles Starlight."],
    ["2019-05-25", "2019-05-25", "Boys", "Hughie goes to Seven Tower to sign the NDA and plant Butcher's bug in the Seven's meeting room; Butcher drives him there and back to work."],
    ["2019-05-26", "2019-05-26", "Boys", "Butcher, Hughie and Frenchie hold Translucent in an electrified cage under an abandoned restaurant and hunt for a way through his skin; the cage's shielding is broken, so Vought can track him."],
    ["2019-05-26", "2019-05-26", "Gov", "Senators attend Stillwell's Vought fundraiser; Senator Calhoun, afraid of Homelander, opposes Supes in national defense. Raynor refuses Butcher the CIA's files on Translucent."],
    ["2019-05-26", "2019-05-26", "Seven", "Translucent is missing; staff assume a bender, and Starlight takes his place in tomorrow night's team-up with The Deep. Homelander cows The Deep, who suspects him in the Baltimore crash."],
    ["2019-05-26", "2019-05-27", "Vought", "Stillwell works senators for the military contract and turns the holdout, Senator Calhoun, with Doppelganger. She knows Homelander downed the Baltimore jet; Translucent is unaccounted for."],
    ["2019-05-27", "2019-05-27", "Boys", "Frenchie has packed C-4 inside Translucent as Homelander closes in. Butcher plans to bring Mother's Milk back and bug the apartment of A-Train's girlfriend, Popclaw."],
    ["2019-05-27", "2019-06-03", "Gov", "Senator Calhoun, blackmailed, now backs Vought's bid for Supes in the military, and the Senate moves toward a vote. Singer still resists."],
    ["2019-05-27", "2019-05-27", "Seven", "Homelander hunts for Translucent, missing over a day, through Vought Crime Analytics. Starlight patrols with The Deep tonight. A-Train fears losing his seat in tomorrow's race."],
    ["2019-05-28", "2019-05-28", "Boys", "Butcher, Hughie, Frenchie and Mother's Milk watch Popclaw through hacked cameras and work A-Train's race, Hughie as a fake reporter, Frenchie hunting a V sample. Hughie has left home."],
    ["2019-05-28", "2019-05-28", "Seven", "A-Train races Shockwave today, with Homelander and Maeve there to push Supes in the military. Starlight wears the revealing costume Vought forced on her."],
    ["2019-05-28", "2019-06-03", "Vought", "Edgar's military talking points roll out at A-Train's race (May 28); Stillwell's team weighs how to explain Translucent's absence. Starlight is in a new revealing costume."],
    ["2019-05-29", "2019-06-03", "Boys", "The Boys watch the noodle shop Popclaw says A-Train visits on every V run, so far for nothing. Butcher plans to take photos of A-Train's V use to CIA's Susan Raynor."],
    ["2019-05-29", "2019-06-03", "Seven", "Translucent is dead and Vought keeps it quiet. A-Train secretly runs Compound V to a Triad cell; Homelander and Stillwell push to get the Seven into the military."],
    ["2019-06-01", "2019-12-31", "GodU", "Summer break, then the fall term from late August: Godolkin trains and ranks young Supes. Brinkerhoff coaches the stars."],
    ["2019-06-04", "2019-06-04", "Boys", "Butcher pitches Raynor while the others trail A-Train's V drop from the noodle shop. Butcher has Hughie keep tonight's bowling date with Starlight to hack her phone."],
    ["2019-06-04", "2019-06-19", "Gov", "After Flight 37 public pressure mounts for Supes in the military. Raynor will move on Vought only with a Compound V sample; Singer at Defense still resists."],
    ["2019-06-04", "2019-06-04", "Seven", "Vought will say Translucent is on a classified mission. A-Train hunts whoever hit his Triad drop; The Deep has Stillwell's OK to 'rescue' dolphins from Oceanland."],
    ["2019-06-04", "2019-06-05", "Vought", "Stillwell says Translucent is on a classified mission. A clean Flight 37 rescue would win Congress; after the crash she lets Homelander's call for Supes in the military run."],
    ["2019-06-05", "2019-06-05", "Boys", "The Boys keep the captured Female chained at Frenchie's place; Frenchie tries to reach her. Hughie, now close to Starlight, will be her guest at the Believe Expo (June 6)."],
    ["2019-06-05", "2019-06-05", "Seven", "Maeve is shaken after Flight 37; Homelander turns the crash into a case for Supes in the military. A-Train has sent Popclaw away and hunts the Female. The Believe Expo opens June 6."],
    ["2019-06-06", "2019-06-06", "Boys", "At the Believe Expo Hughie, Starlight's guest, is to blackmail Ezekiel for V intel while Butcher and Mother's Milk work the venue; Frenchie guards the Female."],
    ["2019-06-06", "2019-06-06", "Seven", "At Ezekiel's Believe Expo Homelander leads a Flight 37 remembrance and Starlight is to give a scripted faith testimony. A-Train has promised Homelander to find the Female."],
    ["2019-06-06", "2019-06-06", "Vought", "Vought has the Seven at Ezekiel's Believe Expo (June 6-10) for a Flight 37 remembrance and Starlight's scripted testimony. Stillwell watches from Seven Tower."],
    ["2019-06-07", "2019-06-19", "Boys", "With a V sample and proof Supes are made, the Boys trace Compound V via Vought-funded Samaritan's Embrace to hospitals. Frenchie tends the healed Female; Hughie dates Starlight."],
    ["2019-06-07", "2019-06-19", "Seven", "After Starlight's speech Vought shields The Deep. Homelander secretly has terrorists dosed with V so Congress needs the Seven; A-Train hunts the Female; Maeve drinks again."],
    ["2019-06-07", "2019-06-19", "Vought", "Vought manages the fallout of Starlight's speech and Homelander's off-script vow; Stillwell courts senators. Samaritan's Embrace keeps shipping Compound V to hospitals as vaccines."],
    ["2019-06-20", "2019-06-20", "Boys", "Mother's Milk maps V shipments back to 1971 and, at Frenchie's urging, recruits the telepath Mesmer to read the Female. Butcher takes Hughie to a Supe-victims support group."],
    ["2019-06-20", "2019-06-21", "Gov", "The Senate vote on Supes in the military is 'any day now'. Raynor waits on Butcher's Compound V evidence; Singer at Defense resists."],
    ["2019-06-20", "2019-06-21", "Seven", "The Seven film Vought's 'Super in America' promo. Stillwell is making The Deep apologize publicly and step away; Starlight, emboldened, defies her and is seeing Hughie."],
    ["2019-06-20", "2019-06-23", "Vought", "Stillwell sacks Ashley, sends The Deep to Sandusky and counts the last Senate votes for the military deal. Stan Edgar wants someone to run Vought."],
    ["2019-06-21", "2019-06-21", "Boys", "Mesmer is reading the Female; Butcher wants him dead after. Butcher takes Raynor a V sample with demands (pay, an office, Homelander prosecuted); Kimiko chooses to stay with Frenchie."],
    ["2019-06-22", "2019-06-22", "Boys", "Hughie spent the night with Starlight. Mesmer has sold them out to Homelander: Butcher hunts him, Mother's Milk moves his family, and the Boys hole up at a Frenchie safe house."],
    ["2019-06-22", "2019-06-23", "Gov", "Holding Butcher's V sample, Raynor moves to make Vought drop the military deal and shelters two Boys' families. The deal is three Senate votes short."],
    ["2019-06-22", "2019-06-22", "Seven", "The Deep reports to Sandusky, Ohio. Homelander, holding Mesmer's photos, suspects Starlight of helping Hughie Campbell; Maeve vouches for her. Homelander digs into Becca Butcher."],
    ["2019-06-23", "2019-06-23", "Boys", "Branded fugitives, the Boys lie low in a motel. Butcher and Hughie seek Grace Mallory's help against Homelander; Butcher means to strike tonight."],
    ["2019-06-23", "2019-06-23", "Seven", "A-Train, leg broken, is in hospital. Homelander confronts Stillwell over Becca's child. Starlight learns from her mother she was given V as a baby; Hughie begs her help."],
    ["2019-06-24", "2019-06-30", "Boys", "Fugitives: Hughie, Mother's Milk, Frenchie and Kimiko hide in New York. Butcher, wanted for Stillwell's murder, is on the run alone, hunting for the house where Becca lives."],
    ["2019-06-24", "2019-06-30", "Gov", "Supes are cleared for the military and Compound V stays classified. The FBI leads a nationwide manhunt for Billy Butcher over Stillwell's murder; the other Boys are fugitives."],
    ["2019-06-24", "2019-06-30", "Seven", "Stillwell is dead. Homelander has found Becca and his son Ryan at a Vought hideaway. A-Train lies in hospital in secret; The Deep sits in Sandusky; Starlight hides that she helped the Boys."],
    ["2019-06-24", "2019-06-30", "Vought", "Stillwell is dead; Vought blames Billy Butcher. Stan Edgar takes Homelander in hand. Becca and Ryan stay in Vought's hideaway, where Homelander now visits."],
    ["2019-07-01", "2019-12-31", "Boys", "Hughie, Mother's Milk (in charge), Frenchie and Kimiko hide with Frenchie's gang contacts, wanted and hunted by Vought; Hughie sees Starlight in secret. Butcher has gone dark, searching for Becca."],
    ["2019-07-01", "2019-12-31", "Gov", "Supes serve with the military while V-powered terrorists surface abroad. The FBI hunts Butcher; Raynor's CIA keeps V secret. Victoria Neuman is a young NY congresswoman, secretly a Supe."],
    ["2019-07-01", "2019-12-31", "Seven", "Homelander, handled by Stan Edgar, visits Ryan when he likes. Active: Maeve, Black Noir, Starlight (secretly with Hughie). Translucent's death is hidden; A-Train hospitalized; The Deep in Sandusky."],
    ["2019-07-01", "2019-12-31", "Vought", "Edgar runs Vought and handles Homelander; Ashley Barrett is SVP of Hero Management. Heroes serve under a $40B-a-year military deal; V stays classified. Lamplighter works at Sage Grove."],
    ["2020-01-01", "2020-09-29", "Boys", "Fugitives Hughie, Mother's Milk, Frenchie and Kimiko hide under a pawn shop run by Frenchie's smuggler friends, MM in charge. Starlight spies on Vought for Hughie. Butcher is missing, hunting Becca."],
    ["2020-01-01", "2020-09-30", "Church", "Alastair Adana's Church of the Collective, with Carol Mannheim, courts fallen Supes like Eagle the Archer with promised comebacks and keeps files on Supes' secrets."],
    ["2020-01-01", "2020-10-06", "GodU", "Godolkin trains and ranks young Supes, terms late August to May, Hero Draft late May. Secret: Indira Shetty runs The Woods under the campus, working with Brinkerhoff on a virus that kills Supes."],
    ["2020-01-01", "2020-09-30", "Gov", "Congresswoman Victoria Neuman campaigns against Vought. Secret: she is a head-popping Supe raised by Stan Edgar. CIA deputy director Raynor suspects Vought; Defense Secretary Singer bargains with it."],
    ["2020-01-01", "2021-11-06", "Payback", "Disbanded since 1984. Soldier Boy, believed dead, is secretly held in a Russian lab; Crimson Countess, Gunpowder, Mindstorm and the TNT Twins live their own lives."],
    ["2020-01-01", "2020-08-31", "Seven", "Homelander leads Queen Maeve, Black Noir and Starlight; A-Train secretly recovers from his heart attack, The Deep is exiled, Translucent's death is hidden. Homelander visits Becca and Ryan at will."],
    ["2020-01-01", "2020-08-31", "Vought", "Stan Edgar runs Vought and handles the Seven himself, Ashley Barrett his go-between; he works out with Defense Secretary Singer how Supes serve in the military. Secret: Sage Grove tests V on adults."],
    ["2020-09-01", "2020-09-30", "Seven", "Vought plans Translucent's public funeral for Sep 30; Homelander means to pick his replacement. Black Noir hunts Supe-terrorist Naqib in Syria. A-Train lies in a secret coma; The Deep is exiled."],
    ["2020-09-01", "2020-09-30", "Vought", "Edgar picks Stormfront, who secretly oversees Sage Grove's V tests, for Translucent's seat, unknown to Homelander. Translucent's funeral is set for Sep 30, blaming Supe-terrorist El Diablo."],
    ["2020-09-30", "2020-09-30", "Boys", "A Supe-terrorist smuggled in by Frenchie's friends has escaped; the Boys take word of him to CIA deputy director Raynor. Hughie wants Starlight to get Compound V for them to leak."],
    ["2020-10-01", "2020-10-02", "Boys", "Raynor is dead; the Boys blame Vought. Butcher is back in charge, out to catch the Supe-terrorist and to corner Grace Mallory at Raynor's funeral (Oct 2). Starlight squeezes Gecko for V."],
    ["2020-10-01", "2020-10-05", "Church", "Carol guides The Deep, newly taken in, through mushroom sessions with his gills, promising him a way back into the Seven."],
    ["2020-10-01", "2020-10-09", "Gov", "Raynor is dead. Grace Mallory hunts her killer through Butcher's Boys: a Supe-terrorist, then the vanished Supe Liberty. Neuman rallies against Vought (rally Oct 8). Secret: Neuman killed Raynor."],
    ["2020-10-01", "2020-10-02", "Seven", "Stormfront, Edgar's pick, joins against Homelander's will; her press day is Oct 2. Rebuked by Edgar, Homelander turns to Ryan, wanting to train his powers. A-Train, awake, plans to return."],
    ["2020-10-01", "2020-10-04", "Vought", "Ashley launches Stormfront with a press day (Oct 2) as Edgar presses the military deal. Secret: Sage Grove tests V on adults; Lamplighter burns the failures."],
    ["2020-10-03", "2020-10-03", "Boys", "Mallory's deal: bring in the Supe-terrorist to be cleared and find Becca. The Boys hunt him; Kimiko suspects her brother. Starlight has the V sample and passes it to a news channel."],
    ["2020-10-03", "2020-10-04", "Seven", "A-Train is back and wants his seat; he and Starlight hold each other's secrets. Stormfront's fan base grows fast. Homelander, impatient, pushes Becca to let him train Ryan's powers."],
    ["2020-10-04", "2020-10-04", "Boys", "On a yacht offshore the Boys hold Kenji, Kimiko's brother, to hand him to Mallory; Kimiko is torn. Starlight's Compound V leak is about to air."],
    ["2020-10-05", "2020-10-06", "Boys", "Kenji is dead; Kimiko grieves. Mallory sends them after Liberty, a Supe unseen since 1979: Hughie, MM and Starlight drive out to find a witness. Butcher, given Becca's location, goes in."],
    ["2020-10-05", "2020-10-06", "Seven", "Compound V is public. Stormfront, hailed for killing Kenji, plans a Vought Square rally (Oct 6); Homelander resents her and has Doppelganger play Madelyn for him. Black Noir hunts Butcher."],
    ["2020-10-05", "2020-10-08", "Vought", "After the V leak Edgar blames Stillwell and sells Stormfront's heroics to save the military deal. Black Noir and analyst Anika hunt Butcher; Ashley readies A-Train's exit (Oct 8)."],
    ["2020-10-06", "2020-10-07", "Church", "Carol picks Cassandra Schwartz as The Deep's wife to fix his image (wedding Oct 7); The Deep signs his bank account over to Adana."],
    ["2020-10-07", "2020-10-08", "Boys", "Stormfront is Liberty. Butcher, rebuffed by Becca, quits and holes up at his Aunt Judy's; Hughie and MM go to bring him back. Kimiko takes kill contracts; Starlight has ended it with Hughie."],
    ["2020-10-07", "2021-12-31", "GodU", "Godolkin trains and ranks young Supes, terms late August to May, Hero Draft late May. Secret: Indira Shetty's lab under the campus, The Woods, holds Sam Riordan, who killed a Sage Grove guard."],
    ["2020-10-07", "2020-10-08", "Seven", "A-Train is out, Shockwave lined up; Ashley readies A-Train's exit (Oct 8). Maeve, outed, must sell her romance with Elena. Black Noir has tracked Butcher to his aunt's house."],
    ["2020-10-08", "2020-10-10", "Church", "The Deep, married, fronts the Church's ads. Adana wants A-Train next and has The Deep set up a meal with him (Oct 10)."],
    ["2020-10-09", "2020-10-09", "Boys", "Butcher is back. Starlight found Stormfront's emails about Sage Grove Center; Frenchie removes her tracking chip, and the Boys break in tonight."],
    ["2020-10-09", "2020-10-10", "Seven", "Homelander and Stormfront are lovers; she knows Starlight leaked V. Maeve has The Deep diving to the Flight 37 wreck for proof against Homelander. Edgar has called Black Noir off Butcher."],
    ["2020-10-09", "2020-10-09", "Vought", "Edgar and Stormfront push Sage Grove's adult V program; Stormfront suspects Starlight leaked V. A-Train is retired, Shockwave lined up."],
    ["2020-10-10", "2020-10-10", "Boys", "Hughie lies in hospital, impaled at Sage Grove. MM, Frenchie and Kimiko hold Lamplighter and bring him to Mallory. They now know Vought is perfecting Compound V for adults."],
    ["2020-10-10", "2020-10-11", "Gov", "Mallory keeps Lamplighter at her mansion as a witness against Vought's Sage Grove program. Secret: Neuman killed Raynor."],
    ["2020-10-10", "2020-10-11", "Vought", "After a riot at Sage Grove, Stormfront has the mess cleaned up. Vought plans to seize Starlight, the V leaker, by luring her with her mother Donna (Oct 12)."],
    ["2020-10-11", "2020-10-12", "Boys", "At Mallory's mansion the Boys keep Lamplighter as a witness, Hughie nursing his wound. Mallory and Neuman plan a hearing on Vought; MM and Mallory seek Vogelbaum; Frenchie and Kimiko guard Neuman."],
    ["2020-10-11", "2020-10-15", "Church", "A-Train has joined. Adana, holding files on Supes' secrets, Stormfront's Nazi past among them, presses Edgar to reinstate The Deep and A-Train (meeting Oct 15)."],
    ["2020-10-11", "2020-10-12", "Seven", "Homelander backs Stormfront's dream of Supe rule. Maeve holds Flight 37 footage to blackmail him. He and Stormfront plan to seize Starlight, the V leaker, through her mother (Oct 12)."],
    ["2020-10-12", "2020-10-13", "Gov", "Neuman plans a congressional hearing on Vought with Lamplighter as witness (Oct 14); Mallory and MM seek Vogelbaum too. Secret: Neuman protects Vought."],
    ["2020-10-12", "2020-10-13", "Vought", "Starlight is held in Vought Tower. Edgar faces Neuman's coming hearing on Vought and still pushes military use of V."],
    ["2020-10-13", "2020-10-13", "Boys", "Vought holds Starlight. Butcher means to force Vogelbaum to testify at Neuman's hearing (Oct 14); Hughie minds Lamplighter at Mallory's mansion."],
    ["2020-10-13", "2020-10-13", "Seven", "Starlight is locked in Vought Tower as a mole. Homelander and Stormfront court Ryan to take him from Becca. Elena has left Maeve."],
    ["2020-10-14", "2020-10-14", "Boys", "Lamplighter is dead; Hughie freed Starlight and her mother. Vogelbaum, blackmailed by Butcher, testifies at Neuman's hearing today; Frenchie and Kimiko guard Neuman."],
    ["2020-10-14", "2020-10-14", "Gov", "Lamplighter is dead; Vogelbaum, forced by Butcher, is to testify at Neuman's hearing today. Secret: Neuman means to stop him."],
    ["2020-10-14", "2020-10-15", "Seven", "Lamplighter is dead and Starlight escaped; Black Noir is in a coma. Homelander and Stormfront have Ryan and try to train his powers; Ryan misses his mother."],
    ["2020-10-14", "2020-10-14", "Vought", "Lamplighter is dead and Starlight escaped; Black Noir is in a coma. Edgar faces Neuman's congressional hearing on Vought today."],
    ["2020-10-15", "2020-10-15", "Boys", "After the hearing massacre the Boys plan to kill the Seven; Hughie and Starlight have until day's end to find a witness against Vought."],
    ["2020-10-15", "2020-10-16", "Gov", "The hearing massacre is blamed on an unknown assassin; Mallory and Neuman suspect Vought, but the President backs military use of V (Oct 15). Secret: Neuman did it."],
    ["2020-10-15", "2020-10-15", "Vought", "The President is set to authorize military V. Edgar weighs Adana's push to reinstate The Deep and A-Train; Ashley is shaken by the hearing deaths."],
    ["2020-10-16", "2020-10-17", "Boys", "Becca is dead; Stormfront is exposed and maimed. Butcher, sworn to Becca to protect Ryan, means to hand him to Mallory (Oct 17). Starlight is back in the Seven."],
    ["2020-10-16", "2020-10-19", "Church", "Edgar takes A-Train back but refuses The Deep, who quits the Church. Eagle the Archer, expelled, attacks the Church in the press."],
    ["2020-10-16", "2020-10-19", "Seven", "Stormfront is maimed and disowned, Becca dead, Ryan gone with Butcher; Maeve's Flight 37 footage holds Homelander back. He must apologize to Starlight and take her back (Oct 16)."],
    ["2020-10-16", "2020-10-19", "Vought", "Edgar contains the fallout: the maimed Stormfront is to be disowned and blamed at a press conference (Oct 16); Compound V's release goes on hold; A-Train is to return."],
    ["2020-10-17", "2020-10-19", "Gov", "The White House is creating an Office of Supe Affairs under Neuman; Mallory hides Ryan for the CIA; the Boys are cleared. Secret: Neuman is Vought's ally."],
    ["2020-10-18", "2020-10-19", "Boys", "Cleared of all charges. Ryan is with Mallory; MM is back with his family; Frenchie and Kimiko grow close; Hughie wants to fight Vought the legal way and means to offer Neuman his help."],
    ["2020-10-20", "2021-07-06", "Boys", "Cleared. Hughie works for Neuman on the coming Office of Supe Affairs and is with Starlight; Butcher grieves Becca, Ryan with Mallory; MM is back with his family; Frenchie and Kimiko are close."],
    ["2020-10-20", "2021-07-06", "Church", "Leaderless: the Church says Adana vanished and hides his death. Eagle the Archer, expelled, is airing its secrets; The Deep has left."],
    ["2020-10-20", "2021-07-06", "Gov", "Neuman builds the Office of Supe Affairs into the FBSA (launch: July) with Hughie Campbell; Mallory raises Ryan in hiding for the CIA; military Supe talks are halted. Secret: Neuman killed Adana."],
    ["2020-10-20", "2021-08-06", "Seven", "Homelander, leashed by Edgar and Maeve's Flight 37 footage, stays out of sight. Starlight is back and with Hughie; Black Noir lies in a coma; A-Train awaits his promised return; The Deep is refused."],
    ["2020-10-20", "2021-07-06", "Vought", "Edgar keeps Homelander in check and out of sight; V's release and the military deal are stalled; Dawn of the Seven is in limbo. Secret: the maimed Stormfront is alive on life support."],
    ["2021-07-07", "2021-12-31", "Boys", "Hughie is senior analyst at Neuman's FBSA, with Butcher, Frenchie and Kimiko on contract catching rogue Supes; Mother's Milk stays home with his family. Hughie is with Starlight."],
    ["2021-07-07", "2021-08-06", "Church", "Adana is still 'missing'; the Church faces Eagle the Archer's tell-all book."],
    ["2021-07-07", "2021-09-06", "Gov", "Director Neuman's FBSA is at work, Hughie its senior analyst, the Boys on contract; VNN attacks it. A partnership with Vought is in the works. Mallory raises Ryan in hiding."],
    ["2021-07-07", "2021-09-06", "Vought", "VNN's Seven on 7 spins for Vought monthly; V production is on hold. Vought plays up A-Train's comeback (Aug 7) and rising star Supersonic, and nears a deal with Neuman's FBSA."],
    ["2021-08-07", "2021-12-31", "Church", "Adana is still 'missing'; the Church faces Eagle the Archer's tell-all book and The Deep's bombshell allegations."],
    ["2021-08-07", "2021-10-06", "Seven", "A-Train is back and plans a comeback race. Homelander edges back into public view; Black Noir is recovering; Maeve and Starlight front Vought's inclusion events; The Deep is still refused."],
    ["2021-09-07", "2021-11-06", "Gov", "The FBSA polices 'bad apple' Supes with Vought and goes after Ezekiel. Secret: it arrests only the Supes Vought lets it have. Mallory raises Ryan in hiding."],
    ["2021-09-07", "2021-11-06", "Vought", "Partnered with the FBSA to police rogue Supes; turning Sage Grove into a 'Global Wellness' center. Secret: Stormfront is alive on life support at an undisclosed facility."],
    ["2021-10-07", "2021-11-06", "Seven", "Black Noir is back, hunting a 'homicidal hitchhiker'. A-Train plans an exhibition race against Mister Marathon. Starlight's popularity nears Homelander's; Homelander keeps a low profile."],
    ["2021-11-07", "2021-12-31", "Gov", "Neuman touts the FBSA's first 120 days; Defense Secretary Singer weighs a presidential run; a joint FBSA-Vought case closes in on Gecko (Dec 7). Mallory raises Ryan in hiding."],
    ["2021-11-07", "2021-12-31", "Payback", "Disbanded; Soldier Boy is secretly held in a Russian lab. Gunpowder runs a Junior Shooter Program with the Vought Rifle Association; the others live their own lives."],
    ["2021-11-07", "2021-12-06", "Seven", "A-Train's race against Mister Marathon is postponed for a 'classified mission'. Homelander keeps a low profile under Edgar; Starlight's star rises; Black Noir is on patrol."],
    ["2021-11-07", "2021-12-31", "Vought", "Fighting lawsuits over nonconsensual V exposure; working a joint case with the FBSA against Gecko (Dec 7). Secret: Stormfront is alive on life support."],
    ["2021-12-07", "2021-12-31", "Seven", "Homelander, after his on-air apology for the Stormfront affair, courts the public. Black Noir, recovered, fronts bulletproof school backpacks; Starlight is honored at a holiday benefit."],
    ["2022-01-01", "2022-05-23", "Boys", "Butcher, Frenchie and Kimiko catch rogue Supes on contract for the FBSA, with Hughie Campbell as their liaison; Mother's Milk has stepped back for his family; Butcher, off the drink, visits Ryan."],
    ["2022-01-01", "2023-07-31", "Church", "The Church of the Collective carries on without Alastair Adana, killed in 2020; The Deep quit it that year."],
    ["2022-01-01", "2023-07-31", "GodU", "Godolkin trains and ranks young Supes under Dean Indira Shetty; terms late August to May, Hero Draft late May; Marie Moreau is still at Red River. Secret: Shetty's lab, The Woods, holds Sam Riordan."],
    ["2022-01-01", "2022-05-30", "Gov", "Congresswoman Victoria Neuman's FBSA polices Supes with the Boys on contract and Hughie Campbell as analyst. Secret: she's a head-popping Supe raised by Edgar. The CIA's Grace Mallory hides Ryan."],
    ["2022-01-01", "2022-06-02", "Payback", "Defunct since 1984. Soldier Boy is secretly in a Russian lab. Black Noir is in the Seven; Crimson Countess sings at Voughtland; the TNT Twins host Herogasm; Gunpowder works gun shows; Mindstorm hides."],
    ["2022-01-01", "2022-04-30", "Seven", "The Seven: Homelander, Queen Maeve, A-Train, Starlight, Black Noir. Homelander, ratings sunk since Stormfront, behaves under Stan Edgar and the Flight 37 video threat; Stormfront lies maimed."],
    ["2022-01-01", "2022-04-30", "Vought", "Stan Edgar runs Vought under FBSA oversight, handing the Bureau only the Supes he picks, and readies V24, a 24-hour Compound V, for the military. Ashley Barrett runs PR; Cameron Coleman anchors VNN."],
    ["2022-05-01", "2022-05-30", "Seven", "The five promote Dawn of the Seven (premiere May 31) while Vought's show American Hero picks new members (finale June 4); Homelander, ratings low, chafes under Edgar; The Deep wants back in."],
    ["2022-05-01", "2022-05-30", "Vought", "Edgar readies V24 for a Pentagon pitch; Ashley Barrett preps the Dawn of the Seven premiere (May 31), Homelander's live birthday special (June 3) and the American Hero finale (June 4)."],
    ["2022-05-24", "2022-05-30", "Boys", "Butcher, Frenchie and Kimiko, FBSA contractors, are lining up Termite, a shrinking Supe, for a grab at a party on May 31; Butcher needs Hughie Campbell's sign-off. Mother's Milk is out."],
    ["2022-05-31", "2022-05-31", "Boys", "Tonight Butcher, Frenchie and Kimiko grab Termite at a party; Butcher gets Hughie Campbell's sign-off at the Dawn of the Seven premiere on two conditions: no torture, no fires."],
    ["2022-05-31", "2022-05-31", "Gov", "Neuman attends the Dawn of the Seven premiere; her analyst Hughie Campbell approves the Boys' grab of Termite tonight. Defense Secretary Robert Singer is due a Vought pitch."],
    ["2022-05-31", "2022-05-31", "Seven", "Premiere night for Dawn of the Seven; Homelander plays contrite about Stormfront for interviewers. Next: his live birthday special (June 3) and the American Hero finale (June 4)."],
    ["2022-05-31", "2022-05-31", "Vought", "Premiere night for Dawn of the Seven; Ashley Barrett runs the press line. Edgar plans to make Starlight co-captain beside Homelander to lift his ratings."],
    ["2022-06-01", "2022-06-01", "Boys", "Butcher is furious the Bureau lets Termite off with rehab; he visits Ryan at Grace Mallory's safe house; Mother's Milk is at his daughter Janine's birthday."],
    ["2022-06-01", "2022-06-01", "Gov", "Neuman lets Termite go to rehab as Vought wants; Tony, a childhood friend who knew her as Nadia, presses her to go public about Red River; Singer hears Vought's V24 pitch."],
    ["2022-06-01", "2022-06-02", "Seven", "Starlight is co-captain beside a resentful Homelander, who choked A-Train over a muttered insult and keeps visiting Stormfront; Queen Maeve secretly helps Butcher. Birthday special set for June 3."],
    ["2022-06-01", "2022-06-02", "Vought", "Edgar pitches V24 to the Pentagon; Vought gets Termite sent to rehab instead of prison; Ashley preps Homelander's live birthday special (June 3), with Starlight to sing to him."],
    ["2022-06-02", "2022-06-02", "Boys", "Butcher weighs Queen Maeve's Soldier Boy file and her three V24 vials after Homelander's visit; Hughie, who saw Neuman kill a man, digs secretly into her past as 'Nadia'."],
    ["2022-06-02", "2022-06-04", "Gov", "Edgar knows Neuman killed Tony and the scene was cleaned up; she wonders where Hughie Campbell keeps disappearing to; Grace Mallory keeps Ryan at her safe house."],
    ["2022-06-03", "2022-06-03", "Boys", "Chasing Soldier Boy: Butcher goes after Gunpowder at a gun show, Frenchie and Kimiko after Crimson Countess at Voughtland, Hughie into Red River for Neuman's file. Mother's Milk says no."],
    ["2022-06-03", "2022-06-06", "Payback", "Gunpowder is dead. Crimson Countess, rattled by Kimiko and Frenchie, hides that she knows Soldier Boy lives; he is still a Russian lab prisoner. Black Noir is in the Seven; Mindstorm hides."],
    ["2022-06-03", "2022-06-03", "Seven", "Homelander's birthday: tonight Vought airs a live special where Starlight honors him and announces a gift in his name; by day he shoots a rooftop 'birthday save' for the cameras."],
    ["2022-06-03", "2022-06-03", "Vought", "Homelander's birthday: Vought airs his live special tonight; Ashley Barrett films a rooftop 'birthday save' with him; Edgar lets Starlight skip singing."],
    ["2022-06-04", "2022-06-04", "Boys", "Mother's Milk is back to settle his family's score with Soldier Boy; the Boys press Grace Mallory about Payback while Butcher, on a V24 hangover, hunts the weapon said to have killed him."],
    ["2022-06-04", "2022-06-04", "Seven", "Buoyed by his rising approval, Homelander demands The Deep's return and a fake romance with Starlight, to be unveiled on tonight's American Hero finale; Starlight begs Supersonic to stay out."],
    ["2022-06-04", "2022-06-04", "Vought", "Ashley Barrett reports Homelander's rant lifted his approval; the American Hero finale airs tonight on Vought+, with Starlight to name the new members."],
    ["2022-06-05", "2022-06-05", "Boys", "Little Nina will get the Boys into Russia if Kimiko kills a man there for her; they fly out today to raid the lab said to hold the weapon. Hughie told the Bureau his arm is broken."],
    ["2022-06-05", "2022-06-05", "Gov", "Edgar asks Neuman to fine Homelander through the FCC, promising she and Zoe will be safe; she plans a press conference about Homelander instead (June 6)."],
    ["2022-06-05", "2022-06-05", "Seven", "The Deep and Supersonic are in; Starlight, Queen Maeve and Supersonic secretly plan to gather heroes against Homelander, who plays up #HomeLight and attacks the media on The Cameron Coleman Hour."],
    ["2022-06-05", "2022-06-05", "Vought", "Edgar presses Victoria Neuman to fine Homelander through the FCC; Ashley Barrett rolls out #HomeLight and books Homelander on The Cameron Coleman Hour."],
    ["2022-06-06", "2022-06-06", "Boys", "In Moscow: Kimiko does Little Nina's killing, then the Boys hit the military lab tonight; Butcher keeps V24 for himself and refuses Hughie a dose."],
    ["2022-06-06", "2022-06-06", "Gov", "Neuman goes public against Edgar today, naming Homelander a whistleblower; Hughie Campbell is in Russia, having told the Bureau his arm is broken."],
    ["2022-06-06", "2022-06-06", "Seven", "Homelander, who secretly killed Supersonic, keeps Starlight in line with #HomeLight photo calls and threats to Hughie Campbell; he says Supes, not Edgar, should run Vought."],
    ["2022-06-06", "2022-06-06", "Vought", "Edgar, accused by Neuman, is put on leave; Homelander moves to run Vought himself with the board behind him."],
    ["2022-06-07", "2022-06-07", "Boys", "Back from Russia with Kimiko powerless in hospital, the Boys hunt the escaped Soldier Boy; Little Nina says Frenchie owes her two killings by tonight; Queen Maeve brings Butcher more V24."],
    ["2022-06-07", "2022-06-07", "Gov", "Neuman, now called Homelander's weapon, has given Zoe Compound V to protect her; Grace Mallory keeps Ryan hidden."],
    ["2022-06-07", "2022-06-07", "Payback", "Soldier Boy, free after 38 years, is back in New York to hunt the Payback members who sold him to the Russians: Crimson Countess first, then the TNT Twins, Mindstorm and Black Noir."],
    ["2022-06-07", "2022-06-07", "Seven", "With Edgar gone, Homelander runs Vought through Ashley Barrett and gives The Deep Crime Analytics; Starlight, under threat, plays along; A-Train takes Blue Hawk to apologize to a Black neighborhood."],
    ["2022-06-07", "2022-06-07", "Vought", "Ashley Barrett takes over as CEO with Homelander running the board; The Deep gets Crime Analytics; Ashley stages Blue Hawk's apology with A-Train."],
    ["2022-06-08", "2022-06-08", "Boys", "Allied with Soldier Boy, Butcher and Hughie, on V24, help him hit the TNT Twins at Herogasm in Vermont tonight; Mother's Milk and Starlight follow; Frenchie stays with Kimiko."],
    ["2022-06-08", "2022-06-08", "Gov", "Neuman means to win Starlight as an ally against Homelander; Grace Mallory keeps Ryan hidden."],
    ["2022-06-08", "2022-06-08", "Payback", "Crimson Countess is dead. Soldier Boy, now allied with Butcher, hits the TNT Twins at Herogasm tonight; Mindstorm and Black Noir are next."],
    ["2022-06-08", "2022-06-08", "Seven", "Homelander holds Queen Maeve in Vought Tower's basement and sets out to find and kill Soldier Boy before he exposes Vought; The Deep heads to Herogasm; A-Train wants justice for his brother."],
    ["2022-06-08", "2022-06-08", "Vought", "Vought plays down the Midtown blast and says Queen Maeve is at a Malibu retreat while she sits in its basement; Ashley brushes off A-Train's demand for justice for his brother."],
    ["2022-06-09", "2022-06-12", "Boys", "Butcher and Hughie, dosing V24, hunt Mindstorm with Soldier Boy from The Legend's house; Mother's Milk, Frenchie and Kimiko lie low; Kimiko wants Compound V to get her powers back."],
    ["2022-06-09", "2022-06-12", "Gov", "Turned down by Starlight, Neuman plans to offer Homelander a pact: Ryan's hiding place for his removing Lamar Bishop, front-runner to be Robert Singer's running mate."],
    ["2022-06-09", "2022-06-13", "Payback", "The TNT Twins are dead. Soldier Boy, sheltered at The Legend's with Butcher and Hughie, hunts Mindstorm, then Black Noir, who has vanished."],
    ["2022-06-09", "2022-06-12", "Seven", "Starlight has quit and Black Noir vanished; A-Train is in hospital after heart failure; Homelander keeps Maeve caged, means to harvest her eggs, and plans a rally against Starlight (June 13)."],
    ["2022-06-09", "2022-06-13", "Starlighters", "Starlight, out of the Seven and in hiding, posts against Homelander and Vought; her fans, the Starlighters, back her and push #FreeMaeve while VNN calls her a liar."],
    ["2022-06-09", "2022-06-13", "Vought", "VNN's Cameron Coleman and Ashley Barrett call Starlight's videos lies; Vought pins Blue Hawk's death on Soldier Boy; Queen Maeve stays locked in the basement."],
    ["2022-06-13", "2022-06-13", "Boys", "Butcher lies trapped in Mindstorm's nightmare while Hughie and Soldier Boy track the telepath; Starlight is getting Compound V from Vought for Kimiko."],
    ["2022-06-13", "2022-06-13", "Gov", "Neuman makes her pitch to Homelander today; Grace Mallory keeps Ryan at her safe house, unaware Neuman is giving it away."],
    ["2022-06-13", "2022-06-13", "Seven", "Homelander rallies his fans against Starlight; A-Train, up again on Blue Hawk's heart, takes Vought's line; The Deep's wife Cassandra has left him."],
    ["2022-06-14", "2022-06-14", "Boys", "Warned by Starlight that V24 kills after three to five doses, Butcher leaves Hughie behind and drives Soldier Boy to New York to kill Homelander; Frenchie has Novichok to stop Soldier Boy."],
    ["2022-06-14", "2022-06-14", "Gov", "Neuman has given Homelander Ryan's hiding place, and he owes her Lamar Bishop's removal; Grace Mallory guards Ryan at her safe house."],
    ["2022-06-14", "2022-06-14", "Payback", "Told by Mindstorm that Vought replaced him with his son, Soldier Boy heads with Butcher to Vought Tower to face Homelander and Black Noir, the last betrayer."],
    ["2022-06-14", "2022-06-14", "Seven", "Homelander, now knowing Soldier Boy is his father and where Ryan is hidden, goes to get Ryan and has The Deep pay his debt to Neuman. Black Noir is still missing; Maeve is caged."],
    ["2022-06-14", "2022-06-14", "Starlighters", "Starlighters hold a Believe Starlight rally outside Vought Tower as Homelander's fans gather; Starlight, with the Boys, tries to get the tower evacuated before Soldier Boy comes."],
    ["2022-06-14", "2022-06-14", "Vought", "Vought's stock drops after Starlight's recording; with a search warrant coming, Ashley Barrett moves Queen Maeve out; Homelander refuses to evacuate Vought Tower."],
    ["2022-06-15", "2022-06-16", "Boys", "Butcher has 12 to 18 months to live and Ryan has chosen Homelander; Annie has joined the team; Queen Maeve, alive and powerless, leaves with Elena. Next target: Victoria Neuman."],
    ["2022-06-15", "2022-07-14", "Gov", "Robert Singer runs for President with Victoria Neuman as his running mate, she secretly allied with Homelander; the CIA's Grace Mallory keeps Soldier Boy on ice and backs the Boys."],
    ["2022-06-15", "2023-07-31", "Payback", "Payback is finished: Gunpowder, Crimson Countess, the TNT Twins, Mindstorm and Black Noir are dead; Soldier Boy lies in cryo-sleep in CIA custody, believed dead."],
    ["2022-06-15", "2022-06-16", "Seven", "With Queen Maeve gone and Black Noir secretly dead, the Seven are down to Homelander, A-Train and The Deep. Homelander keeps Ryan at Vought Tower and will show him to his fans at a rally."],
    ["2022-06-15", "2022-06-16", "Starlighters", "Starlight has thrown away her Vought costume and joined the Boys; her Starlighters face Homelander's fans, who are rallying for him."],
    ["2022-06-15", "2022-06-16", "Vought", "Vought mourns Queen Maeve as a martyr; Ashley Barrett, who knows she lived, has deleted the footage; part of Vought Tower lies wrecked by Soldier Boy's blast."],
    ["2022-06-17", "2023-07-31", "Boys", "With CIA backing through Grace Mallory, Butcher, Hughie, Annie, Mother's Milk, Frenchie and Kimiko hunt Homelander and Victoria Neuman; Butcher is dying from V24; Ryan lives with Homelander."],
    ["2022-06-17", "2022-07-14", "Seven", "Cheered for killing a protester, Homelander runs Vought and raises Ryan at Vought Tower; the Seven are Homelander, A-Train, The Deep and, in name, Black Noir, whose death stays secret."],
    ["2022-06-17", "2023-07-31", "Starlighters", "After Homelander killed a Starlighter on camera, Starlight leads the Starlighters against him, facing his fans, the Hometeamers, at rallies and online; she works with the Boys."],
    ["2022-06-17", "2022-07-14", "Vought", "Ashley Barrett is CEO in name while Homelander gives the orders; Stan Edgar is out; VNN cheers Homelander, who killed a protester on camera."],
    ["2022-07-15", "2023-07-31", "Gov", "Singer runs for President with Neuman as his running mate, she secretly allied with Homelander; New York has charged Homelander with murder; Grace Mallory keeps Soldier Boy on ice and backs the Boys."],
    ["2022-07-15", "2023-07-31", "Seven", "Homelander, charged with murder but free, runs Vought and raises Ryan at Vought Tower; the Seven are Homelander, A-Train, The Deep and Black Noir II, secretly a new man in the suit."],
    ["2022-07-15", "2023-07-31", "Vought", "Ashley Barrett is CEO in name while Homelander gives the orders and faces a murder charge; Stan Edgar is out; Vought keeps Black Noir II in the suit in secret."],
    ["2023-08-01", "2023-09-22", "Boys", "Mother's Milk leads the Boys (Hughie, Frenchie, Kimiko, and Annie) on Grace Mallory's CIA money against Homelander and Neuman. Butcher, stripped of command, hides that Temp V is killing him."],
    ["2023-08-01", "2024-09-30", "Church", "The Church of the Collective carries on without Alastair Adana, killed in 2020; The Deep quit it that year."],
    ["2023-08-01", "2023-08-27", "GodU", "Luke Riordan (Golden Boy), No. 1, dates Cate Dunlap. Secret: Shetty and Brinkerhoff hold Sam Riordan in the Woods, where Cardosa makes a Supe virus; Cate wipes Luke. Marie Moreau arrives Aug 28."],
    ["2023-08-01", "2023-09-16", "Gov", "Robert Singer runs for President with Victoria Neuman, FBSA chief and secretly a Supe allied with Homelander, as his running mate. Grace Mallory's CIA bankrolls the Boys against both."],
    ["2023-08-01", "2024-09-30", "Payback", "Payback is finished: Soldier Boy lies frozen in cryo-sleep in government custody (since June 14, 2022), and most of the old team is dead."],
    ["2023-08-01", "2023-09-22", "Seven", "Homelander, charged with murdering a protester, stays free until trial and raises Ryan at Vought Tower. The Seven is four: Homelander, A-Train, The Deep and Black Noir II (an actor in the suit)."],
    ["2023-08-01", "2023-12-31", "Starlighters", "Starlight (Annie January) leads the Starlighters against Homelander, whose fans, the Hometeamers, split the country with them. Annie also works with the Boys and is with Hughie."],
    ["2023-08-01", "2023-08-30", "Vought", "Ashley Barrett is CEO in name; Homelander runs Vought, and Cameron Coleman's VNN backs him. Vought is papering a deal to put Godolkin's Golden Boy, Luke Riordan, straight into the Seven."],
    ["2023-08-28", "2023-08-29", "GodU", "Term opens. Marie Moreau rooms with Emma Meyer and wants top rank; Andre, Jordan and Cate run with Luke. Brinkerhoff has Luke going straight to the Seven; Luke sees visions of a boy in the woods."],
    ["2023-08-30", "2023-08-30", "GodU", "Brinkerhoff means to expel Marie over the club video to protect Andre, Jordan and Luke, his Seven-bound star. Luke, haunted by visions of a boy in the woods, is coming apart."],
    ["2023-08-31", "2023-09-01", "GodU", "Luke and Brinkerhoff are dead. Marie, Vought's new hero, starts classes; Shetty plans a Brinkerhoff memorial gala (Sep 2). Andre and Cate dig into what Luke whispered about the Woods and Sam."],
    ["2023-08-31", "2023-09-03", "Vought", "Vought sells Golden Boy's death as a drug-fueled breakdown, makes Marie Moreau its hero (TV interview Sep 1) and sends Tek Knight to tape The Whole Truth at Godolkin (Sep 3) and pin it on a student."],
    ["2023-09-02", "2023-09-02", "GodU", "Shetty takes Marie to tonight's Brinkerhoff gala; new rankings come tomorrow. Andre, having found the Woods, gets Emma to shrink and slip in during the gala to find Sam."],
    ["2023-09-03", "2023-09-03", "GodU", "Emma hides Sam, escaped from the Woods, at an abandoned drive-in; Marie, Andre, Jordan and Cate hunt for her. Shetty's guards hunt Sam. Tek Knight tapes on campus today."],
    ["2023-09-04", "2023-09-16", "GodU", "Secret: for Shetty, Cate keeps wiping Marie, Andre, Jordan and Emma of Sam and the Woods, and trackers are put in them; they lose days. Cardosa readies his virus for tests on captive Supes."],
    ["2023-09-04", "2023-09-16", "Vought", "Vought's line: Golden Boy simply snapped. Ashley Barrett runs Vought in name for Homelander; VNN, led by Cameron Coleman, pushes his side."],
    ["2023-09-17", "2023-09-17", "GodU", "Cate has confessed to wiping the friends; Andre walked out on her. Emma has Sam back and keeps him hidden from Shetty's guards. Marie and Jordan want the truth about the Woods."],
    ["2023-09-17", "2023-09-20", "Gov", "Neuman's campaign has a town hall at Godolkin set for Sep 21, aired by VNN. Singer and Neuman campaign; Grace Mallory's CIA funds the Boys."],
    ["2023-09-17", "2023-09-21", "Vought", "VNN's Cameron Coleman is set to air Victoria Neuman's Godolkin town hall (Sep 21), with Polarity on air too. Ashley Barrett runs Vought in name for Homelander."],
    ["2023-09-18", "2023-09-20", "GodU", "The friends know Shetty experiments on Supe children; Sam hides in Emma's room, Cate is shunned. Neuman's town hall here is set for Sep 21. Secret: Shetty wants Cardosa's virus contagious."],
    ["2023-09-21", "2023-09-21", "GodU", "Neuman's town hall is today, with Polarity on VNN first. Marie and Jordan search Shetty's office for proof. Cate waits at Shetty's house to confront her. Shetty goes to the city to see Mallory."],
    ["2023-09-21", "2023-09-21", "Gov", "Neuman holds her Godolkin town hall today. Grace Mallory meets Dean Indira Shetty in the city at Shetty's request."],
    ["2023-09-22", "2023-09-22", "GodU", "Shetty lies dead at home, unfound. Cate and Sam mean to free the Woods' captives today; Marie, Jordan and Emma refuse to join. Andre is at the hospital with his father, Polarity."],
    ["2023-09-22", "2023-12-31", "Gov", "Secret: Neuman holds the last sample of the Supe-killing virus, its maker dead by her hand; Mallory knows Shetty's plan. Singer and Neuman campaign for November 2024."],
    ["2023-09-22", "2023-09-22", "Vought", "Ashley Barrett is at Godolkin today to meet its board of trustees; Dean Shetty hasn't turned up."],
    ["2023-09-23", "2023-09-23", "Boys", "Butcher, on his own, is after the Supe-killing virus made under Godolkin and means to search the wrecked Woods. Mother's Milk runs the team's CIA work; Hughie is with Annie."],
    ["2023-09-23", "2023-12-31", "GodU", "Shetty is dead and the Woods wrecked. Cate Dunlap and Sam Riordan serve Vought as the Guardians of Godolkin. Marie, Jordan, Emma and Andre sit sealed in a doorless room at Elmira, run by Cipher."],
    ["2023-09-23", "2023-12-31", "Seven", "Homelander, back from striking down Marie Moreau at Godolkin, awaits his murder trial and raises Ryan at Vought Tower. The Deep runs his errands; A-Train and Black Noir II fill out the Seven."],
    ["2023-09-23", "2023-12-31", "Vought", "Vought sells Cate Dunlap and Sam Riordan as the Guardians of Godolkin and blames Marie, Jordan, Emma and Andre, held in secret at Elmira. Barrett is CEO in name; Homelander rules."],
    ["2023-09-24", "2024-04-30", "Boys", "Mother's Milk leads Hughie, Frenchie, Kimiko and Annie in Mallory's CIA fight against Neuman and Homelander. Butcher, off on his own, chases the Supe virus and hides his fatal tumor."],
    ["2024-01-01", "2024-09-30", "GodU", "Cate Dunlap and Sam Riordan are Vought's Guardians of Godolkin. Marie Moreau, Jordan Li, Emma Meyer and Andre Anderson, blamed for the massacre, are still held at Elmira under Cipher."],
    ["2024-01-01", "2024-04-30", "Gov", "Election year: Robert Singer and Victoria Neuman campaign for the November 5 vote. Secret: Neuman keeps the Supe virus; Grace Mallory's CIA backs the Boys against her."],
    ["2024-01-01", "2024-08-31", "Seven", "Homelander, free pending his murder trial, raises Ryan at Vought Tower. The Seven stays at four: Homelander, A-Train, The Deep (his errand boy) and Black Noir II, an actor in the suit."],
    ["2024-01-01", "2024-08-31", "Starlighters", "Starlight (Annie January) and her Starlighters keep up their fight against Homelander and his Hometeamers while he awaits trial. Annie works with the Boys and is with Hughie."],
    ["2024-01-01", "2024-08-31", "Vought", "Vought, Ashley Barrett in name and Homelander in fact, promotes its Guardians of Godolkin, Cate and Sam. VNN backs Homelander ahead of his murder trial. Elmira still holds the four students."],
    ["2024-05-01", "2024-09-30", "Boys", "On Singer's secret order Mallory's CIA has Mother's Milk's team readying a hit on Neuman, Frenchie making an acid to kill her. Butcher, dying of his tumor, hunts the Supe virus alone."],
    ["2024-05-01", "2024-09-30", "Gov", "Singer and Neuman campaign toward the November 5 election. Secret: Singer, fearing Neuman, has Grace Mallory's CIA ready the Boys to kill her; Neuman keeps the Supe virus."],
    ["2024-09-01", "2024-09-30", "Seven", "Homelander readies for his New York murder trial, due in October, and raises Ryan at Vought Tower. The Deep runs his errands; A-Train and Black Noir II round out the four-member Seven."],
    ["2024-09-01", "2024-09-30", "Starlighters", "Starlight (Annie January) and the Starlighters gear up for Homelander's murder trial, due in October, against his Hometeamers. Annie works with the Boys and is with Hughie."],
    ["2024-09-01", "2024-09-30", "Vought", "VNN gears up for Homelander's murder trial, due in October, and the November 5 election. Ashley Barrett runs Vought in name for Homelander; Cate and Sam front it as Guardians."],
    ["2024-10-01", "2024-11-04", "Boys", "Under CIA officer Grace Mallory, MM leads Hughie, Frenchie, Kimiko and Annie; Butcher, dying of his Temp V tumor, is stripped of command. On Singer's secret order they plan to poison Neuman (Nov 5)."],
    ["2024-10-01", "2024-11-11", "GodU", "Marie Moreau, Andre Anderson, Emma Meyer and Jordan Li are held at Vought's Elmira facility (since Sept 2023) under Cipher; Vought hails Cate Dunlap and Sam Riordan as Guardians of Godolkin."],
    ["2024-10-01", "2024-11-05", "Gov", "Robert Singer and running mate Victoria Neuman lead the race's final weeks. Secret: Singer, sure Neuman would kill him once elected, has Grace Mallory's Boys set to kill her (Nov 5)."],
    ["2024-10-01", "2025-01-06", "Payback", "Soldier Boy lies frozen in a cryo tank in a secret government lab, put under again in 2022; Homelander, his son, doesn't know where he is."],
    ["2024-10-01", "2024-11-05", "Seven", "Homelander, on trial in New York for killing a Starlighter protester, awaits the verdict as Hometeamers rally; the Seven (The Deep, A-Train, Black Noir II) and Vought court Sister Sage to join."],
    ["2024-10-01", "2024-11-06", "Starlighters", "Starlight's movement protests outside Homelander's murder trial, facing his Hometeamers; Annie January, out of costume, backs Starlight House as herself."],
    ["2024-10-01", "2024-11-05", "Vought", "CEO Ashley Barrett manages Homelander's trial and seeks a new Seven member, Sister Sage the favorite; Cameron Coleman anchors VNN; Stan Edgar is in prison."],
    ["2024-11-05", "2024-11-05", "Boys", "Election night: helped by Secret Service agents, the Boys move to slip poison into Victoria Neuman's eye drops in her hotel suite."],
    ["2024-11-06", "2024-11-06", "Boys", "Mallory and President-elect Singer want Neuman dead before the Jan 6 certification; Butcher, sidelined, confides in Joe Kessler, an old CIA friend who is really a hallucination."],
    ["2024-11-06", "2024-11-08", "Gov", "President-elect Singer and the CIA's Mallory still want Neuman dead before Congress certifies the vote on Jan 6; Neuman, VP-elect, bargains with Butcher for Hughie's files on her."],
    ["2024-11-06", "2024-11-06", "Seven", "Verdict day. Homelander recruits Sister Sage; her first move is to have three of his own fans killed and planted in the courthouse crowd so the Starlighters take the blame."],
    ["2024-11-06", "2024-11-08", "Vought", "Vought awaits Homelander's verdict (Nov 6) and plans Ryan's hero debut, a staged rescue (Nov 8); newly hired Sister Sage starts overruling CEO Ashley Barrett."],
    ["2024-11-07", "2024-11-08", "Boys", "MM, suspecting Sister Sage framed the Starlighters, hacks her phone and plans to tail her at TruthCon (Nov 8); Hughie and Annie watch A-Train; Hughie fights his mother over his father's care."],
    ["2024-11-07", "2024-11-08", "Seven", "Acquitted, Homelander lets Sage steer: she courts far-right Supe Firecracker at TruthCon (Nov 8), stages Ryan's hero debut (Nov 8) and readies her and Firecracker's unveiling (Nov 9)."],
    ["2024-11-07", "2024-11-08", "Starlighters", "Branded killers after three Hometeamers died in the courthouse riot, the Starlighters face public fury; Annie, out of costume, seeks a way to clear them."],
    ["2024-11-09", "2024-11-09", "Boys", "Butcher, thrown out, bonds with Ryan, meaning to drug him away from Homelander; MM plans to bug Homelander's meeting at a Vought on Ice rehearsal and flip A-Train; Kimiko hunts a Shining Light cell."],
    ["2024-11-09", "2024-11-10", "Gov", "Singer plans to bar Supes from government and the military and sidelines Neuman; Neuman secretly meets Homelander and Sage (Nov 9); Annie January seeks a deal with Singer (Nov 10)."],
    ["2024-11-09", "2024-11-09", "Seven", "Sage and Firecracker are unveiled as members at a Vought rally; Homelander and Sage meet Neuman at a Vought on Ice rehearsal to offer her the presidency by removing Singer."],
    ["2024-11-09", "2024-11-09", "Starlighters", "Cleared by footage from A-Train, the Starlighters rally behind Annie, who now speaks out as their leader; Homelander's new ally Firecracker targets her."],
    ["2024-11-09", "2024-11-10", "Vought", "Vought unveils Sage and Firecracker (Nov 9); Sage now runs it over figurehead CEO Ashley Barrett; VNN airs Firecracker's six-hour live special against Starlight (Nov 10)."],
    ["2024-11-10", "2024-11-10", "Boys", "A-Train now spies for MM. Hughie, his father due off life support, gets V from A-Train; MM, Butcher and Frenchie dig for dirt on Firecracker; Frenchie confesses to Colin he killed his family."],
    ["2024-11-10", "2024-11-10", "Seven", "Sage stages Firecracker's six-hour live VNN special against Starlight. Homelander reels from a breakdown over Ryan seeing Butcher. Secret: A-Train now spies for the Boys."],
    ["2024-11-10", "2024-11-10", "Starlighters", "Firecracker sets up a six-hour live VNN special across from Starlight House; Annie seeks a deal with President-elect Singer against Vought."],
    ["2024-11-11", "2024-11-11", "Boys", "Butcher reveals Neuman holds a Supe-killing virus; he and MM spring Stan Edgar from prison to lead them to it. Hughie's father is awake after the V."],
    ["2024-11-11", "2024-11-12", "Gov", "Neuman visits her secret Supe-virus lab at Stan Edgar's farm (Nov 11) and joins Homelander and Sage at Tek Knight's fundraiser to win backers against Singer (Nov 12)."],
    ["2024-11-11", "2024-11-11", "Seven", "At Vought's V52 fan expo the Seven promote new films; Homelander and Sage want the leak found and plan Tek Knight's fundraiser (Nov 12). Secret: A-Train is the Boys' informant."],
    ["2024-11-11", "2024-12-25", "Starlighters", "After Annie's on-air beating of Firecracker, Singer has dropped her and followers drift away; Starlight House is vandalized; her powers fail her; Firecracker's VNN attacks her."],
    ["2024-11-11", "2024-11-11", "Vought", "Vought's V52 fan expo previews new Seven films. Secret: Ashley Barrett, covering for A-Train, pins the leak on her ex, anchor Cameron Coleman."],
    ["2024-11-12", "2024-11-12", "Boys", "Hughie scatters his father's ashes; Frenchie is in jail. Tipped by A-Train, MM plans to slip Hughie into Tek Knight's party as Webweaver. Secret: Butcher holds Sameer Shah captive."],
    ["2024-11-12", "2025-01-06", "GodU", "Cate Dunlap and Sam Riordan, pledged to Homelander, stand ready to serve him; Marie, Andre, Emma and Jordan stay locked in Elmira under Cipher."],
    ["2024-11-12", "2024-11-12", "Seven", "With Ryan, the Seven attend Tek Knight's fundraiser, where Homelander, Sage and Neuman court rich backers to topple President-elect Singer; Firecracker takes over VNN's anchor desk."],
    ["2024-11-12", "2024-11-12", "Vought", "Firecracker takes over Coleman's VNN desk; Ashley Barrett and Sage attend Tek Knight's fundraiser for Homelander's backers; Stan Edgar, freed by Neuman, is loose."],
    ["2024-11-13", "2024-12-24", "Boys", "MM, after his panic attack, leads Hughie, Annie and Kimiko, with A-Train feeding them intel; Frenchie is in jail. Secret: Butcher hides Sameer Shah, forcing him to make a virus to kill Homelander."],
    ["2024-11-13", "2025-01-05", "Gov", "Neuman secretly plots with Homelander and Sage to have Singer killed at the Jan 6 certification so she becomes President; Singer prepares to take office; Mallory backs the Boys."],
    ["2024-11-13", "2024-12-24", "Seven", "Homelander, Sage and Neuman plot to remove Singer (a hired shapeshifter is to kill him on Jan 6) and plan internment camps. Sage secretly knows A-Train is the Boys' informant and feeds them lies."],
    ["2024-11-13", "2024-12-24", "Vought", "Sister Sage runs Vought over figurehead CEO Ashley Barrett; Firecracker anchors VNN against Starlight; a live Avenue V Christmas Special with Ryan is set for Dec 25."],
    ["2024-12-25", "2024-12-25", "Boys", "Butcher comes back; Frenchie, out of jail, and Kimiko guard Sameer; A-Train's photos of Sage lead to an apartment search; MM sends Monique and Janine to Belize."],
    ["2024-12-25", "2024-12-25", "Seven", "Homelander finds Butcher's bugs from Tek Knight's party and sets Firecracker to find the mole; Ryan is to appear on Vought's live Avenue V Christmas Special."],
    ["2024-12-25", "2024-12-25", "Vought", "Vought airs its live Avenue V Christmas Special with Ryan; Ashley Barrett fears Homelander will learn she covered for A-Train."],
    ["2024-12-26", "2025-01-05", "Boys", "Butcher lies in a CIA hospital; MM leads; Frenchie draws the virus from Kimiko's severed leg as they prepare to protect Singer on Jan 6. Secret: 'Annie' is the shapeshifter; Annie is chained up."],
    ["2024-12-26", "2025-01-05", "Seven", "With Sage expelled and A-Train gone, Homelander, Firecracker, The Deep and Black Noir II wait for the shapeshifter, posing as Annie, to kill Singer on Jan 6 so Neuman takes the presidency."],
    ["2024-12-26", "2025-01-06", "Starlighters", "Secret: Annie January is chained in a room while the shapeshifter wears her face among the Boys and the Starlighters, aiming to kill Singer."],
    ["2024-12-26", "2025-01-06", "Vought", "With Sage out and A-Train gone, Ashley Barrett fronts Vought for Homelander; Firecracker's VNN pushes his line; Stan Edgar is in hiding."],
    ["2025-01-06", "2025-01-06", "Boys", "Certification day: MM, Hughie, Frenchie, Kimiko and 'Annie' (secretly the shapeshifter) guard Singer while Frenchie readies the virus; Butcher is in a CIA hospital."],
    ["2025-01-06", "2025-01-06", "Gov", "Certification day: Congress meets to certify Singer's win; the Secret Service and the Boys guard him; Neuman awaits the shapeshifter's strike."],
    ["2025-01-06", "2025-01-06", "Seven", "Certification day: the shapeshifter, posing as Annie, is set to kill Singer so Neuman becomes President. Secret: though expelled, Sage works a plan of her own to bring down Singer and Neuman both."],
    ["2025-01-07", "2025-08-31", "Boys", "Broken up: Hughie, MM and Frenchie are held in Freedom Camp 47; Kimiko, deported, escapes Vought and hides in Manila; Butcher, wanted, hides with the last virus dose, bent on killing every Supe."],
    ["2025-01-07", "2025-08-31", "GodU", "Cate Dunlap and Sam Riordan serve Homelander's regime as deputized Supes; Marie, Andre, Emma and Jordan are still held at Elmira under Cipher."],
    ["2025-01-07", "2025-08-31", "Gov", "Martial law: President Calhoun rules as Homelander's puppet and deputized Supes enforce it; Singer is in prison, framed for Neuman's murder; the FBSA is powerless; Starlighters fill Freedom Camps."],
    ["2025-01-07", "2025-08-31", "Payback", "Soldier Boy is still frozen; Homelander, shown the tank by President Calhoun, now keeps it and leaves his father asleep."],
    ["2025-01-07", "2025-08-31", "Seven", "Homelander rules via President Calhoun, heading the deputized Supes with Sage as right hand and Firecracker, The Deep (hunting A-Train) and Black Noir II; Ryan is gone (Vought: boarding school)."],
    ["2025-01-07", "2025-08-31", "Starlighters", "Branded terrorists, Starlighters are hunted into Freedom Camps; Starlight, wanted, leads an underground resistance from hiding; Hughie is held in Camp 47."],
    ["2025-01-07", "2025-08-31", "Vought", "VNN is state TV. Ashley Barrett, changed by V (a mind-reading second face on the back of her head, hidden under her wig), stays Vought's face; Stan Edgar hides in a bunker."],
    ["2025-09-01", "2026-02-08", "Boys", "Scattered. Hughie Campbell, Mother's Milk and Frenchie are in Freedom Camp 47; Billy Butcher, with Temp V tentacles, strengthens the Supe virus with Sameer Shah near Erie; Kimiko lives in Manila."],
    ["2025-09-01", "2026-02-11", "Church", "Oh Father, a Supe preacher married to Ashley Barrett, rallies believers behind Homelander from his megachurch, Samaritan's Embrace."],
    ["2025-09-01", "2025-09-13", "GodU", "Dean Cipher runs Godolkin; secretly he is the human Doug Brightbill, puppeted by a burned Thomas Godolkin he hides. Emma Meyer, Jordan Li and Andre Anderson are in Elmira; Marie Moreau is on the run."],
    ["2025-09-01", "2026-01-11", "Gov", "President Calhoun rules under martial law as Homelander's puppet: Supes are deputized, Starlighters go to Freedom Camps, VNN is state TV. Robert Singer is in prison for Neuman's murder."],
    ["2025-09-01", "2026-02-12", "Payback", "Soldier Boy lies frozen in a cryo-tank Homelander keeps in his quarters. The Legend lives in hiding under a false name."],
    ["2025-09-01", "2025-10-05", "Seven", "Homelander rules the country through President Calhoun. The Seven (Sister Sage, Firecracker, The Deep, Black Noir II) enforce martial law; The Deep has orders to catch the fugitive A-Train."],
    ["2025-09-01", "2025-09-20", "Starlighters", "Annie January leads the underground resistance; 'Starlighter' is a crime and suspects go to numbered Freedom Camps. She knows Hughie, Mother's Milk and Frenchie are in Camp 47 but hasn't freed them."],
    ["2025-09-01", "2025-10-01", "Vought", "Vought sells Homelander's rule: VNN is state TV, Firecracker hosts Truthbomb, Elmira holds Supes. CEO Ashley Barrett is sidelined; Sister Sage holds the reins. Stan Edgar hides in a bunker."],
    ["2025-09-14", "2025-09-20", "GodU", "Andre Anderson is dead; Vought hides it. Cate Dunlap gets Emma Meyer and Jordan Li out of Elmira for move-in day (Sept 21) if they back Vought's line on The Woods. Marie Moreau hides."],
    ["2025-09-21", "2025-09-21", "GodU", "Move-in day: Emma Meyer and Jordan Li, back at Godolkin, learn Andre died. Cipher sends Cate Dunlap to find the fugitive Marie Moreau, who is searching for her sister Annabeth."],
    ["2025-09-21", "2025-10-04", "Starlighters", "Annie January leads the underground resistance and has asked Marie Moreau to spy on Project Odessa at Godolkin, where a student Starlighter cell works."],
    ["2025-09-22", "2025-09-28", "GodU", "Marie Moreau trains privately with Cipher; Polarity, now teaching, and Emma Meyer dig into Project Odessa, which made Marie. Cate Dunlap lies in hospital, her powers failing."],
    ["2025-09-29", "2025-09-30", "GodU", "Cate Dunlap is back, weakened. Jordan Li, now No. 1, is to speak at Godolkin's 60th-anniversary ceremony (Sept 30). Marie Moreau learns Cipher made her in a Vought lab; Emma joins a Starlighter cell."],
    ["2025-10-01", "2025-10-01", "GodU", "Jordan Li is vilified on air. Threatening Elmira, Cipher makes Jordan and Marie Moreau fight on pay-per-view tonight; Jordan and Cate Dunlap break into his house and find a burned man."],
    ["2025-10-02", "2025-10-02", "GodU", "Cate Dunlap is locked in Elmira and Cipher keeps training Marie Moreau under threat. Marie, Jordan Li and Emma Meyer plan to break Cate out tonight; Polarity confronts Cipher about Andre."],
    ["2025-10-02", "2025-10-05", "Vought", "Sister Sage is CEO and, unknown to Homelander, knows Thomas Godolkin is alive. Elmira holds Cate Dunlap. Stan Edgar hides in his bunker with Zoe Neuman."],
    ["2025-10-03", "2025-10-03", "GodU", "Out of Elmira with Cate Dunlap and Annabeth Moreau, the group shelters in Stan Edgar's bunker and suspects Cipher's burned man is Thomas Godolkin. Cipher wants Marie Moreau back."],
    ["2025-10-04", "2025-10-04", "GodU", "Marie Moreau and Cate Dunlap slip off to find the burned man at Cipher's house; Annabeth, Emma Meyer, Jordan Li and Sam Riordan go after them. Annabeth has foreseen mass death."],
    ["2025-10-05", "2025-10-05", "GodU", "Thomas Godolkin, free and openly alive, holds a seminar to purge weak Supes. Marie Moreau, Emma Meyer, Jordan Li, Cate Dunlap, Sam Riordan and Annabeth plan to free the students."],
    ["2025-10-05", "2026-01-31", "Starlighters", "Annie January's resistance, now with Marie Moreau's group from Godolkin, hides from raids; Stan Edgar, in his bunker, helps them. Starlighters fill the Freedom Camps."],
    ["2025-10-06", "2026-01-31", "GodU", "Thomas Godolkin is dead. Marie Moreau, Annabeth, Emma Meyer, Jordan Li, Cate Dunlap and Sam Riordan are fugitives in Starlight's resistance; Polarity stayed behind to take the blame."],
    ["2025-10-06", "2026-01-31", "Seven", "Homelander rules through Calhoun and scorns Sage over the Godolkin fiasco; Firecracker, The Deep and Black Noir II serve him. The Deep still hunts A-Train. Vought says Ryan is at boarding school."],
    ["2025-10-06", "2026-01-31", "Vought", "Sister Sage runs Vought; Homelander scorns her over the Godolkin fiasco. VNN and Truthbomb back the regime. Stan Edgar, in his bunker, quietly helps Starlight."],
    ["2026-01-12", "2026-03-11", "Gov", "Calhoun rules under martial law with Ashley Barrett as Vice President, signing whatever Homelander wants; critics of Homelander are detained. Robert Singer stays in prison."],
    ["2026-02-01", "2026-03-11", "GodU", "Marie Moreau, Jordan Li and Emma Meyer fight on in Starlight's resistance, dumpster diving and sleeping in cars."],
    ["2026-02-01", "2026-02-08", "Seven", "A year into his rule, Homelander is to speak at Vought's annual shareholders meeting (Feb 8). The Seven: Sister Sage, Firecracker, The Deep, Black Noir II."],
    ["2026-02-01", "2026-02-08", "Starlighters", "Starlight prepares to slip into Vought's annual shareholders meeting (Feb 8) and play the Flight 37 video of Homelander."],
    ["2026-02-01", "2026-02-08", "Vought", "Vought prepares its annual shareholders meeting (Feb 8), with a speech by Homelander; Sister Sage runs his image. Stan Edgar hides in his bunker, helping Starlight."],
    ["2026-02-09", "2026-02-11", "Boys", "Told the three die at Freedom Camp 47 on Feb 12, Butcher visits his father in London, fetches Kimiko from Manila, makes a truce with Starlight and has the Worm tunnel under the camp."],
    ["2026-02-09", "2026-02-12", "Seven", "Enraged by the Flight 37 leak, Homelander has leaked that Hughie Campbell, Mother's Milk and Frenchie die at Freedom Camp 47 on Feb 12, to lure Butcher and Starlight; he waits there."],
    ["2026-02-09", "2026-02-11", "Starlighters", "Vought calls the Flight 37 video AI. Starlight joins Butcher to free Hughie, Mother's Milk and Frenchie from Freedom Camp 47 before their execution (Feb 12); A-Train refuses to help."],
    ["2026-02-09", "2026-02-12", "Vought", "Sister Sage's team calls the Flight 37 video AI and detains people who mock Homelander online; Vought hunts Starlighter cells."],
    ["2026-02-12", "2026-02-14", "Boys", "Hughie Campbell, Mother's Milk and Frenchie are free; A-Train died saving Hughie. At Sameer Shah's lab near Erie the Boys plan to test the virus on Teenage Kix's Rock Hard."],
    ["2026-02-12", "2026-02-25", "Church", "Oh Father preaches Homelander's cause, brands Starlighters demons and leads A-Train's memorial (Feb 13)."],
    ["2026-02-12", "2026-02-15", "Starlighters", "Starlight works with the reunited Boys; Vought blames Starlighters for A-Train's death and raids their cells."],
    ["2026-02-13", "2026-02-15", "Payback", "Thawed by Homelander, Soldier Boy hunts Butcher for a pardon and a deputy's place in the Seven. The Legend hides under a false name, working a cinema's concession stand."],
    ["2026-02-13", "2026-02-15", "Seven", "A-Train is dead. Homelander thaws Soldier Boy to hunt Butcher and offers him a deputy's place in the Seven; Vought relaunches him on Feb 15."],
    ["2026-02-13", "2026-02-15", "Vought", "Vought mourns A-Train, blaming Starlighters, and readies Soldier Boy's relaunch as a hero (Feb 15)."],
    ["2026-02-15", "2026-02-15", "Boys", "Soldier Boy survived the virus. Learning V-One made him immune, the Boys meet Stan Edgar at his bunker to find it; Butcher asks Ryan to carry the virus to Homelander."],
    ["2026-02-16", "2026-02-25", "Boys", "Sameer Shah destroyed the virus; Frenchie must rebuild it, which takes weeks. Butcher tends the battered Ryan; Starlight has flown off. The Boys target Fort Harmony for V-One."],
    ["2026-02-16", "2026-03-15", "Payback", "Soldier Boy serves in the Seven as Homelander's father and hunts V-One with him. The Legend hides under a false name at a cinema."],
    ["2026-02-16", "2026-02-25", "Seven", "Soldier Boy is in the Seven. Told by Sage that V-One keeps Soldier Boy ageless and virus-proof, Homelander wants it and presses the captured Stan Edgar. He beat Ryan nearly to death."],
    ["2026-02-16", "2026-02-25", "Starlighters", "Shaken after killing Cindy, Starlight has flown off to find her estranged father, Rick."],
    ["2026-02-16", "2026-03-11", "Vought", "Vought sells Soldier Boy as reborn and Homelander as a god. Stan Edgar is Homelander's prisoner at Vought Tower, pressed about V-One."],
    ["2026-02-26", "2026-03-11", "Boys", "Bombsight has the V-One. Frenchie rebuilds the virus; Starlight, reconciled with her father, is back with Hughie Campbell. The Boys look for Bombsight."],
    ["2026-02-26", "2026-03-01", "Church", "With Firecracker's team, Oh Father prepares to rebrand his church as the Democratic Church of America, with Homelander as Prophet."],
    ["2026-02-26", "2026-03-01", "Seven", "Calling himself the Messiah, Homelander has Firecracker's team present him as God through a 'Democratic Church of America'; he and Soldier Boy hunt V-One at Fort Harmony."],
    ["2026-02-26", "2026-03-11", "Starlighters", "Starlight, reconciled with her father and back with Hughie Campbell, fights beside the Boys."],
    ["2026-03-02", "2026-03-11", "Church", "The Democratic Church of America hails Homelander as Prophet; Supes like Praying Mantis shake down other churches to join."],
    ["2026-03-02", "2026-03-11", "Seven", "Homelander, now Prophet of the Democratic Church, presses the captive Stan Edgar for V-One with Soldier Boy. The Deep took credit for Edgar's capture, angering Black Noir II."],
    ["2026-03-12", "2026-03-14", "Boys", "The Boys hunt Bombsight: The Legend leads Butcher to Golden Geisha, Bombsight's old lover, as bait. Hughie Campbell and Starlight plan to hit Oh Father's church with the virus (Mar 15)."],
    ["2026-03-12", "2026-03-31", "Church", "Oh Father plans Homelander's 'second coming' for Easter Sunday (April 5), rushing out Homelander Bibles and a film declaring him God; his acolyte Synapse serves him."],
    ["2026-03-12", "2026-04-01", "GodU", "Marie Moreau, Jordan Li and Emma Meyer work with Starlight; Emma tracks Oh Father's movements."],
    ["2026-03-12", "2026-03-14", "Gov", "Calhoun signs whatever Homelander wants. Vice President Ashley Barrett is drawn into Sister Sage's secret plot against Homelander."],
    ["2026-03-12", "2026-03-14", "Seven", "Firecracker and Mister Marathon are dead. Homelander and Soldier Boy hunt Bombsight for the V-One; Oh Father plans Homelander's 'second coming' for Easter Sunday (April 5)."],
    ["2026-03-12", "2026-03-14", "Starlighters", "Starlight fights beside the Boys; she and Hughie Campbell plan to hit Oh Father's megachurch with the virus (Mar 15)."],
    ["2026-03-12", "2026-03-14", "Vought", "Sister Sage, plotting against Homelander, enlists Vice President Ashley Barrett to keep V-One from him. The Deep is to film a PSA for Vought's Alaska pipeline. Edgar is still a prisoner."],
    ["2026-03-15", "2026-03-16", "Boys", "Sister Sage has joined the Boys. Holding Golden Geisha as bait, they wait for Bombsight and the V-One."],
    ["2026-03-15", "2026-03-31", "Gov", "Calhoun signs whatever Homelander wants. Vice President Ashley Barrett, drugged and dropped by Sister Sage, keeps serving Homelander."],
    ["2026-03-15", "2026-03-15", "Seven", "Black Noir II is dead and Sister Sage has deserted. Homelander and Soldier Boy hunt Bombsight for the V-One; Homelander's Easter address is set for April 5."],
    ["2026-03-15", "2026-04-04", "Starlighters", "Starlight fights beside the Boys against Homelander, now armed with V-One; Marie Moreau's group helps. The Freedom Camps still hold Starlighters."],
    ["2026-03-15", "2026-04-05", "Vought", "CEO Sister Sage has deserted. Vought serves Homelander, readying his Easter address (April 5) and a film declaring him God; Stan Edgar is still his prisoner."],
    ["2026-03-16", "2026-04-01", "Payback", "Soldier Boy gave Homelander the last V-One and stays with him. Bombsight, made human, can live with Golden Geisha. The Legend hides under a false name."],
    ["2026-03-16", "2026-03-31", "Seven", "Homelander has injected the last V-One: ageless and virus-proof, he hunts all who humiliated him and prepares to declare himself God at Easter (April 5). Soldier Boy stays at his side."],
    ["2026-03-17", "2026-03-31", "Boys", "Homelander has the V-One and hunts them. In hiding, Butcher has Frenchie irradiate Kimiko to give her Soldier Boy's power-stripping blast."],
    ["2026-04-01", "2026-04-03", "Boys", "Frenchie and Sister Sage stabilize Kimiko's radiation treatment. Butcher and Hughie Campbell investigate Oh Father's church; Starlight and Mother's Milk watch his Vought Studios screening."],
    ["2026-04-01", "2026-04-05", "Church", "Oh Father writes Homelander's Easter address (live from the White House, 4 p.m. April 5) and test-screens a film declaring him God."],
    ["2026-04-01", "2026-04-05", "Gov", "Ashley Barrett is President after Homelander killed Calhoun; the White House is to host Homelander's live Easter address (4 p.m., April 5)."],
    ["2026-04-01", "2026-04-01", "Seven", "Homelander has killed President Calhoun and abolished the Seven; he prepares his Easter address (April 5). The Deep, barred from the sea for the spill, clings to him."],
    ["2026-04-02", "2026-04-04", "GodU", "Marie Moreau, Jordan Li and Emma Meyer shelter the test audience Starlight saved from Vought Studios and plan to get them out of the country."],
    ["2026-04-02", "2026-05-31", "Payback", "Soldier Boy is frozen in cryo-sleep again. The Legend hides under a false name; Bombsight lives as a human."],
    ["2026-04-02", "2026-04-04", "Seven", "Soldier Boy is back on ice. With the Seven abolished, Homelander readies his Easter address from the White House (April 5); The Deep, barred from the sea, clings to him."],
    ["2026-04-04", "2026-04-05", "Boys", "Frenchie is dead; Kimiko has the power-stripping blast. The Boys plan to strike Homelander at the White House, through an old CIA tunnel, during his Easter address (4 p.m., April 5)."],
    ["2026-04-05", "2026-05-31", "GodU", "Marie Moreau, Emma Meyer and Jordan Li have taken the Vought Studios survivors to Canada; Homelander's regime has fallen."],
    ["2026-04-05", "2026-04-05", "Seven", "Easter: Homelander declares himself God live from the White House at 4 p.m., with Oh Father and The Deep at his side."],
    ["2026-04-05", "2026-04-05", "Starlighters", "Starlight joins the Boys' White House raid on Homelander; Marie Moreau's group takes the Vought Studios survivors to Canada."],
    ["2026-04-06", "2026-05-31", "Boys", "Disbanded after the deaths of Frenchie and Butcher. Hughie Campbell is with Annie January; Mother's Milk, Kimiko and the powerless Ryan go their own ways."],
    ["2026-04-06", "2026-05-31", "Church", "Oh Father and his Prophet, Homelander, died on April 5; the Democratic Church of America is leaderless."],
    ["2026-04-06", "2026-04-19", "Gov", "After Homelander's death Congress removed Ashley Barrett; Robert Singer, freed, is President again and the Freedom Camps are open."],
    ["2026-04-06", "2026-05-31", "Seven", "Abolished. Homelander, The Deep, A-Train, Firecracker and Black Noir II are dead; Sister Sage is powerless; Soldier Boy is frozen."],
    ["2026-04-06", "2026-05-31", "Starlighters", "Homelander's regime has fallen and the Freedom Camps are open; the resistance is over. Starlight works as a hero again, with Hughie Campbell."],
    ["2026-04-06", "2026-04-19", "Vought", "Homelander is dead. Stan Edgar, freed, is interim CEO, promising a new era for Vought."],
    ["2026-04-20", "2026-05-31", "Gov", "President Robert Singer has relaunched the FBSA to police Supes."],
    ["2026-04-20", "2026-05-31", "Vought", "Under interim CEO Stan Edgar, Vought has fired every hero who backed Homelander."]
  ];
  // A canon month in one line, for the note's "Earlier" list and time skips: [year, month, line]
  const SUMMARY = [
    [2010, 6, "June 2010 The Deep joined the Seven"],
    [2012, 1, "January 2012 Becca Butcher vanished"],
    [2015, 5, "May 2015 A-Train replaced Mister Marathon in the Seven"],
    [2019, 5, "May 2019 A-Train killed Robin Ward; Starlight replaced Lamplighter; the Boys killed Translucent (public: on a mission)"],
    [2019, 6, "June 2019 Flight 37 crashed; The Deep was exiled to Sandusky; Madelyn Stillwell was killed (Butcher blamed); Supes were cleared for the military"],
    [2020, 9, "September 2020 Stormfront joined the Seven; Translucent's death was announced"],
    [2020, 10, "October 2020 Compound V went public; Stormfront was exposed as a Nazi and maimed; Becca Butcher, Lamplighter and Vogelbaum died; Victoria Neuman was put in charge of policing Supes"],
    [2021, 8, "August 2021 A-Train rejoined the Seven"],
    [2022, 6, "June 2022 Stan Edgar was ousted and Homelander took over Vought; Soldier Boy returned and was put back on ice; Starlight quit the Seven; Supersonic and Black Noir died; Homelander killed a protester"],
    [2023, 8, "August 2023 Golden Boy killed Professor Brinkerhoff and himself at Godolkin"],
    [2023, 9, "September 2023 the Godolkin University massacre"],
    [2024, 11, "November 2024 Singer and Neuman won the election; Homelander was acquitted; Sister Sage and Firecracker joined the Seven"],
    [2024, 12, "December 2024 A-Train was exposed as the Boys' informant and fled"],
    [2025, 1, "January 2025 Victoria Neuman was killed; President Calhoun declared martial law and put Homelander over an army of Supes"],
    [2025, 10, "October 2025 Sister Sage took over Vought; Thomas Godolkin was killed at Godolkin"],
    [2026, 2, "February 2026 Homelander killed A-Train; Soldier Boy joined the Seven as Homelander's father"],
    [2026, 3, "March 2026 Homelander took V-One; Firecracker, Black Noir II and Mister Marathon died"],
    [2026, 4, "April 2026 Billy Butcher killed Homelander on live TV and died the next day; the Seven is gone; Singer is President again and Stan Edgar runs Vought"]
  ];
  // What the public hears: [year, month, the news as it reaches people, words that show a reply delivered it, true for a
  // canon stop (a time skip can't jump over it), its headline, stricter words that show a reply narrated it, a tag (Jack's
  // own stops: "jack"), the day it breaks (a stop lands on that day), and optionally who the headline event depends on
  // ("Name" alive, "!Name" dead in canon), for branch mode]. Only public knowledge: nothing secret is in here.
  const NEWS = [
    [2007, 6, "Vought Studios' first movie, Rising Tide, starring The Deep (still a Godolkin student), is in theaters, and Queen Maeve: Her Majesty comes this summer; Vought is building a movie universe around the Seven.", /Rising Tide|Her Majesty|Vought Studios|(?:Deep|Maeve)[^.]{0,60}(?:movie|film|theaters|premiere)/i, false, "Vought Studios launches its movie universe with Rising Tide", null, null, 15],
    [2010, 6, "The Deep has graduated from Godolkin and been drafted into the Seven, filling the seventh seat; Vought is rolling him out everywhere.", /(?:The Deep|Deep)[^.]{0,80}(?:drafted|joins?|joined|newest member|seventh seat|graduat)|seventh seat/i, false, "The Deep joins the Seven", null, null, 2],
    [2014, 3, "Homelander and Queen Maeve were the stars of the Oscars red carpet.", /Oscars?/i, false, "Homelander and Maeve at the Oscars", null, null, 3],
    [2015, 5, "At the Vought Hero Draft, A-Train, top of his class at Godolkin, beat Mister Marathon in a public race and took his seat in the Seven; Homelander refused Marathon a rematch, and Marathon is out.", /(?:A-Train|Marathon)[^.]{0,80}(?:race|draft|seat|beat|replac)|Hero Draft/i, true, "A-Train beats Mister Marathon and takes his seat in the Seven", /(?:A-Train|Marathon)[^.]{0,80}(?:race|beat|replac|took his seat|takes his seat)|Hero Draft/i, null, 31],
    [2019, 6, "In one week: A-Train ran through and killed a young woman, Robin Ward, in Queens (Vought calls it a tragic accident on a mission); at Vought's shareholders meeting Starlight was introduced as the Seven's newest member, replacing a retiring Lamplighter; Vought says Translucent is away on a classified mission; A-Train beat Shockwave in a televised race; and Transoceanic Flight 37 was hijacked and crashed into the Atlantic with everyone aboard, after which Homelander went on TV demanding that Supes be allowed to serve in the military.", /Robin Ward|Flight 37|Starlight[^.]{0,80}(?:newest|joins?|joined|introduced|shareholders)|Translucent[^.]{0,60}(?:mission|missing|gone)|Shockwave|Supes? in the military/i, true, "Season 1 begins: A-Train kills Robin Ward; Starlight joins the Seven; Translucent 'on a mission'; Flight 37 goes down", /Robin Ward|Flight 37|Starlight[^.]{0,80}(?:newest member|joins the Seven|joined the Seven|introduced)|Translucent[^.]{0,60}classified mission/i, null, 5],
    [2019, 6, "At the Believe Expo, Starlight said on stage that she was assaulted by a fellow hero; The Deep apologized on television and has gone to Sandusky, Ohio.", /Believe Expo|Sandusky|Deep[^.]{0,60}(?:apolog|Ohio|sabbatical)|Starlight[^.]{0,60}(?:assault|speech|on stage)/i, true, "Believe Expo: Starlight speaks out; The Deep exiled to Ohio", /Believe Expo|Sandusky|Deep[^.]{0,60}(?:apologi[sz]ed|exiled|sabbatical)/i, null, 21],
    [2019, 7, "At the end of June, Madelyn Stillwell, Vought's Senior VP of Hero Management, was found killed in her home, and the FBI is hunting a British man, William Butcher, for it; the Pentagon has cleared Supes to serve in the military; Vought has named Ashley Barrett its new Senior VP of Hero Management; the Seven are short two members, with Translucent still \"on a mission\" and The Deep in Ohio; and the news is full of Supe-terrorists abroad, the new reason Supes belong in the military.", /Stillwell[^.]{0,60}(?:dead|died|killed|murder|funeral)|killed in her home|Butcher[^.]{0,60}(?:wanted|fugitive|hunt|suspect)|cleared[^.]{0,40}military|military[^.]{0,40}(?:Supes|cleared)|Ashley Barrett[^.]{0,60}(?:Senior VP|promoted|named|new)|Supe-terrorist/i, true, "Madelyn Stillwell found dead (Butcher blamed); Supes cleared for the military; Ashley Barrett takes her job", /Stillwell[^.]{0,60}(?:dead|died|killed|murder|funeral)|killed in her home|cleared[^.]{0,40}military|Supes? (?:in|for) the military/i, null, 1, "Homelander"],
    [2020, 9, "Vought held a public funeral for Translucent, killed, it says, by a Supe-terrorist called El Diablo, and introduced Stormfront as the Seven's newest member; CIA deputy director Susan Raynor died suddenly in Washington.", /Translucent[^.]{0,60}(?:funeral|dead|death|died)|El Diablo|Stormfront[^.]{0,60}(?:join|newest|member|Seven)|Raynor/i, true, "Translucent's funeral; Stormfront joins the Seven", /Translucent[^.]{0,60}(?:funeral|buried)|El Diablo|Stormfront[^.]{0,60}(?:joins?|joined|newest member|takes? (?:his|a) seat)/i, null, 30],
    [2020, 10, "Compound V is public: a leaked video and documents show Vought makes Supes with a drug (Vought blames rogue scientists, and the military deal is dead); a congressional hearing on Vought ended in a massacre when people's heads exploded on live TV, Jonah Vogelbaum and the hero Shockwave among the dead; Stormfront was exposed as a Nazi born in 1919 and has disappeared; Lamplighter is dead; A-Train is out of the Seven; and Congress created the Federal Bureau of Superhuman Affairs under Congresswoman Victoria Neuman.", /Compound V[^.]{0,80}(?:public|leak|exposed|news|everywhere|out)|hearing[^.]{0,60}(?:head|explod)|heads? explod|Stormfront[^.]{0,60}(?:Nazi|exposed|disappear)|Nazi|Bureau of Superhuman|FBSA|Lamplighter[^.]{0,40}(?:dead|died)|A-Train[^.]{0,40}(?:fired|out of the Seven|dropped)/i, true, "Compound V goes public; the hearing massacre (Vogelbaum dead); Stormfront exposed as a Nazi; the FBSA is born", /hearing[^.]{0,100}(?:heads?|explod|dead|chaos|massacre|Vogelbaum|tragedy)|Vogelbaum[^.]{0,60}(?:dead|died|killed)|Compound V[^.]{0,60}(?:public|leaked|exposed)|Bureau of Superhuman Affairs|FBSA|Stormfront[^.]{0,60}(?:Nazi|exposed)/i, null, 17],
    [2021, 8, "A-Train is officially back in the Seven.", /A-Train[^.]{0,60}(?:back|rejoin|return)/i, false, "A-Train back in the Seven", null, null, 7],
    [2022, 5, "Dawn of the Seven premiered at Vought Tower; the FBSA keeps Supes on a shorter leash, with the Boys as its contractors.", /Dawn of the Seven|premiere/i, false, "Dawn of the Seven premieres", null, null, 31],
    [2022, 6, "Stormfront killed herself; Homelander snapped on live TV, told the country he was done apologizing, and his numbers went up; The Deep and Supersonic joined the Seven, and Supersonic died days later (Vought says an overdose); an explosion in Midtown killed nineteen; Starlight quit the Seven on a livestream and accused Homelander of covering up a Supe called Soldier Boy; Stan Edgar is out as Vought's CEO after Congresswoman Neuman accused him of crimes; Vought says Queen Maeve died stopping Soldier Boy at Vought Tower; and Homelander killed a protester in the street on camera while his crowd cheered.", /Stormfront[^.]{0,40}(?:dead|died|suicide|killed herself)|done apologizing|Supersonic|Soldier Boy|Midtown[^.]{0,40}(?:explosion|blast|nineteen|19)|Starlight[^.]{0,60}(?:quit|livestream|left the Seven)|Edgar[^.]{0,60}(?:out|ousted|resign|forced)|Maeve[^.]{0,40}(?:dead|died)|protester/i, true, "Season 3: Homelander snaps on TV; Soldier Boy returns; Starlight quits; Edgar out; Maeve 'dead'", /done apologizing|Supersonic|Soldier Boy[^.]{0,80}(?:back|returns?|alive|blast|Midtown)|Starlight[^.]{0,60}(?:quit|livestream|left the Seven)|Edgar[^.]{0,60}(?:ousted|forced out|out as CEO|removed)|Maeve[^.]{0,40}(?:dead|died)/i, null, 16, "Homelander"],
    [2023, 8, "At Godolkin University the top-ranked student, Golden Boy, killed Professor Brinkerhoff and then himself; Vought calls it a drug-fueled breakdown.", /Golden Boy|Brinkerhoff[^.]{0,40}(?:dead|died|killed|burn)/i, true, "Golden Boy kills Professor Brinkerhoff at Godolkin", /Golden Boy[^.]{0,80}(?:kill|burn|dead|died)|Brinkerhoff[^.]{0,40}(?:dead|died|killed|burn)/i, null, 30],
    [2023, 9, "A massacre at Godolkin University: Vought says escaped lab subjects attacked the campus, Homelander arrived and arrested four students as the instigators, and two others, Cate Dunlap and Sam Riordan, are being hailed as the Guardians of Godolkin.", /Godolkin[^.]{0,80}(?:massacre|attack|killed|dead)|Guardians of Godolkin|Cate Dunlap|Sam Riordan/i, true, "The Godolkin massacre; the Guardians of Godolkin", /Godolkin[^.]{0,80}(?:massacre|attack|killed|dead)|Guardians of Godolkin/i, null, 22],
    [2024, 10, "Homelander is on trial for murder in New York, with his Hometeamers and Starlight's Starlighters facing off outside the courthouse, while Robert Singer and Victoria Neuman lead the presidential race in its last weeks.", /trial|courthouse|Starlighters|Hometeamers|(?:Singer|Neuman)[^.]{0,60}(?:campaign|election|poll|race)/i, false, "Homelander on trial; Singer and Neuman lead the election", null, null, 1],
    [2024, 11, "Robert Singer won the presidency with Victoria Neuman as Vice President; Homelander was acquitted; Sister Sage and Firecracker joined the Seven; three of Homelander's fans were beaten to death and Starlighters are blamed; VNN anchor Cameron Coleman and the hero Tek Knight are dead.", /(?:Singer|Neuman)[^.]{0,60}(?:won|elected|President|Vice)|acquitted|Sister Sage|Firecracker|Cameron Coleman|Tek Knight/i, true, "Singer elected; Homelander acquitted; Sister Sage and Firecracker join the Seven", /(?:Singer|Neuman)[^.]{0,60}(?:elected|won the|President-elect|Vice President-elect)|Homelander[^.]{0,40}acquitted|Sister Sage[^.]{0,60}(?:joins?|joined|newest)|Firecracker[^.]{0,60}(?:joins?|joined|newest)/i, null, 12, "Homelander"],
    [2024, 12, "A-Train has vanished from the Seven; Vought says he is on a secret mission overseas.", /A-Train[^.]{0,80}(?:vanish|gone|missing|secret mission|overseas|left)/i, false, "A-Train vanishes ('secret mission')", null, null, 26],
    [2025, 1, "Homelander outed Vice President-elect Victoria Neuman as a Supe on live TV; she is dead and President-elect Singer is under arrest for it; House Speaker Steven Calhoun is President and has declared martial law, with Homelander's Supes deputized nationwide; the Boys and Starlight are wanted; Freedom Camps are opening for Starlighters.", /Neuman[^.]{0,80}(?:Supe|dead|died|killed|outed)|Calhoun|martial law|Freedom Camp|deputized|Singer[^.]{0,60}arrest/i, true, "Neuman outed and killed; Calhoun's martial law; Supes deputized", /Neuman[^.]{0,80}(?:Supe|dead|died|killed|outed)|Calhoun|martial law|Freedom Camp|deputized/i, null, 6, "Homelander,Victoria Neuman"],
    [2025, 10, "Sister Sage is Vought's new CEO; at Godolkin University, founder Thomas Godolkin turned out to be alive and was killed by the student Marie Moreau.", /Sister Sage[^.]{0,40}CEO|Thomas Godolkin|Dean Cipher|Marie Moreau/i, true, "Sister Sage is Vought's CEO; Thomas Godolkin killed at God U", /Sister Sage[^.]{0,40}CEO|Thomas Godolkin|Dean Cipher/i, null, 6],
    [2026, 2, "At Vought's shareholders meeting, Starlighters leaked video of Homelander abandoning Flight 37, which Vice President Ashley Barrett called AI; a Freedom Camp was broken open; A-Train is dead and Vought blames Starlight; and Soldier Boy, thawed and pardoned, was presented by Homelander as his father and the Seven's number two.", /Flight 37|Freedom Camp|A-Train[^.]{0,40}(?:dead|died|killed)|Soldier Boy|shareholders/i, true, "Flight 37 video leaks; A-Train dead; Soldier Boy joins the Seven as Homelander's father", /Flight 37[^.]{0,60}(?:video|leak|footage)|A-Train[^.]{0,40}(?:dead|died|killed)|Soldier Boy[^.]{0,80}(?:father|number two|pardon|thaw)/i, null, 15, "Homelander"],
    [2026, 3, "Homelander has been proclaimed Prophet of the Democratic Church of America; Firecracker and Mister Marathon are dead; a Vought oil pipeline burst in the Bering Sea, and Black Noir is said to have died there.", /Prophet|Church of America|Firecracker[^.]{0,40}(?:dead|died|killed)|Marathon[^.]{0,40}(?:dead|died|killed)|pipeline|Noir[^.]{0,40}(?:dead|died|killed)/i, true, "Homelander proclaimed Prophet; Firecracker, Marathon and Noir dead; the pipeline bursts", /Prophet|Church of America|Firecracker[^.]{0,40}(?:dead|died|killed)|Marathon[^.]{0,40}(?:dead|died|killed)|pipeline[^.]{0,40}(?:burst|rupture)/i, null, 16, "Homelander"],
    [2026, 4, "President Calhoun is dead and Ashley Barrett is President; the Seven has been abolished; on Easter Sunday Homelander declared himself God live from the White House and was killed on air by William Butcher with a crowbar; Butcher died the next day; Barrett was impeached and arrested, Robert Singer is President again, and Stan Edgar is back as Vought's CEO.", /Calhoun|crowbar|Easter|White House|Butcher[^.]{0,60}(?:killed|dead|died)|Homelander[^.]{0,60}(?:dead|died|killed)|impeach|Singer[^.]{0,40}President|Edgar[^.]{0,40}(?:CEO|back)/i, true, "Homelander declares himself God and is killed on live TV; the Seven is gone", /crowbar|Easter[^.]{0,80}(?:God|White House)|Homelander[^.]{0,60}(?:dead|died|killed)|Butcher[^.]{0,60}(?:killed Homelander|dead|died)|impeach|Seven[^.]{0,40}abolish/i, null, 6, "Homelander,Billy Butcher"]
  ];
  // Jack's own stops, shaped like NEWS entries but never public news (none at the moment)
  const BEATS = [];
  const isBeat = (n) => !!n && n[7] === "jack";
  const newsKey = (n) => (n[7] ? n[7] + "-" : "") + n[0] + "-" + n[1] + (typeof n[8] === "number" ? "-" + n[8] : "");
  const newsIdx = (n) => D(n[0], n[1]);
  // The day a piece of news breaks, and the day a canon stop lands on (the 1st of its month when a row has no day)
  const stopDayOf = (n) => DY(n[0], n[1], typeof n[8] === "number" ? n[8] : 1);
  const newsDay = stopDayOf;
  // The news as the story stands (branch mode: without the clauses about someone the story changed), and whether any is left
  const newsText = (n) => (isBeat(n) ? n[2] : branching() && needsBroken(n[9], newsDay(n)) ? "" : cleanse(n[2], newsIdx(n), newsDay(n)));
  const newsLive = (n) => !!newsText(n);
  // The days a time skip stops at, in order, within (from, to] (day numbers): the big canon days (and any stop of Jack's own)
  const stopsBetween = (from, to) => NEWS.concat(isJack() ? BEATS : []).filter((n) => n[4] && newsLive(n) && stopDayOf(n) > from && stopDayOf(n) <= to)
    .sort((a, b) => stopDayOf(a) - stopDayOf(b));
  // Where a skip starts looking for stops: today, or while the day is only a guess (a story from v3.1, which stopped at
  // whole months) the end of the month, so a canon stop of the month the story is already in isn't played a second time
  const stopFrom = () => (T.dayGuess ? Math.max(today(), dayNo(T.idx, 31)) : today());
  const newsByKey = (k) => NEWS.concat(BEATS).find((n) => newsKey(n) === k) || null;
  const beatTold = () => !!(T.beat && T.beat.told);
  // v3.1 kept heard news by month ("2019-5"): everything from a month it already heard stays heard
  const migrateTold = () => {
    T.told = T.told || {};
    if (T.toldByDay) return;
    for (const k of Object.keys(T.told)) {
      const m = /^(\d{4})-(\d{1,2})$/.exec(k);
      if (m) for (const n of NEWS) if (n[0] === +m[1] && n[1] === +m[2]) T.told[newsKey(n)] = true;
    }
    T.toldByDay = true;
  };
  // The oldest piece of public news of the past year that the player character hasn't heard yet (n: today's day number)
  const dueNews = (n) => {
    migrateTold();
    const due = NEWS.filter((x) => { const d = newsDay(x); return d <= n && n - d <= 365 && !T.told[newsKey(x)] && newsLive(x); });
    return due.length ? due[0] : null;   // oldest first, so a catch-up after a skip reads in order
  };
  const newsBefore = (n, days) => NEWS.filter((x) => { const d = newsDay(x); return d <= n && n - d <= days && newsLive(x); });
  // News older than a year is the world's background, not a beat to play; after a skip of more than six weeks
  // (from: the day the turn started), so is news more than a month old: the skip's landing already covered it
  const settleOldNews = (n, from) => {
    migrateTold();
    const long = typeof from === "number" && n - from > 45;
    for (const x of NEWS) { const d = newsDay(x); if (n - d > 365 || (long && d < n - 30)) T.told[newsKey(x)] = true; }
  };
  // Canon dead, by the day they die (listed from the day after): [day, name, the name the script follows them by]
  const DEAD = [
    [DY(2019, 5, 20), "Robin Ward"], [DY(2019, 5, 27), "Translucent"], [DY(2019, 6, 6), "Popclaw"], [DY(2019, 6, 22), "Mesmer"], [DY(2019, 6, 23), "Madelyn Stillwell"],
    [DY(2020, 9, 30), "Susan Raynor"], [DY(2020, 10, 4), "Kenji Miyashiro"], [DY(2020, 10, 13), "Lamplighter"], [DY(2020, 10, 14), "Jonah Vogelbaum"], [DY(2020, 10, 14), "Shockwave"],
    [DY(2020, 10, 15), "Becca Butcher"], [DY(2020, 10, 19), "Alastair Adana"], [DY(2022, 6, 3), "Stormfront"], [DY(2022, 6, 3), "Gunpowder"], [DY(2022, 6, 5), "Supersonic"],
    [DY(2022, 6, 7), "Crimson Countess"], [DY(2022, 6, 8), "the TNT Twins"], [DY(2022, 6, 8), "Blue Hawk"], [DY(2022, 6, 8), "Termite"], [DY(2022, 6, 13), "Mindstorm"],
    [DY(2022, 6, 14), "the first Black Noir", "Black Noir"], [DY(2022, 6, 14), "Lamar Bishop"],
    [DY(2023, 8, 30), "Golden Boy", "Luke Riordan"], [DY(2023, 8, 30), "Richard Brinkerhoff"], [DY(2023, 9, 21), "Indira Shetty"], [DY(2024, 11, 10), "Ezekiel"], [DY(2024, 11, 11), "Cameron Coleman"],
    [DY(2024, 11, 11), "Hugh Campbell Sr."], [DY(2024, 11, 12), "Tek Knight"], [DY(2025, 1, 6), "Victoria Neuman"], [DY(2025, 1, 6), "Grace Mallory"], [DY(2025, 9, 14), "Andre Anderson"],
    [DY(2025, 10, 5), "Thomas Godolkin"], [DY(2026, 2, 12), "A-Train"], [DY(2026, 2, 16), "Cindy"], [DY(2026, 3, 12), "Mister Marathon"], [DY(2026, 3, 12), "Firecracker"],
    [DY(2026, 3, 15), "Black Noir II"], [DY(2026, 4, 1), "President Calhoun"], [DY(2026, 4, 3), "Frenchie"], [DY(2026, 4, 5), "Oh Father"], [DY(2026, 4, 5), "The Deep"],
    [DY(2026, 4, 5), "Homelander"], [DY(2026, 4, 6), "Billy Butcher"]
  ];
  const deadName = (d) => d[2] || d[1];   // the name the script follows them by
  // For the note: the dead the recent story mentions, anyone dead within the past year, and every death the
  // story caused (the reply check still catches anyone else shown alive). n: today's day number.
  const deadNear = (n, recent) => {
    if (!recent) return deadFor(n);
    const out = [], i = fromDayNo(n).i;
    for (const d of DEAD) {
      if (!(n > d[0]) || changeOf(deadName(d))) continue;
      const p = trackedByName(deadName(d));
      const re = p ? p[1] : new RegExp("\\b" + escapeRe(d[1]) + "\\b");
      if (n - d[0] <= 365 || re.test(recent)) out.push(d[1]);
    }
    for (const c of latestChanges()) {
      if (c.k !== "dead" || c.at > i) continue;
      if (c.canon) { if (i > c.at) { const d = DEAD.find((x) => deadName(x) === c.n); out.push(d ? d[1] : c.n); } }
      else out.push(c.n + " (died " + fmt(c.at) + " in this story)");
    }
    return out;
  };
  // Who is dead by day n: canon's dead the story left alone, plus the story's own deaths
  const deadFor = (n) => {
    const i = fromDayNo(n).i;
    const out = DEAD.filter((d) => n > d[0] && !changeOf(deadName(d))).map((d) => d[1]);
    for (const c of latestChanges()) {
      if (c.k !== "dead" || c.at > i) continue;
      if (c.canon) {   // the story played their canon death: listed like canon, from the month after
        if (i > c.at) { const d = DEAD.find((x) => deadName(x) === c.n); out.push(d ? d[1] : c.n); }
      } else out.push(c.n + " (died " + fmt(c.at) + " in this story)");
    }
    return out;
  };
  // Who died in canon during a time skip: days [from, to); anyone the story already changed is left out
  const deadBetween = (from, to) => DEAD.filter((d) => d[0] >= from && d[0] < to && !changeOf(deadName(d))).map((d) => d[1]);
  // Ages, given only for people named in the recent story: [name, pattern, birth year, birth month or 0, last month alive or 0]
  const PEOPLE = [
    ["Homelander", /\bHomelander\b/, 1981, 4, D(2026, 4)], ["Queen Maeve", /\bMaeve\b/, 1982, 0, 0], ["Black Noir", /\bNoir\b/, 1967, 0, D(2022, 6)],
    ["Black Noir II", /\bNoir\b/, 1988, 0, D(2026, 3), D(2022, 7)],
    ["Translucent", /\bTranslucent\b/, 1980, 0, D(2019, 5)], ["The Deep", /\bThe Deep\b|\bKevin Kohler\b/, 1985, 0, D(2026, 4)],
    ["Lamplighter", /\bLamplighter\b/, 1977, 0, D(2020, 10)], ["A-Train", /\bA-Train\b|\bReggie\b/, 1987, 0, D(2026, 2)],
    ["Annie January (Starlight)", /\bStarlight\b|\bAnnie\b/, 1996, 0, 0], ["Hughie Campbell", /\bHughie\b/, 1992, 4, 0],
    ["Billy Butcher", /\bButcher\b/, 1976, 12, D(2026, 4)], ["Becca Butcher", /\bBecca\b/, 1981, 6, D(2020, 10)], ["Ryan", /\bRyan\b/, 2012, 9, 0],
    ["Mother's Milk", /\bMother['’]s Milk\b|\bMarvin\b|\bM\.M\./, 1981, 9, 0], ["Frenchie", /\bFrenchie\b|\bSerge\b/, 1985, 2, D(2026, 4)],
    ["Kimiko", /\bKimiko\b/, 1989, 8, 0], ["Grace Mallory", /\bMallory\b/, 1956, 0, D(2025, 1)], ["Madelyn Stillwell", /\bStillwell\b|\bMadelyn\b/, 1966, 0, D(2019, 6)],
    ["Stan Edgar", /\bEdgar\b/, 1959, 0, 0], ["Jonah Vogelbaum", /\bVogelbaum\b/, 1942, 0, D(2020, 10)], ["Ashley Barrett", /\bAshley Barrett\b|\bAshley\b/, 1988, 0, 0],
    ["Victoria Neuman", /\bNeuman\b|\bNadia Khayat\b/, 1986, 0, D(2025, 1)], ["Sister Sage", /\bSage\b(?! Grove)/, 1992, 4, 0], ["Firecracker", /\bFirecracker\b/, 1995, 0, D(2026, 3)],
    ["Popclaw", /\bPopclaw\b/, 1990, 0, D(2019, 6)], ["Tek Knight", /\bTek Knight\b/, 1983, 0, D(2024, 11)], ["Supersonic", /\bSupersonic\b|\bDrummer Boy\b/, 1995, 0, D(2022, 6)],
    ["Marie Moreau", /\bMarie Moreau\b/, 2005, 0, 0], ["Luke Riordan", /\bLuke Riordan\b|\bGolden Boy\b/, 2002, 0, D(2023, 8)], ["Sam Riordan", /\bSam Riordan\b/, 2004, 0, 0],
    ["Cate Dunlap", /\bCate\b/, 2003, 0, 0], ["Emma Meyer", /\bEmma Meyer\b/, 2005, 0, 0], ["Jordan Li", /\bJordan Li\b/, 2003, 0, 0], ["Andre Anderson", /\bAndre Anderson\b/, 2003, 0, D(2025, 9)],
    ["Polarity", /\bPolarity\b/, 1972, 0, 0], ["Indira Shetty", /\bShetty\b/, 1977, 0, D(2023, 9)], ["Richard Brinkerhoff", /\bBrink(?:erhoff)?\b/, 1960, 0, D(2023, 8)]
  ];
  // Everyone the script follows for story changes: the people above plus canon names that only die.
  // [name, pattern (case-sensitive), canon death month or 0, first month in the world or 0]
  const TRACKED = PEOPLE.map((p) => [p[0], p[1], p[4] || 0, p[5] || 0]).concat([
    ["Robin Ward", /\bRobin\b/, D(2019, 5), 0, /\bRobin Ward\b/], ["Mesmer", /\bMesmer\b/, D(2019, 6)], ["Stormfront", /\bStormfront\b|\bKlara\b|\bClara Vought\b/, D(2022, 6)],
    ["Susan Raynor", /\bRaynor\b/, D(2020, 9)], ["Kenji Miyashiro", /\bKenji\b/, D(2020, 10)], ["Shockwave", /\bShockwave\b/, D(2020, 10)],
    ["Alastair Adana", /\bAdana\b|\bAlastair\b/, D(2020, 10)], ["Gunpowder", /\bGunpowder\b/, D(2022, 6)], ["Crimson Countess", /\bCountess\b/, D(2022, 6)],
    ["the TNT Twins", /\bTNT Twins?\b/, D(2022, 6)], ["Blue Hawk", /\bBlue Hawk\b/, D(2022, 6)], ["Mindstorm", /\bMindstorm\b/, D(2022, 6)],
    ["Ezekiel", /\bEzekiel\b/, D(2024, 11)], ["Cameron Coleman", /\bCameron Coleman\b|\bColeman\b/, D(2024, 11)],
    ["Hugh Campbell Sr.", /\bHugh Campbell Sr\b|\bHugh Sr\b/, D(2024, 11)], ["Thomas Godolkin", /\bThomas Godolkin\b|\bDean Cipher\b/, D(2025, 10)],
    ["Cindy", /\bCindy\b/, D(2026, 2)], ["Mister Marathon", /\bMister Marathon\b|\bMarathon\b/, D(2026, 3)], ["President Calhoun", /\bCalhoun\b/, D(2026, 4)],
    ["Oh Father", /\bOh Father\b/, D(2026, 4)], ["Robert Singer", /\bRobert Singer\b|\bSinger\b/, 0],
    ["Soldier Boy", /\bSoldier Boy\b/, 0, D(2022, 6)]   // before June 2022 the world thinks he died in 1984
  ].map((p) => [p[0], p[1], p[2], p[3] || 0, p[4] || null]));
  const trackedByName = (name) => TRACKED.find((p) => p[0] === name) || null;
  // Birth months, so nobody dies before they're born (a "Ryan" in 2006 isn't Homelander's son)
  const BORN = {};
  for (const p of PEOPLE) BORN[p[0]] = D(p[2], p[3] || 1);

  // ---------- what the story changed ----------
  // T.changes holds { n: who, k: "dead" | "alive" | "member" | "left", at: month, turn: action count, canon: true when a
  // death the story showed is the canon one }. The latest entry for a name is the one that counts.
  const changeOf = (name) => { let c = null; for (const x of T.changes) if (x.n === name) c = x; return c; };
  const latestChanges = () => {
    const seen = {}, out = [];
    for (let k = T.changes.length - 1; k >= 0; k--) { const c = T.changes[k]; if (!seen[c.n]) { seen[c.n] = true; out.unshift(c); } }
    return out;
  };
  const addChange = (n, k, at, extra) => {
    T.changes.push(Object.assign({ n, k, at, d: today(), turn: count === null ? -1 : count }, extra || {}));
    if (T.changes.length > C.maxChanges) T.changes = T.changes.slice(-C.maxChanges);
  };
  // When someone died, as the story stands: { at, story } (story: the story killed them, not canon), or null if alive
  const deathOf = (name, canonLast) => {
    const c = changeOf(name);
    if (c && c.k === "dead") return { at: c.at, story: !c.canon, turn: c.turn };
    if (c && c.k === "alive") return null;
    return canonLast ? { at: canonLast, story: false } : null;
  };
  const deadAt = (d, i) => !!d && (d.story ? i >= d.at : i > d.at);
  // ---------- canon mode (v3.3) ----------
  // "strict": canon happens on its day whatever the story did; a line naming someone the story changed is kept, tagged.
  // "branch": the story's changes branch the world. A canon event, agenda line, news clause or card line that depends on
  // someone the story killed early (or saved from a canon death) is dropped, its day is no longer a skip stop and its
  // news is never delivered; the note's "Changed in this story" lines say what happened instead. State lines (the Seven,
  // Vought, the world) are kept and tagged in both modes. Everything the player never touched happens on schedule.
  const canonMode = () => (T.canon === "strict" || T.canon === "branch" ? T.canon : (C.canonMode === "strict" ? "strict" : "branch"));
  const branching = () => canonMode() === "branch";
  // The day someone dies in canon (from DEAD), or null
  const canonDeathDay = (name) => { const d = DEAD.find((x) => deadName(x) === name); return d ? d[0] : null; };
  // The story's changes that `text` depends on: the changed people it names, when the change is in force on day n
  // (or in month `at` when n is null): a story death at or before then, or a survival of a canon death at or before then
  const offScript = (text, at, n) => {
    const out = [];
    if (!text || !T.changes.length) return out;
    for (const c of latestChanges()) {
      if (c.canon || (c.k !== "dead" && c.k !== "alive")) continue;
      const p = trackedByName(c.n);
      if (!p || !p[1].test(text)) continue;
      if (c.k === "dead") { if (typeof n === "number" && typeof c.d === "number" ? c.d <= n : c.at <= at) out.push(c); }
      else if (p[2]) { const dd = canonDeathDay(c.n); if (typeof n === "number" && dd !== null ? n >= dd : at >= p[2]) out.push(c); }
    }
    return out;
  };
  // A canon row's own dependencies (its optional 6th element): "Name" must be alive in the story on day n, "!Name" must
  // be dead (canon's death stood). Broken when the story killed the first early or saved the second.
  const needsBroken = (needs, n) => {
    if (!needs) return false;
    for (const tok of needs.split(",")) {
      const t = tok.trim();
      if (!t) continue;
      const dead = t.charAt(0) === "!", name = dead ? t.slice(1).trim() : t;
      const c = changeOf(name);
      if (!c || c.canon || (c.k !== "dead" && c.k !== "alive")) continue;
      if (!dead && c.k === "dead" && (typeof c.d === "number" ? c.d <= n : c.at <= fromDayNo(n).i)) return true;
      if (dead && c.k === "alive") return true;
    }
    return false;
  };
  // Branch mode: a line made of clauses ("; " apart) loses the clauses that name someone the story changed; "" when
  // nothing is left. A month label in front ("June 2019 ") stays. Strict mode: the line as it is.
  const cleanse = (text, at, n) => {
    if (!branching() || !text || !offScript(text, at, n).length) return text;
    const m = new RegExp("^((?:" + MONTHS.join("|") + ") \\d{4} )").exec(text);
    const body = m ? text.slice(m[1].length) : text;
    const parts = body.split(/;\s+/).filter((p) => !offScript(p, at, n).length);
    return parts.length ? (m ? m[1] : "") + parts.join("; ") : "";
  };
  // A retried or undone turn starts over: forget what an earlier attempt at it (or an undone later turn) recorded
  const rollbackTurn = () => {
    if (count === null) return;
    T.changes = T.changes.filter((c) => typeof c.turn !== "number" || c.turn < count);
    if (T.beat && typeof T.beat.turn === "number" && T.beat.turn >= count) T.beat = T.beat.prev || null;
    if (T.allow) for (const k of Object.keys(T.allow)) if (T.allow[k] >= count) delete T.allow[k];
  };
  // A canon line describing month `at` that names someone the story changed gets a note saying so
  const tagChanged = (text, at, tail) => {
    if (!text || !T.changes.length) return text;
    const notes = [];
    for (const c of latestChanges()) {
      if (c.canon || (c.k !== "dead" && c.k !== "alive")) continue;
      const p = trackedByName(c.n);
      if (!p || !p[1].test(text)) continue;
      if (c.k === "dead" && c.at <= at) notes.push(c.n + " is dead (since " + fmt(c.at) + ")");
      else if (c.k === "alive" && p[2] && at >= p[2]) notes.push(c.n + " is alive");
    }
    return notes.length ? text.replace(/[.\s]*$/, "") + " (In this story " + notes.join(", ") + (tail || "") + ")" : text;
  };
  const OFF_SCRIPT = ", so this plays out differently or not at all";
  // The player character in the Seven, for the lineup line
  const memberNote = (i) => {
    const c = changeOf("the Seven");
    return c && c.k === "member" && c.at <= i ? " In this story " + charName() + " is also a member, since " + fmt(c.at) + "." : "";
  };
  // The changes, as lines for the note
  const changeLines = (i) => latestChanges().map((c) => {
    if (c.k === "dead") return c.canon || c.at > i ? "" : c.n + " died in " + fmt(c.at);
    if (c.k === "alive") { const p = trackedByName(c.n); return c.n + " is alive" + (p && p[2] && i >= p[2] ? " (survived " + fmt(p[2]) + ")" : ""); }
    if (c.at > i) return "";
    if (c.k === "member") return charName() + " is a member of " + c.n + " (since " + fmt(c.at) + ")";
    if (c.k === "left") return charName() + " left " + c.n + " in " + fmt(c.at);
    return "";
  }).filter(Boolean);

  const agesFor = (i, recent) => {
    if (!recent) return "";
    const out = [];
    for (const [name, re, by, bm, last, first] of PEOPLE) {
      if (deadAt(deathOf(name, last), i) || (first && i < first)) continue;
      if (!re.test(recent)) continue;
      const age = yearOf(i) - by - (bm && monthOf(i) < bm ? 1 : 0);
      if (age >= 0) out.push(name + " " + age);
      if (out.length >= 10) break;
    }
    return out.join(", ");
  };
  // Hard canon rules the AI broke in testing: invented deaths, exits, jobs and handlers
  // The general locks always; a lock about a person or place only when the recent story mentions them (saves room)
  const locksFor = (i, recent) => {
    const parts = [];
    const near = (re) => !recent || re.test(recent);
    if (i <= D(2026, 4)) parts.push("nothing canon happens before its day; anything like it earlier is a different incident with different people");
    if (i < D(2026, 4)) parts.push("the Seven's lineup is exactly as listed, and an empty seat stays empty");
    if (i < D(2022, 6)) parts.push("Vought's executives give the orders; Homelander has no office, staff or power to hire, assign or move anyone");
    else if (i <= D(2026, 4)) parts.push("Homelander takes orders from no one, and Vought's executives obey him out of fear");
    if (i <= D(2026, 4) && near(/\bHomelander\b/)) parts.push("Homelander treats any Supe who could rival him as a threat, never a protege");
    if (i < D(2020, 10)) parts.push("Compound V is Vought's top secret; even most Supes think powers are inborn");
    if (i < D(2010, 6) && near(/\b[Tt]he Deep\b|\bKevin\b/)) parts.push("The Deep is a college student, not one of the Seven");
    if (i < D(2019, 5)) { if (near(/\bTranslucent\b|\bLamplighter\b/)) parts.push("Translucent and Lamplighter are alive and in the Seven"); }
    else if (i > D(2019, 5) && i < D(2020, 10) && near(/\bLamplighter\b|\bSage Grove\b/)) parts.push("Lamplighter is alive, an orderly at Sage Grove Center, not hiding and not hunted");
    if (i < D(2020, 10) && near(/\bCindy\b|\bSage Grove\b/)) parts.push("Cindy, a Sage Grove patient who crushes things by clenching her fist, stays sedated in its locked ward until the October 2020 riot: she doesn't escape, get moved, or appear outside her cell before then");
    if (i < D(2025, 1) && near(/\bMallory\b/)) parts.push("Grace Mallory never works for or consults for Vought");
    // Gen V's cast: children until their canon years at Godolkin (the AI put Marie on campus in 2016)
    const genV = /\bGodolkin\b|\bGod U\b|\bRed River\b|\bMarie\b|\bMoreau\b|\bLuke\b|\bGolden Boy\b|\bCate\b|\bJordan\b|\bAndre\b|\bEmma\b/;
    if (i >= D(2015, 6) && i < D(2023, 8) && near(genV)) parts.push("Marie Moreau is a child living at Red River Institute until she starts at Godolkin in August 2023; she is never at Godolkin before then");
    if (i < D(2020, 8)) { if (near(genV)) parts.push("Gen V's students (Luke Riordan, Cate Dunlap, Jordan Li, Andre Anderson, Emma Meyer) are children, not at Godolkin yet"); }
    else if (i < D(2023, 8) && near(genV)) parts.push("Emma Meyer starts at Godolkin in August 2023, not before");
    return parts.length ? tagChanged("Canon locks (absolute unless the player character changes them): " + parts.join("; ") + ".", i, "") : "";
  };
  // ---------- canon in the note (v3.2) ----------
  const canonDays = CANON.map((b) => DS(b[0]));
  const agendaDays = AGENDA.map((a) => [DS(a[0]), DS(a[1])]);
  // "June 3" (the year only when it differs from day `ref`'s)
  const dayLabel = (n, ref) => {
    const x = fromDayNo(n);
    return MONTHS[monthOf(x.i) - 1] + " " + x.d + (typeof ref === "number" && yearOf(fromDayNo(ref).i) === yearOf(x.i) ? "" : ", " + yearOf(x.i));
  };
  // A beat in full or as its short line, tagged when the story changed someone in it
  const beatLine = (k, full) => {
    const i = fromDayNo(canonDays[k]).i;
    if (branching() && (offScript(CANON[k][3], i, canonDays[k]).length || needsBroken(CANON[k][5], canonDays[k]))) return "";
    return tagChanged(full ? CANON[k][3] : CANON[k][4], i, OFF_SCRIPT);
  };
  const beatsIn = (a, b) => { const out = []; for (let k = 0; k < CANON.length; k++) if (canonDays[k] >= a && canonDays[k] <= b) out.push(k); return out; };
  // Canon on day n and in the week before it: today's in full; the past week in full, newest first, while it fits in
  // about `room` characters, the rest as short lines; then short lines for the rest of the past month, and one line
  // per canon month before that (up to a year back)
  const canonNow = (n, compact) => {
    const out = [];
    const todays = beatsIn(n, n);
    if (todays.length) {
      // in full while they fit in about 700 characters (a dense day lists the rest by their short lines)
      let room = compact ? 400 : 600;
      const lines = todays.map((k) => { const full = beatLine(k, true); if (!full) return ""; if (full.length <= room) { room -= full.length; return full; } return CANON[k][4] ? beatLine(k, false).replace(/[.\s]*$/, ".") : ""; }).filter(Boolean);
      if (lines.length) out.push("Canon today: " + lines.join(" "));
    }
    const week = beatsIn(n - 6, n - 1);
    if (week.length) {
      let room = compact ? 0 : 350;
      const lines = [];
      for (let j = week.length - 1; j >= 0; j--) {
        const k = week[j], full = beatLine(k, true);
        if (!full) continue;
        if (full.length <= room) { room -= full.length; lines.unshift(dayLabel(canonDays[k], n) + ": " + full); }
        else if (CANON[k][4]) lines.unshift(dayLabel(canonDays[k], n) + ": " + beatLine(k, false));
      }
      if (lines.length) out.push("Canon this past week: " + lines.map((x) => x.replace(/[.\s]*$/, ".")).join(" "));
    }
    // a busy day leaves out the older lines
    if (!compact && (out.length && todays.length ? out[0].length : 0) <= 400) {
      const month = beatsIn(n - 30, n - 7).filter((k) => CANON[k][4] && beatLine(k, false)).slice(-3).map((k) => dayLabel(canonDays[k], n) + ": " + beatLine(k, false));
      const i = fromDayNo(n).i;
      const older = SUMMARY.filter((r) => { const x = D(r[0], r[1]); return i - x >= 2 && i - x <= 12 && cleanse(r[2], x, null); }).slice(-2).map((r) => tagChanged(cleanse(r[2], D(r[0], r[1]), null), D(r[0], r[1]), OFF_SCRIPT));
      const earlier = older.concat(month);
      if (earlier.length) out.push("Earlier: " + earlier.join("; "));
    }
    return out.map((x) => x.replace(/[.\s]*$/, ".")).join(" ");
  };
  // What happened in canon during a time skip, or lies ahead of an open one: days (from, to], dated short lines; whole
  // months in between as one line each; the latest 12
  const canonSpan = (from, to) => {
    const out = [];
    const fi = fromDayNo(from).i, ti = fromDayNo(to).i;
    for (let k = 0; k < CANON.length; k++) {
      const d = canonDays[k];
      if (d <= from || d > to || !CANON[k][4]) continue;
      const i = fromDayNo(d).i;
      if (i > fi && i < ti && SUMMARY.some((r) => D(r[0], r[1]) === i)) continue;   // a whole month in the middle: its summary line
      const line = beatLine(k, false);
      if (line) out.push([d, dayLabel(d) + ": " + line]);
    }
    for (const r of SUMMARY) { const i = D(r[0], r[1]); const line = i > fi && i < ti ? cleanse(r[2], i, null) : ""; if (line) out.push([DY(r[0], r[1], 1), tagChanged(line, i, OFF_SCRIPT)]); }
    return out.sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(-12);
  };
  // ---------- canon groups: what they are doing right now ----------
  const GROUP_NAMES = { Seven: "The Seven", Boys: "The Boys", Vought: "Vought", Gov: "The government", GodU: "Godolkin", Starlighters: "The Starlighters", Payback: "Soldier Boy and Payback", Church: "The Church" };
  // A group is in the scene when the recent story names it or its people
  const GROUP_RES = [
    ["Boys", /\bthe Boys\b|\bButcher\b|\bHughie\b|\bFrenchie\b|\bMother['’]s Milk\b|\bM\.M\.|\bKimiko\b/],
    ["Seven", /\bthe Seven\b|\bHomelander\b|\bMaeve\b|\bNoir\b|\bA-Train\b|\bThe Deep\b|\bTranslucent\b|\bLamplighter\b|\bStarlight\b|\bStormfront\b|\bSupersonic\b|\bFirecracker\b|\bSister Sage\b/],
    ["Vought", /\bStillwell\b|\bEdgar\b|\bAshley\b|\bVogelbaum\b|\bSage Grove\b|\bRed River\b|\bElmira\b|\bVought (?:executives?|board|lawyers?|PR|offices?)\b/],
    ["Gov", /\bCIA\b|\bRaynor\b|\bMallory\b|\bSinger\b|\bNeuman\b|\bFBSA\b|\bCongress(?:woman|man)?\b|\bPentagon\b|\bWhite House\b|\bCalhoun\b|\bSecret Service\b/],
    ["GodU", /\bGodolkin\b|\bGod U\b|\bMarie\b|\bMoreau\b|\bAndre\b|\bEmma Meyer\b|\bJordan Li\b|\bCate\b|\bSam Riordan\b|\bGolden Boy\b|\bBrinkerhoff\b|\bShetty\b|\bCipher\b|\bPolarity\b|\bThe Woods\b/],
    ["Starlighters", /\bStarlighters?\b|\bFreedom Camps?\b|\bHometeamers?\b|\bthe resistance\b/],
    ["Payback", /\bSoldier Boy\b|\bPayback\b|\bCrimson Countess\b|\bMindstorm\b|\bGunpowder\b|\bTNT Twins?\b|\bThe Legend\b/],
    ["Church", /\bChurch of the Collective\b|\bthe Collective\b|\bAdana\b|\bEagle the Archer\b|\bOh Father\b/]
  ];
  const agendaOn = (g, n) => { for (let k = 0; k < AGENDA.length; k++) if (AGENDA[k][2] === g && agendaDays[k][0] <= n && n <= agendaDays[k][1]) return AGENDA[k][3]; return null; };
  // The groups near the scene on day n: the player character's own (once they're in the Boys or the Seven), then the one the
  // end of the story names last; only groups with something going on that day
  const groupsNear = (recent, n) => {
    const tail = (recent || "").slice(-1200);
    const seen = [];
    for (const [g, re] of GROUP_RES) {
      const all = tail.match(new RegExp(re.source, "g"));
      if (all) seen.push([g, tail.lastIndexOf(all[all.length - 1])]);
    }
    seen.sort((a, b) => b[1] - a[1]);
    const i = fromDayNo(n).i, own = [];
    for (const [name, g] of [["the Boys", "Boys"], ["the Seven", "Seven"]]) { const c = changeOf(name); if (c && c.k === "member" && c.at <= i) own.push(g); }
    // one group, or two when one of them is the player character's own
    return own.concat(seen.map((x) => x[0]).filter((g) => !own.includes(g))).filter((g) => agendaOn(g, n)).slice(0, own.length ? 2 : 1);
  };
  const groupLines = (recent, n) => groupsNear(recent, n).map((g) => {
    const a = agendaOn(g, n);
    if (branching() && offScript(a, fromDayNo(n).i, n).length) return "";   // the group's plans hinge on someone the story changed
    return GROUP_NAMES[g] + ": " + tagChanged(a, fromDayNo(n).i, OFF_SCRIPT).replace(/[.\s]*$/, ".");
  }).filter(Boolean);

  // ---------- status note ----------
  const STATUS_TAG = "[Status (for the narrator, not story text):";
  // On the turn the player skips time, tell the AI how to land the skip
  const skipHint = () => {
    const t = T.turn;
    if (!t || t.cmd) return "";
    const keep = " Whatever the player set up carries through the skip unchanged unless the player said otherwise " +
      "(plans, deals, home, job, habits): don't resolve a plan early or decide a big change in the player character's life.";
    // a birthday skip for a character whose age the script knows
    const bday = t.mode === "vague" && !!t.birthday && typeof t.floor === "number" && curBirth() !== null;
    // How a canon event meets the player character: in person when their place in the world puts them there, as news otherwise
    const pull = " It reaches them the way it reaches everyone (a screen, a feed, a paper, people talking), and when their position puts them near it (a Vought asset or employee, a Godolkin student, a member of the Seven, press, police, a bystander where it happens) it also offers a way in they can take or leave: a message, an invitation, something happening down the street. The player character joins a canon event only by the player's choice; it is never the only way forward, and left alone it goes on without them while the story continues.";
    if (t.pastBirthday) return " AGE: " + charName() + " already turned " + t.pastBirthday.age + " in " + fmt(t.pastBirthday.at) + "; that birthday is past. Don't go back to it or write an earlier date line: mention it in passing at most, and stay in " + fmt(t.start) + ".";
    fillTurn(t);
    const fromNo = dayNo(t.base, t.baseDay), toNo = dayNo(t.start, t.startDay);
    // A canon stop by its full date ("canon lands on May 20, 2019"), and what to open on there
    const stopWhere = (n, upper) => (isBeat(n) ? "Jack's 18th birthday is on " : (upper ? "Canon" : "canon") + " lands on ") + fmtNo(stopDayOf(n));
    const stopBody = (n) => (isBeat(n) ? n[2] : tagChanged(newsText(n), newsIdx(n), OFF_SCRIPT) + pull);
    // What lies ahead of an open-ended skip that can reach month `reach`
    // (reachNo: the furthest day it can reach)
    const aheadText = (reachNo) => {
      const ahead = canonSpan(fromNo, reachNo);
      const died = deadBetween(fromNo, reachNo + 1);
      return (ahead.length ? " Canon between " + textNo(fromNo) + " and " + textNo(reachNo) + ", in order; whatever date you land on, everything dated before it has happened (its public parts reached the player character as news, feeds, or talk; anything secret stayed secret), and nothing dated after it has: " + ahead.join("; ") + "." : "") +
        (died.length ? " Anyone who dies before the date you land on stays dead: " + died.join(", ") + "." : "");
    };
    if (t.mode === "exact" && toNo > fromNo) {
      const missed = toNo - fromNo > 7 ? canonSpan(fromNo, toNo).slice(t.stop ? -6 : -12) : [];
      const died = deadBetween(fromNo, toNo);
      const st = t.stop ? newsByKey(t.stop) : null;
      const n = toNo - fromNo;
      // "from June 4, 2019 to June 11, 2019" (while the day is a guess: "from mid-June 2019 to late June 2019")
      const fromText = t.baseGuess ? dayPart(t.baseDay) + fmt(t.base) : fmtNo(fromNo), toText = textNo(toNo);
      const span = fromText === toText ? n + (n === 1 ? " day passes" : " days pass") + " (it is still " + toText + ")" : "from " + fromText + " to " + toText;
      return " TIME SKIP this turn: " + span + ageLine(t.start) + "." +
        (st ? (typeof T.pendingDay === "number" && T.pendingDay > toNo ? " The player skipped further (to " + textNo(T.pendingDay) + "), but " + stopWhere(st, false) : " " + stopWhere(st, true)) + ", so the story stops here and opens on it: " + stopBody(st) + " Nothing dated after " + fmtNo(stopDayOf(st)) + " has happened, and nobody knows it is coming." : "") +
        // a skip into a new month opens with its date line; one inside the month just opens later (no date line)
        (t.start !== t.base
          ? " Start with the date line \"" + fmt(t.start) + ".\", cover the gap in a few sentences only if the player described how it went, then land in one specific scene at the new date"
          : " Open the scene " + (n === 1 ? "the next day" : n + " days later") + (T.dayGuess ? "" : ", on " + weekday(toNo)) + ", cover the gap in a few sentences only if the player described how it went, then land in one specific scene") +
        (st ? " built around that event" : " that shows what changed") + "." + keep +
        (missed.length ? " Canon events during the skipped time (their public parts reached the player character as news, feeds, or talk; anything secret stayed secret); mention the biggest in passing in the landing, and never play them out: " + missed.join("; ") + "." : "") +
        (died.length ? " Dead since " + fmt(t.base) + " (they never appear alive again): " + died.join(", ") + "." : "");
    }
    if (t.mode === "vague" && !bday) {   // including a birthday skip for a character whose age the script doesn't know
      const sa = t.stopAhead ? newsByKey(t.stopAhead) : null;
      const cap = sa ? t.cap : (t.cap || C.maxVagueJumpMonths);   // months; 0 when the canon stop comes later this month
      return " TIME SKIP this turn: the player asked for time to pass without saying how long. Choose an amount that fits their words, at most " +
        (cap > 0 ? spanText(cap) : daysText(t.capDays || 1)) + (sa ? " (" + stopWhere(sa, false) + ", so the story can't go past it; if you reach that day, open on this: " + stopBody(sa) + ")" : "") +
        ". If the month changes, start with the new date line (like \"" + fmt(t.base + 1) + ".\"); if it doesn't, no date line." + keep + aheadText(sa ? stopDayOf(sa) : cap > 0 ? dayNo(t.base + cap, 31) : fromNo + (t.capDays || 1));
    }
    // Some days or weeks with no number ("days pass", "weeks go by"): the AI picks, and the reply's own words move the day.
    // No date line: one would move the month without the day; the script adds the line where the words cross into a new month.
    if (t.mode === "days") {
      const sa = t.stopAhead ? newsByKey(t.stopAhead) : null;
      return " TIME SKIP this turn: the player asked for some " + (t.dayDefault >= 14 ? "weeks" : "days") + " to pass without saying how many. Choose an amount that fits their words, at most " +
        daysText(t.dayCap || 7) + (sa ? " (" + stopWhere(sa, false) + ", so the story can't go past it; if you reach that day, open on this: " + stopBody(sa) + ")" : "") +
        ", and open the reply by saying how long it was (like \"" + (t.dayDefault >= 14 ? "Two weeks later," : "Three days later,") + "\"), with no date line." + keep +
        aheadText(fromNo + (t.dayCap || 7));
    }
    if (bday) {
      const next = t.floor;
      return " TIME SKIP this turn: the player's action lands on " + charName() + "'s birthday. The next one is " + fmt(next) + ", when " + charName() + " turns " + charAge(next) +
        ": land there, unless the story has clearly been building toward a specific later birthday (like turning 18); then land on that one instead. " +
        "Start with the date line of the birthday you land on (like \"" + fmt(next) + ".\"), state the new age in the text, cover the gap in a few sentences only if the player described how it went, then play the birthday scene." + keep;
    }
    return "";
  };
  // level 0: everything; 1 (small context): no world line, short events, no ages; 2 (tiny context): date, Jack and the lineup
  const statusFor = (i, hint, recent, level) => {
    const compact = level >= 1, minimal = level >= 2;
    const tiny = minimal || (!!T.max && T.max < C.tinyJackBelowChars);   // Jack's part in a few words
    const a = ageAt(i);
    let s = STATUS_TAG + " It is " + nowText(i) + ".";
    if (isJack()) {
      const prof = !T.jackInPE;
      if (prof) s += " " + jackWho(i, a, tiny);
      s += " Jack is " + a + ": " + sizeFor(a) + ", " + voiceFor(a) +
        ". His powers right now, never more: " + (tiny ? powersTiny(a) + ". Also perfect memory, fast learning, immune to mind powers. No heat vision." :
          powersFor(a, compact) + ". Always: picture-perfect memory; he copies a fighting style or physical skill after seeing it once; mind powers don't work on him. He has no other powers: no heat vision or eye beams. He flies, uses X-ray vision or uses blood control only when the player says so.") +
        (a >= 27 ? " He stopped aging at 27 and still looks 27." : "") + (!tiny && mindFor(a) ? " " + mindFor(a) : "") +
        (prof && !tiny && !compact ? " " + JACK_BLOOD : "") + (prof && a >= 18 ? " " + (tiny || compact ? JACK_GROWN_SHORT : JACK_GROWN) : "") +
        (prof && a >= 16 && !tiny ? " " + (compact ? JACK_FIGHT_SHORT : JACK_FIGHT) : "");
      // His body's own adaptation to V: the anti-Supe weapons of the 2020s don't work on him (each named only once it exists in canon)
      if (i >= D(2022, 6)) s += " Jack can't have his powers burned out or stripped by Soldier Boy's blast or anything like it (it still hits him like a huge explosion)" +
        (i >= D(2023, 9) ? ", and the virus that kills Supes can't infect him." : ".");
      if (a >= 18) s += " " + (tiny ? ADULT_LOOK_SHORT : ADULT_LOOK) + (T.private ? " " + ADULT_PRIVATE : "");
      if (a < 18) s += " Jack is a minor: keep every scene involving him free of sexual or romantic content.";
    } else if (charAge(i) !== null) {
      s += " " + charName() + " is " + charAge(i) + "." + (charAge(i) < 18 ? " A minor: keep every scene involving them free of sexual or romantic content." : "");
    }
    // A custom character's powers as the player gave them: the AI otherwise drifts and adds more
    if (!isJack() && T.customPowers) {
      const pw = T.customPowers, bare = pw.replace(/^["'“”‘’\s]+|["'“”‘’!.,;:\s]+$/g, "");
      s += /^(?:none(?:\s*[(,;:\-–—].*)?|nope|nothing(?: special)?|n\/?a|no|no (?:super ?)?powers?|no superpowers|-+|(?:a |just a |just )?normal(?: human| person| guy| girl)?|(?:just )?(?:a )?human)$/i.test(bare)
        ? " " + charName() + " has no powers." : " " + charName() + "'s powers, never more: " + (/\.\.\.$/.test(pw) ? pw : pw.replace(/[.\s]+$/, "") + ".");
    }
    const n = dayNo(i, T.day);   // today, as a day number
    const roster = tagChanged(rosterFor(n), i, "");
    s += " The Seven now: " + roster + "." + memberNote(i);
    if (!minimal) s += " Vought: " + tagChanged(at(BOSSES, n), i, "") + ".";
    if (!compact) s += " World: " + tagChanged(at(WORLD, n), i, "");
    // One piece of public canon news at a time, on ordinary turns, until the reply delivers it
    const news = !minimal && T.turn && !T.turn.cmd && T.turn.mode === "none" && T.began ? dueNews(n) : null;
    T.newsDue = news ? newsKey(news) : null;
    // Canon by the day: today, the past week, earlier; then what the canon groups near the scene are doing right now
    const now = minimal ? "" : canonNow(n, compact);
    if (now) s += " " + now;
    const groups = minimal ? [] : groupLines(recent, n);
    if (groups.length) s += " Right now (insiders only; play it unless the story changed it): " + groups.join(" ");
    const dead = minimal ? [] : deadNear(n, recent);
    if (dead.length) s += " Dead by now (they never appear alive): " + dead.join(", ") + ".";
    const ages = compact ? "" : agesFor(i, recent);
    if (ages) s += " Ages now: " + ages + ".";
    const locks = minimal ? "" : locksFor(i, recent);
    if (locks) s += " " + locks;
    // What the script saw the story change, then the player's own /facts (while Jack is a minor, a fact with adult wording is held back)
    const facts = changeLines(i).concat(isJack() && a < 18 ? T.facts.filter((f) => !UNSAFE.test(f)) : T.facts);
    if (facts.length) {
      s += " Changed in this story (true now; where the canon lists above disagree, these win): " +
        facts.map((f) => f.replace(/[.;\s]+$/, "")).join("; ") + ".";
    }
    // Mistakes the script caught in recent replies
    const fixes = minimal ? [] : fixesNow();
    if (fixes.length) s += " CORRECTIONS (mistakes in recent replies; the story treats them as never written): " + fixes.join(" ");
    if (news) {
      s += " NEWS (work it into this reply, or the first calm beat, the way a screen, feed, paper or talk would bring it, in a few sentences, public side only; the player character reacts only as the player directs): " + tagChanged(newsText(news), newsIdx(news), OFF_SCRIPT);
    }
    if (isJack() && a >= 18 && !tiny) s += " Jack's lines: dark, deadpan jokes.";
    return s + (hint || "") + "]";
  };
  // The first reply of the story
  const openingHint = () => " OPENING: this is the story's first reply. Open on " + nowText() + ", in the player character's starting scene (PLAYER CHARACTER above), with what they see and hear around them, and stop when it is the player's move." +
    (isJack() && !T.jackInPE ? (T.idx <= D(2004, 10) ? " Jack's starting scene: he is 5, in a black Vought sedan driven by a man in a gray suit, leaving the upstate facility where he grew up for Red River Institute, a Vought group home in New York for Supe kids nobody else will take." : " Jack's starting scene: a moment in his life on this date, at his age.") : "");
  // A status note is a single line. This matches a whole note, or a copy cut off before its closing bracket,
  // and never runs past the end of the line, so a stray "[Status (" in the story can't swallow the text after it.
  const statusPattern = /[ \t]*\[Status \(for the narrator[^\]\n]*(?:\]|(?=\n)|$)[ \t]*/g;
  // Notes the AI copied into its reply: the Status note, the Author's note, a [Tracker] line
  const stripNotes = (s) => {
    const cleaned = s
      .replace(/[ \t]*[\[(]?Status \(for the narrator[^\]\n]*(?:\]|(?=\n)|$)[ \t]*/gi, "")
      .replace(/[ \t]*\[Author['’]?s note:[^\]\n]*(?:\]|(?=\n)|$)[ \t]*/gi, "")
      .replace(/[ \t]*\[Tracker\][^\n]*$/gm, "");
    return cleaned === s ? s : cleaned.replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "");
  };
  // AI Dungeon cuts Front Memory to roughly 125 tokens, keeping the end, so Front Memory
  // only carries a short note (date, age, size). The Context hook adds the full note.
  const shortStatusFor = (i) => {
    const a = ageAt(i);
    if (!isJack()) return STATUS_TAG + " It is " + nowText(i) + "." + (charAge(i) !== null ? " " + charName() + " is " + charAge(i) + "." : "") + "]";
    return STATUS_TAG + " It is " + nowText(i) + ". Jack is " + a + " (" + sizeFor(a) + ", " + voiceFor(a) + ")." +
      (a < 18 ? " Jack is a minor: nothing sexual or romantic involving him." : "") + "]";
  };
  // Removes a cut-off copy of the Front Memory text (the part AI Dungeon kept)
  const removeFrontMemoryEcho = (ctx, fm) => {
    if (!fm || fm.length < 24) return ctx;
    const tail = fm.slice(-24);
    const at = ctx.lastIndexOf(tail);
    if (at < 0) return ctx;
    let a = at - 1, b = fm.length - tail.length - 1;
    while (a >= 0 && b >= 0 && ctx[a] === fm[b]) { a--; b--; }
    return ctx.slice(0, a + 1) + ctx.slice(at + tail.length);
  };

  // ---------- corrections: mistakes the script caught in a reply, carried to the AI for a few turns ----------
  const addFix = (text) => {
    T.fix = (T.fix || []).filter((f) => f.t !== text);
    T.fix.push({ t: text, until: (T.inputCount || 0) + 3 });
    T.fix = T.fix.slice(-4);
  };
  const fixesNow = () => (T.fix || []).filter((f) => (T.inputCount || 0) <= f.until).map((f) => f.t);
  // Removes every sentence that contains a match; keeps line breaks
  const sentenceWith = (re) => new RegExp("[^.!?\\n]*(?:" + re.source + ")[^.!?\\n]*(?:[.!?]+[\"'”’]?)?[ \\t]*", "gi");
  const stripSentences = (s, re) => s.replace(sentenceWith(re), " ").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");
  // Powers Jack doesn't have, as the AI tends to invent them: [pattern, what to call it, strip the sentence?]
  const NOT_JACK = [
    [/\byour (?:own )?(?:telepathy|telekinesis|force ?fields?|invisibility|super ?breath|ice breath|frost breath|freeze breath|heat (?:hands|touch|aura|vision)|laser (?:eyes|vision)|eye ?beams?|optic (?:blasts?|beams?)|energy (?:blasts?|bolts?|beams? from your hands?)|lightning(?! reflex| fast| quick)|electricity|fire(?:balls?|power)?(?! escape| alarm| exit)|flames?|plasma|sonic scream|wings)\b/i, "a power he doesn't have", true],
    [/\byour (?:hands?|palms?|fingers?|fingertips?) (?:glow|radiat|crackl|spark|blaz|pulse|smolder|ignit)\w*[^.!?\n]{0,40}\b(?:heat|fire|flame|energy|lightning|electric|ice|frost|plasma)\b/i, "heat or energy from his hands (he has no heat or energy powers; his long-range power is blood control)", true],
    [/\b(?:heat|fire|flame|energy|lightning|electricity|frost|ice|plasma)[^.!?\n]{0,30}\b(?:from|out of|through) your (?:hands?|palms?|fingers?|fingertips?|touch|mouth|chest)\b/i, "heat or energy from his hands or body (he has no heat or energy powers; his long-range power is blood control)", true],
    [/\b(?:heat|laser|energy|light|fire|red|gold(?:en)?) (?:beams?|blasts?|rays?|lasers?)[^.!?\n]{0,30}\b(?:from|out of) your eyes\b|\byour eyes (?:fire|shoot|blast|unleash|emit|release|lance|blaze|flare|glow|burn)\w*[^.!?\n]{0,40}\b(?:beams?|lasers?|rays?)\b|\byour eyes (?:fire|shoot|unleash|emit|release)\w*[^.!?\n]{0,20}\b(?:heat|fire)\b/i, "beams or heat from his eyes (he has no heat vision; his long-range power is blood control)", true],
    [/\byou (?:turn|go|become|are|were) invisible\b|\byou (?:teleport|blink out of|phase through|walk through the wall|read (?:his|her|their) minds?|freeze (?:him|her|them|it) (?:solid|with your breath)|breathe (?:ice|fire|frost))\b|\b(?:lift|move|throw|hold|crush|pull|push)[^.!?\n]{0,20}\bwith your mind\b/i, "a power he doesn't have", true],
    [/\b(?:without|no|suppress\w*|swallow\w*|muffl\w*|contain\w*)[^.!?\n]{0,25}\bsonic booms?\b|\bsonic booms?[^.!?\n]{0,25}\b(?:suppressed|contained|swallowed|muffled)\b/i, "flying supersonic with no sonic boom (a boom follows him over any city and breaks windows)", false],
    [/\b(?:speed of light|light ?speed|faster than light)\b/i, "anything near the speed of light", false]
  ];
  // Lifting past his strength, by what he lifts: [pattern, the age he can first lift it (99: never)]
  const LIFT_VERB = /\b(?:lift|lifts|lifted|lifting|deadlift\w*|hoist\w*|carry|carries|carried|carrying|throw|throws|threw|throwing|hurl\w*|toss\w*|heave|heaves|heaved|heaving)\b/gi;
  // what the verb lifts: right after it, with at most an article and two describing words in between
  const liftsThing = (tail, re) => new RegExp("^\\s+(?:up\\s+)?(?:(?:the|a|an|that|this|another|both|an entire|the entire|the whole|a whole)\\s+)?(?:[\\w-]+\\s+){0,2}?(?:" + re.source + ")", "i").exec(tail);
  const BIG_THINGS = [
    [/\b(?:main battle tanks?|Abrams|tanks?)\b/i, 17],
    [/\b(?:airliners?|747s?|jetliners?|passenger jets?|jumbo jets?|locomotives?)\b/i, 18],
    [/\b(?:buildings?|skyscrapers?|aircraft carriers?|battleships?|cruise ships?|bridges?|freighters?|cargo ships?|trains?)\b/i, 99]
  ];
  const SMALL_TANK = /\b(?:fuel|water|gas|fish|septic|propane|oxygen|scuba|think|air|storage|holding|shark|test|heater|hot|gasoline|diesel|toilet|ink|nitrous|helium|aquarium)\s+(?:\w+\s+)?tanks?\b|\btank\s?tops?\b/i;
  const OTHER_SUPES = /\b(?:A-Train|Homelander|Maeve|Noir|Translucent|The Deep|Lamplighter|Starlight|Stormfront|Soldier Boy|Supersonic|Shockwave|Marathon|Popclaw|Golden Boy|Luke|Cate|Jordan|Andre|Emma|Marie|Ryan|Butcher|Kimiko|Tek Knight|Firecracker|Sage)\b/;
  // Flight tops out by age; below 12 he can't fly supersonic at all. On foot he's slower: no Mach before 15.
  const machCap = (a) => (a < 12 ? 0 : FLY_MACH[Math.min(18, a)]);
  const RUN_MACH = { 15: 1, 16: 2, 17: 4, 18: 6 };
  const runCap = (a) => (a < 15 ? 0 : RUN_MACH[Math.min(18, a)]);
  const reFlying = /\b(?:fly|flies|flying|flew|flown|flight|soar\w*|airborne|in the air|through the air|sky|skies|clouds?|stratosphere|altitude|overhead|jet ?stream|orbit)\b/i;
  const reRunning = /\b(?:run|runs|running|ran|sprint\w*|on foot|footsteps?|feet pound\w*)\b/i;
  const enforceJack = (s, age) => {
    for (const [re, what, strip] of NOT_JACK) {
      const m = s.match(re);
      if (!m || /X-?ray/i.test(m[0])) continue;
      let removed = false;
      if (strip) {
        const cut = stripSentences(s, re);
        if (cut.trim()) { s = cut; removed = true; }
      }
      addFix("Jack has no such thing as " + what + "; a recent reply gave him \"" + m[0].trim().slice(0, 60) + "\", which " + (removed ? "has been removed from the story" : "was a mistake") + ". Don't repeat it.");
    }
    // Speed: "Mach 7" above his cap, in his own sentences, becomes his cap (on foot when the sentence has him running, not flying)
    s = s.replace(/[^.!?\n]*\bMach\s*(\d+(?:\.\d+)?)\b[^.!?\n]*/gi, (sentence) => {
      if (!/\b(?:you|your)\b/i.test(sentence) || OTHER_SUPES.test(sentence)) return sentence;
      const onFoot = reRunning.test(sentence) && !reFlying.test(sentence);
      const a = Math.max(4, Math.min(18, age));
      const cap = onFoot ? runCap(a) : machCap(a);
      const slow = onFoot ? SPEED[a] : FLY[a].replace(/^about /, "").replace(/,.*$/, "");
      return sentence.replace(/\bMach\s*(\d+(?:\.\d+)?)\b/gi, (w, n) => {
        if (parseFloat(n) <= cap) return w;
        addFix("Jack's top speed right now is " + (onFoot ? (cap ? "Mach " + cap : SPEED[a]) + " on foot" : (cap ? "Mach " + cap : "about " + slow) + " in the air") + "; a recent reply had him faster and was corrected.");
        return cap ? "Mach " + cap : slow;
      });
    });
    // Lifting more than he can at his age, in his own sentences
    const a = Math.max(4, Math.min(18, age));
    for (const sentence of s.match(/[^.!?\n]+/g) || []) {
      if (!/\b(?:you|your)\b/i.test(sentence) || OTHER_SUPES.test(sentence)) continue;
      // what comes right after a lifting verb: "lift the empty 747", "deadlift a main battle tank"
      const tails = [];
      for (const lm of sentence.matchAll(LIFT_VERB)) tails.push(sentence.slice(lm.index + lm[0].length, lm.index + lm[0].length + 48));
      if (!tails.length) continue;
      for (const [re, from] of BIG_THINGS) {
        let m = null, hit = "";
        for (const t of tails) { const x = liftsThing(t, re); if (x) { m = x[0].match(re); hit = x[0]; break; } }
        if (!m || age >= from || (from === 17 && SMALL_TANK.test(hit))) continue;
        addFix("Jack can't lift " + (from === 17 ? "a tank" : from === 18 ? "an airliner or a locomotive" : "a building, a ship, a bridge or a train") + " at " + age +
          ": his arms top out at " + commas(STRENGTH[a][0]) + " lbs (" + STRENGTH[a][2] + "); a recent reply had him lifting \"" + m[0] + "\", which was a mistake.");
        break;
      }
    }
    return s;
  };
  // Canon dead shown alive: the name in a sentence with a living verb, or the next sentence picking them up with a pronoun
  const ALIVE = /\b(?:says?|said|asks?|asked|walks?|turns?|looks?|smiles?|calls?|phones?|texts?|enters?|stands?|sits?|nods?|laughs?|steps?|answers?|replies|speaks?|tells?|stares?|grins?|frowns?|leans?|shrugs?|waits?|watches|arrives?|greets?|waves?|meets?|pours?|sighs?|whispers?|shouts?|is (?:here|there|waiting|standing|sitting|alive|back)|voice is)\b/i;
  const NOT_ALIVE = /\b(?:body|corpse|lifeless|limp|motionless|unmoving|glassy|remains|bleeds? out|bled out|dead|died|dies|death|killed|murder\w*|funeral|grave|buried|memorial|remember\w*|memory|memories|used to|ghost|photo\w*|picture|portrait|video|footage|recording|tape|file|dream\w*|flashback|years? ago|months? ago|the late|former|back then|had been|was alive|were alive|impostor|pretend\w*|disguise\w*|lookalike|look-alike)\b/i;
  // [name, the month they died, true if the story killed them (not canon)] for everyone dead whom the reply shows alive
  const deadShownAlive = (s, i) => {
    const sentences = blankQuotes(unify(s)).match(/[^.!?\n]+[.!?]*/g) || [];
    const hits = [];
    const thisTurn = count === null ? -1 : count;
    // a name that also belongs to someone alive now (the second Black Noir) is never flagged
    const aliveSources = TRACKED.filter(([n, re, last, first]) => !deadAt(deathOf(n, last), i) && (!first || i >= first)).map((p) => p[1].source);
    // the most recent death first, so a shared name (the two Black Noirs) reports the right one
    const order = TRACKED.map((p) => [p, deathOf(p[0], p[2])]).filter(([p, d]) => deadAt(d, i)).sort((a, b) => b[1].at - a[1].at);
    const reported = new Set();
    for (const [[name, re0, last, first, strict], d] of order) {
      const re = strict && i > d.at + 12 ? strict : re0;   // a year on, a bare common first name is probably someone else
      if (aliveSources.includes(re0.source) || reported.has(re0.source)) continue;
      if (d.story && d.turn === thisTurn) continue;   // they die in this very reply
      // "a barista named Robin", "Robin, the new intern": someone else with the same name
      const other = new RegExp("\\b(?:named|called)\\s+(?:" + re.source + ")|(?:" + re.source + "),\\s+(?:a|an|the|my|your|his|her|their)\\b");
      for (let k = 0; k < sentences.length; k++) {
        if (!re.test(sentences[k]) || other.test(sentences[k])) continue;
        const window = sentences[k] + " " + (/^\s*(?:He|She|Her|His|They|Their)\b/.test(sentences[k + 1] || "") ? sentences[k + 1] : "");
        if (ALIVE.test(window) && !NOT_ALIVE.test(window)) { hits.push([name, d.at, d.story]); reported.add(re0.source); break; }
      }
    }
    return hits;
  };

  // ---------- noticing what the story changed ----------
  // Run on each reply. A canon character the reply kills stays dead (before their canon date only when the player
  // character had a hand in it); one canon kills this month whom the player character saves stays alive; the player
  // character joining or leaving the Seven or the Boys is remembered. Returns the [Tracker] lines for the player.
  const escapeRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const MARK = "\u0001";   // stands in for the person's name, so the name stays case-sensitive and the rest doesn't
  // "Becca Butcher" and "Ryan Butcher" are not Billy
  const unify = (s) => s.replace(/\b(Becca|Rebecca|Ryan) Butcher\b/g, "$1");
  // Something unreal, reported, remembered or on a screen: no change comes from it
  const FICTION = /\b(?:dream\w*|nightmares?|hallucinat\w*|fantas(?:y|ies|i[sz]e\w*)|imagin\w*|simulat\w*|movies?|films?|episodes?|comics?|video games?|rehears\w*|pretend\w*|fak(?:e|es|ed|ing)|staged|hoax|rumou?r\w*|presumed|supposedly|reportedly|news|headlines?|reports?|TV|television|screens?|broadcast\w*|footage|videos?|podcast|articles?|posters?|billboards?|statues?|memorials?|legends?|photos?|pictures?|portraits?|anchor|prompter|announc\w*|press conference|statement|obituar\w*)\b/i;
  // Between a name and "dies"/"is dead": nothing that makes it a wish, a doubt, a denial or someone else's death
  const HEDGE_GAP = /\b(?:not|never|no longer|almost|nearly|half|practically|basically|probably|maybe|perhaps|likely|surely|would|could|should|might|may|can|cannot|will|must|going|gonna|about|wants?|wanted|wish\w*|hope\w*|try|tries|trying|tried|attempt\w*|threaten\w*|plan\w*|if|unless|whether|looks?|looked|seems?|seemed|like|think\w*|thought|believe\w*|assum\w*|sure|claims?|claimed|says?|said|told|tells?|heard|hears?|fail\w*|refus\w*|decid\w*|ready|able|need\w*)\b|n['’]t\b/i;
  const GAP_BAD = /['’]s\b|[,;:]|\b(?:who|whom|which|that|as|while|when|and|but|then|the|a|an|his|her|their|its)\b/i;
  // Before the name: someone believing, hoping, saying or imagining it
  const HEDGE_LEAD = /\b(?:if|unless|whether|think\w*|thought|believe\w*|assum\w*|hope\w*|wish\w*|pretend\w*|claims?|claimed|says?|said|told|tells?|heard|maybe|perhaps|probably|sure|imagin\w*|wonder\w*|fear\w*|afraid)\b/i;
  // Right before a verb: a modal or an intent ("could kill", "want to kill", "don't kill", "about to kill")
  const HEDGE_VERB = /(?:\b(?:would|could|should|might|may|can|cannot|will|must|shall|not|never|almost|nearly|barely|to|gonna|wanna)|n['’]t|['’](?:d|ll))\s+(?:\w+\s+)?$/i;
  // After it: a death long ago ("He died a hero in 1984")
  const PAST_TIME = /\b(?:ago|back then|long before|in (?:19|20)\d\d|years? before|once upon)\b/i;
  // A person other than the named one, after the name: a pronoun in the next sentence may mean them
  const OTHER_PERSON = /\b(?:the|a|an|another|one|his|her|their|some)\s+(?:\w+\s+)?(?:guard|man|woman|gunman|gunmen|soldier|cop|officer|agent|kid|boy|girl|driver|guy|stranger|thug|merc|mercenary|hostage|victim|bodyguard|goon|henchman|shooter|attacker|assassin|nurse|doctor|scientist|reporter|civilian|terrorist|Supe|hero|villain|bystander|waiter|bartender|neighbor)s?\b|\b(?:someone|somebody|everyone|nobody)\b|\b[A-Z][a-z]{2,}\b/;
  const VIOLENCE = /\b(?:punch(?:es|ed)?|kick(?:s|ed)?|stab(?:s|bed)?|impale[sd]?|spear(?:s|ed)?|slash(?:es|ed)?|rip(?:s|ped)?|tear(?:s)?|tore|crush(?:es|ed)?|snap(?:s|ped)?|shoot(?:s)?|shot|blast(?:s|ed)?|throw(?:s)?|threw|hurl(?:s|ed)?|choke[sd]?|strangle[sd]?|drown(?:s|ed)?|burn(?:s|ed)?|behead(?:s|ed)?|decapitate[sd]?|kill(?:s|ed)?|smash(?:es|ed)?|slam(?:s|med)?|stomp(?:s|ed)?|hit(?:s)?|strike[s]?|struck|cut(?:s)?|slice[sd]?|break(?:s)?|broke|drive[s]?|drove)\b/i;
  const VIOLENCE_G = new RegExp(VIOLENCE.source, "gi");
  const KILL_INTENT = /\b(?:attack\w*|fight\w*|punch\w*|hit|hits|strike\w*|kill(?:s|ed|ing)?|murder\w*|rip\w*|tear\w*|tore|crush\w*|snap\w*|behead\w*|decapitat\w*|stab\w*|impal\w*|spear\w*|shoot\w*|shot|end\w*|finish\w*|slaughter\w*|execut\w*|choke\w*|strangl\w*|drown\w*|burn\w*|explod\w*|smash\w*)\b/i;
  const DEATH_SUBJ = new RegExp(MARK + "([^.!?\\n" + MARK + "]{0,40}?)\\b(?:is|was|lies|lay|lying|falls?|fell|drops?|dropped|collapses?|collapsed|slumps?|slumped|crumples?|crumpled|goes|went|ends? up|ended up)\\s+((?:\\w+\\s+){0,2}?)(?:dead|lifeless)\\b(?![- ]?(?:tired|serious|set|silent|still|wrong|right|eye|ahead|last|weight|cent|calm|quiet|sure|on\\b|cold|asleep|drunk|end|pan|bolt|heat|ringer|giveaway|zone|air|man|men|meat|certain|flat|broke|beat|in the water|to rights|to the world))", "i");
  const DEATH_VERB = new RegExp(MARK + "([^.!?\\n" + MARK + "]{0,40}?)\\b(?:dies|died|is killed|was killed|gets killed|got killed|is murdered|was murdered|bleeds out|bled out|stops breathing|stopped breathing|breathes (?:his|her|their) last|takes (?:his|her|their) last breath|took (?:his|her|their) last breath)\\b", "i");
  const KILLS = new RegExp("\\b(?:kill|kills|killed|murder|murders|murdered|execute|executes|executed|decapitates?|decapitated|beheads?|beheaded|assassinates?|assassinated|finish(?:es|ed)? off)\\s+" + MARK + "(?!['’]s)", "i");
  const RIP = "(?:rip|rips|ripped|tear|tears|tore|pull|pulls|pulled|twist|twists|twisted|wrench|wrenches|wrenched)";
  const CRUSH = "(?:crush|crushes|crushed|cave|caves|caved|smash|smashes|smashed)";
  const headKills = (who) => new RegExp("\\b" + RIP + "\\s+off\\s+" + who + "\\s+head\\b|\\b" + RIP + "\\s+" + who + "\\s+head\\s+(?:off|clean off|from (?:his|her|their) (?:shoulders|body|neck))\\b" +
    "|\\b(?:rip|rips|ripped|tear|tears|tore|pull|pulls|pulled)\\s+(?:out\\s+" + who + "\\s+heart|" + who + "\\s+heart\\s+(?:out|from))\\b" +
    "|\\b" + CRUSH + "\\s+(?:in\\s+" + who + "\\s+(?:skull|head)|" + who + "\\s+(?:skull|head)\\s+in)\\b|\\b(?:crush|crushes|crushed)\\s+" + who + "\\s+skull\\b" +
    "|\\b(?:blow|blows|blew|pop|pops|popped)\\s+" + who + "\\s+head\\s+(?:off|apart|clean off)\\b|\\b(?:explode|explodes|exploded)\\s+" + who + "\\s+(?:head|skull)\\b" +
    "|\\b(?:snap|snaps|snapped|break|breaks|broke)\\s+" + who + "\\s+neck\\b" +
    "|\\b(?:drive|drives|drove|punch|punches|punched|put|puts|shove|shoves|shoved|ram|rams|rammed|plunge|plunges|plunged|fire|fires|fired|send|sends|sent|stab|stabs|stabbed)\\b[^.!?\\n]{0,40}\\bthrough\\s+" + who + "\\s+(?:skull|head|heart|brain)\\b" +
    "|\\b(?:the\\s+)?(?:light|life)\\s+(?:leaves|left|fades from|faded from|drains from|drained from|goes out of|went out of)\\s+" + who + "\\s+eyes\\b", "i");
  const HEAD_KILLS = headKills(MARK + "['’]s");
  // The named person's own head or body: "Butcher's head explodes", "Butcher's corpse", "Butcher's dead."
  const OWN_DEATH = new RegExp(MARK + "['’]s\\s+(?:(?:head|skull)\\s+(?:explodes|exploded|bursts|burst|pops|popped|caves in|caved in|comes off|came off|splits open|split open)\\b|corpse\\b|lifeless body\\b|dead body\\b|heart stops\\b|(?:body|corpse)[^.!?\\n]{0,30}\\blifeless\\b|dead\\b(?=\\s*(?:[.!?,;:—–]|$)|\\s+(?:now|already|too)\\b))", "i");
  // Finishing someone the sentence named, by pronoun: "...and kill him." / "You snap his neck." / "The light leaves his eyes."
  const PRONOUN_KILLS = new RegExp("\\b(?:kill|kills|killed|killing|murder|murders|murdered|murdering|execute|executes|executed|behead\\w*|decapitat\\w*|finish(?:es|ed)? off)\\s+(?:him|her|them)\\b|" +
    headKills("(?:his|her|their)").source + "|\\b(?:his|her|their)\\s+heart\\s+stops\\b", "i");
  const SAVES = new RegExp("\\b(?:save|saves|saved|rescue|rescues|rescued|shield|shields|shielded)\\s+" + MARK + "(?!['’]s)|\\b(?:pull|pulls|pulled|yank|yanks|yanked|shove|shoves|shoved|push|pushes|pushed|tackle|tackles|tackled|knock|knocks|knocked|throw|throws|threw|drag|drags|dragged|snatch|snatches|snatched|grab|grabs|grabbed|whisk|whisks|whisked|carry|carries|carried|haul|hauls|hauled)\\s+" + MARK + "(?!['’]s)[^.!?\\n]{0,40}\\b(?:out of the way|to safety|out of (?:his|her|its|their|the) (?:path|way)|clear of|out of reach)", "i");
  const SURVIVES = new RegExp(MARK + "([^.!?\\n" + MARK + "]{0,30}?)\\b(?:survives|survived|is still alive|makes it|made it|will live|is going to live|is still breathing)\\b", "i");
  const PERIL = /\b(?:A-Train|bomb|bullets?|blast|crash\w*|explo\w*|attack\w*|fire|burn\w*|heart attack|overdose|bleed\w*|wound\w*|shot|stabb\w*|kill\w*|dead|death|die|dies|died|dying|ambulance|hospital|CPR|trauma|path)\b/i;
  const PRONOUN_START = /^\s*(?:He|She|They)\b/;
  // "His body hits the floor, lifeless." / "Her heart stops."
  const PRONOUN_OWN = /^\s*(?:His|Her|Their)\s+(?:(?:body|corpse)[^.!?\n]{0,30}\blifeless\b|corpse\b|lifeless body\b|heart stops\b|(?:head|skull)\s+(?:explodes|bursts|pops|caves in|comes off|splits open)\b)/;
  // Who does the verb at `at`: the player character, when the last possible subject before it in the sentence is "you" (or their name)
  const playerDoes = (s, at, you) => {
    const before = s.slice(0, at);
    let last = null, m;
    const re = new RegExp(you.source + "|\\b(?:He|She|They|he|she|they)\\b|\\b[A-Z][a-z]+\\b", "g");
    while ((m = re.exec(before))) last = m[0];
    return !!last && you.test(last);
  };
  const noticeChanges = (raw) => {
    const out = unify(raw);
    const i = T.idx, notes = [];
    const sentences = blankQuotes(out).match(/[^.!?\n]+[.!?]*/g) || [];
    const input = unify((T.turn && T.turn.input) || "");
    const who = charName() !== "The player character" ? "|\\b" + escapeRe(charName()) + "\\b" : "";
    const you = new RegExp("\\b(?:[Yy]ou|[Yy]our|[Yy]ours|[Yy]ourself)\\b" + who);
    const youSubj = new RegExp("^(?:[Yy]ou" + (who ? "|" + escapeRe(charName()) : "") + ")$");
    // people alive and born now (by canon and the story)
    const living = TRACKED.filter(([n, re, last, first]) => !deadAt(deathOf(n, last), i) && (!first || i >= first) && !(BORN[n] && BORN[n] > i));
    const events = [];   // [name, "dead" | "alive", canon's own death]
    for (let k = 0; k < sentences.length; k++) {
      const sent = sentences[k], next = sentences[k + 1] || "", window = sent + " " + next;
      if (FICTION.test(sent)) continue;
      const here = living.filter((p) => p[1].test(sent));
      for (const [name, re, last] of here) {
        const marked = sent.replace(new RegExp(re.source, "g"), MARK);
        const at0 = marked.indexOf(MARK);
        const after = marked.slice(marked.lastIndexOf(MARK) + 1);
        let died = false, byPlayer = false, saved = false;
        // "Butcher is dead" / "Butcher dies": a clean gap between the name and the death, nothing doubting it before the name, not long ago
        for (const R of [DEATH_SUBJ, DEATH_VERB]) {
          const m = marked.match(R);
          if (m && !GAP_BAD.test(m[1]) && !HEDGE_GAP.test(m[1] + " " + (m[2] || "")) && !HEDGE_LEAD.test(marked.slice(Math.max(0, m.index - 40), m.index)) && !PAST_TIME.test(marked.slice(m.index))) died = true;
        }
        // "Butcher's head explodes" / "Butcher's corpse" / "Butcher's dead."
        { const m = marked.match(OWN_DEATH); if (m && !HEDGE_LEAD.test(marked.slice(Math.max(0, m.index - 40), m.index))) died = true; }
        // "you kill Butcher" / "you tear Butcher's head off": no modal or intent right before the verb
        for (const R of [KILLS, HEAD_KILLS]) {
          const m = marked.match(R);
          if (m && !HEDGE_VERB.test(marked.slice(0, m.index)) && !HEDGE_LEAD.test(marked.slice(0, m.index))) { died = true; if (playerDoes(marked, m.index, you)) byPlayer = true; }
        }
        // "...grab Butcher and kill him." : later in the same sentence, by pronoun, with nobody else named in between
        if (!died && here.length === 1) {
          const m = after.match(PRONOUN_KILLS);
          if (m && !OTHER_PERSON.test(after.slice(0, m.index)) && !HEDGE_VERB.test(after.slice(0, m.index))) { died = true; if (playerDoes(marked, at0, you)) byPlayer = true; }
        }
        // the next sentence picks them up by pronoun: "He bleeds out on the concrete." / "You snap his neck."
        if (!died && here.length === 1 && !FICTION.test(next) && !living.some((p) => p[1].test(next)) && !OTHER_PERSON.test(after)) {
          if (PRONOUN_START.test(next)) {
            const mk = next.replace(PRONOUN_START, MARK);
            for (const R of [DEATH_SUBJ, DEATH_VERB]) { const m = mk.match(R); if (m && !GAP_BAD.test(m[1]) && !HEDGE_GAP.test(m[1] + " " + (m[2] || "")) && !PAST_TIME.test(mk.slice(m.index))) died = true; }
          }
          const m = next.match(PRONOUN_KILLS);
          if (m && !HEDGE_VERB.test(next.slice(0, m.index)) && !HEDGE_LEAD.test(next.slice(0, m.index))) { died = true; if (playerDoes(next, m.index, you)) byPlayer = true; }
          if (PRONOUN_OWN.test(next)) died = true;
        }
        if (died) {
          // canon's own death in its month counts as canon; any other death changes the story only when the player character did it,
          // or the reply has them doing violence right there, or the player's action this turn went after that person
          const playerViolence = [sent, next].some((s) => { for (const v of s.matchAll(VIOLENCE_G)) if (playerDoes(s, v.index, you)) return true; return false; });
          const involved = byPlayer || playerViolence || (re.test(input) && KILL_INTENT.test(input));
          if (last && i >= last) events.push([name, "dead", true]);
          else if (involved) events.push([name, "dead", false]);
          continue;
        }
        if (last && i === last) {
          // the month canon kills them: the player character saving them, or the story saying they made it through danger
          const m = marked.match(SAVES);
          if (m && !HEDGE_VERB.test(marked.slice(0, m.index)) && playerDoes(marked, m.index, you)) saved = true;
          const m2 = marked.match(SURVIVES);
          if (m2 && !GAP_BAD.test(m2[1]) && !HEDGE_GAP.test(m2[1]) && you.test(window) && PERIL.test(window)) saved = true;
          if (saved) events.push([name, "alive", false]);
          else if (ALIVE.test(window) && !NOT_ALIVE.test(window) && you.test(window) && !FICTION.test(next)) T.seenYou[name] = i;   // with the player character that month
        }
      }
    }
    for (const [name, kind, canonTimed] of events) {
      const c = changeOf(name);
      if (kind === "dead") {
        if (c && c.k === "dead") continue;
        if (canonTimed && !(c && c.k === "alive")) { addChange(name, "dead", i, { canon: true }); continue; }   // canon's own death, played out
        addChange(name, "dead", i);
        notes.push(name + " is dead.");
      } else if (!c) {
        addChange(name, "alive", i);
        notes.push(name + " survives.");
      }
    }
    // The player character joining or leaving the Seven or the Boys
    const P = "(?:\\b[Yy]ou" + who + ")";
    const TEAM_END = "\\b(?!['’]|\\s*,|\\s+(?:and|with|for|at|in|on|as|outside|inside|downstairs|upstairs|by|near|around|over|across|onstage|backstage|again|who|while|arguing|talking)\\b)";
    const JOIN = [
      new RegExp(P + "(?:\\s+(?:are|is|become|became|have become|has become)|['’](?:re|s))\\s+(?:now\\s+|officially\\s+){0,2}(?:(?:a|an|the)\\s+)?(?:(?:newest|youngest|latest|seventh|eighth|official|full)\\s+)?(?:member|one)\\s+of\\s+the\\s+(Seven|Boys)\\b(?!['’])"),
      new RegExp(P + "\\s+(?:officially\\s+)?(?:join|joins|joined)\\s+the\\s+(Seven|Boys)" + TEAM_END),
      new RegExp(P + "\\s+(?:take|takes|took|claim|claims|claimed|fill|fills|filled)\\s+(?:your|his|her|their|the)\\s+(?:open\\s+|empty\\s+|seventh\\s+|new\\s+)?seat\\s+(?:in|on|at|with)\\s+the\\s+(Seven)\\b(?!['’])")
    ];
    const LEAVE = [
      new RegExp(P + "\\s+(?:quit|quits|leave|leaves|left)\\s+the\\s+(Seven|Boys)" + TEAM_END + "(?!\\s+(?:behind|to|alone|standing|there)\\b)"),
      new RegExp(P + "(?:\\s+(?:are|is|were|was|get|gets|got)|['’](?:re|s))\\s+(?:kicked|thrown|cut|fired|expelled|dropped|booted)\\s+(?:out\\s+)?(?:of|from)\\s+the\\s+(Seven|Boys)\\b(?!['’])")
    ];
    for (const sent of sentences) {
      if (FICTION.test(sent)) continue;
      for (const [list, kind] of [[JOIN, "member"], [LEAVE, "left"]]) {
        for (const R of list) {
          const m = sent.match(R);
          if (!m || HEDGE_VERB.test(sent.slice(0, m.index)) || HEDGE_LEAD.test(sent.slice(0, m.index))) continue;
          const team = "the " + m[1], c = changeOf(team);
          if (kind === "member" && (!c || c.k !== "member")) { addChange(team, "member", i); notes.push(charName() + " joins " + team + "."); }
          if (kind === "left" && c && c.k === "member") { addChange(team, "left", i); notes.push(charName() + " leaves " + team + "."); }
          break;
        }
      }
    }
    return notes;
  };

  // ---------- canon arriving early ----------
  // 1. What the AI reads: a story card's "Canon schedule:" and a dated Plot Essentials line ("- May 2019: ...") lose
  //    every item dated after the month the story can reach this turn. The AI copied "Starlight takes his seat"
  //    from them into a May 2015 reply.
  const SCHED_MONTHS = MONTHS.join("|");
  const SCHED_DATE = new RegExp("^(?:(about|around|early|late|mid|by|from|until|spring|summer|fall|autumn|winter)[- ]+)?(?:(" + SCHED_MONTHS + ")(?:\\s*[-–]\\s*(?:" + SCHED_MONTHS + "))?\\s+)?(?:(\\d{1,2})(?:\\s*[-–]\\s*\\d{1,2})?,\\s+)?((?:19|20)\\d\\d)(\\s*[-–]\\s*(?:19|20)?\\d\\d|\\s+to\\s+[^:.\\n]{3,30})?:\\s", "i");
  const SCHED_SEASON = { spring: 3, summer: 6, fall: 9, autumn: 9, winter: 12 };
  // The day an item ("May 27, 2019: ...") may first show: its day; with only a month, the end of that month (early and
  // mid: the 10th and 20th), so nothing shows before it happens; with a season, its end; with a year or a span of
  // years, the start (a standing fact)
  const schedDay = (s) => {
    const m = SCHED_DATE.exec(s);
    if (!m) return null;
    const y = parseInt(m[4], 10), q = (m[1] || "").toLowerCase();
    if (m[2]) {
      const mo = parseMonthWord(m[2]);
      if (m[3]) return DY(y, mo, Math.min(parseInt(m[3], 10), 31));
      return q === "early" ? DY(y, mo, 10) : q === "mid" ? DY(y, mo, 20) : DY(y, mo + 1, 0);
    }
    if (SCHED_SEASON[q]) return DY(y, SCHED_SEASON[q] + 3, 0);
    return DY(y, 1, 1);
  };
  // "Date: text. Date: text." without the items dated after day n ("" when none is left)
  const dropFutureItems = (run, i) => {
    const starts = [0];
    const re = /[.!?]["”’']?\s+/g;
    let m;
    while ((m = re.exec(run))) {
      const at = m.index + m[0].length;
      if (at < run.length && SCHED_DATE.test(run.slice(at, at + 60))) starts.push(at);
    }
    const items = starts.map((a, k) => run.slice(a, k + 1 < starts.length ? starts[k + 1] : run.length));
    const kept = items.filter((it) => { const x = schedDay(it); return (x === null || x <= i) && !(branching() && x !== null && offScript(it, fromDayNo(x).i, x).length); });
    return kept.length === items.length ? run : kept.join("").replace(/\s+$/, "");
  };
  // Everything above "Recent Story:" (Plot Essentials, story cards); the story itself is never touched
  const hideFutureCanon = (ctx, i) => {
    const storyAt = ctx.search(/Recent\s*Story\s*:/i);
    const head = storyAt >= 0 ? ctx.slice(0, storyAt) : ctx;
    if (!/Canon schedule:|^[ \t]*[-•*][ \t]+(?:\w+[ -]+)?(?:\w+\s+)?(?:\d{1,2},\s+)?(?:19|20)\d\d/m.test(head)) return ctx;
    const lines = [];
    for (const line of head.split("\n")) {
      const b = /^([ \t]*[-•*][ \t]+)(.*)$/.exec(line);
      if (b && SCHED_DATE.test(b[2])) {
        const rest = dropFutureItems(b[2], i);
        if (rest) lines.push(b[1] + rest);
        continue;
      }
      const at = line.indexOf("Canon schedule:");
      if (at < 0) { lines.push(line); continue; }
      const from = at + "Canon schedule:".length;
      const nv = line.indexOf("Never:", from);
      const end = nv >= 0 ? nv : line.length;
      const run = line.slice(from, end).trim();
      const rest = dropFutureItems(run, i);
      if (rest === run) { lines.push(line); continue; }
      lines.push((line.slice(0, at) + (rest ? "Canon schedule: " + rest + " " : "") + line.slice(end)).replace(/[ \t]+$/, ""));
    }
    return lines.join("\n") + (storyAt >= 0 ? ctx.slice(storyAt) : "");
  };

  // 2. What the AI writes: someone in the Seven before they join, an exit from it before it happens, Compound V out
  //    before October 2020. The sentence is cut and the AI is told for a few turns. Left alone: anyone the story
  //    changed (a death, a rescue), anyone the player's action this turn names, anyone in a /fact, the Seven's exits
  //    once the player character is in it, and words that wish, doubt, deny, ask, or happen in a movie.
  const SEVEN_BARE = "[Tt]he\\s+Seven\\b(?!\\s+(?:Seas|seas|Tower|tower)\\b)";
  const SEVEN = SEVEN_BARE + "(?!['’]s?\\s+(?!(?:ranks|roster|lineup)\\b))";
  const NAME_STOP = "\\b(?:Homelander|Maeve|Noir|Translucent|[Tt]he Deep|Lamplighter|Starlight|Annie|A-Train|Marathon|Stormfront|Soldier Boy|Supersonic|Sister Sage|Firecracker|Popclaw|Shockwave|Butcher|Hughie|Edgar|Stillwell|[Yy]ou|[Yy]our)\\b";
  const GAP = "(?:(?!" + NAME_STOP + ")[^.!?\\n]){0,80}?";
  const DEPARTING = "(?:Lamplighter|Translucent|(?:Mister|Mr\\.?)\\s*Marathon)";
  const NEAR_SEVEN = new RegExp(SEVEN_BARE + "|" + DEPARTING);
  const joinRes = (S) => [
    S + GAP + "\\b(?:join|joins|joined|joining|rejoined)\\s+" + SEVEN,
    S + GAP + "\\b(?:is|was|were|got|gets|been|being)\\s+(?:(?:officially|finally)\\s+)?(?:drafted|recruited|inducted|added|picked|chosen|named|voted|brought|welcomed)\\s+(?:in)?to\\s+" + SEVEN,
    S + GAP + "(?:,|\\b(?:is|was|became|becomes|become|had become|has become|remains|remained))\\s+(?:(?:now|already|officially|finally|still)\\s+){0,2}(?:(?:a|an|the)\\s+)?(?:(?:newest|new|youngest|latest|seventh|official|full|fastest|only)\\s+)?(?:member|part|one)\\s+of\\s+" + SEVEN,
    S + GAP + "\\b(?:is|was|are|were)\\s+(?:(?:now|already)\\s+)?(?:in|on)\\s+" + SEVEN,
    S + "\\s+of\\s+" + SEVEN,
    S + ",\\s+" + SEVEN_BARE + "['’]s\\b",
    SEVEN_BARE + "['’]s\\s+(?:(?:own|newest|new|latest|youngest|fastest)\\s+)?(?:(?:member|addition|recruit|hero|heroine|star|speedster)\\s*,?\\s+)?" + S,
    "\\b(?:[Nn]ewest|[Nn]ew|[Ll]atest|[Ss]eventh|[Yy]oungest)\\s+(?:member|addition|recruit|face|hero|heroine)\\s+(?:of|to|in)\\s+" + SEVEN_BARE + "[,:—–-]?\\s+(?:[\\w-]+\\s+){0,2}?" + S,
    "\\bSeven\\s+(?:member|hero|heroine|speedster|star)\\s+" + S,
    "\\b(?:[Rr]eplac\\w*|[Ss]ucceed\\w*)\\s+(?:" + DEPARTING + "|him|her)\\s+with\\s+" + S,
    "\\b(?:replaced|succeeded)\\s+by\\s+" + S,
    S + GAP + "\\b(?:replaces|replaced|replacing|succeeds|succeeded|succeeding|took over for|took over from)\\s+" + DEPARTING,
    S + GAP + "\\b(?:took|takes|taking|filled|fills|filling|claimed|claims|won|wins|inherited|inherits|got|gets|earned|earns)\\s+(?:" + DEPARTING + "['’]s|the\\s+(?:empty|open|vacant|seventh))\\s+(?:[\\w-]+\\s+)?(?:seat|spot|place|slot)\\b",
    SEVEN_BARE + GAP + "\\b(?:welcomed|welcomes|added|adds|drafted|drafts|inducted|inducts|recruited|recruits)\\s+(?:[\\w-]+\\s+){0,2}?" + S + "(?=\\s+(?:to|into)\\s+(?:the\\s+)?(?:team|fold|ranks|roster|lineup)\\b|\\s+as\\s+(?:a|an|the|its)\\s+(?:\\w+\\s+)?member\\b|\\s*[.,;!]|\\s*$)",
    "\\b(?:added|adds|drafted|drafts|inducted|inducts|brought|brings|named|names|put|puts|placed|places|voted|votes)\\s+" + S + "\\s+(?:in)?to\\s+" + SEVEN
  ].map((x) => new RegExp(x));
  // "took his seat" counts only next to the Seven or a member leaving it, and not "took her seat at the table"
  const seatRe = (S) => new RegExp(S + GAP + "\\b(?:took|takes|taking|filled|fills|filling|claimed|claims|inherited|inherits)\\s+(?:his|her|their|the)\\s+(?:(?:empty|open|vacant)\\s+)?(?:seat|spot|place)\\b(?!\\s+(?:at|on|beside|next|across|by|near|behind|in\\s+front|in\\s+(?!" + SEVEN_BARE + ")|among|opposite|facing|between|under|around|up|down|to|with|inside|outside|for)\\b)");
  const leaveRes = (P) => [
    P + GAP + "\\b(?:retire|retires|retired|retiring|resign|resigns|resigned|resigning|step down|steps down|stepped down|stepping down|bow out|bows out|bowed out)\\b(?=\\s*[.,;:!?\"”'’)—–]|\\s+(?:from|last|this|that|in|after|at|and|to\\s+focus|to\\s+spend|to\\s+pursue|citing|quietly|abruptly|suddenly|for\\s+good)\\b|\\s*$)",
    P + GAP + "\\b(?:left|leaves|leaving|quit|quits|quitting|exited|exits|(?:was|got)\\s+(?:kicked|thrown|forced|pushed|voted|booted)\\s+out\\s+of|is\\s+(?:out|gone)\\s+(?:of|from))\\s+" + SEVEN,
    P + "['’]s\\s+[\"“'‘]?(?:retirement|resignation|departure|exit|replacement|firing|ouster|old seat|empty seat|vacant seat|seat went)\\b",
    "\\b(?:[Rr]eplac(?:e|es|ed|ing)|[Ss]ucceed(?:s|ed|ing)?)\\s+" + P,
    P + GAP + "\\b(?:was|is|got|gets|getting|being|had been|has been|been)\\s+(?:(?:quietly|finally|officially|abruptly)\\s+)?(?:replaced|retired|fired(?!\\s+(?:up|upon|on|at)\\b)|forced out|pushed out|kicked out|let go|ousted|removed from\\s+" + SEVEN + ")",
    "\\b(?:[Ff]ormer|[Ee]x-|[Rr]etired)\\s*(?:Seven\\s+)?(?:(?:member|hero|speedster)\\s+)?" + P,
    P + ",\\s+(?:who\\s+(?:had\\s+)?(?:retired|left|quit)|formerly\\s+of|now\\s+retired|recently\\s+retired|newly\\s+retired)\\b"
  ].map((x) => new RegExp(x));
  const S_STARLIGHT = "(?:\\bStarlight\\b|\\bAnnie(?:\\s+January)?\\b)", S_DEEP = "\\b[Tt]he Deep\\b", S_ATRAIN = "\\bA-Train\\b",
    S_MARATHON = "\\b(?:Mister|Mr\\.?)\\s*Marathon\\b", S_LAMP = "\\bLamplighter\\b", S_TRANS = "\\bTranslucent\\b", S_MAEVE = "\\b(?:Queen\\s+)?Maeve\\b";
  const joinFix = (name) => (i) => name + " is not in the Seven and never has been (it's " + fmt(i) + "); the lineup is exactly the one this note lists. A recent reply put " + name + " in it, which was a mistake.";
  const leaveFix = (name, extra) => (i) => name + " is " + (extra || "") + "still in the Seven (it's " + fmt(i) + "): no retirement, replacement, or exit. A recent reply said otherwise, which was a mistake.";
  const join = (S, until, name, who, more, after) => ({ key: name + " joins", after, S, until, who, res: joinRes(S).concat((more || []).map((x) => new RegExp(x))), seat: seatRe(S), fix: joinFix(name) });
  const leave = (P, since, until, name, who, more, extra) => ({ key: name + " leaves", S: P, since, until, who, res: leaveRes(P).concat((more || []).map((x) => new RegExp(x))), seat: null, leave: true, fix: leaveFix(name, extra) });
  const EARLY = [
    join(S_DEEP, D(2010, 6), "The Deep", ["The Deep"]),
    join(S_ATRAIN, D(2015, 5), "A-Train", ["A-Train", "Mister Marathon"], [S_ATRAIN + GAP + "\\b(?:beat|beats|beaten|outran|outruns|outraced|outraces|outpaced|defeated|defeats|smoked)\\s+(?:Mister|Mr\\.?)\\s*Marathon\\b"], "Mister Marathon leaves"),
    join(S_STARLIGHT, D(2019, 5), "Starlight (Annie January)", ["Annie January (Starlight)", "Lamplighter"], null, "Lamplighter leaves"),
    join("\\bStormfront\\b", D(2020, 9), "Stormfront", ["Stormfront", "Translucent"], null, "Translucent leaves"),
    join("\\bSupersonic\\b", D(2022, 6), "Supersonic", ["Supersonic"]),
    join("\\bSister Sage\\b", D(2024, 11), "Sister Sage", ["Sister Sage"]),
    join("\\bFirecracker\\b", D(2024, 11), "Firecracker", ["Firecracker"]),
    join("\\bSoldier Boy\\b", D(2026, 2), "Soldier Boy", ["Soldier Boy"]),
    leave(S_MARATHON, 0, D(2015, 5), "Mister Marathon", ["Mister Marathon", "A-Train"], [S_MARATHON + GAP + "\\blost\\s+(?:his\\s+(?:seat|spot|place)|(?:the|a|that|his)\\s+(?:[\\w-]+\\s+)?race\\s+to\\s+A-Train|to\\s+A-Train)"]),
    leave(S_LAMP, 0, D(2019, 5), "Lamplighter", ["Lamplighter"]),
    leave(S_TRANS, 0, D(2019, 5), "Translucent", ["Translucent"], [
      S_TRANS + GAP + "\\b(?:is|was|went|has been|had been|got)\\s+(?:(?:off|away)\\s+)?(?:on\\s+(?:a|some)\\s+(?:classified|secret)\\s+mission|missing\\b(?!\\s+(?:his|her|the|a|an|out|it|them|you|work|class|school)\\b)|declared dead|presumed dead|killed|murdered|dead\\b(?!\\s+(?:tired|serious|set|silent|still|wrong|right|ahead|last|calm|quiet|sure|cold|asleep|drunk|end|weight)\\b))",
      S_TRANS + "['’]s\\s+(?:death|funeral|murder|killing|corpse|memorial|obituary)\\b",
      S_TRANS + GAP + "\\b(?:died|dies)\\b"], "alive and "),
    leave(S_DEEP, D(2010, 6), D(2019, 6), "The Deep", ["The Deep"], [
      S_DEEP + GAP + "\\b(?:was|is|got|gets|been|being)\\s+(?:exiled|banished|shipped off|sent away|sent to (?:Ohio|Sandusky))",
      S_DEEP + "['’]s\\s+(?:exile|banishment|sabbatical)\\b",
      S_DEEP + GAP + "\\b(?:in|to)\\s+Sandusky\\b"], "in New York and "),
    leave(S_ATRAIN, D(2015, 5), D(2020, 10), "A-Train", ["A-Train"]),
    leave(S_MAEVE, D(2004, 6), D(2022, 6), "Queen Maeve", ["Queen Maeve"]),
    leave(S_STARLIGHT, D(2019, 5), D(2022, 6), "Starlight", ["Annie January (Starlight)"]),
    { key: "Compound V", S: "\\bCompound V\\b", until: D(2020, 10), who: [], seat: null, res: [
      "\\bCompound V\\b" + GAP + "\\b(?:was|is|has been|had been|got|gets|went)\\s+(?:(?:finally|officially|now)\\s+)?(?:leaked|exposed|revealed|made public|public|out|public knowledge|all over the news|everywhere)\\b",
      "\\b(?:[Tt]he\\s+)?(?:public|world|[Ee]veryone|[Aa]merica|country|press|media|reporters|nation)\\s+(?:now\\s+|finally\\s+)?(?:knows?|knew|learned|learns|found out|finds out)\\s+(?:about\\s+)?(?:Compound V|that\\s+(?:Supes|supes|heroes)\\s+(?:are|were)\\s+(?:made|manufactured|created|engineered))",
      "\\b(?:[Ll]eak|[Ll]eaked|[Ll]eaks|[Ee]xposure|[Rr]evelation)\\s+(?:of\\s+)?Compound V\\b"].map((x) => new RegExp(x)),
      fix: (i) => "Compound V is still Vought's secret (it's " + fmt(i) + "): the public, the press and most Supes believe powers are inborn. A recent reply said it was out, which was a mistake." }
  ];
  const HEDGE_EARLY = /\b(?:if|unless|whether|would|could|might|should|will|shall|gonna|going to|wants?|wanted|wish\w*|hope\w*|hoping|dream\w*|someday|one day|plan\w*|intend\w*|threat\w*|rumou?r\w*|gossip\w*|heard|hears?|speculat\w*|predict\w*|imagin\w*|pretend\w*|fantas\w*|movies?|films?|comics?|episodes?|video games?|toys?|action figures?|posters?|cosplay\w*|costumes?|fan ?fic\w*|audition\w*|try ?outs?|trying out|appl(?:y|ies|ied|ying)|application|campaign\w*|lobb(?:y|ies|ied|ying)|petition\w*|not|never|nobody|no one|none|neither|nor|without|isn['’]t|wasn['’]t|aren['’]t|weren['’]t|won['’]t|didn['’]t|doesn['’]t|don['’]t|hasn['’]t|haven['’]t|hadn['’]t|can['’]t|cannot|couldn['’]t|wouldn['’]t|shouldn['’]t|almost|nearly|wonder\w*|guess\w*|bets?|odds|favou?rite|tipped|expect\w*|likely|probably|maybe|perhaps|supposedly|allegedly)\b/i;
  const HEDGE_MAY = /\bmay\b/;   // lowercase: the month stays
  // A follow-up to a cut sentence that makes no sense alone: "The public ate it up."
  const ECHO = /^\s*(?:The\s+(?:announcement|news|move|decision|switch|change|swap|replacement)\b|(?:The\s+(?:public|press|fans|media|country|world|internet|crowd|nation)|Fans|Everyone|America|People)\b[^.!?\n]{0,50}\b(?:it|this|that|the news|her|him|them)\b)/;
  const earlyClaim = (sent, prev, active) => {
    const hits = [];
    if (/\?\s*["”’)]*\s*$/.test(sent) || (sent.match(/["“”]/g) || []).length % 2 === 1) return hits;   // a question, or half a quote
    const clean = (m) => !HEDGE_EARLY.test(sent.slice(0, m.index + m[0].length)) && !HEDGE_MAY.test(sent.slice(0, m.index + m[0].length));
    for (const e of active) {
      let hit = e.res.some((R) => { const m = R.exec(sent); return !!m && clean(m); });
      if (!hit && e.seat && NEAR_SEVEN.test(prev + " " + sent)) { const m = e.seat.exec(sent); hit = !!m && clean(m); }
      if (hit) hits.push(e);
    }
    return hits;
  };
  const ABBR_DOT = /\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|Prof|Gen|Sgt|Lt|Capt|Col|Mt|vs)\./g;
  const NOTE_LINE = /\[(?:Author['’]?s note|Status \(for the narrator)/;
  const tokensOf = (raw) => raw.replace(ABBR_DOT, "$1\u0002").match(/[^.!?\n]+(?:[.!?]+["'”’)]*)?[ \t]*|[.!?]+["'”’)]*[ \t]*|\n/g) || [];
  // story = false: the reply (cut, and the AI is told); story = true: the story so far as the AI reads it (cut quietly,
  // so early canon already written into the story, before this script or by hand, stops steering the AI)
  const guardEarlyCanon = (raw, story) => {
    const i = T.idx;
    const input = unify((T.turn && !T.turn.cmd && T.turn.input) || "");
    const facts = (T.facts || []).join("\n");
    const sc = changeOf("the Seven");
    const inSeven = !!sc && sc.k === "member" && sc.at <= i;
    T.allow = T.allow || {};
    const live = EARLY.filter((e) => i < e.until && !(e.since && i < e.since) && !e.who.some((n) => changeOf(n)) &&
      !(e.key in T.allow) && !(e.after && e.after in T.allow) && !new RegExp(e.S).test(facts) && !(e.leave && inSeven));
    if (!live.length) return raw;
    const turnNo = count === null ? -1 : count;
    // what the player's own action says happens is theirs: it stands from now on
    const mine = live.filter((e) => new RegExp(e.S).test(input));
    if (!story && mine.length) {
      let p = "";
      for (const t of tokensOf(input)) { if (t === "\n") continue; const x = t.replace(/\u0002/g, "."); for (const e of earlyClaim(x, p, mine)) T.allow[e.key] = turnNo; p = x; }
    }
    const active = live.filter((e) => !(e.key in T.allow) && !(story && mine.includes(e)));
    if (!active.length) return raw;
    const any = new RegExp(active.map((e) => e.S).join("|"));
    if (!any.test(raw)) return raw;
    const out = [];
    let prev = "", cutPrev = false, note = false;
    for (const t of tokensOf(raw)) {
      if (t === "\n") { out.push(t); prev = ""; cutPrev = false; note = false; continue; }
      const sent = t.replace(/\u0002/g, ".");
      if (NOTE_LINE.test(sent)) note = true;   // a bracketed note is never cut
      let hits = note || !any.test(sent) ? [] : earlyClaim(sent, prev, active);
      if (hits.length && !story && hits.some((e) => mine.includes(e))) {   // the reply carries out the player's action
        for (const e of hits) T.allow[e.key] = turnNo;
        hits = [];
      }
      if (hits.length && !story) for (const e of hits) addFix(e.fix(i));
      if (hits.length || (cutPrev && !note && sent.length <= 60 && ECHO.test(sent))) cutPrev = true;
      else { out.push(sent); cutPrev = false; }
      prev = sent;
    }
    const s = out.join("").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n");
    return s.trim() ? s : raw;
  };

  // ---------- story cards: canon history so far, never the future ----------
  // AI Dungeon fits story cards into the context before this script runs, so card text the script hides still costs
  // room. Each card's "Canon schedule:" is rebuilt here to hold only what has happened by the story's month: future
  // canon costs no context and spoils nothing, and it fills back in as time passes. Cards are found by their keys; a
  // card the player re-keyed keeps its own schedule, cut back to the past.
  const CARD_SCHED = {"Homelander":[[15336,"December 2011: he sexually assaults Becca Butcher; Vought hides her from him, and later the son she has by him."],[18070,"June 23, 2019: he kills Madelyn Stillwell."],[18071,"June 24, 2019: he finds Becca and his son, Ryan, alive in Vought's compound."],[18544,"October 2020: Stormfront's lover."],[19150,"June 2022: takes control of Vought."],[19157,"June 14, 2022: takes Ryan in."],[20094,"From January 6, 2025: rules the country through President Calhoun."],[20548,"April 5, 2026: stripped of his powers and killed by Billy Butcher on live TV."]],"Maeve,Maggie Shaw":[[13679,"2007: her film Queen Maeve: Her Majesty."],[18051,"June 4, 2019: she and Homelander abandon Flight 37."],[18541,"October 6, 2020: Homelander outs her on TV; she's back with Elena."],[18550,"October 15, 2020: she helps stop Stormfront."],[19157,"June 14, 2022: she loses an eye, then her powers, stopping Soldier Boy; the world thinks she died, but she lives in hiding with Elena."]],"Noir":[[18548,"October 13, 2020: Maeve drops him with an Almond Joy (a coma, months of recovery)."],[19157,"June 14, 2022: Homelander kills him for hiding who his father is; the public never learns."],[19188,"From July 2022 Vought secretly puts an actor Supe in the suit (Black Noir II, born late 1980s: he flies, talks nonstop in private, and falls asleep at bad moments)."],[20527,"March 15, 2026: The Deep kills Black Noir II."]],"Translucent":[[18041,"May 25, 2019: Billy Butcher and Hughie Campbell capture him."],[18043,"May 27, 2019: Hughie kills him with a bomb placed inside him. Vought tells the public he is on a classified mission."],[18535,"September 30, 2020: Vought announces his death, blames a Supe-terrorist, and holds a funeral."]],"Kevin Kohler,Kevin Moskowitz,The Deep's,The Deep says,The Deep said,The Deep asks,The Deep asked,The Deep looks,The Deep is,The Deep was,The Deep.":[[12418,"Until 2010: a student at Godolkin University, coached by Professor Brinkerhoff and president of the Gamma Epsilon Delta fraternity."],[13679,"2007: he stars in the Vought film Rising Tide."],[14761,"June 2010: he graduates and is drafted into the Seven, filling its last seat."],[18040,"May 24, 2019: he coerces the new member Starlight sexually."],[18068,"June 21, 2019: after she speaks out, Vought makes him apologize on TV and exiles him to Sandusky, Ohio."],[18536,"October 1, 2020: joins the Church of the Collective."],[19147,"June 4, 2022: Homelander brings him back into the Seven."],[20033,"From November 2024: Homelander's errand boy."],[20548,"April 5, 2026: Starlight blasts him into the sea and the creatures he betrayed kill him."]],"Lamplighter":[[16570,"May 2015: Grace Mallory's Boys blackmail him into spying on the Seven; he goes to kill Mallory and burns her two grandchildren to death by mistake. He never tells Vought the Boys exist."],[18031,"May 2019: Stan Edgar forces him out of the Seven (announced as retirement) and posts him as an orderly at Sage Grove Center, where he burns failed test patients."],[18548,"October 13, 2020: the Boys find him; he sets himself on fire in the Seven's meeting room."]],"Mister Marathon,Mr. Marathon":[[16586,"May 31, 2015: at the Vought Hero Draft he loses a public race to A-Train, fresh out of Godolkin, and Vought gives A-Train his seat; Homelander refuses him a rematch and he never forgives it. Afterwards he moves to Los Angeles, makes cheap superhero movies for other studios, deals drugs to rich clients, and collects Vought memorabilia."],[20524,"March 12, 2026: Homelander, hunting V-One, stomps his head in."]],"A-Train,atrain,Reggie Franklin,Nathan Franklin":[[16586,"May 31, 2015: beats Mister Marathon in a public race at the Vought Hero Draft and joins the Seven, its first Black member."],[18036,"About May 20, 2019: high on Compound V, he runs through Robin Ward and kills her."],[18053,"June 6, 2019: kills Popclaw with a forced heroin overdose to keep her quiet."],[18070,"June 23, 2019: a heart attack."],[18540,"October 2020: fired from the Seven."],[18846,"August 2021: back in."],[19151,"June 2022: a racist Supe, Blue Hawk, cripples Nathan; A-Train kills him."],[20036,"November 2024: informs for the Boys."],[20082,"December 25, 2024: exposed, he flees with his family."],[20496,"February 12, 2026: saves Hughie Campbell, and Homelander kills him."]],"Annie January,Starlight,Donna January":[[18040,"May 24, 2019: at 23 she joins the Seven, replacing Lamplighter; that day The Deep coerces her sexually. She meets Hughie Campbell and they fall in love."],[18053,"June 6, 2019: she speaks out at Believe Expo."],[18547,"October 2020: she leaks Compound V to the press and is locked up in Vought Tower as a traitor."],[18551,"October 16, 2020: reinstated."],[19151,"June 8, 2022: she quits on a live stream and accuses Homelander, then leads the Starlighters."],[20094,"January 6, 2025: she escapes arrest and leads the underground resistance."],[20549,"April 2026: she survives and still works as a hero."]],"Stormfront,Klara Risinger,Klara Vought,Clara Vought":[[18535,"From September 30, 2020: she oversees Vought's Compound V tests at Sage Grove Center and courts the public against \"Supe-terrorists\"."],[18539,"October 4, 2020: kills Kenji Miyashiro."],[18544,"October 2020: Homelander's lover."],[18550,"October 15, 2020: exposed as a Nazi; Ryan's heat vision burns off three of her limbs, and Vought disowns her."],[19146,"June 3, 2022: she kills herself."]],"Soldier Boy,Nicaragua":[[19149,"June 2022: the Boys free him from a Russian lab."],[19150,"June 7, 2022: his blast kills 19 people in Midtown Manhattan; he hunts down Payback."],[19157,"June 14, 2022: he attacks Vought Tower, is stopped, and is put back in cryo-sleep in CIA custody."],[20497,"February 2026: Homelander thaws him and makes him the Seven's number two."],[20545,"April 2026: Homelander chokes him out and freezes him again."]],"Stillwell,Madelyn":[[16586,"May 31, 2015: she introduces A-Train on TV as the Seven's new member."],[17897,"By 2019 she has a baby son, Teddy, and Stan Edgar is lining her up for more."],[18070,"June 23, 2019: Homelander learns she lied about his son and kills her at her home with his heat vision; the public blames Billy Butcher."]],"Edgar":[[18535,"September 30, 2020: he brings Stormfront into the Seven."],[19149,"About June 6, 2022: Victoria Neuman turns on him in public and he is forced out, then hunted."],[20095,"2025: hiding in a bunker."],[20500,"February 2026: captured."],[20549,"April 2026: freed, CEO again."]],"Vogelbaum":[[17897,"by 2019 he has retired to a country house, full of regret for what he made."],[18544,"October 2020: the Boys push him to testify against Vought."],[18549,"October 14, 2020: at the congressional hearing his head explodes with the others (Victoria Neuman's doing)."]],"Ashley Barrett,Ashley":[[18040,"May 2019: she handles Starlight's debut."],[18067,"June 2019: fired after Starlight's speech at Believe Expo."],[18078,"July 2019: brought back as Senior VP of Hero Management after Stillwell's death; she has the title, but Homelander does as he likes and Stan Edgar gives the real orders."],[19150,"June 2022: CEO of Vought in name, Homelander's frightened puppet."],[20095,"January 2025: injects Compound V."],[20465,"2026: Vice President under Calhoun."],[20544,"April 1, 2026: President, after Homelander kills Calhoun."],[20549,"April 6, 2026: impeached and removed."]],"Neuman,Nadia Khayat":[[18262,"By 2020 she is a young New York congresswoman who campaigns against Vought."],[18535,"Secret: on September 30, 2020 she kills CIA deputy director Susan Raynor."],[18549,"Secret: on October 14, 2020 she kills the witnesses at the congressional hearing."],[18552,"October 17, 2020: put in charge of a new federal office to police Supes (the FBSA), Hughie Campbell's boss."],[19149,"June 6, 2022: she betrays Stan Edgar."],[19158,"June 15, 2022: Robert Singer's running mate."],[20032,"November 5, 2024: elected Vice President."],[20094,"January 6, 2025: Homelander outs her as a Supe on live TV, and Billy Butcher kills her."]],"Popclaw":[[18044,"May 2019: high on V, she crushes her landlord's skull by accident; the Boys blackmail her into giving up A-Train's Compound V supply."],[18053,"June 6, 2019: A-Train kills her with a forced heroin overdose to keep her quiet."]],"The Legend's,The Legend says,The Legend said,The Legend is,The Legend was,called The Legend":[[19150,"June 2022: he shelters Soldier Boy."],[20454,"2026: hiding under a false name at a movie theater."]],"Sage Grove":[[18031,"From late May 2019 Lamplighter works there as an orderly, burning the failures and the evidence."],[18544,"October 2020: the Boys break in; a patient named Cindy, who crushes things by clenching her fist, escapes with others in a riot. The program later yields Temp V (V24)."]],"Compound V,Temp V,V24,V-One":[[18539,"October 4, 2020: the secret is leaked to the press, and Vought blames rogue scientists."],[19146,"From June 2022: Temp V (V24), a green serum that gives an adult powers for 24 hours and kills after a few doses."],[20498,"February 2026: V-One, Frederick Vought's original 1940s formula, is far stronger: its few carriers (Soldier Boy, Stormfront) don't age, and the Supe virus can't kill them."]],"Red River":[[16601,"June 2015: Marie Moreau, 10, arrives after her powers kill her parents; she stays until she wins a place at Godolkin."],[18078,"July 2019: Madelyn Stillwell's teleporting baby, Teddy, is placed there."],[19597,"August 2023: Marie Moreau leaves for Godolkin."]],"Godolkin,at God U,to God U,God U's,God U student,Vought Hero Draft":[[19599,"August 30, 2023: its top student kills Brinkerhoff and himself."],[19622,"September 22, 2023: The Woods is exposed and there is a massacre on campus."]],"Vought News Network,VNN,Cameron Coleman":[[20038,"November 11, 2024: wrongly taken for the Boys' informant, Coleman is beaten to death by the Seven."]],"Church of the Collective,Alastair Adana":[[18536,"October 2020: it takes in The Deep in Sandusky, arranges him a wife, and courts A-Train."],[18554,"October 2020: Adana offers Victoria Neuman dirt on a dozen Supes, and she bursts his head in secret; the Church calls it a disappearance."]],"Federal Bureau of Superhuman Affairs,FBSA,Bureau of Superhuman Affairs":[[18552,"October 2020: created after the Compound V scandal, with Congresswoman Victoria Neuman in charge and Hughie Campbell on her staff; from 2021 the Boys work for it on contract. It arrests only the Supes Vought lets it have."],[20094,"From January 2025: powerless under martial law."],[20563,"April 20, 2026: relaunched."]],"Starlighters,Starlighter,Hometeamers,Hometeamer,Freedom Camp,Starlight House":[[19159,"June 16, 2022: Homelander kills a Starlighter in public and is cheered."],[20033,"November 2024: three Hometeamers are murdered on Homelander's orders and Starlighters are framed."],[20095,"January 2025: under martial law \"Starlighter\" becomes a crime; suspects are rounded up into numbered Freedom Camps guarded by Supes."],[20549,"April 2026: the camps are opened."]],"Billy Butcher,William Butcher,Butcher's,Butcher says,Butcher said,Butcher looks,Butcher is,Butcher was,Butcher.":[[15363,"January 24, 2012: Becca vanishes."],[15445,"April 2012: CIA officer Grace Mallory tells him Homelander sexually assaulted his wife; he helps found the Boys and hunts Supes."],[16577,"May 2015: the team is disbanded."],[18040,"May 24, 2019: he recruits Hughie Campbell and rebuilds the Boys."],[18071,"June 2019: blamed for Madelyn Stillwell's murder, a fugitive; learns Becca is alive."],[18550,"October 15, 2020: Becca dies."],[18552,"October 17, 2020: cleared."],[19146,"June 2022: starts taking Temp V, which gives him a fatal brain tumor."],[20094,"January 6, 2025: the tumor gives him powers; he kills Victoria Neuman and takes a virus that kills Supes."],[20548,"April 5, 2026: kills Homelander. He works from the shadows: no press, no public fights, never on camera if he can help it."],[20549,"April 6, 2026: tries to release the virus and is shot dead by Hughie."]],"Becca,Rebecca Butcher,Becca Saunders":[[15332,"December 24, 2011: at Vought's Christmas party she introduces Billy to Homelander; days later Homelander sexually assaults her."],[15363,"January 24, 2012: she is last seen on Vought's cameras and vanishes. Secret: pregnant, she went to Madelyn Stillwell and Jonah Vogelbaum; Vought made her sign an NDA and hides her in a guarded suburban compound. Homelander isn't told. Her family presumes her dead; Billy believes Homelander killed her."],[15598,"September 2012: Secret: she has Homelander's son, Ryan, and raises him in the compound."],[18071,"June 24, 2019: Billy and Homelander both find her alive."],[18550,"October 15, 2020: Ryan's heat vision kills her by accident as he saves her from Stormfront."]],"Hughie,Hugh Campbell":[[17897,"by 2019, at 27, he still lives with his father, sells electronics at Bryman Audio-Visual, and loves his girlfriend, Robin Ward."],[18036,"About May 20, 2019: A-Train runs through Robin in front of him. He refuses Vought's hush money."],[18040,"May 24, 2019: Billy Butcher recruits him; he meets Annie January, and they fall in love."],[18043,"May 27, 2019: he kills Translucent."],[18554,"From October 2020: on Victoria Neuman's staff; from 2021 a senior analyst at the Federal Bureau of Superhuman Affairs."],[19158,"June 2022: he leaves the FBSA."],[20038,"November 11, 2024: his father dies."],[20094,"January 2025: sent to a Freedom Camp."],[20496,"February 12, 2026: freed."],[20549,"April 6, 2026: he shoots Billy Butcher to stop him wiping out every Supe. Afterwards he runs an audio store with Annie."]],"Robin Ward":[[18036,"About May 20, 2019, as she steps off a New York curb holding Hughie's hands, A-Train runs through her at superspeed and kills her instantly. Vought calls it an accident during a pursuit and offers Hughie $45,000 to sign an NDA."]],"Mother's Milk,Mother’s Milk,Marvin Milk,M.M.":[[15445,"2012: he joins Grace Mallory's Boys; his daughter, Janine, is born June 2, 2012."],[16577,"After the Boys disband in May 2015 he becomes a juvenile detention counselor and later marries Monique."],[18043,"May 27, 2019: Butcher pulls him back in."],[20094,"January 2025: sent to a Freedom Camp."],[20496,"February 12, 2026: freed."],[20549,"April 2026: he survives, remarries Monique, and takes in Ryan."]],"Frenchie,Cherie":[[15491,"May 2012: arrested after a bank robbery, he is recruited by Grace Mallory into the Boys."],[16570,"May 2015: he leaves his post tailing Lamplighter to save Jay from an overdose, and Mallory's grandchildren die; he carries the guilt and drifts back into crime."],[18051,"June 2019: back with Butcher, he frees Kimiko and stays devoted to her."],[20094,"January 2025: sent to a Freedom Camp."],[20496,"February 12, 2026: freed."],[20546,"April 3, 2026: mortally wounded luring Homelander into a uranium room, he dies in Kimiko's arms after giving her the power to strip Supes' powers."]],"Kimiko,Kenji,Miyashiro":[[18051,"June 4, 2019: the Boys free her from a Triad cage under a bodega in New York; the Shining Light Liberation Army, who used her and her brother Kenji as child soldiers, smuggled her into the US, where she was injected with Compound V. She is ferociously strong and heals from almost anything, even a snapped neck; anesthetic gas knocks her out. Frenchie understands her best."],[18539,"October 4, 2020: Stormfront kills her brother Kenji, a telekinetic."],[19149,"June 6, 2022: Soldier Boy's blast strips her powers."],[19156,"June 13, 2022: she takes Compound V again by choice."],[20094,"January 6, 2025: seized with the Boys, she speaks her first word."],[20548,"April 5, 2026: she uses Frenchie's last gift, a power-stripping blast, on Homelander, survives, and later leaves for France."]],"Little Nina":[[19149,"June 2022: she sells the Boys access to the Russian lab where Soldier Boy is held, and loses her hold on Frenchie."]],"Mallory":[[15445,"April 2012: she tells Billy Butcher what Homelander did to his wife and founds the Boys with him, a deniable CIA unit that spies on and blackmails Supes (Butcher, Mother's Milk, Frenchie)."],[16570,"May 2015: Lamplighter comes to kill her and burns her two grandchildren to death; she disbands the Boys and retires."],[18070,"June 2019: Butcher comes to her for help."],[18552,"From October 2020: she hides and raises Ryan for the CIA."],[20094,"January 6, 2025: Ryan kills her by accident."]],"Ryan Butcher,Homelander's son,Becca's son,Becca and Ryan,Ryan and Becca,Ryan's,Ryan says,Ryan looks,Ryan is,Ryan was":[[18071,"June 24, 2019: Homelander and Billy Butcher both learn of him."],[18550,"October 2020: saving his mother from Stormfront, his heat vision maims Stormfront and kills Becca by accident."],[18552,"October 17, 2020: he goes into CIA hiding with Grace Mallory."],[19157,"June 14, 2022: he leaves with Homelander and lives in Vought Tower."],[20094,"January 6, 2025: he accidentally kills Mallory and runs."],[20500,"February 2026: Homelander beats him nearly to death."],[20548,"April 5, 2026: Kimiko's blast takes his powers along with Homelander's; afterwards he lives with Mother's Milk's family."]],"Raynor,Rayner":[[18051,"June 2019: she refuses to move against Vought without proof."],[18535,"September 30, 2020: as she starts to tell the Boys about a coup inside the government, her head explodes (Victoria Neuman's doing)."]],"Sister Sage,Jessica Bradley":[[20033,"November 6, 2024: Homelander recruits her as his strategist."],[20036,"November 9, 2024: she joins the Seven and starts planning the coup that will make Steven Calhoun President."],[20363,"October 2, 2025: CEO of Vought."],[20527,"March 15, 2026: she turns on Homelander and helps the Boys."],[20547,"April 4, 2026: Kimiko's blast takes her powers, and she walks away."]],"Firecracker,Sparkler,Misty Tucker Gray":[[20035,"November 2024: Sister Sage brings her to Homelander."],[20036,"November 9, 2024: she joins the Seven and becomes Vought News Network's loudest voice. She worships Homelander."],[20524,"March 2026: he learns she doubts he is God and kills her."]],"Drummer Boy,Super-Sweet,Supersonic's,Supersonic says,Supersonic said,Supersonic is,Supersonic was,hero Supersonic,named Supersonic":[[19147,"June 4, 2022: he wins a place in the Seven."],[19148,"June 5, 2022: Homelander learns he is plotting with Starlight and kills him."]],"Tek Knight,Robert Vernon":[[19603,"September 2023: he investigates the deaths at Godolkin for Vought."],[20038,"November 2024: he hosts Homelander's backers and offers his prisons for the coming round-ups."],[20039,"November 12, 2024: his butler strangles him."]],"Robert Singer,Dakota Bob,President Singer,Secretary Singer":[[17897,"In 2019: Secretary of Defense; he resists putting Supes in the military."],[18070,"June 23, 2019: he approves it."],[19158,"June 2022: running for President, with Victoria Neuman as his running mate."],[20032,"November 5, 2024: elected."],[20094,"January 6, 2025: framed for Neuman's murder and jailed while Steven Calhoun takes power."],[20549,"April 2026: freed and President again."]],"Calhoun":[[20094,"January 2025: with Robert Singer arrested, he becomes President, declares martial law, deputizes Supes under Homelander, and has \"Starlighters\" rounded up into Freedom Camps. He governs as Homelander's rubber stamp."],[20465,"From early 2026 Ashley Barrett is his Vice President."],[20544,"April 1, 2026: Homelander crushes his skull."]],"Oh Father,Oh-Father":[[20183,"2025: he marries Ashley Barrett."],[20497,"February 2026: he preaches at A-Train's memorial."],[20513,"March 1, 2026: he founds the Democratic Church of America with Homelander as its Prophet."],[20548,"April 5, 2026: Mother's Milk kills him."]],"Mesmer's,Mesmer says,Mesmer said,Mesmer is,Mesmer was,Mesmer reads,Mesmer looks,Mesmer.,The Mesmerizer":[[18068,"June 2019: the Boys use him to read Kimiko; he sells them out to Homelander."],[18069,"June 22, 2019: Billy Butcher beats him to death."]],"against Shockwave,beat Shockwave,beats Shockwave,speedster Shockwave,hero Shockwave,Shockwave and A-Train,A-Train and Shockwave":[[18044,"May 28, 2019: he loses a televised race to A-Train, who is doped on Compound V."],[18540,"October 2020: Vought lines him up to replace A-Train in the Seven."],[18549,"October 14, 2020: his head explodes at the congressional hearing."]],"Ezekiel":[[18053,"June 2019: the Boys blackmail him at Believe Expo."],[20037,"November 2024: Billy Butcher kills him."]],"Marie Moreau,Marie,Moreau,Annabeth":[[16586,"May 31, 2015: at 10 her power appears and kills both her parents; she and her little sister, Annabeth, are separated. From June 2015 she lives at Red River Institute, guarded and well-behaved, practicing in secret."],[19597,"August 2023: she wins a place at Godolkin University."],[19622,"September 22, 2023: after uncovering the lab under Godolkin, she is locked in Elmira."],[20366,"October 5, 2025: she kills Thomas Godolkin and joins Starlight's resistance."]],"Emma Meyer,Little Cricket":[[19597,"August 2023: a Godolkin freshman and Marie Moreau's roommate."],[19622,"September 22, 2023: locked in Elmira."],[20352,"September 2025: back at Godolkin."],[20366,"October 2025: with Starlight's resistance."]],"Jordan Li":[[19358,"by 2023 the second-ranked student at Godolkin University and Professor Brinkerhoff's teaching assistant."],[19622,"September 22, 2023: locked in Elmira."],[20352,"September 2025: back at Godolkin."],[20366,"October 2025: with Starlight's resistance."]],"Andre Anderson":[[19358,"by 2023 a popular Godolkin student and Golden Boy's best friend."],[19622,"September 22, 2023: locked in Elmira."],[20345,"2025: he dies in Elmira forcing open a steel door to free his friends."]],"Cate Dunlap,Dunlap":[[19358,"by 2023: Golden Boy's girlfriend and, secretly, Shetty's tool, wiping her friends' memories."],[19622,"September 22, 2023: she turns on humans; Vought names her a Guardian of Godolkin."],[20366,"October 2025: she breaks with Vought and joins Starlight's resistance."]],"Sam Riordan":[[0,"As a teenager he is committed to Sage Grove Center."],[18541,"October 2020: he kills a guard there, and Vought moves him to The Woods, the lab under Godolkin University."],[19622,"September 22, 2023: he leads the escaped test subjects in the campus massacre; Vought names him a Guardian of Godolkin."],[20366,"October 2025: with Starlight's resistance."]],"Luke Riordan,Golden Boy Luke":[[19358,"by 2023 he is Godolkin University's top-ranked student, Professor Brinkerhoff's protege, Cate Dunlap's boyfriend, and Vought's pick for the Seven. Secret: he was told Sam died; Cate has been erasing his memories of the lab under the school."],[19599,"August 30, 2023: he remembers, burns Brinkerhoff to death, and kills himself."]],"Brinkerhoff,Professor Brink,Coach Brink":[[19599,"August 30, 2023: Golden Boy burns him to death."]],"Shetty":[[18051,"June 4, 2019: her husband, Paul, and daughter, Lily, die on Flight 37; she later learns Homelander let them die. Secret: after that she runs The Woods, the lab under the campus, to create a virus that kills Supes."],[19621,"September 21, 2023: Cate Dunlap makes her cut her own throat."]],"Crimson Countess,Mindstorm,Swatto,TNT Twins,Payback team":[[19146,"June 3, 2022: Billy Butcher kills Gunpowder."],[19150,"June 7, 2022: Soldier Boy, back, kills Crimson Countess."],[19151,"June 8, 2022: Soldier Boy's blast at Herogasm kills the TNT Twins."],[19156,"June 13, 2022: Soldier Boy kills Mindstorm."],[19157,"June 14, 2022: Homelander kills Black Noir."]]};
  const CARD_LINES = {"The Seven":[[10592,"- 1999: Homelander debuts as leader, with Black Noir, Lamplighter, Translucent, and Mister Marathon."],[12692,"- 2004: Queen Maeve is drafted. The seventh seat stays open."],[14761,"- June 2010: The Deep is drafted. The classic seven."],[16586,"- May 31, 2015: A-Train replaces Mister Marathon."],[18040,"- May 24, 2019: Starlight replaces the retired Lamplighter."],[18043,"- May 27, 2019: Translucent dies (public: on a mission)."],[18068,"- June 2019: The Deep is exiled to Ohio."],[18535,"- September 30, 2020: Stormfront joins."],[18550,"- October 2020: Stormfront falls; A-Train is fired."],[18846,"- August 2021: A-Train is back."],[19147,"- June 4, 2022: The Deep returns; Supersonic joins (killed the next day)."],[19151,"- June 8, 2022: Starlight quits."],[19157,"- June 14, 2022: Black Noir is killed and secretly replaced; Maeve is presumed dead."],[20036,"- November 9, 2024: Sister Sage and Firecracker join."],[20499,"- February 15, 2026: Soldier Boy joins."],[20544,"- April 1, 2026: Homelander abolishes the team days before his death."]],"Mallory's Boys,Butcher's Boys,Butcher and the Boys,Hughie and the Boys,the Boys' safe house":[[0,"- Before April 2012 they don't exist."],[15445,"- April 2012: a secret CIA unit founded by Grace Mallory with Billy Butcher, Mother's Milk, and Frenchie."],[16577,"- May 2015: disbanded after Lamplighter killed Mallory's grandchildren; the members don't speak."],[18040,"- May 2019: Butcher rebuilds the team with Hughie Campbell, Frenchie, Mother's Milk, and Kimiko."],[18071,"- From June 24, 2019: fugitives."],[18552,"- October 2020: cleared; from 2021 working on contract for the Federal Bureau of Superhuman Affairs; Starlight helps from inside the Seven."],[19158,"- June 2022: Starlight joins them."],[19160,"- From June 2022: hunting Homelander and Victoria Neuman with CIA backing."],[20094,"- January 2025: seized under martial law; Butcher goes his own way with a virus that kills Supes."],[20496,"- February 2026: reunited against Homelander."],[20549,"- April 2026: Frenchie and Butcher are dead; the rest disband."]]};
  // (n: today's day number; a card's items show from their day)
  const syncCards = (i) => {
    if (typeof storyCards === "undefined" || !Array.isArray(storyCards)) return;
    for (let k = 0; k < storyCards.length; k++) {
      try {
        const c = storyCards[k];
        if (!c || typeof c.entry !== "string") continue;
        const keys = typeof c.keys === "string" ? c.keys : Array.isArray(c.keys) ? c.keys.join(",") : "";
        const has = (o) => Object.prototype.hasOwnProperty.call(o, keys);
        let e = c.entry.replace(/Canon schedule,[^:\n]{1,40}:/, "Canon schedule:");
        // a dated list, one line per date ("- May 31, 2015: ..."): only the lines whose date has come
        if (C.cardHistory && has(CARD_LINES)) {
          const ls = e.split("\n"), first = ls.findIndex((l) => /^- /.test(l));
          let last = -1; ls.forEach((l, n) => { if (/^- /.test(l)) last = n; });
          const nv = ls.findIndex((l) => /^Never:/.test(l));
          const cut = first >= 0 ? first : nv >= 0 ? nv : ls.length;
          const rest = first >= 0 ? ls.slice(last + 1) : nv >= 0 ? ls.slice(nv) : [];
          e = ls.slice(0, cut).concat(CARD_LINES[keys].filter((x) => x[0] <= i && !(branching() && offScript(keys + ": " + x[1], fromDayNo(x[0]).i, x[0]).length)).map((x) => x[1]), rest).join("\n");
        }
        // a "Canon schedule:" run: only the items whose date has come
        const items = C.cardHistory && has(CARD_SCHED) ? CARD_SCHED[keys] : null, at = e.indexOf("Canon schedule:");
        if (items || at >= 0) {
          // the card without its schedule; the schedule goes back in right before its "Never:" line, or at the end
          const end = at >= 0 ? e.indexOf("Never:", at) : -1;
          const run = at >= 0 ? e.slice(at + 15, end >= 0 ? end : e.length).trim() : "";
          const bare = at >= 0 ? (e.slice(0, at).replace(/\s+$/, "") + (end >= 0 ? " " + e.slice(end) : "")).trim() : e;
          const past = items ? items.filter((x) => x[0] <= i && !(branching() && offScript(keys + ": " + x[1], fromDayNo(x[0]).i, x[0]).length)).map((x) => x[1]).join(" ") : dropFutureItems(run, i);
          const nv = bare.lastIndexOf("Never:");
          const sched = past ? "Canon schedule: " + past : "";
          e = nv >= 0 ? [bare.slice(0, nv).replace(/\s+$/, ""), sched, bare.slice(nv)].filter(Boolean).join(" ") : [bare, sched].filter(Boolean).join(" ");
        }
        if (e !== c.entry) c.entry = e;
      } catch (err) { /* a card the platform won't let the script change stays as it is */ }
    }
  };

  // ---------- content safety while Jack is a minor ----------
  const UNSAFE_WORDS = "penis(?:es)?|cocks?(?! (?:his|her|their|its|my|your|the|a|an|one)\\b)|ball ?sacks?|nut ?sacks?|scrotums?|testicles?|genitals?|genitalia|erections?|aroused(?! (?:suspicion|interest|curiosity|anger|fear|concern)\\b)|arousal|crotch(?:es)?|between (?:your|his) legs";
  const UNSAFE = new RegExp("\\b(?:" + UNSAFE_WORDS + ")\\b", "i");
  // Removes each whole sentence that contains an unsafe word; keeps line breaks intact
  const UNSAFE_SENTENCE = new RegExp("[^.!?\\n]*\\b(?:" + UNSAFE_WORDS + ")\\b[^.!?\\n]*(?:[.!?]+[\"'”’]?)?[ \\t]*", "gi");
  const stripUnsafe = (s) => (UNSAFE.test(s)
    ? s.replace(UNSAFE_SENTENCE, " ").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n")
    : s);

  // ---------- reading time skips ----------
  const NUM = "(\\d{1,2}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|another|a few|few|several|a couple(?: of)?|couple(?: of)?|half a)";
  const UNIT = "(years?|months?|decades?)";      // skips counted in months
  const UNIT_D = "(weeks?|days?|nights?)";       // skips counted in days (v3.2: a week is seven days, no longer rounded into months)
  const numVal = (w) => {
    w = String(w).toLowerCase().replace(/ of$/, "").replace(/^a (few|couple)$/, "$1");
    if (/^\d+$/.test(w)) return parseInt(w, 10);
    if (w === "half a") return 0.5;
    return NUM_WORDS[w] || 1;
  };
  const toMonths = (n, unit) => {
    unit = unit.toLowerCase();
    if (unit.startsWith("decade")) return Math.round(n * 120);
    if (unit.startsWith("year")) return Math.round(n * 12);
    return Math.round(n);
  };
  const toDays = (n, unit) => Math.floor(n * (/^week/i.test(unit) ? 7 : 1));   // "half a week": 3 days; "half a day": none
  const SKIP_VERB = "(?:pass(?:es|ed)?|go(?:es)? by|went by|fl(?:y|ies|ew) by|have passed|has passed|later|elapse[sd]?)";
  // The ways a counted skip is typed, for one kind of unit. verb: "2 years pass", "a week later". span: "The next two
  // years you...", "Over the next few days", "You spend the following year": at a sentence or clause start, or after
  // spend/over/during/for/in/through (a bare "next year" mid-sentence, "you plan to leave next year", doesn't count).
  // after: "after a month". jump: "skip 4 days", "fast forward a week". definite: "the two weeks pass", the form that
  // confirms a skip already typed ("spend the next two weeks..."), so it isn't counted twice.
  const skipRes = (U) => ({
    verb: new RegExp("\\b" + NUM + "\\s+(?:more\\s+)?" + U + "\\s+(?:more\\s+)?" + SKIP_VERB + "\\b", "i"),
    span: new RegExp("(?:^|[.!?,;:]\\s*|\\b(?:spend|spends|spent|over|during|for|in|through|throughout)\\s+)(?:the\\s+)?(?:next|following|coming)\\s+(?:" + NUM + "\\s+)?(?:more\\s+)?" + U + "\\b", "i"),
    after: new RegExp("\\bafter\\s+" + NUM + "\\s+(?:more\\s+)?" + U + "\\b", "i"),
    jump: new RegExp("\\b(?:fast[- ]?forward|time ?skip|skip(?:\\s+ahead)?|jump(?:\\s+ahead)?)\\s+(?:by\\s+)?" + NUM + "\\s+(?:more\\s+)?" + U + "\\b", "i"),
    definite: new RegExp("\\bthe\\s+(?:" + NUM + "\\s+)?" + U + "\\s+(?:pass(?:es|ed)?|go(?:es)? by|went by|(?:is|are) over|ends?)\\b", "i")
  });
  const SKIP_M = skipRes(UNIT), SKIP_D = skipRes(UNIT_D);
  // A date as the player types it: "June 4, 2019", "June 4 2019", "4 June 2019", "the 4th of June, 2019", "June 2019"
  // ([1] a day before the month, [2] the month or season, [3] a day after it, [4] the year)
  const MONTH_ALT = MONTHS.join("|");
  const DATE_RE = "(?:(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?=(?:" + MONTH_ALT + ")\\b))?(" + MONTH_ALT + "|Spring|Summer|Fall|Autumn|Winter),?\\s+(?:of\\s+)?(?:(\\d{1,2})(?:st|nd|rd|th)?,?\\s+)?((?:19|20)\\d\\d)\\b";
  // The day a date names, when it names a real month and a day it has (a day past the month's end is its last day)
  const dayIn = (s, word, i) => {
    const d = s ? parseInt(s, 10) : 0;
    return d >= 1 && d <= 31 && MONTHS.some((m) => m.toLowerCase() === String(word).toLowerCase()) ? Math.min(d, dim(i)) : null;
  };
  // "fast forward to June 2019" (the 1st), "skip to June 4, 2019", "fast forward to 2019" ([5]: a year alone)
  const reJumpTo = new RegExp("\\b(?:fast[- ]?forward|time ?skip|skip(?:\\s+ahead)?|jump(?:\\s+ahead)?|(?:pass(?:es)?|go(?:es)?\\s+by|fl(?:y|ies)\\s+by)\\s+(?:until|till))\\s+(?:to\\s+|until\\s+|till\\s+)?(?:" + DATE_RE + "|((?:19|20)\\d\\d)\\b)", "i");
  const AGE_ALT = "(\\d{1,2}|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty-(?:one|two|three|four|five|six|seven|eight|nine)|twenty|thirty)";
  const reTurn = new RegExp("\\b(?:you|jack)\\s+(?:finally\\s+|now\\s+)?turn(?:s|ed)?\\s+" + AGE_ALT + "\\b", "i");
  const reUntilAge = new RegExp("\\b(?:until|till)\\s+(?:you|jack)(?:'re|’re|\\s+are|\\s+is)\\s+(?:finally\\s+|now\\s+)?" + AGE_ALT + "\\b", "i");
  const reVague = /\b(?:(?:some\s+)?time\s+(?:passes|goes by|went by|flies by|skips?)|some\s+time\s+later|a\s+while\s+(?:passes|later)|fast[- ]?forward|time ?skip|(?:months|years)\s+(?:pass|go by|blur|later))\b/i;
  // "Keep living your life", "life goes on", "life continues", "the seasons turn", "days pass": the player wants time to pass, a little
  const reMontage = /\b(?:keeps?|kept|continues?|continued|go(?:es)?\s+on|carry|carries)\s+(?:on\s+)?(?:living|with|about)\s+(?:your|his|my|their)\s+(?:life|lives|days|routine|business)\b|\blife\s+(?:goes\s+on|continues|moves\s+on|carries\s+on|rolls\s+on)\b|\btime\s+(?:moves|marches|rolls|goes)\s+on\b|\b(?:time|life|the\s+world)\s+(?:keeps?|kept)\s+(?:going|moving|rolling|turning|marching|passing)(?:\s+on)?\b|\bgo(?:es)?\s+about\s+(?:your|his|my)\s+(?:life|days|business)\b|\b(?:days|weeks)\s+(?:pass|go\s+by|blur|later)\b|\b(?:the\s+)?(?:days|weeks|months|years|seasons)\s+(?:roll|drift|slip|tick|turn|change)(?:\s+(?:by|on|past|into\s+(?:weeks|months|years)))?\b/i;
  const reResume = /\b(?:continue|keep|resume|finish)\s+(?:the\s+|your\s+)?(?:skip|skipping|time\s*skip|skip ahead)\b|\bskip\s+(?:on|ahead)\s+(?:to|toward)\s+where\b/i;
  // The longest skip the AI may choose for a skip with no length, by the player's wording (the largest unit named wins):
  // { months }, or for days and weeks (v3.2) { days: the most, def: how many when the reply doesn't say }
  const vagueKind = (s) => {
    s = s.toLowerCase();
    if (/\byears?\b|fast|skip/.test(s)) return { months: C.maxVagueJumpMonths };
    if (/\bmonths?\b|\bseasons?\b/.test(s)) return { months: 12 };
    if (/\bweeks?\b/.test(s)) return { days: 28, def: 14 };
    if (/\bdays?\b/.test(s)) return { days: 7, def: 3 };
    if (/\b(?:life|lives|routine|business)\b/.test(s)) return { months: 6 };
    return { months: 24 };
  };
  // Days by name (v3.2). A next-day skip counts at the start of the action or of a clause ("The next morning you...",
  // "You eat, then sleep until morning."): "the next day/morning", "the following morning", "next morning", "sleep/wait
  // until morning/tomorrow", "sleep through the night", "you wake up the next morning"; the skip verbs anywhere ("skip to
  // tomorrow"). "You plan to go tomorrow" and "tomorrow's game" are not skips.
  const CLAUSE = "(?:^|[.!?,;:]\\s*|\\b(?:and|then|but|so)\\s+)";
  const reNextDay = new RegExp("\\b(?:skip|jump|fast[- ]?forward)\\s+(?:ahead\\s+)?to\\s+(?:tomorrow\\b(?!['’])|the\\s+next\\s+(?:day|morning)\\b)|" + CLAUSE +
    "(?:(?:the\\s+)?(?:next|following)\\s+(?:morning|day|night|evening|afternoon)\\b|(?:you\\s+)?(?:sleep|wait|rest)\\s+(?:until|till)\\s+(?:the\\s+)?(?:morning|tomorrow|dawn|sunrise|daybreak)\\b(?!['’])|(?:you\\s+)?sleep\\s+through\\s+the\\s+night\\b|(?:you\\s+)?wake(?:\\s+up)?\\s+(?:the\\s+)?(?:next|following)\\s+(?:morning|day)\\b)", "i");
  // "Skip to next week": seven days. "Skip to Friday", "wait until Monday": the next such weekday, one to seven days on.
  const reToNextWeek = /\b(?:skip|jump|fast[- ]?forward)\s+(?:ahead\s+)?(?:to\s+)?(?:the\s+)?next\s+week\b(?!['’])/i;
  const reToWeekday = new RegExp("(?:\\b(?:skip|jump|fast[- ]?forward)(?:\\s+ahead)?|" + CLAUSE + "(?:you\\s+)?(?:wait|sleep|rest))\\s+(?:to|until|till)\\s+(?:next\\s+|this\\s+|the\\s+next\\s+)?(" + WEEKDAYS.join("|") + ")\\b(?!['’])", "i");
  // "Your birthday arrives", "the day of your 18th birthday", "on your eighteenth birthday": a skip to that birthday.
  // "Your birthday was last week" / "remember your birthday" are not skips.
  const ORDINALS = { fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
    thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20,
    "twenty-first": 21, "twenty-second": 22, "twenty-third": 23, "twenty-fourth": 24, "twenty-fifth": 25, "twenty-sixth": 26,
    "twenty-seventh": 27, "twenty-eighth": 28, "twenty-ninth": 29, thirtieth: 30 };
  const ORD_ALT = "(\\d{1,2})(?:st|nd|rd|th)|(" + Object.keys(ORDINALS).join("|") + ")";
  const reBirthday = new RegExp("\\b(?:your|jack(?:'s|’s)?|his)\\s+(?:(?:" + ORD_ALT + ")\\s+|(?:next|coming|own)\\s+)?birthday\\b", "i");
  const reBirthdayPast = /\b(?:last|since|remember(?:s|ed|ing)?|missed|forg[eo]t(?:s|ten)?|skipped|was|were|ago|before)\b[^.!?\n]{0,24}\bbirthday\b|\bbirthday\s+(?:was|were|had|passed|came\s+and\s+went|is\s+(?:in|on|next|still)|isn['’]t|will|would|won['’]t)\b/i;
  const ordinalVal = (m) => (m[1] ? parseInt(m[1], 10) : m[2] ? ORDINALS[m[2].toLowerCase()] : null);
  // The player character's birthday month at or after i (the current month counts if it is the birth month: the
  // tracked age already includes it), and the next one strictly after it (a typed "your birthday arrives" in the
  // birth month means next year's)
  const birthdayAtOrAfter = (i) => {
    const b = curBirth();
    const bm = b === null ? C.birth.month : monthOf(b);
    return toIdx(yearOf(i) + (monthOf(i) > bm ? 1 : 0), bm);
  };
  const nextBirthdayIdx = (i) => {
    const b = curBirth();
    const bm = b === null ? C.birth.month : monthOf(b);
    return toIdx(yearOf(i) + (monthOf(i) >= bm ? 1 : 0), bm);
  };
  const spanText = (m) => (m >= 12 && m % 12 === 0 ? (m / 12) + (m === 12 ? " year" : " years") : m + (m === 1 ? " month" : " months"));
  const daysText = (n) => (n === 1 ? "a day" : n === 7 ? "a week" : n % 7 === 0 ? (n / 7) + " weeks" : n + " days");
  // A date that opens the action ("June 2019." / "June 4, 2019."), the weekday allowed in front
  const reDateLead = new RegExp("^\\s*(?:>\\s*)?(?:(?:" + WEEKDAYS.join("|") + "),?\\s+)?" + DATE_RE, "i");
  // Quoted dialogue never moves the date: "In two years I'm out of here" is talk, not a skip
  const unquote = (s) => s.replace(/"[^"\n]*"|“[^”\n]*”/g, " ");

  const parseMonthWord = (w) => {
    if (!w) return null;
    const lw = w.toLowerCase();
    const mi = MONTHS.findIndex((m) => m.toLowerCase() === lw);
    if (mi >= 0) return mi + 1;
    return SEASONS[lw] || null;
  };
  const wordToAge = (w) => (/^\d+$/.test(w) ? parseInt(w, 10) : AGE_WORDS.indexOf(w.toLowerCase()));

  // What a typed action asks for. Month, year, age and target skips come first, as before v3.2; a day skip counts only
  // when none of those matched. months/days: a counted skip; setIdx/setDay: a date to land on (setDay null: the leading
  // date named no day), dayNamed: the player typed the day;
  // turnAge: an age to turn; vague/cap: an open-ended skip in months; dayCap/dayDefault: an open-ended skip in days.
  const detectInputSkip = (raw) => {
    const r = { months: 0, days: 0, setIdx: null, setDay: null, dayNamed: false, turnAge: null, vague: false, confirm: false, dayConfirm: false, cap: 0, dayCap: 0, dayDefault: 0, birthday: false };
    const body = unquote(raw).replace(/^\s*>\s*/, "");
    const lead = body.match(reDateLead);
    if (lead) {
      const m = parseMonthWord(lead[2]);
      const y = parseInt(lead[4], 10);
      if (m && y >= 1990 && y <= 2060) { r.setIdx = toIdx(y, m); r.setDay = dayIn(lead[1] || lead[3], lead[2], r.setIdx); r.dayNamed = r.setDay !== null; }
    }
    const to = body.match(reJumpTo);                  // "fast forward to June 2019": forward only, to the 1st unless a day is named
    if (to && r.setIdx === null) {
      const y = parseInt(to[4] || to[5], 10);
      const target = toIdx(y, parseMonthWord(to[2]) || 1);
      const named = dayIn(to[1] || to[3], to[2], target), day = named || 1;
      if (y >= 1990 && y <= 2060 && dayNo(target, day) > today()) { r.setIdx = target; r.setDay = day; r.dayNamed = !!named; }
    }
    const turn = body.match(reTurn) || body.match(reUntilAge);
    if (turn) {
      const a = wordToAge(turn[1]);
      if (a >= 4 && a <= 60) r.turnAge = a;
    }
    const bday = body.match(reBirthday);
    if (bday && !reBirthdayPast.test(body)) {
      const a = ordinalVal(bday);
      if (a !== null && r.turnAge === null) { if (a >= 4 && a <= 60) r.turnAge = a; }   // "your 18th birthday": that birthday
      else if (a === null) r.birthday = true;                                            // "your birthday": the next one, or a later one the story set up
    }
    let counted = false;   // a skip with a length ("2 years pass", "3 days pass") is never vague, even when it comes to 0
    let mm = body.match(SKIP_M.definite);
    if (mm) {
      r.months = toMonths(mm[1] ? numVal(mm[1]) : 1, mm[2]);
      r.confirm = true;
      counted = true;
    }
    if (!counted) {
      for (const re of [SKIP_M.verb, SKIP_M.span, SKIP_M.after, SKIP_M.jump]) {
        mm = body.match(re);
        if (!mm) continue;
        // no number: "the coming months" means a few, "the next year" means one
        r.months = toMonths(mm[1] ? numVal(mm[1]) : (/s$/i.test(mm[2]) ? 3 : 1), mm[2]);
        counted = true;
        break;
      }
    }
    // Days, weeks and nights, when no month, year, age or target skip matched
    if (!counted && r.setIdx === null && r.turnAge === null) {
      mm = body.match(SKIP_D.definite);
      // "the days pass" with no number is open-ended (below); "the day ends" is no skip at all
      if (mm && (mm[1] || !/s$/i.test(mm[2])) && !(!mm[1] && /^(?:day|night)$/i.test(mm[2]) && /\b(?:is|are)\s+over\b|\bends?\b/i.test(mm[0]))) {
        r.days = toDays(mm[1] ? numVal(mm[1]) : 1, mm[2]);
        r.dayConfirm = true;
        counted = true;
      }
      if (!counted) {
        for (const re of [SKIP_D.verb, SKIP_D.span, SKIP_D.after, SKIP_D.jump]) {
          mm = body.match(re);
          if (!mm) continue;
          // no number: "the coming days" means a few, "the next week" means one
          r.days = toDays(mm[1] ? numVal(mm[1]) : (/s$/i.test(mm[2]) ? 3 : 1), mm[2]);
          counted = true;
          break;
        }
      }
      if (!counted && reToNextWeek.test(body)) { r.days = 7; counted = true; }
      if (!counted && (mm = body.match(reToWeekday))) {
        const want = WEEKDAYS.findIndex((w) => w.toLowerCase() === mm[1].toLowerCase());
        r.days = ((want - WEEKDAYS.indexOf(weekday(today())) + 7) % 7) || 7;
        counted = true;
      }
      if (!counted && reNextDay.test(body)) { r.days = 1; counted = true; }
    }
    if (!counted && r.setIdx === null && r.turnAge === null) {
      const v = body.match(reVague) || body.match(reMontage);
      if (v) {
        const k = vagueKind(v[0]);
        if (k.days) { r.dayCap = k.days; r.dayDefault = k.def; }   // "days pass", "weeks go by": the AI picks the days
        else { r.vague = true; r.cap = k.months; }
      }
      if (r.birthday) { r.vague = true; r.cap = Math.max(r.cap, C.maxVagueJumpMonths); r.dayCap = 0; }
    } else {
      r.birthday = false;   // a counted skip or a set age already says where to land
    }
    return r;
  };

  // Only sentence-opening skips count ("Two years pass." / "Six months later,"),
  // never reflections like "Ten years have passed since..."
  const reOutputSkipAll = new RegExp("(?:^|[.!?\"”]\\s+|\\n)\\s*" + NUM + "\\s+(?:more\\s+)?" + UNIT + "\\s+(?:pass(?:es)?|go(?:es)? by|later)\\b", "gi");
  // "For the next six months, ..." / "Over the following two years ..." at a sentence start: the reply covers that span
  const reOutputSpanAll = new RegExp("(?:^|[.!?\"”]\\s+|\\n)\\s*(?:For|Over|Through|Throughout|During|In)\\s+the\\s+(?:next|following|coming)\\s+(?:" + NUM + "\\s+)?(?:more\\s+)?" + UNIT + "\\b", "gi");

  // ---------- evidence in the AI's text that the story reached a later date ----------
  // Used on turns without a typed exact skip. Quoted speech never counts; plans ("until you're 18",
  // "when you turn 18", "by the time you're 18") never count; only forward moves within maxEvidenceMonths count.
  const MONTH_WORDS_RE = "(January|February|March|April|May|June|July|August|September|October|November|December|Spring|Summer|Fall|Autumn|Winter)";
  const AGE_OUT_ALT = "(\\d{1,2}|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty-(?:one|two|three|four|five|six|seven|eight|nine)|twenty|thirty)";
  const blankQuotes = (s) => s.replace(/"[^"\n]*"|“[^”\n]*”/g, (q) => " ".repeat(q.length));
  // "It's a Tuesday afternoon in late March 2016." / "It is now 2016." / "Today is September 2018." / "It's mid-June 2019."
  // / "It's Tuesday, June 4, 2019." ([1] the month, [2] the day, [3] the year)
  const rePresentDate = new RegExp("\\b(?:It(?:'s|’s| is)|Today(?:'s|’s| is))\\s+(?:now\\s+)?(?:(?:" + WEEKDAYS.join("|") + "),?\\s+)?(?:(?:a|an|the|another)\\s+(?:[^.!?\\n]{0,40}?\\b(?:in|of)\\s+)??)?(?:(?:early|mid|late|the\\s+(?:start|middle|end)\\s+of)[-\\s]+)?(?:" + MONTH_WORDS_RE + "\\s+(?:of\\s+)?(?:(\\d{1,2})(?:st|nd|rd|th)?,?\\s+)?)?((?:19|20)\\d\\d)\\b", "gi");
  // "Summer 2016 passes" / "September 2018 arrives" / "June 4, 2019 arrives" ([1] the month, [2] the day, [3] the year)
  const reDateArrives = new RegExp("\\b" + MONTH_WORDS_RE + "\\s+(?:(\\d{1,2})(?:st|nd|rd|th)?,?\\s+)?((?:19|20)\\d\\d)\\s+(?:passes|arrives|comes|begins|ends|is\\s+here|rolls\\s+(?:in|around))\\b", "gi");
  // "You turn sixteen in September 2016" / "You turn eighteen"
  const reTurnOut = new RegExp("\\b(?:you|jack)\\s+(?:finally\\s+|now\\s+)?turn(?:s|ed)?\\s+" + AGE_OUT_ALT + "\\b(?:[^.!?\\n]{0,40}?\\bin\\s+(?:" + MONTH_WORDS_RE + "\\s+)?((?:19|20)\\d\\d)\\b)?", "gi");
  // "It's your birthday." / "Today is your eighteenth birthday."
  const reBirthdayOut = new RegExp("\\b(?:It(?:'s|’s| is)|Today(?:'s|’s| is))\\s+(?:your|jack(?:'s|’s)?|his)\\s+(?:(?:" + ORD_ALT + ")\\s+)?birthday\\b", "gi");
  // "You're eighteen." / "You are now 18 years old" (not "you're 15 minutes late", "you're six-foot-eleven", "you're 6'3\"")
  const reAgeOut = new RegExp("\\b(?:you(?:'re|’re|\\s+are)|jack\\s+is)\\s+(?:now\\s+|only\\s+|just\\s+|already\\s+|finally\\s+|still\\s+|officially\\s+|barely\\s+)?" + AGE_OUT_ALT +
    "(?:\\s+years?\\s+old)?\\b(?!\\s*(?:-|['’]|\"|”|feet|foot|ft|percent|%|miles?|mph|minutes?|hours?|days?|weeks?|months?|years?\\s+(?:away|from|into|older|younger|ahead|late|early|behind)|times|pounds|lbs|inches|grand|dollars|bucks|blocks|stories|floors|seconds|degrees|point|and\\s+a\\s+half))", "gi");
  // Words right before an age or a date that make it a plan or a condition, not the present
  const FUTURE_LEAD = /\b(?:until|till|when|whenever|by\s+the\s+time|before|once|after|if|unless|as\s+soon\s+as|so\s+that|the\s+day|the\s+moment|the\s+year|the\s+second)\s*$/i;
  const futureLead = (s, offset) => FUTURE_LEAD.test(s.slice(Math.max(0, offset - 24), offset));
  // The latest date the reply's own text reaches, with where in the text it does so, or null
  const reNewsy = /\b(?:breaking news|headlines?|the news|news alert|on the news|VNN|Vought News)\b/i;
  const reOutputSkipOnce = new RegExp(reOutputSkipAll.source, "i"), reOutputSpanOnce = new RegExp(reOutputSpanAll.source, "i");
  // Weeks skipped at a sentence start ("Three weeks later"): canon the reply tells counts then, as it did when weeks were months
  const reOutputWeeksOnce = new RegExp("(?:^|[.!?\"”]\\s+|\\n)\\s*(?:" + NUM + "\\s+(?:more\\s+)?weeks?\\s+(?:pass(?:es)?|go(?:es)? by|later)|(?:For|Over|Through|Throughout|During|In)\\s+the\\s+(?:next|following|coming)\\s+(?:" + NUM + "\\s+)?(?:more\\s+)?weeks?)\\b", "i");
  // The latest month the reply reaches: { idx, at, minDay } (minDay: a canon stop's day the story has reached, or 0)
  const collectEvidence = (out, base, from, canonCounts, hadStamp) => {
    const s = blankQuotes(out);
    const sane = (i) => typeof i === "number" && i > from && i - base <= C.maxEvidenceMonths;
    let best = null;
    const offer = (idx, at, minDay) => {
      if (!sane(idx)) return;
      if (!best || idx > best.idx) best = { idx, at, minDay: minDay || 0 };
      else if (idx === best.idx && minDay > best.minDay) best.minDay = minDay;
    };
    const dateIdx = (monthWord, year, fallbackMonth) => toIdx(parseInt(year, 10), parseMonthWord(monthWord) || fallbackMonth);
    let m;
    rePresentDate.lastIndex = 0;
    while ((m = rePresentDate.exec(s))) {
      if (futureLead(s, m.index)) continue;
      // a bare year means at least January of that year
      offer(m[1] ? dateIdx(m[1], m[3], 1) : Math.max(from, toIdx(parseInt(m[3], 10), 1)), m.index);
    }
    reDateArrives.lastIndex = 0;
    while ((m = reDateArrives.exec(s))) offer(dateIdx(m[1], m[3], 1), m.index);
    // A big canon event told in the reply puts the story at least in its month, on or after its day (open-ended turns only)
    if (canonCounts) {
      // v3.3: a reply can tell the next canon stop's news, never anything past it ("A-Train killed Robin Ward" is not 2026)
      const next = stopsBetween(stopFrom(), 1e9)[0];
      const limit = next ? stopDayOf(next) : Infinity;
      for (const n of NEWS) {
        const x = newsIdx(n);
        if (n[6] && newsLive(n) && x > from && stopDayOf(n) <= limit && n[6].test(s)) offer(x, s.search(n[6]), fromDayNo(stopDayOf(n)).d);
      }
    }
    const b = curBirth();
    if (b !== null) {
      const ageNow = charAge(from);
      reTurnOut.lastIndex = 0;
      while ((m = reTurnOut.exec(s))) {
        const a = wordToAge(m[1]);
        if (a < 4 || a > ageNow + 10 || futureLead(s, m.index)) continue;
        offer(m[3] ? dateIdx(m[2], m[3], monthOf(b)) : b + a * 12, m.index);
      }
      reBirthdayOut.lastIndex = 0;
      while ((m = reBirthdayOut.exec(s))) {
        const a = ordinalVal([m[0], m[1], m[2]]);
        if (a === null) offer(birthdayAtOrAfter(from), m.index);
        else if (a >= 4 && a <= ageNow + 10) offer(b + a * 12, m.index);
      }
      reAgeOut.lastIndex = 0;
      while ((m = reAgeOut.exec(s))) {
        const a = wordToAge(m[1]);
        if (a < 4 || a <= ageNow || a > ageNow + 10 || futureLead(s, m.index)) continue;
        offer(b + a * 12, m.index);
      }
    }
    // Spans with no date ("Six months later", "For the next two years") count only when nothing in the reply names one,
    // and never after a date line (the line already placed the story; "Two years pass." under it describes the same jump)
    if (!best && !hadStamp) {
      let months = 0, at = -1;
      for (const re of [reOutputSkipAll, reOutputSpanAll]) {
        re.lastIndex = 0;
        while ((m = re.exec(s))) {
          months += toMonths(m[1] ? numVal(m[1]) : (/s$/i.test(m[2]) ? 3 : 1), m[2]);
          at = m.index + m[0].length - 1;
        }
      }
      if (months > 0) offer(from + months, at);
    }
    return best;
  };
  // ---------- days the reply moves (v3.2) ----------
  // The narration's own day jumps, at the start of a sentence or paragraph and outside quotes: "The next morning", "The
  // following day", "Next morning", "The next night", "You wake up the next morning" (one day); "Two days later", "Three
  // days pass", "A week later", "Two weeks later", "By the third day" (n days, or 7n); "The next week", "Over the next
  // three days" (the span); "Days later" (2); "Weeks later" (14). Never "that night", "later that day", "hours later"
  // (the same day), "two days ago", "in two days", "two days from now", or "for three days" inside a sentence; a jump
  // its sentence puts in the future ("The next day will be worse") doesn't count either.
  const DAY_ORDS = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 };
  const reDayJump = new RegExp("(?:^|\\n|[.!?…][ \\t]+)[ \\t]*(?:" +
    "(?:the\\s+)?(?:next|following)\\s+(morning|day|night|evening|afternoon)\\b" +                                    // [1]
    "|you\\s+wake(?:\\s+up)?\\s+(?:the\\s+)?(?:next|following)\\s+(morning|day)\\b" +                                   // [2]
    "|" + NUM + "\\s+(?:more\\s+)?" + UNIT_D + "\\s+(?:later|pass(?:es)?|go(?:es)?\\s+by)\\b" +                          // [3] [4]
    "|(?:(?:for|over|through|throughout|during)\\s+)?the\\s+(?:next|following)\\s+(?:" + NUM + "\\s+)?(?:more\\s+)?(days|weeks?|nights)\\b" +   // [5] [6]
    "|by\\s+the\\s+(\\d{1,2}(?:st|nd|rd|th)|" + Object.keys(DAY_ORDS).join("|") + ")\\s+(day|week|night)\\b" +           // [7] [8]
    "|(days|weeks)\\s+(?:later|pass|go\\s+by)\\b)", "gi");                                                                // [9]
  const reFutureClause = /\b(?:will|won['’]t|shall|would|going\s+to|gonna)\b|['’]ll\b/i;
  // [{ at, n }]: each jump, where it is and how many days, in order
  const dayJumps = (out) => {
    // dialogue is blanked; a quote that ends a sentence still ends it, so the next sentence counts as a start
    const s = out.replace(/"[^"\n]*"|“[^”\n]*”/g, (q) => (/[.!?…]["”]$/.test(q) ? " ".repeat(q.length - 2) + ". " : " ".repeat(q.length)));
    const found = [];
    let m;
    reDayJump.lastIndex = 0;
    while ((m = reDayJump.exec(s))) {
      const end = m.index + m[0].length;
      if (reFutureClause.test((s.slice(end).match(/^[^.!?\n]*/) || [""])[0])) continue;
      let n;
      if (m[1] || m[2]) n = 1;
      else if (m[4]) n = toDays(numVal(m[3]), m[4]);
      else if (m[6]) n = toDays(m[5] ? numVal(m[5]) : (/s$/i.test(m[6]) ? 3 : 1), m[6]);
      else if (m[8]) n = toDays(/^\d/.test(m[7]) ? parseInt(m[7], 10) : DAY_ORDS[m[7].toLowerCase()], m[8]);
      else n = /^days$/i.test(m[9]) ? 2 : 14;
      if (n > 0) found.push({ at: end - 1, n });
    }
    return found;
  };
  // Dates with a day that the reply states ("It's Tuesday, June 4, 2019", "June 4, 2019 arrives"): [{ at, i, d }]
  const datesWithDay = (out) => {
    const s = blankQuotes(out), found = [];
    let m;
    for (const re of [rePresentDate, reDateArrives]) {
      re.lastIndex = 0;
      while ((m = re.exec(s))) {
        if (!m[2] || futureLead(s, m.index)) continue;
        const mo = MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
        if (mo < 0) continue;
        const i = toIdx(parseInt(m[3], 10), mo + 1), d = parseInt(m[2], 10);
        if (d >= 1 && d <= dim(i)) found.push({ at: m.index, i, d });
      }
    }
    return found;
  };
  // Two date lines back to back ("August 2018." then "September 2018."): only the later one stays
  const collapseDateLines = (s) => {
    const re = /(^|\n)([ \t]*)((January|February|March|April|May|June|July|August|September|October|November|December) ((?:19|20)\d\d)\.)[ \t]*\n[ \t]*\n*((January|February|March|April|May|June|July|August|September|October|November|December) ((?:19|20)\d\d)\.)(?=[ \t]*\n|[ \t]*$)/g;
    let prev;
    do {   // the later date stays; repeat for runs of three or more
      prev = s;
      s = s.replace(re, (w, nl, sp, a, am, ay, b, bm, by) => nl + sp + (toIdx(parseInt(by, 10), parseMonthWord(bm)) >= toIdx(parseInt(ay, 10), parseMonthWord(am)) ? b : a));
    } while (s !== prev);
    return s;
  };
  // Puts a date line of its own before the line of text that holds offset `at`, unless that line already names the month and year
  const insertDateLine = (out, at, line) => {
    const start = out.lastIndexOf("\n", Math.max(0, at - 1)) + 1;
    const stop = out.indexOf("\n", at);
    const para = out.slice(start, stop < 0 ? out.length : stop);
    if (para.includes(line.slice(0, -1))) return out;
    const before = out.slice(0, start);
    if (before.trim() === "") return "\n" + line + "\n\n" + out.slice(start).replace(/^\s+/, "");
    const gap = before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    return before + gap + line + "\n\n" + out.slice(start).replace(/^\s+/, "");
  };

  // ---------- date stamps the AI writes ----------
  // A stamp opens a paragraph: "March 2006." / "Spring 2010:" / a bare "2006." at the very start.
  // It must end in punctuation or a line break, so "2004 feels far away" is not a stamp.
  // The last group is the stamp's own punctuation and spaces, removed along with it.
  // v3.2: the day is kept ("June 4, 2019." / "Tuesday, June 4, 2019." / "4 June 2019."): [3] a day before the month,
  // [4] the month or season, [5] a day after it, [6] the year, [7] the punctuation.
  const reStamp = new RegExp("(^|\\n)([ \\t]*)(?:(?:" + WEEKDAYS.join("|") + "),?[ \\t]+(?=(?:\\d{1,2}(?:st|nd|rd|th)?[ \\t]+(?:of[ \\t]+)?)?(?:" + MONTHS.join("|") + ")\\b))?(?:(?:(\\d{1,2})(?:st|nd|rd|th)?[ \\t]+(?:of[ \\t]+)?(?=(?:" + MONTHS.join("|") + ")\\b))?(January|February|March|April|May|June|July|August|September|October|November|December|Spring|Summer|Fall|Autumn|Winter),?\\s+(?:of\\s+)?(?:(\\d{1,2})(?:st|nd|rd|th)?,?\\s+)?)?((?:19|20)\\d\\d)(?=[ \\t]*[.,:;—–-]|[ \\t]*\\n|[ \\t]*$)([ \\t]*[.,:;—–-]?[ \\t]*)", "gi");
  const reLeadDateLine = /^\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December) (?:19|20)\d\d\.[ \t]*\n\s*)?/;

  // ---------- words from the notes that don't belong in the story ----------
  // "The canon events of the last week reach you..." : a sentence that talks about canon is cut (not inside dialogue)
  const reMetaCanon = /\bcanon(?:ical)?\s+(?:events?|timeline|calendar|lineup|locks?|stops?|schedule|dates?|history|news)\b|\b(?:the|in|by)\s+canon\b/i;
  const dropMetaCanon = (out) => out.split("\n").map((line) => {
    if (!reMetaCanon.test(line) || /^\[Tracker\]/.test(line)) return line;
    return line.replace(/[^.!?]*[.!?]+["”’]?\s*|[^.!?]+$/g, (sent) => (reMetaCanon.test(sent) && !/["“”]/.test(sent) ? "" : sent)).replace(/\s+$/, "");
  }).join("\n").replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n");
  // A paragraph the AI writes twice in one reply (the second time often longer): keep it once
  const dropRepeatedParagraphs = (out) => {
    const paras = out.split(/(\n[ \t]*\n)/);
    const norm = (p) => p.toLowerCase().replace(/\s+/g, " ").trim();
    const keep = paras.map(() => true);
    for (let i = 0; i < paras.length; i += 2) {
      const a = norm(paras[i]);
      if (a.length < 60) continue;
      for (let j = i + 2; j < paras.length; j += 2) {
        const b = norm(paras[j]);
        if (b === a) { keep[j] = false; if (j - 1 >= 0) keep[j - 1] = false; }
        else if (b.length > a.length && b.startsWith(a)) { keep[i] = false; if (i + 1 < paras.length) keep[i + 1] = false; break; }
      }
    }
    return paras.filter((p, k) => keep[k]).join("").replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n");
  };

  // ---------- a Continue that repeats the end of the last turn ----------
  const lastActionText = () => {
    if (typeof history === "undefined" || !Array.isArray(history) || !history.length) return T.ctxTail || "";
    const h = history[history.length - 1];
    const s = h && (typeof h.text === "string" ? h.text : h.rawText);
    return typeof s === "string" ? s : (T.ctxTail || "");
  };
  const words = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  // One sentence, its closing quote and trailing spaces; "Mr." / "Dr." etc. don't end a sentence
  const reSentence = /^(?:(?:Mr|Mrs|Ms|Dr|St|Jr|Sr)\.(?= )|[^.!?\n])+[.!?]+["”’']*[ \t]*/;
  // A Continue (no typed action) often restarts the last scene in new words. On a Continue only,
  // an opening sentence is also a repeat when it begins with the last sentence word for word, or
  // when it restates nearly all of a recent sentence's meaningful words.
  const STOP = new Set(("you your yours the a an and of to in on at it its is are was were be been he she his her him them they their we our " +
    "me my i with for from that this as but or not into out up down then than there here by over under off like just so all one " +
    "has have had do does did can could will would s t").split(" "));
  const content = (w) => w.split(" ").filter((x) => x && !STOP.has(x));
  const lastActionType = () => {
    if (typeof history === "undefined" || !Array.isArray(history) || !history.length) return "";
    const h = history[history.length - 1];
    return (h && typeof h.type === "string") ? h.type : "";
  };
  const fuzzyRepeat = (w, prevSentences) => {
    const cw = content(w);
    if (cw.length < 4) return false;
    const cset = new Set(cw);
    const recent = prevSentences.slice(-3).map((s) => words(s));
    for (const p of recent) {
      if (p.length >= 15 && w.startsWith(p + " ") && p.split(" ").length >= 5) return true;   // same opening words
      const pw = content(p);
      if (pw.length < 4) continue;
      const hit = pw.filter((x) => cset.has(x)).length;
      if (hit / pw.length >= 0.8 && hit / cw.length >= 0.5) return true;                       // restated sentence
    }
    return false;
  };
  const dropRepeatedOpening = (out, prev, fuzzy) => {
    const tail = words(prev.slice(-800));
    if (tail.length < 20) return out;
    const prevSentences = prev.trim().match(/[^.!?\n]+[.!?]+["”’']*/g) || [];
    const lastLine = words(prevSentences[prevSentences.length - 1] || "");
    const head = (out.match(reLeadDateLine) || [""])[0];
    const rest = out.slice(head.length);
    let cut = 0;
    for (let n = 0; n < 4; n++) {
      const m = rest.slice(cut).match(reSentence);
      if (!m) break;
      const w = words(m[0]);
      const repeat = (w.length >= 15 && (tail.includes(w) || (lastLine.length >= 15 && w.endsWith(lastLine)))) ||
        (fuzzy && fuzzyRepeat(w, prevSentences));
      if (!repeat) break;
      cut += m[0].length;
    }
    if (!cut) return out;
    let after = rest.slice(cut);
    if (!after.trim()) return out;                     // never blank the whole turn
    const removed = rest.slice(0, cut);
    if ((removed.match(/["“”]/g) || []).length % 2 === 1 && !/^\s*["“]/.test(after)) {
      after = (removed.includes("“") ? "“" : "\"") + after;   // the repeat stopped inside a quote: reopen it
    }
    let res = head + after;
    if (!/^\s/.test(res) && prev && !/\s$/.test(prev)) res = " " + res;
    return res;
  };
  // ---------- a reply that opens by writing the player's action back ----------
  // ('You say, "Huh? What's remarkable?"' as the first paragraph of the reply.) Only a near-copy is dropped.
  const dropActionEcho = (out) => {
    const type = lastActionType();
    if (type !== "say" && type !== "do") return out;
    const act = words(lastActionText().replace(/^\s*>\s*/, ""));
    if (act.length < 12) return out;
    const m = out.match(/^\s*([^\n]+)\n/);
    if (!m) return out;
    const first = words(m[1]);
    if (first.length < 12 || first.length > act.length * 1.5 + 20) return out;
    const aw = new Set(content(act));
    const fw = content(first);
    if (fw.length < 2) return out;
    if (fw.filter((x) => aw.has(x)).length / fw.length < 0.8) return out;
    const rest = out.slice(m[0].length);
    return rest.trim() ? rest : out;
  };
  // ---------- stray quote marks ----------
  // The AI sometimes leaves a quote mark hanging off narration ('...the card."') or doubles one ('"Yeah.""').
  // A paragraph that continues an open quote from the one before is left alone.
  const QUOTES = /["“”]/g;
  const fixStrayQuotes = (s, prev) => {
    const prevLast = (prev || "").split("\n").filter((l) => l.trim()).slice(-1)[0] || "";
    const openAfter = (p) => (p.match(QUOTES) || []).length % 2 === 1 && !/["”]\s*$/.test(p);
    let carry = openAfter(prevLast);
    // A quote mark alone on the turn's first line, or followed by a space, opens nothing: drop it
    if (!carry) s = s.replace(/^(\s*)["“”](?:[ \t]*(?=\n)|[ \t]+(?=\S))/, "$1");
    const paras = s.split("\n");
    for (let i = 0; i < paras.length; i++) {
      const p = paras[i];
      if (!p.trim()) continue;
      const q = (p.match(QUOTES) || []).length;
      if (q % 2 === 1 && /[.!?…,]["”]["”]\s*$/.test(p)) paras[i] = p.replace(/["”](\s*)$/, "$1");
      else if (q === 1 && !carry && !/^\s*["“]/.test(p) && /[.!?…]["”]\s*$/.test(p)) paras[i] = p.replace(/["”](\s*)$/, "$1");
      carry = openAfter(paras[i]);
    }
    return paras.join("\n");
  };

  // ---------- narration slipping into first person ("I look at the paper") ----------
  // Second-person narration has no "I" outside quotes, apart from short unquoted texts and notes ("Call me.").
  // When two or more longer paragraphs slip, their narration outside quotes goes back to "you".
  const splitQuotes = (p) => p.split(/("[^"\n]*"?|“[^”\n]*”?)/);
  const outsideQuotes = (p) => splitQuotes(p).filter((x, i) => i % 2 === 0).join(" ");
  const FIRST_I = /\bI(?:['’](?:m|ve|ll|d))?\b/;
  const FIRST_ANY = /\b(?:I(?:['’](?:m|ve|ll|d))?|me|my|myself)\b/;
  const toSecondPerson = (p) => {
    const parts = splitQuotes(p);
    let before = "";
    for (let i = 0; i < parts.length; i += 1) {
      if (i % 2 === 0) {
        const sentenceStart = !before.trim() || /[.!?…]["”']?\s*$/.test(before);
        parts[i] = parts[i]
          .replace(/\bI(['’])m\b/g, "you$1re").replace(/\bI(['’])ve\b/g, "you$1ve")
          .replace(/\bI(['’])ll\b/g, "you$1ll").replace(/\bI(['’])d\b/g, "you$1d")
          .replace(/\bI am\b/g, "you are").replace(/\bI was\b/g, "you were").replace(/\bI\b/g, "you")
          .replace(/\bmyself\b/g, "yourself").replace(/\bMyself\b/g, "Yourself")
          .replace(/\bmy\b/g, "your").replace(/\bMy\b/g, "Your").replace(/\bme\b/g, "you").replace(/\bMe\b/g, "You")
          .replace(/(^\s*|[.!?…]["”']?\s+)you\b/g, (w, lead, off) => (off === 0 && /^\s*$/.test(lead) && !sentenceStart ? w : lead + "You"));
      }
      before += parts[i];
    }
    return parts.join("");
  };
  const fixFirstPerson = (s) => {
    const paras = s.split("\n");
    const long = (p) => p.trim().length >= 40;
    if (paras.filter((p) => long(p) && FIRST_I.test(outsideQuotes(p))).length < 2) return s;
    return paras.map((p) => (long(p) && FIRST_ANY.test(outsideQuotes(p)) ? toSecondPerson(p) : p)).join("\n");
  };

  // Present-tense claims only, so history like "It was 1984 when..." is left alone
  // ([1] the lead, [2] a weekday, [3] the month, [4] a day, [5] the year)
  const reInlineYear = new RegExp("\\b([Ii]t(?:'s|’s| is)\\s+(?:now\\s+)?|[Tt]he year is\\s+)(?:(" + WEEKDAYS.join("|") + "),?\\s+(?=(?:" + MONTHS.join("|") + ")\\s))?(?:(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(\\d{1,2})(?:st|nd|rd|th)?,?\\s+)?)?((?:19|20)\\d\\d)\\b", "g");

  // Age statements from `from` on that disagree with the tracked age. Plans and conditions ("until you're 18") are left alone.
  const fixAgeStatements = (out, age, from) => out.replace(
    /\b(You(?:'re|’re| are)(?: now)? )(\d{1,2}|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty-\w+|thirty)((?: years? old)?)(?=[.,;!?]|\s+(?:now|and|but|which|who)\b)/gi,
    (whole, lead, num, tail, offset, all) => {
      if (offset < (from || 0) || futureLead(all, offset)) return whole;
      const said = wordToAge(num);
      if (said < 4 || said === age) return whole;
      const word = AGE_WORDS[age] || String(age);
      const isCap = /^[A-Z]/.test(num);
      return lead + (/^\d+$/.test(num) ? String(age) : (isCap ? word[0].toUpperCase() + word.slice(1) : word)) + tail;
    }
  );

  // ---------- cleaning up a typed action ----------
  // 1. A Do action that is really a time skip: AI Dungeon glues "You" on ("> You 2 years pass.", "> You life goes on").
  //    The "You" is dropped and the next letter capitalized.
  // 2. In a Do action, first person outside quotes becomes second person ("im so famous" -> "you're so famous"),
  //    so the narrator isn't pulled into "I".
  const GN = "(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d{1,2}|another|a few|few|several|a couple(?: of)?|couple(?: of)?|half a|some)";
  const GU = "(?:years?|months?|weeks?|days?|hours?|decades?|time|morning|nights?|evening)";
  const reGluedYou = new RegExp("^(\\s*>?\\s*)You\\s+(?=(?:the\\s+(?:next|following)\\s+(?:" + GN + "\\s+)?(?:more\\s+)?" + GU +
    "\\b|" + GN + "\\s+(?:more\\s+)?" + GU + "\\b|time\\s+(?:passes|goes by|flies by|skips?)\\b|(?:months|years|weeks|days)\\s+(?:pass|go by|blur|later)\\b|after\\s+" +
    GN + "\\s+(?:more\\s+)?" + GU + "\\b|(?:fast[- ]?forward|time ?skip|skip ahead|jump ahead)\\b|life (?:goes on|continues|moves on|carries on)\\b|time (?:moves|marches|rolls) on\\b|" +
    "the seasons (?:turn|change|pass)\\b|the day of (?:your|his) (?:\\S+ )?birthday\\b|(?:your|his) (?:\\S+ )?birthday (?:arrives|comes)\\b))", "i");
  const cleanInput = (raw) => {
    let t = raw;
    if (reGluedYou.test(t)) {
      t = t.replace(reGluedYou, (whole, lead) => lead).replace(/^(\s*>?\s*)([a-z])/, (w, lead, ch) => lead + ch.toUpperCase());
    } else if (/^\s*>\s*You\b/.test(t)) {
      t = t.split(/("[^"\n]*"?|“[^”\n]*”?)/).map((part, i) => (i % 2 ? part : part
        .replace(/\b[Ii](?:['’])?m\b/g, "you're").replace(/\b[Ii](?:['’])?ve\b/g, "you've")
        .replace(/\b[Ii]['’]ll\b/g, "you'll").replace(/\b[Ii]['’]d\b/g, "you'd")
        .replace(/\bI\b/g, "you").replace(/(^|\s)i(?=\s|[,.!?;:]|$)/g, "$1you")
        .replace(/\bmyself\b/g, "yourself").replace(/\bmy\b/g, "your").replace(/\bme\b/g, "you")
        .replace(/([.!?]\s+)you\b/g, "$1You"))).join("");
    }
    return t;
  };

  // ---------- commands ----------
  // A command starts its line. AI Dungeon may put "> You " or "> You say " in front of it.
  const CMD_HEAD = "[ \\t]*(?:>[ \\t]*)?(?:You[ \\t]+(?:say[ \\t]+)?)?[\"“]?[ \\t]*\\/(date|skip|facts?|forget|private|status|news|changes|dead|alive|canon)\\b";
  const reCommand = new RegExp("^" + CMD_HEAD + "([^\\n]*)", "im");
  const reCommandLine = new RegExp("^" + CMD_HEAD + ".*$\\n?", "gim");

  // ====================== HOOKS ======================
  if (hook === "input") {
    const raw = String(text || "");
    rollbackTurn();

    // The same input run again for the same action is a retry, not a second skip
    if (count !== null && T.lastInput && T.lastInput.count === count && T.lastInput.text === raw && T.turn) {
      restoreTurn(fillTurn(T.turn));
      state.memory.frontMemory = shortStatusFor(T.idx);
      return [T.turn.cmd ? "\n[Tracker] " + T.turn.cmd + "\n" : cleanInput(raw), false];
    }
    T.lastInput = { count, text: raw };

    // Commands. The reply shows in the story as a [Tracker] line, the AI's answer to it
    // is blanked, and [Tracker] lines are kept out of what the AI reads.
    const cmd = raw.match(reCommand);
    if (cmd) {
      const name = cmd[1].toLowerCase();
      const rest = cmd[2].replace(/["”]\s*$/, "").trim();     // a Say action wraps the command in quotes
      const arg = rest.replace(/[.!?]+$/, "").trim();          // a Do action may add a period
      let reply = null;
      if (name === "date" && arg) {
        // "/date June 4, 2019", "/date June 4 2019", "/date 4 June 2019"; "/date June 2019" is the 1st
        const m = arg.match(new RegExp("^" + DATE_RE + "$", "i"));
        const mo = m ? parseMonthWord(m[2]) : null;
        const target = mo ? toIdx(parseInt(m[4], 10), mo) : null;
        const day = m && (m[1] || m[3]) ? parseInt(m[1] || m[3], 10) : null;
        if (target !== null && (day === null || (dayIn(String(day), m[2], target) === day))) {
          T.idx = target;
          T.day = day || 1;
          if (day) T.dayGuess = false;
        } else reply = "Couldn't read that date. Try: /date June 4, 2010 or /date June 2010";
      } else if (name === "skip") {
        const m = arg.match(/^(\d{1,3})\s+(years?|months?|weeks?|days?)$/i);
        let target = null;   // a day number
        if (m) target = /^(?:week|day)/i.test(m[2]) ? today() + toDays(parseInt(m[1], 10), m[2]) : dayNo(T.idx + toMonths(parseInt(m[1], 10), m[2]), T.day);
        else if (!arg && typeof T.pendingDay === "number" && T.pendingDay > today()) target = T.pendingDay;   // resume a paused skip
        if (target === null) reply = arg ? "Try: /skip 2 years, /skip 6 months, /skip 2 weeks or /skip 3 days" : "No paused skip to continue. Try: /skip 2 years or /skip 3 days";
        else {
          const st = stopsBetween(stopFrom(), target)[0];
          if (st) {
            setToday(stopDayOf(st));
            T.dayGuess = false;   // the story is on the stop's own day
            T.pendingDay = target > today() ? target : null;
            reply = "Skipped to " + fmtNo(today()) + ", where " + (isBeat(st) ? "the story" : "canon") + " stops it: " + st[5] + "." + (T.pendingDay ? " Type /skip to continue to " + fmtNo(target) + ", or play on." : "");
          } else { setToday(target); T.pendingDay = null; }
        }
      } else if (name === "fact" && arg) {
        // brackets and line breaks would break the note the fact is carried in
        const fact = rest.replace(/[\[\]\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, C.maxFactChars);
        if (T.facts.length >= C.maxFacts) reply = "You already have " + C.maxFacts + " facts. Remove one first, like: /forget 3";
        else { T.facts.push(fact); reply = "Fact " + T.facts.length + " saved: " + fact; }
      } else if (name === "fact" || name === "facts") {
        reply = T.facts.length ? "Your facts: " + T.facts.map((f, n) => (n + 1) + ") " + f).join("  ")
          : "No facts yet. Add one like: /fact Jack joined the Seven in June 2018";
      } else if (name === "forget") {
        const n = parseInt(arg, 10);
        if (/^all$/i.test(arg)) { T.facts = []; reply = "All facts removed."; }
        else if (n >= 1 && n <= T.facts.length) reply = "Removed fact " + n + ": " + T.facts.splice(n - 1, 1)[0];
        else reply = T.facts.length ? "Which one? /forget 1 to /forget " + T.facts.length + ", or /forget all" : "There are no facts to remove.";
      } else if (name === "changes") {
        const lines = changeLines(T.idx);
        reply = lines.length ? "Changed in this story: " + lines.join("; ") + "." : "Nothing in canon has been changed by your story yet.";
      } else if (name === "dead" || name === "alive") {
        // A manual fix, only for when the script missed something: the person's name, like /dead Butcher
        const low = arg.toLowerCase();
        const alive = (x) => !deadAt(deathOf(x[0], x[2]), T.idx) && (!x[3] || T.idx >= x[3]);
        const found = (f) => TRACKED.filter(f).sort((a, b) => (alive(b) ? 1 : 0) - (alive(a) ? 1 : 0))[0];
        const p = arg.length >= 3 ? (found((x) => x[0].toLowerCase() === low) || found((x) => x[1].test(arg)) ||
          found((x) => x[0].toLowerCase().includes(low))) : null;
        if (!p) reply = "Who? Use a canon name, like: /" + name + " Billy Butcher";
        else {
          addChange(p[0], name, T.idx);
          reply = p[0] + " is " + name + " in this story from now on.";
        }
      } else if (name === "canon") {
        if (/^strict$/i.test(arg)) T.canon = "strict";
        else if (/^branch(?:ing)?$/i.test(arg)) T.canon = "branch";
        reply = "Canon mode: " + canonMode() + ". " + (branching()
          ? "Your story's changes branch the world: canon that depends on someone you killed or saved is dropped, and the rest still happens on schedule. /canon strict makes canon happen regardless."
          : "Canon happens on its day whatever your story did; lines about someone you changed are tagged. /canon branch lets your changes branch the world.") +
          (arg && !/^(?:strict|branch(?:ing)?)$/i.test(arg) ? " (Try: /canon strict or /canon branch.)" : "");
      } else if (name === "status") {
        const level = !T.max || T.max >= C.compactBelowChars ? 0 : T.max >= C.minimalBelowChars ? 1 : 2;
        reply = "Tracker v" + TRACKER_VERSION + ". It's " + nowText() + "." + (isJack() ? " Jack is " + ageAt(T.idx) + "." : charAge(T.idx) !== null ? " " + charName() + " is " + charAge(T.idx) + "." : " Custom character.") +
          " The AI gets the " + ["full", "short", "minimal"][level] + " note" + (T.max ? " (its context holds about " + commas(T.max) + " characters)" : "") +
          ". Facts: " + T.facts.length + ". Story changes: " + changeLines(T.idx).length + ". Canon: " + canonMode() + ". Private details: " + (T.private ? "on" : "off") + ".";
      } else if (name === "news") {
        const recent = newsBefore(today(), 365);
        reply = recent.length ? "Public canon news of the past year: " + recent.map((n) => fmtNo(newsDay(n)) + ": " + newsText(n)).join("  ")
          : "No public canon news in the past year (" + fmt(T.idx) + ").";
      } else if (name === "private") {
        if (/^on$/i.test(arg)) T.private = true;
        else if (/^off$/i.test(arg)) T.private = false;
        reply = "Private adult details are " + (T.private ? "ON for this adventure. The AI gets them only once Jack is 18. /private off removes them." : "OFF for this adventure. Turn them on with: /private on");
      }
      reply = reply || ("It's " + nowText() + "." + (isJack() ? " Jack is " + ageAt(T.idx) + "." : charAge(T.idx) !== null ? " " + charName() + " is " + charAge(T.idx) + "." : ""));
      T.turn = Object.assign(newTurn("none"), { cmd: reply });
      state.message = reply;
      state.memory.frontMemory = shortStatusFor(T.idx);
      return ["\n[Tracker] " + reply + "\n", false];
    }

    text = cleanInput(raw);

    const base = T.idx, baseDay = T.day, baseGuess = !!T.dayGuess;
    const from = today();          // the day this turn starts on
    const stopsFrom = stopFrom();  // where canon stops start to count (see stopFrom)
    const d = detectInputSkip(text);   // the cleaned action: "You the next two years" reads as "The next two years"
    let mode = "none";
    let idx = base;
    let landDay = null;            // the day of the month a typed date names (else a skip by months keeps the day)
    let land = null;               // where an exact skip lands, as a day number
    let typedDay = false;          // the player typed the landing day ("June 4, 2019.", "fast forward to June 4, 2019")
    // "Continue the skip" / "keep skipping": pick up a skip that a canon stop paused
    if (reResume.test(unquote(text)) && typeof T.pendingDay === "number" && T.pendingDay > from) {
      Object.assign(d, { setIdx: null, months: 0, days: 0, turnAge: null, vague: false, dayCap: 0, birthday: false });
      land = T.pendingDay;
      mode = "exact";
    }
    if (d.setIdx !== null) {
      idx = d.setIdx;
      mode = "exact";
      // a typed date lands on its day; one without a day on the 1st, or nowhere new when it names this month
      landDay = d.setDay !== null ? d.setDay : (idx === base ? T.day : 1);
      typedDay = !!d.dayNamed;
    } else if (d.months > 0) {
      const last = T.recentSkips[T.recentSkips.length - 1];
      if (d.confirm && last && last.months === d.months && T.inputCount - last.at <= 6) {
        mode = "exact"; // "the five months pass" after "spend the next five months": already counted
      } else {
        idx = base + d.months;
        mode = "exact";
        T.recentSkips.push({ months: d.months, at: (T.inputCount || 0) + 1 });
        T.recentSkips = T.recentSkips.slice(-5);
      }
    }
    let pastBirthday = null;
    if (d.turnAge !== null && curBirth() !== null) {
      const target = curBirth() + d.turnAge * 12;
      if (target > idx) { idx = target; landDay = null; typedDay = false; }
      else if (target < idx) pastBirthday = { age: d.turnAge, at: target };   // "you turn 18" after that birthday: no rewind
      mode = "exact";
    }
    if (mode === "exact" && land === null) land = dayNo(idx, landDay !== null ? landDay : T.day);   // by months: the same day of the month
    // Days, weeks and nights ("3 days pass", "the next morning", "skip to Friday"), when no skip by months matched
    if (mode === "none" && d.days > 0) {
      const last = T.recentSkips[T.recentSkips.length - 1];
      mode = "exact";
      if (d.dayConfirm && last && last.days === d.days && T.inputCount - last.at <= 6) {
        land = from;   // "the two weeks pass" after "spend the next two weeks": already counted
      } else {
        land = from + d.days;
        T.recentSkips.push({ days: d.days, at: (T.inputCount || 0) + 1 });
        T.recentSkips = T.recentSkips.slice(-5);
      }
    }
    if (mode === "none" && d.dayCap > 0) mode = "days";   // "days pass", "weeks go by": the AI picks how many
    if (mode === "none" && d.vague) mode = "vague";
    T.inputCount = (T.inputCount || 0) + 1;
    // Canon stops: a skip across one of the big canon days lands on that day first, and the rest of the skip waits
    let stop = null, stopAhead = null, cap = mode === "vague" ? d.cap : 0, capDays = 0, dayCap = mode === "days" ? d.dayCap : 0;
    if (mode === "exact") {
      if (land > from) {
        const st = stopsBetween(stopsFrom, land)[0];
        if (st) { T.pendingDay = land > stopDayOf(st) ? land : null; land = stopDayOf(st); stop = newsKey(st); }
        else T.pendingDay = null;
      }
    } else if (mode === "vague") {
      const st = stopsBetween(stopsFrom, dayNo(base + (cap || C.maxVagueJumpMonths), T.day))[0];
      // the months the AI may skip stop at the stop's month; a stop later this month leaves it only the days until then
      if (st) { cap = fromDayNo(stopDayOf(st)).i - base; capDays = cap ? 0 : stopDayOf(st) - from; stopAhead = newsKey(st); }
      T.pendingDay = null;
    } else if (mode === "days") {
      const st = stopsBetween(stopsFrom, from + dayCap)[0];
      if (st) { dayCap = stopDayOf(st) - from; stopAhead = newsKey(st); }
      T.pendingDay = null;
    }
    // "Your birthday arrives": the AI lands on the next birthday or a later one the story set up, never earlier than the
    // next; a canon stop before the birthday comes first, and the birthday (the same day of the month) waits as the paused skip
    let birthday = false, floor = null;
    if (mode === "vague" && d.birthday && curBirth() !== null) {
      const bday = nextBirthdayIdx(base), bdayNo = dayNo(bday, T.day);
      const st = stopsBetween(stopsFrom, bdayNo)[0];
      if (st) { mode = "exact"; land = stopDayOf(st); stop = newsKey(st); stopAhead = null; cap = 0; capDays = 0; T.pendingDay = bdayNo; }
      else { birthday = true; floor = bday; }
    }
    if (land !== null) setToday(land);
    if (stop || typedDay) T.dayGuess = false;   // the story is on a known day now: a canon stop's, or one the player typed
    T.turn = { base, baseDay, baseGuess, mode, start: T.idx, startDay: T.day, guess: !!T.dayGuess, ctx: null, out: null, cap, capDays, dayCap,
      dayDefault: mode === "days" ? d.dayDefault : 0, stop, stopAhead, input: unquote(text).slice(0, 400) };
    if (pastBirthday) T.turn.pastBirthday = pastBirthday;
    if (birthday) { T.turn.birthday = true; T.turn.floor = floor; }
    syncCards(today());
    state.memory.frontMemory = shortStatusFor(T.idx);
    return [text, false];
  }

  if (hook === "context") {
    syncTurn("ctx");
    if (!T.turn.cmd) rollbackTurn();
    let ctx = String(text || "");
    ctx = removeFrontMemoryEcho(ctx, state.memory.frontMemory);
    ctx = ctx.replace(statusPattern, "").replace(/\n{3,}/g, "\n\n");
    ctx = ctx.replace(/^.*\[Tracker\].*$\n?/gm, "").replace(reCommandLine, "");
    const picked = applyCharacterPick(ctx);
    ctx = picked.ctx;
    T.jack = picked.jack;
    if (!picked.jack && typeof picked.powers === "string") T.customPowers = picked.powers;   // a blanked answer clears it; no options block leaves it
    // An adventure made from an older Plot Essentials still describes Jack there (his old past included): the note doesn't add a second profile
    T.jackInPE = !!picked.jack && /^(?:Origin \(Secret|Personality \(grown|JACK SUMMERS \(the player, "you"\)\. Born\b)/m.test(ctx);
    // Once per adventure: the start date and the character's age from the questions answered at the start.
    // A story that is already under way (the script was updated mid-adventure) keeps its date.
    const storyAt0 = ctx.search(/Recent\s*Story\s*:/i);
    const fresh = storyAt0 < 0 || ctx.length - storyAt0 < 1500;
    if (!fresh) T.began = true;   // the story is under way: no opening hint, no opening date line
    if (!T.setup) {
      T.setup = true;
      T.startAt = null;
      let start = picked.startIdx;
      if (picked.jack && start !== null && start < toIdx(C.start.year, C.start.month)) start = null;   // Jack's story can't start before Red River
      if (fresh) {
        // a new story starts on the day the start answer names ("June 4, 2019"), otherwise on the 1st
        if (start !== null) T.idx = start;
        T.day = start !== null && picked.startDay ? Math.min(picked.startDay, dim(T.idx)) : 1;
        T.dayGuess = false;
        if (T.turn) Object.assign(T.turn, { base: T.idx, start: T.idx, baseDay: T.day, startDay: T.day, baseGuess: false, guess: false });
      }
      if (fresh) T.startAt = T.idx;
      // a custom character keeps the age the player gave; under 18 they get the minor rule like Jack does
      if (!picked.jack && picked.age !== null && picked.age >= 0 && picked.age <= 120) T.customBirth = T.idx - picked.age * 12;
      if (!picked.jack && picked.name) T.customName = picked.name;
      settleOldNews(today());
    }
    // Canon dated after the furthest day this turn can reach stays out of what the AI reads
    {
      const t = T.turn || {};
      const sa = t.stopAhead ? newsByKey(t.stopAhead) : null;   // the canon stop ahead: the window ends on its day
      const reach = t.mode === "vague" ? (sa ? stopDayOf(sa) : dayNo(T.idx + (t.cap || C.maxVagueJumpMonths), 31))
        : t.mode === "days" ? today() + (t.dayCap || 7) : today();
      ctx = hideFutureCanon(ctx, reach);
    }
    const age = ageAt(T.idx);
    if (isJack() && age < 18) ctx = stripUnsafe(ctx);
    // His grown fighting style stays out of what the AI reads until his late teens
    if (isJack() && age < 16) ctx = ctx.replace(/^Fighting style \(from his late teens\):[^\n]*\n?/m, "");
    // End of the story so far, in case the output hook can't read history
    T.ctxTail = ctx.replace(/\[Author['’]?s note:[\s\S]*?\](?=[ \t]*(?:\r?\n|$))/gi, "").trimEnd().slice(-600);
    // Early canon already in the story (from before this script, or typed in by hand) stays out of what the AI reads
    { const at = ctx.search(/Recent\s*Story\s*:/i); if (at >= 0) ctx = ctx.slice(0, at) + guardEarlyCanon(ctx.slice(at), true); }
    const max = (typeof info !== "undefined" && info && Number.isInteger(info.maxChars)) ? info.maxChars : 0;
    T.max = max;
    const storyAt = ctx.search(/Recent\s*Story\s*:/i);
    const recent = (storyAt >= 0 ? ctx.slice(storyAt) : ctx).slice(-8000);
    const status = statusFor(T.idx, (T.began ? "" : openingHint()) + skipHint(), recent, !max || max >= C.compactBelowChars ? 0 : max >= C.minimalBelowChars ? 1 : 2);
    // The Author's note ends at the "]" that closes its line, so brackets inside it are fine
    const notes = [...ctx.matchAll(/\[Author['’]?s note:[\s\S]*?\](?=[ \t]*(?:\r?\n|$))/gi)];
    if (notes.length) {
      const last = notes[notes.length - 1];
      const at = last.index + last[0].length;
      ctx = ctx.slice(0, at) + "\n" + status + ctx.slice(at);
    } else {
      ctx = ctx.trimEnd() + "\n\n" + status + "\n";
    }
    if (max && ctx.length > max) {
      // Too long: drop the oldest story text first, then the top of the context (world notes).
      // The Author's note, the status note and the player's last action at the end are never cut.
      const an = ctx.lastIndexOf("[Author");
      const st = ctx.lastIndexOf(STATUS_TAG);
      const keepFrom = Math.max(0, an >= 0 && an < st ? an : st);
      let over = ctx.length - max + 20;
      const marker = ctx.search(/Recent\s*Story\s*:/i);
      const startAt = marker >= 0 ? ctx.indexOf("\n", marker) + 1 : 0;
      if (startAt > 0 && startAt < keepFrom) {
        let cutTo = Math.min(startAt + over, keepFrom);
        if (cutTo < keepFrom) {
          const lineEnd = ctx.indexOf("\n", cutTo);
          if (lineEnd >= 0 && lineEnd - cutTo < 600 && lineEnd + 1 <= keepFrom) cutTo = lineEnd + 1;   // drop whole lines of the oldest text
        }
        ctx = ctx.slice(0, startAt) + ctx.slice(cutTo);
        over = ctx.length - max + 20;
      }
      if (over > 20) {
        // Still too long (a very small context): cut from the top, never into the story or the notes
        const limit = marker >= 0 ? marker : keepFrom;
        let cut = Math.min(over, limit);
        const lineEnd = ctx.indexOf("\n", cut);
        if (cut > 0 && lineEnd >= 0 && lineEnd - cut < 300 && lineEnd + 1 <= limit) cut = lineEnd + 1;
        ctx = ctx.slice(cut);
      }
    }
    return [ctx, false];
  }

  if (hook === "output") {
    const original = stripNotes(String(text || ""));   // without any hidden note the AI copied in
    let out = dropActionEcho(original);
    const turn = syncTurn("out");
    if (turn.cmd) {                       // the AI's answer to a command is not kept
      state.message = turn.cmd;
      state.memory.frontMemory = shortStatusFor(T.idx);
      return ["\n", false];
    }
    const base = typeof turn.base === "number" ? turn.base : T.idx;   // the month before this turn
    const startIdx = T.idx, startNo = today();   // where the reply starts from: a typed skip's landing, or the date before the turn
    const capEntry = (turn.mode === "vague" || turn.mode === "days") && turn.stopAhead ? newsByKey(turn.stopAhead) : null;
    const capNo = capEntry ? stopDayOf(capEntry) : null;   // the canon stop this skip can't pass
    rollbackTurn();
    // A paragraph the AI wrote twice is kept once before anything reads dates or ages from it
    out = dropRepeatedParagraphs(out);

    // 1. Date lines that open a paragraph. One stays only where the month changes, on its own
    //    line: the first one after a typed skip shows the typed date; any later date the AI
    //    writes moves the tracker forward (within maxEvidenceMonths); an earlier one is
    //    normalized to the tracked date. A date line that changes nothing is removed. The line
    //    the reader sees names only the month; a day in it ("June 4, 2019.") is kept for step 2b.
    let shown = base;     // the month the reader last saw
    let stamps = 0;       // date lines the AI wrote
    let kept = 0;         // date lines left in
    const dated = [];     // dates with a day the reply wrote: { at (in the text as it becomes), i, d }
    let shift = 0;        // how much longer the text has become so far by the date lines changed
    out = out.replace(reStamp, (whole, nl, sp, dayBefore, monthWord, dayAfter, year, trail, offset, all) => {
      const atLead = all.slice(0, offset).trim() === "";
      if (!monthWord && !atLead) return whole;   // a bare year mid-text is not a stamp
      const y = parseInt(year, 10);
      const aiIdx = monthWord ? toIdx(y, parseMonthWord(monthWord)) : (y > yearOf(T.idx) ? toIdx(y, 1) : T.idx);
      let idx = T.idx;
      // the first date line after a typed skip shows the typed date; while the day is only a guess, a short skip can
      // still cross into the next month (never past a canon stop)
      if (stamps === 0 && turn.mode === "exact") idx = turn.start === base && aiIdx === base + 1 && T.dayGuess && !turn.stop ? aiIdx : T.idx;
      else if (aiIdx > T.idx && aiIdx - base <= C.maxEvidenceMonths) idx = capNo !== null ? Math.min(aiIdx, fromDayNo(capNo).i) : aiIdx;
      stamps++;
      if (idx !== T.idx) setMonth(idx);
      const day = monthWord ? dayIn(dayBefore || dayAfter, monthWord, aiIdx) : null;
      if (day) dated.push({ at: offset + shift, i: aiIdx, d: day });
      const next = all.charAt(offset + whole.length);
      let res;
      if (idx === shown) {                       // nothing changed: drop the date line
        res = next === "\n" || next === "" ? nl : nl + sp + (offset === 0 && !nl && !sp ? "\n\n" : "");
      } else {
        shown = idx;
        kept++;
        res = (nl || (offset === 0 ? "\n" : "")) + fmt(idx) + "." + (next === "\n" ? "" : "\n\n");
      }
      shift += res.length - whole.length;
      return res;
    });
    out = collapseDateLines(out);
    out = out.replace(/\bVaught\b/g, "Vought").replace(/\bVAUGHT\b/g, "VOUGHT");

    // 2. Where the AI's own text reaches a later date ("It's March 2016", "You turn sixteen in
    //    September 2016", "You're eighteen", "Six months later"), the tracker follows it. Not on a
    //    typed exact skip, where the typed date is the one that counts.
    let evAt = -1;        // where in the text the story reaches the tracked date
    if (turn.mode !== "exact") {
      const canonCounts = turn.mode === "vague" || turn.mode === "days" || reNewsy.test(out) || reOutputSkipOnce.test(out) || reOutputSpanOnce.test(out) || reOutputWeeksOnce.test(out);
      const ev = collectEvidence(out, base, T.idx, canonCounts, stamps > 0);
      if (ev) {
        const moved = ev.idx !== T.idx;
        setMonth(ev.idx);
        // a canon stop the reply told: at least its day, and exactly its day when the reply only now reached its month
        if (ev.minDay && (moved || ev.minDay > T.day)) T.day = Math.min(ev.minDay, dim(T.idx));
        evAt = ev.at;
      }
    }
    // "Your birthday arrives": never land before the next birthday
    if (curBirth() !== null && typeof turn.floor === "number" && T.idx < turn.floor) setMonth(turn.floor);   // the date line goes where the text jumped, or at the top

    // 2b. The day (v3.2). A date with a day that the reply wrote ("June 4, 2019." / "It's June 4, 2019") sets it, if it
    //     is in the month the story is now in and not earlier than where the reply started (while the day is only a
    //     guess, any day of that month); a canon stop holds its own day. The narration's day jumps ("The next morning",
    //     "Three days later") count, in order and at most 60 days, only on a turn without a typed skip whose reply
    //     didn't move the month; and a vague day skip ("days pass") with nothing in the reply moves its default.
    {
      const dates = dated.concat(datesWithDay(out)).filter((e) => !turn.stop);
      if (turn.mode === "exact" || T.idx !== startIdx) {
        let best = null;
        for (const e of dates) {
          const n = dayNo(e.i, e.d);
          if (e.i === T.idx && (T.dayGuess || n >= startNo) && (best === null || n > best)) best = n;
        }
        if (best !== null) { setToday(best); T.dayGuess = false; }
      } else {
        const events = dates.map((e) => ({ at: e.at, no: dayNo(e.i, e.d), i: e.i })).concat(dayJumps(out)).sort((a, b) => a.at - b.at);
        let cur = startNo, total = 0, crossAt = -1, said = false, known = false;
        for (const e of events) {
          if (typeof e.n === "number") {          // a jump
            if (total >= 60) continue;
            const k = Math.min(e.n, 60 - total);
            total += k;
            cur += k;
            said = true;
            if (crossAt < 0 && fromDayNo(cur).i !== startIdx) crossAt = e.at;
          } else if (e.i === fromDayNo(cur).i && ((T.dayGuess && !known) || e.no >= cur)) {   // a date in the month reached
            cur = e.no;
            said = known = true;
          }
        }
        if (!said && turn.mode === "days") cur = startNo + Math.min(turn.dayDefault || 3, turn.dayCap || 7);   // nothing said: the default
        if (cur !== startNo) setToday(cur);
        if (known) T.dayGuess = false;
        if (crossAt >= 0 && T.idx !== startIdx) evAt = crossAt;   // the date line goes where the narration crossed into the new month
      }
    }
    if (capNo !== null && today() > capNo) { setToday(capNo); T.dayGuess = false; }   // never past the stop ahead
    const fixFrom = Math.max(0, evAt);

    // 3. Year claims ("It's 2022.") and age statements that go backward from the date the text reached
    out = out.replace(reInlineYear, (whole, lead2, wday, month, day, year, offset) => {
      if (offset < fixFrom || futureLead(out, offset)) return whole;
      const y = parseInt(year, 10);
      if (y === yearOf(T.idx) && (!month || parseMonthWord(month) === monthOf(T.idx))) return whole;
      const exact = !T.dayGuess;   // a claim with a weekday or a day gets the tracked ones, when the day is known
      return lead2 + (wday && exact ? weekday(today()) + ", " : "") + (month ? MONTHS[monthOf(T.idx) - 1] + " " + (day && exact ? T.day + ", " : "") : "") + yearOf(T.idx);
    });
    const age = ageAt(T.idx);
    if (curBirth() !== null) out = fixAgeStatements(out, charAge(T.idx), fixFrom);

    // 4. Show the date where the story reached it: before the line that gets there, or at the top
    //    of a typed skip the AI didn't date
    if (T.idx !== shown) {
      if (!out.trim()) out = "\n" + fmt(T.idx) + ".\n";   // the reply was only a stale date line
      else out = evAt >= 0 ? insertDateLine(out, evAt, fmt(T.idx) + ".") : "\n" + fmt(T.idx) + ".\n\n" + out.replace(/^\s+/, "");
      out = collapseDateLines(out);
    }
    // The story's first reply opens with its date
    if (!T.began) {
      T.began = true;
      if (out.trim() && !/^\s*(?:January|February|March|April|May|June|July|August|September|October|November|December) (?:19|20)\d\d\./.test(out)) {
        out = "\n" + fmt(T.idx) + ".\n\n" + out.replace(/^\s+/, "");
      }
    }

    // News: what this reply delivered, and what to stop asking for
    migrateTold();
    const delivered = [];
    for (const n of NEWS) {
      const k = newsKey(n), x = newsDay(n);
      if (!T.told[k] && newsLive(n) && x <= today() && today() - x <= 365 && (n[3].test(out) || (n[6] && n[6].test(out)))) { T.told[k] = true; delivered.push(n); }
    }
    if (typeof T.pendingDay === "number" && today() >= T.pendingDay) T.pendingDay = null;
    if (T.newsDue && !T.told[T.newsDue]) {
      T.tries = T.tries || {};
      T.tries[T.newsDue] = (T.tries[T.newsDue] || 0) + 1;
      if (T.tries[T.newsDue] >= 4) T.told[T.newsDue] = true;   // the scene never gave it room: let it go
    }
    if (today() !== startNo || T.idx !== base) settleOldNews(today(), dayNo(base, typeof turn.baseDay === "number" ? turn.baseDay : T.day));

    // 4b. What the script can catch in the reply itself: powers Jack doesn't have, speeds and lifts past his age
    if (isJack()) out = enforceJack(out, age);

    // 5. A Continue that opens by repeating the end of the last turn (word for word on any turn;
    //    restated in new words only on a Continue, where the last history entry is the AI's own text)
    const isContinue = /^(?:continue|start)$/.test(lastActionType());
    out = dropRepeatedOpening(out, lastActionText(), isContinue);
    out = out.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n");
    if (!out.trim()) out = original;      // the turn was only a date line: leave it
    if (!out.trim()) out = "\n";          // the reply was nothing but a copied note
    out = fixStrayQuotes(out, lastActionText());
    out = fixFirstPerson(out);
    out = dropMetaCanon(out);
    out = dropRepeatedParagraphs(out);
    out = collapseDateLines(out);   // a cut between two date lines leaves them back to back: keep the later one

    // 6. Safety while Jack is a minor
    if (isJack() && age < 18) out = stripUnsafe(out);

    // 6b. What the story changed (deaths, survivals, joining the Seven or the Boys), then the dead walking
    const changed = noticeChanges(out);
    // 6c. Canon the reply brought in before its date (after the changes above, so what the player caused stands)
    out = guardEarlyCanon(out, false);
    for (const [name, died, story] of deadShownAlive(out, T.idx)) {
      const p = trackedByName(name);
      if (!story && !changeOf(name) && p && p[2] && T.seenYou[name] === p[2]) {
        // with the player character through the month canon kills them, and still here: the story kept them alive
        addChange(name, "alive", T.idx);
        changed.push(name + " survives.");
        continue;
      }
      addFix(name + " died in " + fmt(died) + (story ? " in this story" : "") + " and is dead now. A recent reply showed them alive, which was a mistake: they're gone and don't appear again, unless the player writes in a recording, a memory, or an impostor.");
    }
    // 7. The player's notice: a stop, canon the reply delivered, what the story changed. [Tracker] lines never reach the AI.
    const notices = [];
    const stopEntry = turn.stop ? newsByKey(turn.stop) : null;
    if (stopEntry) {
      notices.push((isBeat(stopEntry) ? "Stop, " : "Canon stop, ") + fmtNo(stopDayOf(stopEntry)) + ": " + stopEntry[5] + "." +
        (typeof T.pendingDay === "number" && T.pendingDay > today() ? " Your skip to " + textNo(T.pendingDay) + " is paused here. Type /skip to continue it, or play on." : ""));
    }
    for (const n of delivered) if (newsKey(n) !== turn.stop) notices.push("Canon, " + fmtNo(newsDay(n)) + ": " + n[5] + ".");
    for (const c of changed) notices.push("Changed in this story: " + c);
    if (notices.length && out.trim()) out = out.replace(/\s+$/, "") + "\n\n" + notices.map((n) => "[Tracker] " + n).join("\n") + "\n";

    syncCards(today());   // the cards' canon history, as of the day the story reached
    state.memory.frontMemory = shortStatusFor(T.idx);
    return [out, false];
  }

  return [text, false];
}

