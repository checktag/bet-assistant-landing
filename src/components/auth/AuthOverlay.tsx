"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Bot, ShieldCheck, Zap } from "lucide-react";

interface AuthOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export default function AuthOverlay({ isVisible, message = "Initializing Neural Link...", subMessage = "Synchronizing identity with the global terminal..." }: AuthOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-[#03060E] flex flex-col items-center justify-center p-6 text-center"
        >
          {/* Background Orbs */}

          {/* Icon Animation */}
          <div className="relative mb-12">
            <div className="w-24 h-24 rounded-[2.5rem] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue relative z-10">
              <Bot className="w-10 h-10 animate-pulse" />
            </div>
            
            {/* Pulsing rings */}
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute inset-0 border-2 border-brand-blue/30 rounded-[2.5rem]" 
            />
            <motion.div 
               animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
               transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
               className="absolute inset-[-10px] border border-brand-blue/20 rounded-[3rem]" 
            />
          </div>

          <div className="space-y-4 max-w-sm">
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">
              {message}
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
              {subMessage}
            </p>
          </div>

          {/* Progress Bar (Faking it) */}
          <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-brand-teal to-transparent"
            />
          </div>

          <div className="mt-12 flex items-center gap-6">
             <div className="flex flex-col items-center gap-1 opacity-40">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Security Gate</span>
             </div>
             <div className="flex flex-col items-center gap-1 opacity-40">
                <Zap className="w-4 h-4 text-brand-blue" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Node Link</span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
