import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the 4Tango team. We're here to help tango organizers and dancers with any questions about our event management platform.",
  openGraph: {
    title: "Contact Us | 4Tango",
    description:
      "Get in touch with the 4Tango team. We're here to help tango organizers and dancers.",
    url: `${baseUrl}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | 4Tango",
    description:
      "Get in touch with the 4Tango team. We're here to help tango organizers and dancers.",
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
