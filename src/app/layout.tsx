import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const viewport: Viewport = {
  themeColor: "#03060E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Bet Assistant | Quant Betting",
  description: "Institutional-Grade Quantitative Betting engine scanning 55+ global leagues natively into Telegram.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BetAssistant",
  },
};

import AuthProvider from "@/components/providers/AuthProvider";
import NavigationProgressWrapper from "@/components/NavigationProgressWrapper";
import RegisterServiceWorker from "@/components/providers/RegisterServiceWorker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased bg-[#03060E] text-slate-200`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <RegisterServiceWorker />
        <NavigationProgressWrapper />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
