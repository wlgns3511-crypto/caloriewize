import type { Metadata } from "next";
import { headers } from 'next/headers';
import { Inter } from "next/font/google";
import "./globals.css";
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const SITE_NAME = "CalorieWize";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://caloriewize.com";

const ROOT_LOCALES = ['es'] as const;
type RootLocale = (typeof ROOT_LOCALES)[number];
const ROOT_ALTERNATE_LANGUAGES = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/es/`,
  'x-default': `${SITE_URL}/`,
} as const;

function getHtmlLang(pathname: string | null): string {
  const locale = pathname?.split('/').filter(Boolean)[0] as RootLocale | undefined;
  return locale && ROOT_LOCALES.includes(locale) ? locale : 'en';
}


export const metadata: Metadata = {
  title: { default: `${SITE_NAME} - Calories & Nutrition Facts`, template: `%s | ${SITE_NAME}` },
  description: "Find calories and nutrition facts for thousands of foods. Compare foods side by side. Data from USDA FoodData Central.",
  metadataBase: new URL(SITE_URL),
  alternates: { languages: ROOT_ALTERNATE_LANGUAGES },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname');
  const htmlLang = getHtmlLang(pathname);
  return (
    <html lang={htmlLang}>
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
