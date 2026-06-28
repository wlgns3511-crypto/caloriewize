import type { Metadata } from "next";
import Link from "next/link";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { breadcrumbSchema } from "@/lib/schema";

const desc = "Contact CalorieWize — for data corrections, partnership inquiries, or general feedback about USDA FoodData Central nutrition data presented on the site.";

export const metadata: Metadata = {
  title: "Contact CalorieWize",
  description: desc,
  alternates: { canonical: "/contact/" },
  openGraph: { title: "Contact CalorieWize", description: desc, url: "/contact/" },
};

function formatVintage(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ContactPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <h1>Contact CalorieWize</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: <time dateTime={LEGAL_VINTAGES.contact}>{formatVintage(LEGAL_VINTAGES.contact)}</time></p>

      <p>
        CalorieWize is a small US-data publication. Email is the only channel.
        We do not run live chat, social DMs, or telephone support &mdash; none scale
        to the editorial standards we hold for nutrition pages.
      </p>

      <h2>Email</h2>
      <p>
        <strong>
          <a href="mailto:datapeekfacts@gmail.com">datapeekfacts@gmail.com</a>
        </strong>{' '}
        &mdash; shared with the wider DataPeek Research Network. We typically respond
        within 1-2 business days.
      </p>

      <h2>Best contact paths by topic</h2>
      <ul>
        <li>
          <strong>Data correction (a number disagrees with USDA FoodData Central):</strong>{' '}
          see the <Link href="/corrections-policy/">corrections policy</Link>{' '}
          for the exact information we need to act on a fix. Include the food
          page URL, the value you believe is wrong, and the FDC ID you cross-checked
          against.
        </li>
        <li>
          <strong>Methodology question:</strong> the{' '}
          <Link href="/methodology/">methodology page</Link> documents
          our data lineage, classifier definitions, and the difference
          between FDA Daily Values and individual RDAs. Most methodology
          questions are answered there before email.
        </li>
        <li>
          <strong>Editorial concern:</strong> see the{' '}
          <Link href="/editorial-policy/">editorial policy</Link>{' '}
          for what is reviewed and how. If you believe a page violates that
          policy, email us with the URL and the specific concern.
        </li>
        <li>
          <strong>Network-wide question (DataPeek Facts):</strong> reach the
          shared network team at the same email address &mdash; flag &ldquo;Network&rdquo;
          in the subject line.
        </li>
      </ul>

      <h2>What we cannot help with</h2>
      <ul>
        <li>
          <strong>Personal nutrition or medical advice.</strong> CalorieWize is
          a public-data tool. We cannot recommend macros, evaluate a diet, or
          comment on a specific health condition. Work with a registered
          dietitian or licensed physician for individualized advice.
        </li>
        <li>
          <strong>Brand label disputes.</strong> Branded entries reflect what
          the manufacturer submitted to USDA. If a current package label
          disagrees with the FoodData Central entry, the manufacturer&apos;s
          current label is more authoritative &mdash; contact the manufacturer
          directly to update the FoodData Central submission.
        </li>
        <li>
          <strong>Account or paid subscriptions.</strong> CalorieWize is free
          and there are no accounts. There is nothing to log in to, cancel, or refund.
        </li>
      </ul>

      <h2>About the network</h2>
      <p>
        CalorieWize is part of the{' '}
        <a href="https://datapeekfacts.com" rel="noopener">DataPeek Research Network</a>,
        a collection of public-data tools across US nutrition, housing, tax,
        healthcare, and other civic domains. The network shares editorial
        standards and a single corrections workflow.
      </p>

      <AuthorBox layer="legal" slug="contact" />
    </article>
  );
}
