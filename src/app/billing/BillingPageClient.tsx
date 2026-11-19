"use client";

import { useState } from "react";
import {
  ShieldCheck, Zap, Crown, CheckCircle2, ArrowLeft,
  Loader2, Copy, CheckCheck, ExternalLink, Bitcoin, X
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { signOut } from "next-auth/react";

interface BillingPageClientProps {
  user: any;
  accessToken: string;
}

const WALLETS = [
  {
    id: "trc20",
    label: "USDT / TRC-20 (Tron)",
    coin: "USDT",
    network: "TRC-20 (Tron)",
    address: "TKHJp9tK3koiBZQwerqnVxxahBigbznyR9",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    id: "erc20",
    label: "USDC / EVM Multi-Chain",
    coin: "USDC",
    network: "EVM (Ethereum, Base, Avalanche, etc.)",
    address: "0x05bD1b80AEE60EEAe0e293845192A3B05307E323",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
];

export default function BillingPageClient({ user, accessToken }: BillingPageClientProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [copied, setCopied] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  const handleDevUnlock = async () => {
    setIsUnlocking(true);
    try {
      await axios.post(`${API_URL}/dev-test-premium`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("✅ Premium unlocked successfully! You must log in again to sync your new status.");
      await signOut({ callbackUrl: "/auth/login" });
    } catch {
      alert("Failed to unlock premium.");
      setIsUnlocking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 p-8 relative overflow-hidden flex flex-col items-center justify-center">

      <div className="w-full max-w-4xl z-10 space-y-12">
        <header className="text-center space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <h1 className="text-5xl font-black text-white tracking-tight">Upgrade Your <span className="text-gradient">Quant Seat</span></h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-light leading-relaxed">Level up from trial operative to institutional prime status. Instant access to the /scan terminal and live AI advisory.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Current Status */}
          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-8 h-full flex flex-col justify-center">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Active Tier</h3>
              <div className="text-3xl font-black text-white flex items-center gap-3">
                {user.is_premium ? "PRO PLATINUM" : "STRICT TRIAL"}
                {!user.is_premium && <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-1 rounded-md border border-brand-blue/20">7 DAYS</span>}
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Multi-Platform Booking Codes</li>
              <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> AI Betslip Decoding</li>
              <li className={`flex items-center gap-3 text-sm flex-wrap ${user.is_premium ? 'text-slate-400' : 'text-slate-600'}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${user.is_premium ? 'text-brand-teal' : 'text-slate-800'}`} /> Unlimited /scan Access
              </li>
              <li className={`flex items-center gap-3 text-sm flex-wrap ${user.is_premium ? 'text-slate-400' : 'text-slate-600'}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${user.is_premium ? 'text-brand-teal' : 'text-slate-800'}`} /> Pro Slip Tracker
              </li>
            </ul>

            {!user.is_premium && (
               <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-500 leading-relaxed font-bold uppercase tracking-tight">Your terminal access for /scan will expire in {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / 86400000))} days.</p>
               </div>
            )}
          </div>

          {/* Upgrade Card */}
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-brand-blue/20 to-brand-teal/10 border border-brand-teal/30 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Crown className="w-32 h-32 text-brand-teal" /></div>
            
            <div className="space-y-4 relative z-10">
              <div className="text-brand-teal text-[10px] font-black uppercase tracking-widest bg-brand-teal/10 inline-block px-3 py-1 rounded-full border border-brand-teal/20">Monthly Subscription</div>
              <h3 className="text-4xl font-black text-white">$19.99<span className="text-sm font-normal text-slate-400 ml-2">/ month</span></h3>
              <p className="text-slate-300 text-sm leading-relaxed">Complete data parity, zero latency signals, and cross-platform Telegram sync.</p>
            </div>

            <div className="space-y-4 relative z-10">
               {/* Crypto Payment */}
               <button
                 onClick={() => setShowCryptoModal(true)}
                 className="w-full py-5 bg-gradient-to-r from-brand-teal/20 to-brand-blue/20 border border-brand-teal/40 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 <Bitcoin className="w-5 h-5 text-brand-teal" />
                 Pay with USDT / USDC
               </button>

               {/* Paystack — disabled */}
               <div className="w-full py-5 bg-white/3 border border-white/5 text-slate-700 font-black rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed select-none">
                 <ShieldCheck className="w-5 h-5 text-slate-700" />
                 <span>Pay with Paystack</span>
                 <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono uppercase tracking-widest">Temporarily Disabled</span>
               </div>

               {!user.is_premium && (
                 <button 
                   onClick={handleDevUnlock}
                   disabled={isUnlocking}
                   className="w-full py-5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                 >
                   {isUnlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                   Dev Mode: Unlock Premium to Test Tracker
                 </button>
               )}
            </div>

            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest relative z-10">Instant Deployment Upon Confirmation</p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs">By upgrading, you agree to our Terms of Service. Secure payments validated by our team.</p>
      </div>

      {/* Crypto Checkout Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowCryptoModal(false); setPaymentSent(false); }} />
          
          <div className="relative w-full max-w-md bg-[#080C19] border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6 z-10">
            <button
              onClick={() => { setShowCryptoModal(false); setPaymentSent(false); }}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSent ? (
              /* Sent confirmation screen */
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mx-auto">
                  <CheckCheck className="w-10 h-10 text-brand-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Transaction Received</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">We'll verify your payment and activate your Premium account within <strong className="text-white">2 hours</strong>. Check your Telegram or email for confirmation.</p>
                </div>
                <div className="p-4 bg-brand-teal/5 border border-brand-teal/15 rounded-2xl text-[10px] text-slate-400 text-left leading-relaxed">
                  <p className="text-brand-teal font-black uppercase tracking-wider mb-1">Next Steps</p>
                  If you haven't already, link your Telegram in Settings to receive instant activation notifications.
                </div>
                <button
                  onClick={() => { setShowCryptoModal(false); setPaymentSent(false); }}
                  className="w-full py-4 bg-brand-teal text-background font-black rounded-2xl hover:scale-[1.02] transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              /* Wallet selection + instruction screen */
              <>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Crypto Checkout</h3>
                  <p className="text-[11px] text-slate-500">Send exactly <span className="text-white font-bold">$19.99 USDT or USDC</span> to the address below. Premium activates within 2 hours.</p>
                </div>

                {/* Network Selector */}
                <div className="flex gap-2">
                  {WALLETS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        selectedWallet.id === w.id
                          ? `${w.bg} ${w.border} ${w.color}`
                          : "bg-white/3 border-white/8 text-slate-600 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {w.coin}<br /><span className="font-normal normal-case tracking-normal">{w.network.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{selectedWallet.network} Wallet Address</p>
                  <div className={`flex items-center gap-2 p-4 rounded-2xl border ${selectedWallet.bg} ${selectedWallet.border}`}>
                    <code className={`flex-1 text-xs font-mono break-all ${selectedWallet.color}`}>{selectedWallet.address}</code>
                    <button
                      onClick={() => handleCopy(selectedWallet.address)}
                      className="shrink-0 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                    >
                      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">⚠ Important</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Send <strong className="text-white">only {selectedWallet.coin} on the {selectedWallet.network} network</strong>. Sending any other coin or using a different network will result in permanent loss of funds. We cannot recover wrong-network transfers.
                  </p>
                </div>

                <button
                  onClick={() => setPaymentSent(true)}
                  className="w-full py-4 bg-brand-teal text-background font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  I've Sent the Payment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
