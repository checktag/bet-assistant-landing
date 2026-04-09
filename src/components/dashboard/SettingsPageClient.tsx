"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Crown, BellRing, Send, CheckCircle2,
  Loader2, LinkIcon, Unlink, Lock, AlertCircle, Zap, Sparkles
} from "lucide-react";

interface SettingsPageClientProps {
  user: {
    email: string;
    is_premium: boolean;
    telegram_id?: number | null;
    telegram_linked?: boolean;
    link_code?: string;
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
      className={`relative flex items-center w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
        on
          ? "bg-brand-teal shadow-[0_0_12px_rgba(0,198,186,0.45)]"
          : "bg-white/10"
      }`}
    >
      {/* Track border */}
      <span className={`absolute inset-0 rounded-full border transition-all duration-300 ${on ? "border-brand-teal/60" : "border-white/15"}`} />
      {/* Knob */}
      <span
        className={`absolute w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
          on
            ? "translate-x-[26px] bg-white"
            : "translate-x-[2px] bg-white/70"
        }`}
      />
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
                {user.is_premium ? (
                  <span className="flex items-center gap-1.5 text-xs font-black text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full">
                    <Crown className="w-3 h-3" /> PRO CLEARANCE
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

          {/* Telegram Integration — Streamlined */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Section
              title="Telegram Integration"
              desc="Link your identity to authorize AI push notifications and claim trial credits."
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
                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-teal mb-0.5">Integration: ACTIVE</div>
                        <div className="text-sm font-black text-white">Neural Handshake Synchronized</div>
                        <div className="text-[11px] text-slate-500 mt-1">ID Clearance: {user.telegram_id || "VERIFIED"}</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-brand-teal/10 flex items-center justify-between">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active: Push Notifications & Advisories</p>
                      <button onClick={handleUnlinkTelegram} className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                        <Unlink className="w-3 h-3" /> Disconnect Node
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-6">
                      <Zap className="w-8 h-8 animate-pulse" />
                    </div>
                    
                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Initialize Handshake</h4>
                    <p className="text-[11px] text-slate-400 mb-8 max-w-xs leading-relaxed">
                      Link your account once to synchronize your **Credits** and enable **AI Push Alerts** across the network.
                    </p>

                    <a
                      href={`https://t.me/BetAssistant_AI_bot?start=verify_${user.link_code || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue text-white font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,113,206,0.2)]"
                    >
                      <Send className="w-4 h-4" /> START HANDSHAKE IN APP
                    </a>

                    <button 
                      onClick={() => window.location.reload()}
                      className="w-full mt-3 py-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> RE-CALIBRATE SYNC STATUS
                    </button>
                  </div>

                  <div className="p-4 bg-brand-teal/5 border border-brand-teal/15 rounded-xl flex items-start gap-3">
                    <BellRing className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      One link covers all terminal features. If you already linked via the bot for credits, click <strong>RE-CALIBRATE</strong> to sync your status.
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
  );
}
