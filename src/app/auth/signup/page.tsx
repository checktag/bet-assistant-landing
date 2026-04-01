"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Lock, Bot, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your deployment key.");
      return;
    }
    
    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

    try {
      const res = await axios.post(`${API_URL}/signup`, {
        email,
        password
      });

      if (res.status === 200) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-brand-teal/10 blur-[140px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal mx-auto mb-6">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-4">Transmission Sent</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            We have securely dispatched an initialization link to <span className="text-white font-bold">{email}</span>. 
            <br/><br/>Please inspect your inbox (and spam array) to verify your clearance and activate your terminal.
          </p>
          <Link href="/auth/login" className="w-full inline-flex justify-center bg-brand-blue text-white font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,113,206,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all font-mono">
            RETURN TO LOGIN
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-brand-teal/10 blur-[140px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Commission</h1>
            <p className="text-slate-400 text-sm">Initialize 14-day Quant Trial.</p>
          </div>
        </div>

        <div className="mb-8 p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20 text-[10px] uppercase font-bold tracking-widest text-brand-teal text-center">
             ⚡ Full terminal features enabled for trial 
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-4">Registry Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-[16px] md:text-sm text-white placeholder:text-slate-700 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-4">Deployment Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter your password"
                className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-[16px] md:text-sm text-white placeholder:text-slate-700 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-4">Confirm Deployment Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="re-enter your password"
                className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl pl-12 pr-6 py-4 text-[16px] md:text-sm text-white placeholder:text-slate-700 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-center scale-[0.85] md:scale-100 origin-center">
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,113,206,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center font-mono"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "DEPLOY AGENT"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          Already active? <Link href="/auth/login" className="text-brand-blue hover:underline font-bold">Login to Dashboard</Link>
        </p>
      </motion.div>
    </main>
  );
}
