import type { Metadata } from "next";
import { Funnel_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/dashboard/themeProvider";
import { SessionProvider } from "next-auth/react";
const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MaturaMate",
  description:
    "MaturaMate è un sito web che aiuta gli studenti a prepararsi per il test di maturità",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelDisplay.className} ${dmSans.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
