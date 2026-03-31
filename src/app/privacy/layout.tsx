import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "4Tango Privacy Policy. Learn how we collect, use, and protect your personal data when using our tango event management platform.",
  openGraph: {
    title: "Privacy Policy | 4Tango",
    description:
      "4Tango Privacy Policy. Learn how we collect, use, and protect your personal data.",
    url: `${baseUrl}/privacy`,
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | 4Tango",
    description:
      "4Tango Privacy Policy. Learn how we collect, use, and protect your personal data.",
  },
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
