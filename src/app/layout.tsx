import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/dashboard/themeProvider";
import AuthProvider from "./components/auth/AuthProvider";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
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
      <body className={`${funnelDisplay.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
