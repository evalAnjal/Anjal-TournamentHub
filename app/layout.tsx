import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import MobileBottomBar from "@/components/MobileBottomBar";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameHub - Tournament Platform",
  description: "Join tournaments, compete with players, and win prizes",
};

// Inline script to apply theme class before first paint (prevents flash)
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.classList.add(t==='light'?'light':'dark');}catch(e){document.documentElement.classList.add('light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Blocking theme script – runs before CSS paints to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider>
          <main className="pb-20 lg:pb-0">
            {children}
          </main>
          <MobileBottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}