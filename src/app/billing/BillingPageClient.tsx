"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, CheckCircle2, Copy, Crown, Loader2, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";

interface BillingPageClientProps {
  user: { is_premium?: boolean; credits?: number; [key: string]: unknown };
  accessToken: string;
}
interface Network { id: string; label: string; coin: string; auto_detect: boolean }
interface Options { price_usd: number; period_days: number; networks: Network[]; is_premium: boolean; premium_until: string | null }
interface Invoice {
  id: number; network: string; label: string; coin: string; address: string; amount: string; auto_detect: boolean;
  status: "pending" | "paid" | "expired"; expires_at: string; message?: string; premium_until?: string | null;
}

const errText = (e: unknown) => (axios.isAxiosError(e) && typeof e.response?.data?.detail === "string" ? e.response.data.detail : "Something went wrong. Please try again.");
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "");

export default function BillingPageClient({ user, accessToken }: BillingPageClientProps) {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io").replace(/\/$/, "");
  const headers = { Authorization: `Bearer ${accessToken}` };
  const { update } = useSession();

  const [options, setOptions] = useState<Options | null>(null);
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setOptions((await axios.get(`${API_URL}/billing/crypto/options`, { headers })).data);
    } catch (e) {
      setLoadError(errText(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const onPaid = useCallback(async (inv: Invoice) => {
    setInvoice(inv);
    await update();          // refresh the session so Premium shows everywhere
    loadOptions();
  }, [update, loadOptions]);

  // Automatic detection: poll while an auto-detect invoice is open
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!open || !invoice || invoice.status !== "pending" || !invoice.auto_detect) return;
    timer.current = setInterval(async () => {
      try {
        const res = (await axios.get(`${API_URL}/billing/crypto/invoice/${invoice.id}`, { headers })).data as Invoice;
        if (res.status === "paid") onPaid(res);
        else if (res.status === "expired") { setInvoice(res); setNote(res.message || ""); }
      } catch { /* keep polling */ }
    }, 15000);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id, invoice?.status]);

  const start = async (network: string) => {
    setBusy(true); setNote(""); setTxHash("");
    try {
      setInvoice((await axios.post(`${API_URL}/billing/crypto/invoice`, { network }, { headers })).data);
    } catch (e) {
      setNote(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!invoice || !txHash.trim()) return;
    setBusy(true); setNote("");
    try {
      const res = (await axios.post(`${API_URL}/billing/crypto/invoice/${invoice.id}/confirm`, { tx_hash: txHash.trim() }, { headers })).data as Invoice;
      if (res.status === "paid") await onPaid(res);
      else { setInvoice(res); setNote(res.message || "Not confirmed yet."); }
    } catch (e) {
      setNote(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  };

  const close = () => { setOpen(false); setInvoice(null); setNote(""); setTxHash(""); };
  const premium = options ? options.is_premium : !!user.is_premium;
  const price = options ? `$${options.price_usd.toFixed(2)}` : "";
  const field = "flex items-center gap-2 p-3 border border-white/10 bg-black/30";

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 p-6 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-10">
        <header className="text-center space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Upgrade to <span className="text-gradient">Premium</span></h1>
          <p className="text-slate-400 max-w-xl mx-auto">Pay in crypto. Your seat activates automatically as soon as the payment confirms on-chain.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-8 bg-white/5 border border-white/10 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your plan</h3>
              <p className="text-3xl font-black text-white">{premium ? "Premium" : "Free"}</p>
              <p className="text-xs text-slate-400 mt-1">
                {premium ? (options?.premium_until ? `Active until ${day(options.premium_until)}` : "Active") : `${user.credits ?? 0} credits left`}
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              {[["Scans across 14 sports and all markets", true], ["Booking codes for SportyBet, Bet9ja, MSport, Betika", true],
                ["Community feed and tailing", true], ["Slip tracker with live hold / cash-out alerts", premium]].map(([label, on]) => (
                <li key={label as string} className={`flex items-center gap-3 ${on ? "text-slate-300" : "text-slate-600"}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${on ? "text-brand-teal" : "text-slate-700"}`} /> {label}
                </li>
              ))}
            </ul>
          </section>

          <section className="p-8 bg-gradient-to-br from-brand-blue/20 to-brand-teal/10 border border-brand-teal/30 space-y-6 relative overflow-hidden">
            <Crown className="absolute top-6 right-6 w-20 h-20 text-brand-teal opacity-10" />
            <div className="space-y-2">
              <span className="text-brand-teal text-[10px] font-black uppercase tracking-widest border border-brand-teal/30 px-2 py-1">Premium</span>
              <h3 className="text-4xl font-black text-white">{price || <Loader2 className="w-6 h-6 animate-spin inline" />}<span className="text-sm font-normal text-slate-400 ml-2">/ {options?.period_days ?? 30} days</span></h3>
              <p className="text-slate-300 text-sm">Slip tracker, live alerts and priority analysis. One payment covers one period; nothing renews by itself.</p>
            </div>
            {loadError && <p className="text-xs text-red-400">{loadError}</p>}
            {options && options.networks.length === 0 ? (
              <p className="text-xs text-yellow-400">Payments are not open yet. Please check back shortly.</p>
            ) : (
              <button onClick={() => setOpen(true)} disabled={!options} className="w-full py-4 bg-brand-teal text-background font-black uppercase tracking-wider text-sm disabled:opacity-40">
                {premium ? "Extend with crypto" : "Pay with crypto"}
              </button>
            )}
            <p className="text-[10px] text-slate-500">USDT on Tron, or USDC on Base and Ethereum.</p>
          </section>
        </div>
        <p className="text-center text-slate-600 text-xs">By upgrading, you agree to our Terms of Service. Crypto payments cannot be reversed.</p>
      </div>

      {open && options && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={close} />
          <div className="relative w-full max-w-md bg-[#080C19] border border-white/10 p-6 md:p-8 space-y-5 z-10 max-h-[92vh] overflow-y-auto">
            <button onClick={close} className="absolute top-5 right-5 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>

            {invoice?.status === "paid" ? (
              <div className="text-center space-y-5 py-4">
                <CheckCheck className="w-14 h-14 text-brand-teal mx-auto" />
                <h3 className="text-2xl font-black text-white">Premium is active</h3>
                <p className="text-sm text-slate-400">Payment confirmed on-chain{invoice.premium_until ? `. Your seat runs until ${day(invoice.premium_until)}.` : "."}</p>
                <Link href="/dashboard" className="block w-full py-4 bg-brand-teal text-background font-black uppercase tracking-wider text-sm">Back to dashboard</Link>
              </div>
            ) : !invoice || invoice.status === "expired" ? (
              <>
                <h3 className="text-2xl font-black text-white">Choose a network</h3>
                <p className="text-xs text-slate-400">You will get a wallet address and an exact amount for {price}.</p>
                <div className="space-y-2">
                  {options.networks.map(n => (
                    <button key={n.id} onClick={() => start(n.id)} disabled={busy} className="w-full flex items-center justify-between p-4 border border-white/10 hover:border-brand-teal/50 text-left disabled:opacity-50">
                      <span className="text-sm font-bold text-white">{n.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{n.auto_detect ? "Detected automatically" : "Confirm with hash"}</span>
                    </button>
                  ))}
                </div>
                {busy && <Loader2 className="w-5 h-5 animate-spin text-brand-teal mx-auto" />}
                {note && <p className="text-xs text-yellow-400">{note}</p>}
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-white">Send {invoice.coin}</h3>
                <p className="text-xs text-slate-400">{invoice.label}. Send the <span className="text-white font-bold">exact amount</span> below — the last digits identify your payment.</p>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Amount</p>
                  <div className={field}>
                    <code className="flex-1 text-lg font-mono font-bold text-white">{invoice.amount} <span className="text-xs text-slate-400">{invoice.coin}</span></code>
                    <button onClick={() => copy(invoice.amount, "amount")} className="p-2 bg-white/5">{copied === "amount" ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Wallet address</p>
                  <div className={field}>
                    <code className="flex-1 text-xs font-mono break-all text-brand-teal">{invoice.address}</code>
                    <button onClick={() => copy(invoice.address, "address")} className="p-2 bg-white/5">{copied === "address" ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}</button>
                  </div>
                </div>

                <p className="text-[10px] text-yellow-400 border border-yellow-500/20 bg-yellow-500/5 p-3 leading-relaxed">
                  Send only {invoice.coin} on this network. Another coin or network cannot be recovered. If your exchange deducts its fee from the amount, send enough for at least {price} to arrive.
                </p>

                {invoice.auto_detect && (
                  <p className="flex items-center gap-2 text-xs text-slate-300"><Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" /> Watching the network. This screen updates when your payment confirms.</p>
                )}

                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{invoice.auto_detect ? "Sent a different amount? Paste the transaction hash" : "After sending, paste the transaction hash"}</p>
                  <div className="flex gap-2">
                    <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="Transaction hash" className="flex-1 min-w-0 bg-black/30 border border-white/10 px-3 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal/60" />
                    <button onClick={verify} disabled={busy || !txHash.trim()} className="px-4 bg-white text-background font-black text-[11px] uppercase tracking-wider disabled:opacity-40 flex items-center gap-2">
                      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Verify
                    </button>
                  </div>
                  {note && <p className="text-xs text-yellow-400">{note}</p>}
                </div>
                <p className="text-[10px] text-slate-600">Invoice valid until {new Date(invoice.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
