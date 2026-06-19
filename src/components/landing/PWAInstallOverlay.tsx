"use client";

import React, { useEffect, useState } from "react";
import { X, Share, PlusSquare, MoreVertical, Smartphone, Download, Crown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PWAInstallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onBypass: () => void;
}

export default function PWAInstallOverlay({ isOpen, onClose, onBypass }: PWAInstallOverlayProps) {
  const [deviceOS, setDeviceOS] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceOS("ios");
      } else if (/android/.test(userAgent)) {
        setDeviceOS("android");
      } else {
        setDeviceOS("other");
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03060E]/80 backdrop-blur-md animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#070B16] p-6 shadow-[0_0_80px_rgba(0,198,186,0.15)]"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-teal/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue/20 to-brand-teal/20 border border-brand-teal/30 flex items-center justify-center mb-4 shadow-lg shadow-brand-teal/5">
              <img src="/image.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover scale-[1.3]" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Install BetAssistant</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[280px]">
              Add the Quant Terminal to your home screen for the full mobile-app experience.
            </p>
          </div>

          {/* Instructions based on OS */}
          <div className="space-y-4 mb-6">
            {deviceOS === "ios" ? (
              <>
                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Step 1</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Tap the <span className="font-bold text-white">Share</span> button at the bottom of Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Step 2</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Scroll down and select <span className="font-bold text-white">Add to Home Screen</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Step 3</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Tap <span className="font-bold text-white">Add</span> in the top right to launch standalone mode.
                    </p>
                  </div>
                </div>
              </>
            ) : deviceOS === "android" ? (
              <>
                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Step 1</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Tap the <span className="font-bold text-white">Menu</span> (three vertical dots) in the browser header.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Step 2</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Select <span className="font-bold text-white">Install App</span> or <span className="font-bold text-white">Add to Home Screen</span>.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Add to Home Screen</h4>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Open your mobile browser menu and tap <span className="font-bold text-white">Add to Home Screen</span> to run BetAssistant in app-mode.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onBypass}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-400 hover:text-white font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1"
            >
              Continue in Browser <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
