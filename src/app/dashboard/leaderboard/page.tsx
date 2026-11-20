"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CheckCircle2, Clock, Copy, Loader2, Send, ShieldCheck, Trophy, UserPlus, UserCheck, Users, XCircle } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io").replace(/\/$/, "");
const BOOKIES = [
  { id: "sportybet", name: "SportyBet" }, { id: "bet9ja", name: "Bet9ja" },
  { id: "msport", name: "MSport" }, { id: "betika", name: "Betika" },
];

interface Leg { match: string; league?: string; kickoff?: string; market: string; pick: string; odds: number; state?: string; score?: string; result?: string }
interface Record { settled: number; wins: number; losses: number; win_rate: number | null; roi: number | null; streak: number; followers: number; pending?: number }
interface Slip {
  id: number; username: string; platform: string; code: string; legs: Leg[]; legs_count: number; total_odds: number;
  probability: number | null; note?: string; status: string; tails: number; posted_at: string; author: Record; following: boolean; mine: boolean;
}
interface Rank extends Record { user_id: number; username: string; following: boolean; me: boolean }

const errText = (e: unknown) => (axios.isAxiosError(e) && typeof e.response?.data?.detail === "string" ? e.response.data.detail : "Something went wrong. Please try again.");

function StatusBadge({ status }: { status: string }) {
  const map: { [k: string]: { cls: string; icon: React.ReactNode; label: string } } = {
    won: { cls: "text-green-400 border-green-400/30 bg-green-400/10", icon: <CheckCircle2 className="w-3 h-3" />, label: "Won" },
    lost: { cls: "text-red-400 border-red-400/30 bg-red-400/10", icon: <XCircle className="w-3 h-3" />, label: "Lost" },
    pending: { cls: "text-slate-300 border-white/15 bg-white/5", icon: <Clock className="w-3 h-3" />, label: "Open" },
  };
  const s = map[status] || { cls: "text-slate-400 border-white/10 bg-white/5", icon: <Clock className="w-3 h-3" />, label: status };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>{s.icon}{s.label}</span>;
}

