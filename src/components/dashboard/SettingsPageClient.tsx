"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Settings, CreditCard,
  Crown, BellRing, ShieldCheck, Send, CheckCircle2,
  Loader2, Link as LinkIcon, Unlink, User, Lock,
  Moon, Globe, Bell, ChevronRight, AlertCircle
} from "lucide-react";

interface SettingsPageClientProps {
  user: {
    email: string;
    is_premium: boolean;
    telegram_id?: number | null;
    telegram_linked?: boolean;
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
      className={`relative w-10 h-5 rounded-full transition-all border ${
        on ? "bg-brand-teal border-brand-teal" : "bg-white/10 border-white/20"
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function SettingsPageClient({ user, accessToken }: SettingsPageClientProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  // Telegram linking state
  const [telegramCode, setTelegramCode] = useState("");
  const [linkStatus,   setLinkStatus]   = useState<"idle"|"loading"|"success"|"error">("idle");
  const [linkMessage,  setLinkMessage]  = useState("");
  const [isLinked,     setIsLinked]     = useState(!!user.telegram_linked);

  // Notification prefs
  const [notifScan,   setNotifScan]   = useState(true);
  const [notifSlip,   setNotifSlip]   = useState(true);
  const [notifPromo,  setNotifPromo]  = useState(false);

  // Change password
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw,     setNewPw]       = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwStatus,  setPwStatus]    = useState<"idle"|"loading"|"success"|"error">("idle");
  const [pwMessage, setPwMessage]   = useState("");

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
    <div className="min-h-screen bg-[#03060E] text-slate-200 flex flex-col md:flex-row overflow-hidden">

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#060913]">
        <span className="text-sm font-black text-white">Settings</span>
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-white transition-colors">← Back</Link>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-[#060913] flex-col p-6 space-y-8 h-screen sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 overflow-hidden rounded-lg"><img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" /></div>
          <span className="font-bold tracking-tight text-white">Bet Assistant</span>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/8 text-white border border-white/10 font-medium">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <Link href="/calculator" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <CreditCard className="w-4 h-4" /> Bet Calculator
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-teal/4 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">

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
                {user.is_premium ? (
                  <span className="flex items-center gap-1.5 text-xs font-black text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full">
                    <Crown className="w-3 h-3" /> PREMIUM
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

          {/* Telegram Integration — the star feature */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Section
              title="Telegram Integration"
              desc="Link your Telegram to receive AI cashout alerts and slip tracker push notifications."
            >
              {isLinked ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Telegram Linked ✅</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        You&apos;ll receive real-time AI push notifications for tracked slips and cashout signals.
                      </div>
                    </div>
                  </div>
                  <button onClick={handleUnlinkTelegram}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors">
                    <Unlink className="w-3.5 h-3.5" /> Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center text-[10px] font-black text-brand-teal">1</div>
                      <span className="text-xs font-bold text-white">Open the Bet Assistant Telegram bot</span>
                    </div>
                    <a
                      href="https://t.me/BetAssistantBot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#229ED9] hover:bg-[#1a8ab8] text-white rounded-xl text-xs font-bold transition-all w-fit"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Open @BetAssistantBot
                    </a>
                    <p className="text-[11px] text-slate-500">Send the bot the command: <code className="text-brand-teal font-mono bg-white/5 px-1.5 py-0.5 rounded">/link</code></p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center text-[10px] font-black text-brand-teal">2</div>
                      <span className="text-xs font-bold text-white">Enter your 6-digit link code below</span>
                    </div>
                    <p className="text-[11px] text-slate-500">The bot will send you a code — paste it here to link your accounts.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={telegramCode}
                        onChange={e => setTelegramCode(e.target.value.toUpperCase())}
                        placeholder="e.g. TG-4F9X2A"
                        maxLength={10}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 tracking-widest uppercase"
                      />
                      <button
                        onClick={handleLinkTelegram}
                        disabled={linkStatus === "loading" || !telegramCode.trim()}
                        className="px-5 py-3 bg-brand-teal text-background font-black text-xs rounded-xl hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        {linkStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                        Link
                      </button>
                    </div>

                    {linkMessage && (
                      <div className={`flex items-start gap-2 text-xs p-3 rounded-lg ${linkStatus === "success" ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
                        {linkStatus === "success"
                          ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                        {linkMessage}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-brand-teal/5 border border-brand-teal/15 rounded-xl flex items-start gap-2">
                    <BellRing className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400">
                      Once linked, Premium users receive <strong className="text-brand-teal">real-time cashout alerts</strong> when the AI detects a momentum shift on their tracked slips — sent directly to Telegram.
                    </p>
                  </div>
                </div>
              )}
            </Section>
          </motion.div>

          {/* Notification Preferences */}
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
                  { label: "Current Password",  value: currentPw, set: setCurrentPw },
                  { label: "New Password",       value: newPw,     set: setNewPw },
                  { label: "Confirm Password",   value: confirmPw, set: setConfirmPw },
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
      </main>
    </div>
  );
}
