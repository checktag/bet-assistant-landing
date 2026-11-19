"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No security token detected in the URL parameters.");
      return;
    }

    const verifyToken = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
        await axios.get(`${API_URL}/verify-email?token=${token}`);
        
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.response?.data?.detail || "The mathematical signature of the verification token is invalid or expired.");
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10 text-center"
      >
        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Decrypting Clearance</h1>
            <p className="text-slate-400 text-sm">Please stand by while we verify your cryptographic signature...</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Clearance Granted</h1>
            <p className="text-slate-400 text-sm mb-8">Your terminal access has been securely verified and activated.</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-white text-background font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-mono"
            >
              LAUNCH DASHBOARD
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Verification Failed</h1>
            <div className="text-xs font-bold text-red-400 bg-red-400/10 py-3 px-4 rounded-xl border border-red-400/20 leading-relaxed mb-8">
              {errorMessage}
            </div>
            <button
              onClick={() => router.push("/auth/signup")}
              className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-mono"
            >
              GENERATE NEW CLEARANCE
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03060E] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
