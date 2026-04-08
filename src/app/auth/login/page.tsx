"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Lock, Bot, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthOverlay from "@/components/auth/AuthOverlay";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL errors (e.g. Session Expired)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "SessionRequired" || errorParam === "unauthorized") {
      setError("SESSION TERMINATED: Your identity link has expired. Please re-engage the secure terminal.");
    } else if (errorParam) {
      setError(`IDENTITY ERROR: ${errorParam.toUpperCase()}`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        // Map generic Auth.js errors to user-friendly terminal messages
        let errorMessage = "CRITICAL_FAILURE: Unexpected identity sync terminal error.";
        
        if (res.error === "CredentialsSignin" || res.error === "Credentials") {
          errorMessage = "Incorrect email or password. Please verify your registry clearance.";
        } else if (res.error === "Configuration") {
          errorMessage = "AUTHENTICATION_UNAVAILABLE: Secure gateway is temporarily offline.";
        } else {
          errorMessage = res.error;
        }

        setError(errorMessage);
        setIsLoading(false);
      } else {
        // Success: Let the overlay show for a moment longer for smoother transition
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      setError("Incorrect email or password. Please verify your registry clearance.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Auth State Overlay */}
      <AuthOverlay 
        isVisible={isLoading && !error} 
        message="Engaging Terminal..." 
        subMessage="Synchronizing identity with the global quant node. Initializing neural link..."
      />

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence>
        {!isLoading || error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-[11px] font-black uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" /> Core System
            </Link>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Identity</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Access Link</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">Neural Access Key</label>
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
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight leading-normal">
                    {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-background font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-widest"
              >
                ENGAGE TERMINAL
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] uppercase font-black tracking-widest">
              <span className="text-slate-600">No clearance?</span> <Link href="/auth/signup" className="ml-2 text-brand-teal hover:text-brand-teal/80 transition-colors">Request Access</Link>
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
