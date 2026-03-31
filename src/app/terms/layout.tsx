import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "4Tango Terms of Service. Understand the terms and conditions for using our tango event management platform.",
  openGraph: {
    title: "Terms of Service | 4Tango",
    description:
      "4Tango Terms of Service. Understand the terms and conditions for using our platform.",
    url: `${baseUrl}/terms`,
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | 4Tango",
    description:
      "4Tango Terms of Service. Understand the terms and conditions for using our platform.",
  },
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
