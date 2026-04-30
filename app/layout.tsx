import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

// 2026-04-24 structural fix — do NOT reintroduce `headers()` in this layout.
// Any dynamic API (headers, cookies, draftMode, searchParams) in the root
// layout forces EVERY route in the tree to render dynamically (ƒ). That
// silently:
//   1. Disables SSG — no prerendered HTML for any dynamic route (food, compare,
//      state, guide, insights all went from ● SSG → ƒ Dynamic)
//   2. Emits `cache-control: private,no-cache,no-store` → CF edge cache ~1%
//   3. Bypasses `dynamicParams=false` validation → Next.js 16 returns
//      HTTP 200 + 404 HTML body (soft-404) for unknown slugs
// Verified 2026-04-24 on caloriewize: `/food/xxx/`, `/compare/x-vs-y/`,
// `/state/xxx/` all returned HTTP 200 with "Not Found" body because root
// layout used `await headers()` for dynamic <html lang>. This was THE cause
// of 36K 404s + 86K crawled-not-indexed in GSC. Same fix as nameblooms
// (2026-04-23) + costbycity (35d1dde) that restored SSG portfolio-wide.
// Keep `<html lang="en">` static — /es/ subtree loses dynamic lang attribute;
// acceptable because hreflang alternates still signal the Spanish URL.

const inter = Inter({ subsets: ["latin"], display: "swap" });
const SITE_NAME = "CalorieWize";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://caloriewize.com";

const ROOT_ALTERNATE_LANGUAGES = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/es/`,
  'x-default': `${SITE_URL}/`,
} as const;

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} - Calories & Nutrition Facts`, template: `%s | ${SITE_NAME}` },
  description: "Find calories and nutrition facts for thousands of foods. Compare foods side by side. Data from USDA FoodData Central.",
  metadataBase: new URL(SITE_URL),
  alternates: { languages: ROOT_ALTERNATE_LANGUAGES },
  // robots metadata intentionally omitted at root (2026-04-24 soft-404 fix):
  // Next.js 16 adds `content="noindex"` for 404 responses but fails to override
  // a root `content="index, follow"` — BOTH tags leak to Google on notFound()
  // pages, which picks the first → pruned URLs stay indexable. Default
  // (index, follow) is already Google's assumption; no need to be explicit.
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FTE9B0SQSS" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FTE9B0SQSS');` }} />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "CalorieWize",
              "url": "https://caloriewize.com",
              "description": "Find calories and nutrition facts for thousands of foods. Compare foods side by side. Data from USDA FoodData Central.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://caloriewize.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "CalorieWize",
              "url": "https://caloriewize.com",
              "description": "Find calories and nutrition facts for thousands of foods. Compare foods side by side. Data from USDA FoodData Central.",
              "parentOrganization": {
                "@type": "Organization",
                "name": "DataPeek Research Network",
                "url": "https://datapeekfacts.com"
              }
            }
          ]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <UpgradeAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-orange-600">{SITE_NAME}</a>
            <nav className="flex gap-4 text-sm">
              <a href="/food/" className="hover:text-orange-600">Foods</a>
              <a href="/compare/" className="hover:text-orange-600">Compare</a>
              <a href="/calculator/" className="hover:text-orange-600">Calculator</a>
              <a href="/state/" className="hover:text-orange-600">By State</a>
              <a href="/insights/" className="hover:text-orange-600">Insights</a>
              <a href="/guide/" className="hover:text-orange-600">Guides</a>
              <a href="/blog/" className="hover:text-orange-600">Articles</a>
              <a href="/es/" className="text-slate-400 hover:text-orange-600 text-xs">ES</a>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>Powered by data from USDA FoodData Central. Values per 100g serving.</p>
            <p className="mt-2">
              <a href="/about/" className="hover:text-orange-600">About</a>
              {" | "}
              <a href="/privacy/" className="hover:text-orange-600">Privacy</a>
              {" | "}
              <a href="/terms/" className="hover:text-orange-600">Terms</a>
              {" | "}
              <a href="/disclaimer/" className="hover:text-orange-600">Disclaimer</a>
              {" | "}
              <a href="/contact/" className="hover:text-orange-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Data Tools</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://ingredipeek.com" className="hover:text-orange-600" rel="nofollow noopener">Food Allergens</a>
                <a href="https://nameblooms.com" className="hover:text-orange-600" rel="nofollow noopener">Baby Names</a>
                <a href="https://calcpeek.com" className="hover:text-orange-600" rel="nofollow noopener">Calculators</a>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Your go-to resource for nutrition facts and calorie data.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} {SITE_NAME}. An independent data resource.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
