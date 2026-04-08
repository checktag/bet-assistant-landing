"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, CheckCircle2, Loader2, X, ShieldCheck, Trophy, Sparkles, AlertCircle } from "lucide-react";
import TelegramLoginWidget from "./TelegramLoginWidget";
import axios from "axios";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  onSuccess: () => void;
}

export default function OnboardingModal({ isOpen, onClose, accessToken, onSuccess }: OnboardingModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuth = async (user: any) => {
    setIsVerifying(true);
    setError(null);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
    
    try {
      const res = await axios.post(`${API_URL}/confirm-telegram-join`, user, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (res.data.status === "success" || res.data.status === "already_claimed") {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const detail = err.response?.data?.detail;
      if (detail === "MUST_JOIN_TELEGRAM_FIRST") {
        setError("CLEARANCE DENIED: You must join the Telegram channel first before syncing your identity.");
      } else {
        setError(detail || "An unexpected error occurred during terminal initialization.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0A0F1C] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)]"
        >
          {/* Close Button */}
          {!isSuccess && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="p-6 md:p-12 relative z-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center text-brand-teal mb-6">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Clearance Granted</h2>
                  <p className="text-brand-teal font-bold uppercase tracking-widest text-[10px] md:text-xs">1,000 Credits Injected</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="w-full flex flex-col items-center">
                   {/* Header Icon */}
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-6 md:mb-8">
                     <Zap className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                   </div>

                   <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3 md:mb-4">
                      Initialize <span className="text-gradient">Terminal</span>
                   </h2>
                   
                   <p className="text-slate-400 text-xs md:text-base leading-relaxed mb-8 md:mb-10 max-w-xs">
                     Unlock your first **1,000 Credits** by joining our official community channel.
                   </p>

                   {/* Onboarding Steps */}
                   <div className="w-full space-y-4 mb-8">
                      {/* Step 1: Join */}
                      <a 
                        href="https://t.me/+KKXegSaFc1Y3MTQ0" 
                        target="_blank" 
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-teal/40 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/20 flex items-center justify-center text-brand-teal">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Step 01</p>
                          <p className="text-sm font-bold text-white">Join Official Channel</p>
                        </div>
                      </a>

                      {/* Step 2: Sync */}
                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                             <ShieldCheck className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                             <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Step 02</p>
                             <p className="text-sm font-bold text-white">Sync Identity (One-Click)</p>
                           </div>
                        </div>

                        {/* Login Widget Container */}
                        <div className="flex justify-center relative min-h-[40px]">
                           {isVerifying ? (
                              <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" /> VERIFYING CLEARANCE...
                              </div>
                           ) : (
                              <TelegramLoginWidget botName="BetAssistant_AI_bot" onAuth={handleAuth} />
                           )}
                        </div>
                      </div>
                   </div>

                   {/* Error State */}
                   {error && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-left mb-6"
                     >
                       <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] font-bold text-red-400 uppercase tracking-tight leading-normal">{error}</p>
                     </motion.div>
                   )}

                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                      * automated terminal initialization
                   </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
