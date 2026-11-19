/**
 * Bet9ja booking codes, created from the user's own browser.
 *
 * Bet9ja does not accept requests from our server, but it does accept them from a
 * visitor's browser, so the last step happens here: the server prepares each
 * selection (Sportradar match id + Bet9ja odd key), this module finds the fixture on
 * Bet9ja, reads its current price and asks Bet9ja for a booking code.
 */
const B9 = "https://sports.bet9ja.com/desktop/feapi";

export interface Bet9jaLeg { sr: string; key: string; name: string; category: string; tournament: string; odds: number }
export interface Bet9jaResult { code?: string; added: number; skipped: string[]; total_odds?: number; error?: string }

interface B9Event { ID: number; EXTID?: string | number; O?: { [key: string]: string } }
interface B9League { gid: string; country: string; league: string }

const tokens = (s: string) => new Set((s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ").filter(w => w.length > 1));
const overlap = (a: Set<string>, b: Set<string>) => {
  let both = 0;
  a.forEach(x => { if (b.has(x)) both += 1; });
  const union = a.size + b.size - both;
  return union ? both / union : 0;
};

// Bet9ja's own cache-version parameter: a fresh value gets a response addressed to this page
const VERSION = Date.now();

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${B9}/${path}${path.includes("?") ? "&" : "?"}v_cache_version=${VERSION}`, { credentials: "omit" });
  const json = await res.json();
  if (json.R !== "OK") throw new Error("Bet9ja request failed");
  return json.D as T;
}

export async function createBet9jaCode(legs: Bet9jaLeg[]): Promise<Bet9jaResult> {
  const skipped: string[] = [];
  if (!legs.length) return { added: 0, skipped, error: "None of these selections exist on Bet9ja." };

  let leagues: B9League[] = [];
  try {
    const tree = await get<{ PAL: { [sport: string]: { SG?: { [id: string]: { SG_DESC?: string; G?: { [gid: string]: { G_DESC?: string } } } } } } }>("PalimpsestAjax/GetSports?DISP=0");
    Object.values(tree.PAL?.["1"]?.SG || {}).forEach(sg =>
      Object.entries(sg.G || {}).forEach(([gid, g]) => leagues.push({ gid, country: sg.SG_DESC || "", league: g.G_DESC || "" })));
  } catch {
    return { added: 0, skipped, error: "Bet9ja could not be reached from this device." };
  }

  const bySr = new Map<string, B9Event>();
  const loaded = new Set<string>();
  const loadGroup = async (gid: string) => {
    if (loaded.has(gid)) return;
    loaded.add(gid);
    try {
      const d = await get<{ E?: B9Event[] }>(`PalimpsestAjax/GetEventsInGroupV2?GROUPID=${gid}&DISP=0&GROUPMARKETID=1&matches=true`);
      (d.E || []).forEach(e => { if (e.EXTID) bySr.set(String(e.EXTID), e); });
    } catch { /* league unavailable: try the next */ }
  };

  const picks: { id: number; key: string; odd: string }[] = [];
  for (const leg of legs) {
    if (!bySr.has(leg.sr)) {
      const wantT = tokens(leg.tournament), wantC = tokens(leg.category);
      const ranked = leagues
        .map(l => ({ gid: l.gid, t: overlap(wantT, tokens(l.league)), c: overlap(wantC, tokens(l.country)) }))
        .filter(x => x.t > 0 && 2 * x.t + x.c > 0.6)
        .sort((a, b) => (2 * b.t + b.c) - (2 * a.t + a.c))
        .slice(0, 5);
      for (const r of ranked) {
        await loadGroup(r.gid);
        if (bySr.has(leg.sr)) break;
      }
    }
    const ev = bySr.get(leg.sr);
    if (!ev) { skipped.push(`${leg.name} - fixture not found on Bet9ja`); continue; }
    let odd = ev.O?.[leg.key];
    if (!odd) {
      try { odd = (await get<B9Event>(`PalimpsestAjax/GetEvent?EVENTID=${ev.ID}`)).O?.[leg.key]; } catch { /* handled below */ }
    }
    if (!odd) { skipped.push(`${leg.name} - market not offered on Bet9ja`); continue; }
    if (leg.odds > 1 && Math.abs(Number(odd) / leg.odds - 1) > 0.25) {
      skipped.push(`${leg.name} - Bet9ja price ${odd} does not match ${leg.odds}; left out to be safe`);
      continue;
    }
    picks.push({ id: ev.ID, key: leg.key, odd: String(odd) });
  }
  if (!picks.length) return { added: 0, skipped, error: "None of these selections could be placed on Bet9ja." };

  const odds: { [key: string]: string } = {};
  let total = 1;
  picks.forEach(p => { odds[`${p.id}$${p.key}`] = p.odd; total *= Number(p.odd); });
  const n = picks.length;
  const type = n === 1 ? 3 : 1;                         // Bet9ja bet types: 3 = single, 1 = multiple
  const slip = {
    BETS: [{ BSTYPE: type, TAB: type, NUMLINES: n, COMB: 1, TYPE: n, STAKE: 100,
      POTWINMIN: Math.round(total * 10000) / 100, POTWINMAX: Math.round(total * 10000) / 100, BONUSMIN: 0, BONUSMAX: 0,
      ODDMIN: Math.round(total * 100) / 100, ODDMAX: Math.round(total * 100) / 100, ODDS: odds, FIXED: {} }],
    IMPERSONIZE: 0,
  };
  try {
    const res = await fetch(`${B9}/PlacebetAjax/BookABetV2`, {
      method: "POST", credentials: "omit",
      body: new URLSearchParams({ BETSLIP: JSON.stringify(slip), IS_PASSBET: "0" }),
    });
    const json = await res.json();
    const first = Array.isArray(json.D) ? json.D[0] : json.D;
    if (json.R === "OK" && first?.RIS) {
      return { code: String(first.RIS), added: n, skipped, total_odds: Math.round(total * 100) / 100 };
    }
    return { added: 0, skipped, error: "Bet9ja did not accept this slip." };
  } catch {
    return { added: 0, skipped, error: "Bet9ja could not be reached from this device." };
  }
}
