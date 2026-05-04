"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Crown, BellRing, Send, CheckCircle2,
  Loader2, LinkIcon, Unlink, Lock, AlertCircle, Zap, Sparkles,
  Wifi, ShieldCheck, Activity, Gift, XCircle, ChevronRight,
} from "lucide-react";
import { useEffect } from "react";

interface SettingsPageClientProps {
  user: {
    email: string;
    is_premium: boolean;
    is_quant?: boolean;
    telegram_id?: number | null;
    telegram_linked?: boolean;
    link_code?: string;
    total_referrals?: number;
    created_at?: string;
  };
  accessToken: string;
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8 space-y-5">
      <div>
        <h3 className="text-sm font-black text-white">{title}</h3>
        {desc && <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-slate-200 font-medium">{label}</div>
        {desc && <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      className={`relative flex items-center w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${on
        ? "bg-brand-teal shadow-[0_0_12px_rgba(0,198,186,0.45)]"
        : "bg-white/10"
        }`}
    >
      {/* Track border */}
      <span className={`absolute inset-0 rounded-full border transition-all duration-300 ${on ? "border-brand-teal/60" : "border-white/15"}`} />
      {/* Knob */}
      <span
        className={`absolute w-5 h-5 rounded-full shadow-md transition-all duration-300 ${on
          ? "translate-x-[26px] bg-white"
          : "translate-x-[2px] bg-white/70"
          }`}
      />
    </button>
  );
}

// ─── Cash Rewards Panel ───────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

interface Reward {
  id: number;
  amount_ngn: number;
  milestone: number;
  status: "pending" | "approved" | "paid";
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  created_at: string;
  paid_at: string | null;
}

function CashRewardsPanel({ accessToken, totalReferrals }: { accessToken: string; totalReferrals: number }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [form, setForm] = useState({ bank_name: "", account_name: "", account_number: "" });
  const [msg, setMsg] = useState("");
  const [loadingRewards, setLoadingRewards] = useState(true);

  const headers = { Authorization: `Bearer ${accessToken}` };

  useEffect(() => {
    axios.get(`${API_URL}/my-rewards`, { headers })
      .then(r => setRewards(r.data))
      .catch(() => {})
      .finally(() => setLoadingRewards(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const nextMilestone = Math.ceil((totalReferrals + 1) / 5) * 5;
  const progressPct = Math.min(((totalReferrals % 5) / 5) * 100, 100);
  const remaining = nextMilestone - totalReferrals;

  const handleClaim = async (rewardId: number) => {
    if (!form.bank_name || !form.account_name || !form.account_number) {
      setMsg("❌ Please fill all bank details before claiming."); return;
    }
    setClaiming(rewardId); setMsg("");
    try {
      await axios.post(`${API_URL}/claim-reward`, { reward_id: rewardId, ...form }, { headers });
      setMsg("✅ Bank details submitted! Your ₦500 will arrive within 2–3 business days.");
      setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, status: "approved" as const } : r));
    } catch (err: any) {
      setMsg(`❌ ${err?.response?.data?.detail || "Submission failed."}`);
    } finally { setClaiming(null); }
  };

  const statusChip = (status: string) => {
    const s: Record<string, string> = {
      pending:  "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
      approved: "bg-brand-teal/10 border-brand-teal/20 text-brand-teal",
      paid:     "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    };
    return s[status] || "bg-white/5 border-white/10 text-slate-400";
  };

  return (
    <div className="space-y-5">
      {/* Progress toward next ₦500 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-400/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">₦500 Milestone</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{totalReferrals % 5} / 5 referrals</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          {remaining === 0 ? "🎉 Milestone reached! Claim your ₦500 below." : `Refer ${remaining} more user${remaining !== 1 ? "s" : ""} to unlock your next ₦500 cash reward.`}
        </p>
      </div>

      {/* Reward list */}
      {loadingRewards ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-brand-teal" /></div>
      ) : rewards.length === 0 ? (
        <p className="text-[11px] text-slate-500 text-center py-4">No rewards yet. Keep referring friends!</p>
      ) : (
        <div className="space-y-3">
          {rewards.map(r => (
            <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">₦{r.amount_ngn} Cash Reward</p>
                  <p className="text-[10px] text-slate-500">Milestone: {r.milestone} referrals · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${statusChip(r.status)}`}>
                  {r.status}
                </span>
              </div>

              {r.status === "pending" && (
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter Bank Details to Claim</p>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                    placeholder="Bank Name (e.g. GTBank)"
                    value={form.bank_name}
                    onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                    placeholder="Account Name"
                    value={form.account_name}
                    onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                    placeholder="Account Number"
                    value={form.account_number}
                    onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                  />
                  <button
                    onClick={() => handleClaim(r.id)}
                    disabled={claiming === r.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-yellow-400 text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] disabled:opacity-50 transition-all"
                  >
                    {claiming === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                    {claiming === r.id ? "Submitting…" : "Claim ₦500"}
                  </button>
                </div>
              )}

              {r.status === "approved" && (
                <p className="text-[11px] text-brand-teal flex items-center gap-1.5 pt-1 border-t border-white/5">
                  <ChevronRight className="w-3 h-3" />
                  Bank details received. Transfer processing in 2–3 business days.
                </p>
              )}

              {r.status === "paid" && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-white/5">
                  ✅ Paid on {r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {msg && (
        <p className={`text-xs text-center ${msg.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
      )}
    </div>
  );
}

export default function SettingsPageClient({ user, accessToken }: SettingsPageClientProps) {
  const { update } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  // Telegram linking state
  const [telegramCode, setTelegramCode] = useState("");
  const [linkStatus, setLinkStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [linkMessage, setLinkMessage] = useState("");
  const [isLinked, setIsLinked] = useState(!!user.telegram_id);
  const [isSyncing, setIsSyncing] = useState(false);

  // Notification prefs
  const [notifScan, setNotifScan] = useState(true);
  const [notifSlip, setNotifSlip] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Change password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwMessage, setPwMessage] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  // Background Polling for "Zero-Click" Linking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isLinked) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.data.telegram_id || res.data.telegram_linked) {
            setIsLinked(true);
            setLinkStatus("success");
            setLinkMessage("Handshake synchronized automatically via cloud registry.");
            await update({ user: res.data });
          }
        } catch (e) { /* silent polling */ }
      }, 3000); // 3s Pulse
    }
    return () => clearInterval(interval);
  }, [isLinked, API_URL, accessToken, update]);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-scroll to notifications if hash present
    if (window.location.hash === "#notifications") {
      setTimeout(() => {
        const el = document.getElementById("notifications-section");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, []);

  const markRead = async (id: number) => {
    try {
      await axios.post(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) { /* silent */ }
  };

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    setLinkMessage("");
    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const freshUser = res.data;
      if (freshUser.telegram_joined || freshUser.telegram_id) {
        setIsLinked(true);
        setLinkStatus("success");
        setLinkMessage("Identity fusion confirmed! Your terminal is now fully synchronized.");
        await update({ user: freshUser });
      } else {
        setLinkStatus("error");
        setLinkMessage("Handshake not detected yet. Ensure you have clicked START in the bot.");
      }
    } catch (err) {
      setLinkStatus("error");
      setLinkMessage("Failed to connect to the node. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!telegramCode.trim()) return;
    setLinkStatus("loading");
    try {
      await axios.post(`${API_URL}/link-telegram`, { code: telegramCode.trim() }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setLinkStatus("success");
      setLinkMessage("Telegram linked successfully! You'll now receive push notifications.");
      setIsLinked(true);
      await update({ user: { ...user, telegram_linked: true } });
    } catch (err: any) {
      setLinkStatus("error");
      setLinkMessage(err.response?.data?.detail || "Invalid code. Generate a fresh code from the Telegram bot and try again.");
    }
  };

  const handleUnlinkTelegram = async () => {
    try {
      await axios.post(`${API_URL}/unlink-telegram`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setIsLinked(false);
      setLinkStatus("idle");
      setLinkMessage("");
      setTelegramCode("");
      await update({ user: { ...user, telegram_linked: false, telegram_id: null } });
    } catch {
      // silent
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwStatus("error");
      setPwMessage("Passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwStatus("error");
      setPwMessage("Password must be at least 8 characters.");
      return;
    }
    setPwStatus("loading");
    try {
      await axios.post(`${API_URL}/change-password`, { current_password: currentPw, new_password: newPw }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setPwStatus("success");
      setPwMessage("Password updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwStatus("error");
      setPwMessage(err.response?.data?.detail || "Failed to update password. Check your current password.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 md:px-0 space-y-6 relative z-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account, notifications, and integrations.</p>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="Account" desc="Your plan and account details">
          <Row label="Email" desc="Your registered email address">
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              {user.email}
            </span>
          </Row>
          <div className="h-px bg-white/5" />
          <Row label="Subscription" desc="Your current plan">
            {user.is_quant ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full">
                <Crown className="w-3 h-3" /> QUANT
              </span>
            ) : user.is_premium ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full">
                <Crown className="w-3 h-3" /> PRO
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                  TRIAL
                </span>
                <Link href="/billing" className="text-[11px] font-bold text-brand-teal hover:underline">Upgrade →</Link>
              </div>
            )}
          </Row>
          {user.created_at && (
            <>
              <div className="h-px bg-white/5" />
              <Row label="Member Since" desc="">
                <span className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </Row>
            </>
          )}
        </Section>
      </motion.div>
      
      {/* Notifications Feed */}
      <motion.div id="notifications-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <Section 
          title="Terminal Alerts" 
          desc="Operational logs and intelligence notifications for your node."
        >
          {notifications.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-end">
                 <button onClick={markAllRead} className="text-[10px] font-black text-brand-teal uppercase tracking-widest hover:opacity-70 transition-opacity">
                    Clear All Alerts
                 </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`p-4 rounded-xl border transition-all relative cursor-pointer ${
                      n.is_read 
                        ? "bg-white/[0.02] border-white/5 opacity-60" 
                        : "bg-white/[0.05] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.08]"
                    }`}
                  >
                    {!n.is_read && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-brand-teal rounded-full animate-pulse" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === "success" ? "bg-green-500/20 text-green-400" :
                        n.type === "warning" ? "bg-red-500/20 text-red-400" :
                        "bg-brand-blue/20 text-brand-blue"
                      }`}>
                        {n.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         n.type === "warning" ? <AlertCircle className="w-3.5 h-3.5" /> :
                         <BellRing className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white mb-0.5">{n.title}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mb-2">{n.content}</div>
                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                          {new Date(n.created_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center text-center">
              <BellRing className="w-8 h-8 text-slate-700 mb-3" />
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Inbox Empty</div>
              <p className="text-[10px] text-slate-600 mt-1">No operational alerts detected in your local datastream.</p>
            </div>
          )}
        </Section>
      </motion.div>

      {/* Ref & Earn */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Section title="Ref & Earn" desc="Share your referral link. You earn +50 credits for every friend who signs up — they get +100.">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-brand-teal truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/auth/signup?ref=${user.link_code ?? "..."}`
                  : `https://betassistant.io/auth/signup?ref=${user.link_code ?? "..."}`}
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/auth/signup?ref=${user.link_code}`;
                  navigator.clipboard.writeText(url);
                }}
                className="shrink-0 px-4 py-3 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-brand-teal/20 transition-all"
              >
                Copy
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Credits are added automatically once your referred friend verifies their email. Track your credits balance above.
            </p>
          </div>
        </Section>
      </motion.div>

      {/* Neural Telegram Integration */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section
          title="Neural Integration"
          desc="Synchronize your identity to authorize AI push notifications and automated credit refills."
        >
          {isLinked ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden p-6 rounded-2xl bg-brand-teal/5 border border-brand-teal/20 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Send className="w-16 h-16 text-brand-teal -rotate-12" />
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 flex items-center justify-center text-brand-teal shrink-0 shadow-lg border border-brand-teal/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-teal mb-0.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                      Integration: ACTIVE
                    </div>
                    <div className="text-sm font-black text-white">Neural Handshake Synchronized</div>
                    <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-mono">Identity Status: {user.telegram_id || "VERIFIED"}</div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-brand-teal/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-teal/60" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Push Alerts & AI Advisories Active</p>
                  </div>
                  <button onClick={handleUnlinkTelegram} className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 self-start">
                    <Unlink className="w-3 h-3" /> Disconnect Node
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/8 text-center flex flex-col items-center relative overflow-hidden">
                {/* Polling Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                  <Activity className="w-3 h-3 text-brand-blue animate-pulse" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Searching Registry...</span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-6 shadow-[0_0_30px_rgba(0,113,206,0.1)]">
                  <Zap className="w-8 h-8 animate-pulse" />
                </div>

                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Initialize Handshake</h4>
                <p className="text-[11px] text-slate-400 mb-8 max-w-xs leading-relaxed">
                  Press **START** on the bot to link your account. Your **Credits** and **AI Push Alerts** will synchronize automatically once detected.
                </p>

                <a
                  href={`https://t.me/BetAssistant_AI_bot?start=verify_${user.link_code || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue text-white font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,113,206,0.2)]"
                >
                  <Send className="w-4 h-4" /> START HANDSHAKE IN BOT
                </a>

                <button
                  onClick={handleSyncStatus}
                  disabled={isSyncing}
                  className="w-full mt-3 py-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                  {isSyncing ? "SYNCING..." : "FORCED RE-SYNC"}
                </button>

                {linkMessage && (
                  <div className={`mt-4 flex items-start gap-2 text-[10px] p-3 rounded-lg w-full text-left ${linkStatus === "success" ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
                    {linkStatus === "success"
                      ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                    {linkMessage}
                  </div>
                )}
              </div>

              <div className="p-4 bg-brand-teal/5 border border-brand-teal/15 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Our cloud registry polls your status every 3 seconds. Once you interact with the bot, this terminal will synchronize **automatically**.
                </p>
              </div>
            </div>
          )}
        </Section>
      </motion.div>

      {/* --- Referral Program --- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Section
          title="Referral Program"
          desc="Recruit new operatives and earn terminal credits. Bonuses are issued after your referrals verify their identity."
        >
          <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Operatives</div>
                <div className="text-2xl font-black text-white">{user.total_referrals || 0}</div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Your Registry Code</span>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-brand-teal font-mono font-bold text-sm select-all">
                  {user.link_code || "REGEN_REQUIRED"}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.link_code || "");
                    // Simple alert for feedback
                    alert("Registry code copied to clipboard.");
                  }}
                  className="p-2 rounded-lg bg-brand-teal text-background hover:scale-110 active:scale-95 transition-all"
                  title="Copy Code"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-black text-brand-teal uppercase tracking-tighter mb-1">Operative Bonus</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Referrals receive <span className="text-white font-bold">100 Credits</span> once they sync with Telegram.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-black text-brand-blue uppercase tracking-tighter mb-1">Recruitment Bounty</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">You receive <span className="text-white font-bold">1 Credit</span> for every operative that verifies their email.</p>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* --- Cash Rewards --- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
        <Section
          title="💰 Cash Rewards"
          desc="Earn ₦500 for every 5 verified users you refer. Claim it straight to your bank account."
        >
          <CashRewardsPanel accessToken={accessToken} totalReferrals={user.total_referrals || 0} />
        </Section>
      </motion.div>

        {/* --- Platform Performance --- */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Notification Preferences" desc="Choose what alerts you receive via Telegram and email">
            <Row label="Scan Completion Alerts" desc="Notify when a market scan finds +EV edges">
              <Toggle on={notifScan} onToggle={() => setNotifScan(v => !v)} />
            </Row>
            <div className="h-px bg-white/5" />
            <Row label="Slip Advisory Updates" desc="AI cashout and hold recommendations">
              <Toggle on={notifSlip} onToggle={() => setNotifSlip(v => !v)} />
            </Row>
            <div className="h-px bg-white/5" />
            <Row label="Promotions & Tips" desc="Weekly edge reports and platform updates">
              <Toggle on={notifPromo} onToggle={() => setNotifPromo(v => !v)} />
            </Row>

            {!user.is_premium && (
              <div className="p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15 flex items-start gap-2 mt-2">
                <Crown className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400">Telegram notifications require a linked account and <strong className="text-yellow-400">Premium</strong> for cashout alerts.</p>
              </div>
            )}
          </Section>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Security" desc="Update your password">
            <form onSubmit={handleChangePassword} className="space-y-3">
              {[
                { label: "Current Password", value: currentPw, set: setCurrentPw },
                { label: "New Password", value: newPw, set: setNewPw },
                { label: "Confirm Password", value: confirmPw, set: setConfirmPw },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input
                    type="password"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-teal/50 placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              ))}

              {pwMessage && (
                <div className={`flex items-start gap-2 text-xs p-3 rounded-lg ${pwStatus === "success" ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
                  {pwStatus === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {pwMessage}
                </div>
              )}

              <button type="submit" disabled={pwStatus === "loading"}
                className="px-5 py-2.5 bg-white/8 hover:bg-white/12 border border-white/10 text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
                {pwStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="p-6 rounded-2xl bg-red-500/3 border border-red-500/15 space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Danger Zone</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">These actions cannot be undone.</p>
            </div>
            <button className="text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </motion.div>

    </div>
  );
}
