import { Metadata } from "next";
import { TDEECalculator } from "@/components/TDEECalculator";

export const metadata: Metadata = {
  title: "TDEE Calculator - Embeddable Widget",
  robots: "noindex, nofollow",
  openGraph: { url: "/embed/tdee/" },
};

export default function EmbedTDEEPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <TDEECalculator />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://caloriewize.com" target="_blank" rel="noopener" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          CalorieWize
        </a>
      </p>
    </div>
  );
}
