"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Lock, Bot, ShieldCheck, Gift } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AuthOverlay from "@/components/auth/AuthOverlay";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("VALIDATION_ERROR: Deployment keys do not match. Please verify your entry.");
      return;
    }
    
    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

    try {
      const res = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        ...(refCode ? { ref: refCode } : {})
      });

      if (res.status === 200) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "REGISTRY_ERROR: Identity link could not be established.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      <AuthOverlay 
        isVisible={isLoading} 
        message="Deploying Agent Node..." 
        subMessage="Initializing neural security clearance and establishing encrypted link..." 
      />

      <div className="absolute top-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-brand-teal/10 blur-[140px] rounded-full pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal mx-auto mb-6">
              <Mail className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-4">Transmission Sent</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              We have securely dispatched an initialization link to <span className="text-white font-bold">{email}</span>. 
              <br/><br/>Please inspect your inbox (and spam array) to verify your clearance and activate your terminal.
            </p>
            <Link href="/auth/login" className="w-full inline-flex justify-center bg-brand-blue text-white font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,113,206,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all font-mono text-sm uppercase tracking-widest">
              RETURN TO LOGIN
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-[11px] font-black uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" /> Core System
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Commission</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Initialize Quant Trial</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Referral bonus banner */}
              {refCode && (
                <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center gap-3">
                  <Gift className="w-4 h-4 text-brand-teal shrink-0" />
                  <p className="text-[10px] text-brand-teal font-bold leading-snug">
                    You were referred! Sign up to receive <span className="text-white">+100 free credits</span> — and your referrer gets bonus credits too.
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">Registry Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@betassistant.io"
                    className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">Deployment Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                  />
                </div>
                {/* Password Hint */}
                <div className="mt-2 space-y-1.5 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 font-mono">Security Protocol</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${password.length >= 8 ? "text-brand-teal/80" : "text-slate-700"}`}>
                      <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? "bg-brand-teal shadow-[0_0_5px_rgba(20,255,200,0.5)]" : "bg-slate-800"}`} />
                      8+ CHARS
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-brand-teal/80" : "text-slate-700"}`}>
                      <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? "bg-brand-teal shadow-[0_0_5px_rgba(20,255,200,0.5)]" : "bg-slate-800"}`} />
                      ALPHA MIX
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${/\d/.test(password) ? "text-brand-teal/80" : "text-slate-700"}`}>
                      <div className={`w-1 h-1 rounded-full ${/\d/.test(password) ? "bg-brand-teal shadow-[0_0_5px_rgba(20,255,200,0.5)]" : "bg-slate-800"}`} />
                      NUMERIC
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-brand-teal/80" : "text-slate-700"}`}>
                      <div className={`w-1 h-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "bg-brand-teal shadow-[0_0_5px_rgba(20,255,200,0.5)]" : "bg-slate-800"}`} />
                      SYMBOL
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">Re-confirm Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[10px] font-bold text-red-400 text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 uppercase tracking-tight">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,113,206,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-widest"
              >
                DEPLOY AGENT
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-600">Active link?</span> <Link href="/auth/login" className="ml-2 text-brand-blue hover:text-brand-blue/80 transition-colors">Login to Terminal</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
