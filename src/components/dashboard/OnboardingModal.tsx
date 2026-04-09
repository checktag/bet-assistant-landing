import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, CheckCircle2, Loader2, X, Sparkles, AlertCircle } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  linkCode: string;
  onSuccess: () => void;
}

export default function OnboardingModal({ isOpen, onClose, accessToken, linkCode, onSuccess }: OnboardingModalProps) {
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "handshaking" | "verifying">("idle");

  // Neural Polling Logic: Automatically detect handshake completion
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && !isSuccess) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
      
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          const userData = res.data;
          
          if (userData.telegram_id && !userData.telegram_joined) {
            setPollingStatus("verifying");
          }

          if (userData.telegram_joined) {
            setIsSuccess(true);
            setPollingStatus("idle");
            clearInterval(interval);
            // Trigger session update to refresh credits in real-time
            await update();
            
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2500);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isSuccess, accessToken, onSuccess, onClose, update]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0A0F1C] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)]"
        >
          {/* Close Button */}
          {!isSuccess && (
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="p-8 md:p-14 relative z-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center text-brand-teal mb-8">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Access Granted</h2>
                  <p className="text-brand-teal font-black uppercase tracking-widest text-xs">100 Credits Injected</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="w-full flex flex-col items-center">
                   {/* Header Icon */}
                   <div className="w-20 h-20 rounded-[2rem] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-10">
                     <Zap className="w-10 h-10 animate-pulse text-brand-blue" />
                   </div>

                   <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                      Direct <span className="text-gradient">Handshake</span>
                   </h2>
                   
                   <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 max-w-xs">
                     Link your Telegram identity to initialize your terminal and claim **100 Credits**.
                   </p>

                   {/* Instruction Card */}
                   <div className="w-full p-6 md:p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 mb-10">
                      <div className="space-y-6 text-left">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-brand-teal/20 flex items-center justify-center text-brand-teal shrink-0 font-black text-xs">1</div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">Join Community</p>
                            <p className="text-[11px] text-slate-500 leading-normal">Must be a member of the official channel to gain terminal access.</p>
                            <a href="https://t.me/+KKXegSaFc1Y3MTQ0" target="_blank" className="inline-block mt-3 text-[10px] font-black text-brand-teal uppercase tracking-widest hover:underline transition-all">Join Channel →</a>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0 font-black text-xs">2</div>
                          <div className="w-full">
                            <p className="text-sm font-bold text-white mb-1">Activate Handshake</p>
                            <p className="text-[11px] text-slate-500 leading-normal mb-4">Click below to open the bot and press **START** to link your node.</p>
                            
                            {pollingStatus !== "idle" && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-[10px] font-black text-brand-teal uppercase tracking-widest mb-3"
                              >
                                <Loader2 className="w-3 h-3 animate-spin" /> 
                                {pollingStatus === "handshaking" ? "Detecting Handshake..." : "Verifying Membership..."}
                              </motion.div>
                            )}

                            <a 
                              href={`https://t.me/BetAssistant_AI_bot?start=verify_${linkCode}`}
                              target="_blank"
                              onClick={() => setPollingStatus("handshaking")}
                              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-blue text-white font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,113,206,0.3)]"
                            >
                              <Send className="w-4 h-4" /> START HANDSHAKE IN APP
                            </a>
                            
                            <button 
                              onClick={() => window.location.reload()}
                              className="w-full mt-3 py-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> MANUAL RE-SYNC
                            </button>
                          </div>
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

                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-auto">
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