function RecordLine({ r }: { r: Record }) {
  if (!r || !r.settled) return <span className="text-[10px] text-slate-500">No settled slips yet</span>;
  return (
    <span className="text-[10px] text-slate-400">
      {r.wins}W–{r.losses}L · {r.win_rate}% hit · <span className={(r.roi ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>{(r.roi ?? 0) > 0 ? "+" : ""}{r.roi}% return</span>
    </span>
  );
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState<"all" | "following" | "mine" | "board">("all");
  const [slips, setSlips] = useState<Slip[]>([]);
  const [board, setBoard] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ platform: "sportybet", code: "", note: "" });
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [tailPlatform, setTailPlatform] = useState("sportybet");
  const [tailed, setTailed] = useState<{ [id: number]: { code?: string; error?: string; skipped?: string[]; loading?: boolean } }>({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (tab === "board") {
        setBoard((await axios.get(`${API_URL}/social/leaderboard`, { headers })).data);
      } else {
        setSlips((await axios.get(`${API_URL}/social/feed`, { headers, params: { scope: tab } })).data);
      }
    } catch (e) {
      setNotice({ ok: false, text: errText(e) });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  useEffect(() => { load(); }, [load]);

  const post = async () => {
    if (!form.code.trim()) return;
    setPosting(true); setNotice(null);
    try {
      await axios.post(`${API_URL}/social/post`, { platform: form.platform, code: form.code.trim(), note: form.note.trim() || null }, { headers });
      setForm({ ...form, code: "", note: "" });
      setNotice({ ok: true, text: "Posted. Your followers were notified and the result will be verified automatically." });
      if (tab === "board") setTab("mine"); else load();
    } catch (e) {
      setNotice({ ok: false, text: errText(e) });
    } finally {
      setPosting(false);
    }
  };

  const toggleFollow = async (username: string, following: boolean) => {
    try {
      await axios({ method: following ? "delete" : "post", url: `${API_URL}/social/follow/${encodeURIComponent(username)}`, headers });
      setSlips(prev => prev.map(s => (s.username === username ? { ...s, following: !following } : s)));
      setBoard(prev => prev.map(b => (b.username === username ? { ...b, following: !following } : b)));
    } catch (e) {
      setNotice({ ok: false, text: errText(e) });
    }
  };

  const tail = async (id: number) => {
    setTailed(prev => ({ ...prev, [id]: { loading: true } }));
    try {
      const res = await axios.post(`${API_URL}/social/tail/${id}`, { platform: tailPlatform }, { headers });
      setTailed(prev => ({ ...prev, [id]: { code: res.data.code, skipped: res.data.skipped } }));
    } catch (e) {
      setTailed(prev => ({ ...prev, [id]: { error: errText(e) } }));
    }
  };

  const tabs = [
    { id: "all", label: "Everyone" }, { id: "following", label: "Following" },
    { id: "mine", label: "My slips" }, { id: "board", label: "Leaderboard" },
  ] as const;
  const input = "bg-black/30 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal/60";

  return (
    <div className="w-full max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-0 space-y-6">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight text-gradient mb-1">Community</h1>
        <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Every result here is read from the bookmaker. Nobody marks their own slips.
        </p>
        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
          <span className="text-slate-300">Tail</span>: copy a slip to your own bookmaker. <span className="text-slate-300">Hit</span>: how often their slips win.{" "}
          <span className="text-slate-300">Return</span>: profit or loss for every 100 staked on their slips. <span className="text-slate-300">Chance</span>: how likely the whole slip is to win.
        </p>
      </header>

      <section className="bg-[#0A0F1C] border border-white/10 p-4 md:p-5 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Post a slip to your followers</p>
        <div className="flex flex-col md:flex-row gap-2">
          <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={input}>
            {BOOKIES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Booking code" className={`${input} md:w-44 font-mono`} />
          <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" maxLength={280} className={`${input} flex-1`} />
          <button onClick={post} disabled={posting || !form.code.trim()} className="px-5 py-2.5 bg-brand-teal text-background font-black text-xs uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
          </button>
        </div>
        <p className="text-[10px] text-slate-500">Only slips whose games have not started can be posted.</p>
        {notice && <p className={`text-xs ${notice.ok ? "text-green-400" : "text-red-400"}`}>{notice.text}</p>}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex border border-white/10">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 md:px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${tab === t.id ? "bg-brand-teal text-background" : "text-slate-400 hover:text-white"}`}>{t.label}</button>
          ))}
        </div>
        {tab !== "board" && (
          <label className="flex items-center gap-2 text-[11px] text-slate-400">Tail to
            <select value={tailPlatform} onChange={e => setTailPlatform(e.target.value)} className={`${input} py-1.5 text-xs`}>
              {BOOKIES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : tab === "board" ? (
        board.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-16">The leaderboard opens once someone has 3 settled slips.</p>
        ) : (
          <div className="border border-white/10 divide-y divide-white/5">
            {board.map((b, i) => (
              <div key={b.user_id} className="flex items-center gap-3 p-4 bg-[#0A0F1C]">
                <span className="w-7 text-sm font-black text-slate-500">{i === 0 ? <Trophy className="w-4 h-4 text-yellow-400" /> : i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">@{b.username}{b.me && <span className="text-slate-500 font-normal"> (you)</span>}</p>
                  <RecordLine r={b} />
                </div>
                <span className="hidden md:flex items-center gap-1 text-[10px] text-slate-500"><Users className="w-3 h-3" />{b.followers}</span>
                {!b.me && (
                  <button onClick={() => toggleFollow(b.username, b.following)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${b.following ? "border-white/15 text-slate-300" : "border-brand-teal text-brand-teal"}`}>
                    {b.following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : slips.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-16">
          {tab === "following" ? "Nobody you follow has posted yet. Find people under Everyone or the Leaderboard." : tab === "mine" ? "You have not posted a slip yet." : "No slips posted yet. Be the first."}
        </p>
      ) : (
        <div className="space-y-4">
          {slips.map(s => {
            const t = tailed[s.id];
            return (
              <article key={s.id} className="bg-[#0A0F1C] border border-white/10 p-4 md:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">@{s.username}</p>
                    <RecordLine r={s.author} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={s.status} />
                    {!s.mine && (
                      <button onClick={() => toggleFollow(s.username, s.following)} title={s.following ? "Unfollow" : "Follow"} className={`p-1.5 border ${s.following ? "border-white/15 text-slate-300" : "border-brand-teal text-brand-teal"}`}>
                        {s.following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
                {s.note && <p className="text-xs text-slate-300">{s.note}</p>}
                <ul className="divide-y divide-white/5 border border-white/5">
                  {s.legs.map((l, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{l.match}</p>
                        <p className="text-[10px] text-slate-400 truncate">{l.market}: {l.pick}{l.kickoff ? ` · ${new Date(l.kickoff).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono font-bold text-brand-teal">@{l.odds}</p>
                        {l.result && l.result !== "pending" ? <p className={`text-[10px] font-bold uppercase ${l.result === "won" ? "text-green-400" : l.result === "lost" ? "text-red-400" : "text-slate-400"}`}>{l.result}</p>
                          : l.state === "live" ? <p className="text-[10px] text-yellow-400">Live {l.score || ""}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    {s.legs_count} legs · total odds <span className="text-white font-bold">{s.total_odds}</span>
                    {s.probability != null && <> · chance <span className="text-white font-bold">{s.probability}%</span></>} · {s.tails} tailed
                  </p>
                  {s.status === "pending" && !t?.code && (
                    <button onClick={() => tail(s.id)} disabled={t?.loading} className="px-4 py-2 bg-white text-background font-black text-[11px] uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
                      {t?.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Tail on {BOOKIES.find(b => b.id === tailPlatform)?.name}
                    </button>
                  )}
                </div>
                {t?.code && (
                  <div className="border border-brand-teal/30 bg-brand-teal/5 px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-mono font-bold text-white">{t.code}</span>
                      <button onClick={() => navigator.clipboard.writeText(t.code || "")} className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-teal"><Copy className="w-3 h-3" /> Copy</button>
                    </div>
                    {(t.skipped || []).map((x, i) => <p key={i} className="text-[10px] text-yellow-400">Left out: {x}</p>)}
                  </div>
                )}
                {t?.error && <p className="text-xs text-red-400">{t.error}</p>}
              </article>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 text-center">A good record does not guarantee the next slip. Stake only what you can afford to lose.</p>
    </div>
  );
}
