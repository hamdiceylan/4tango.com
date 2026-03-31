import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "4Tango - Event Management for Tango Organizers",
    template: "%s | 4Tango",
  },
  description:
    "The event platform built for tango organizers. Create beautiful event pages, collect registrations, manage attendees, and keep everything in one place.",
  keywords: [
    "tango",
    "tango marathon",
    "tango festival",
    "tango event",
    "event management",
    "dance registration",
    "tango organizer",
    "milonga",
  ],
  authors: [{ name: "4Tango" }],
  creator: "4Tango",
  publisher: "4Tango",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "4Tango",
    title: "4Tango - Event Management for Tango Organizers",
    description:
      "The event platform built for tango organizers. Create beautiful event pages, collect registrations, manage attendees, and keep everything in one place.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "4Tango - Event Management for Tango Organizers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "4Tango - Event Management for Tango Organizers",
    description:
      "The event platform built for tango organizers. Create beautiful event pages, collect registrations, manage attendees, and keep everything in one place.",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
