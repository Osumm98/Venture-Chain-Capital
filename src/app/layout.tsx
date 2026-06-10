import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewModeProvider } from "@/components/view-mode-provider";
import { UserProvider } from "@/components/user-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-body-next",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading-next",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono-next",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Venture Chain Capital | Diversified Investment Platform",
  description:
    "Venture Chain Capital distributes your investment across five professionally managed asset class portfolios (Crypto, Stocks, Commodities, Forex, and Hedge) with transparent, rules-based automation.",
  keywords: [
    "investment platform",
    "diversified portfolio",
    "crypto investment",
    "VCC",
    "Venture Chain Capital",
    "token investment",
    "South Africa fintech",
  ],
  openGraph: {
    title: "Venture Chain Capital",
    description:
      "Diversified investment across 5 asset class portfolios with transparent automation.",
    type: "website",
    locale: "en_ZA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] relative transition-colors duration-300">
        <ThemeProvider defaultTheme="system">
          <ViewModeProvider>
            <UserProvider>
              <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden">
                {/* Cinematic noise texture */}
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay dark:opacity-[0.02] opacity-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%23")' }} />
              </div>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </UserProvider>
          </ViewModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
