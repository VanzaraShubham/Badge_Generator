import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://hh-goa-badge.vercel.app";

export const metadata: Metadata = {
  title: "HH Goa 2026 – Builder ID Card Generator",
  description:
    "Generate your official Hacker House Goa 2026 Builder ID Card in seconds. Upload your photo, enter your name & role, download and share on X. #FrameInGoa",
  keywords: ["HH Goa", "Hacker House Goa", "2026", "Builder Badge", "FrameInGoa"],
  openGraph: {
    title: "HH Goa 2026 – Builder ID Card Generator",
    description:
      "Generate your official Hacker House Goa 2026 Builder ID Card. Upload your photo, get your badge, share on X! #FrameInGoa",
    type: "website",
    url: BASE_URL,
    siteName: "HH Goa 2026 Badge Generator",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "HH Goa 2026 – Builder ID Card Generator",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 – Builder ID Card Generator",
    description:
      "Generate your official Hacker House Goa 2026 Builder ID Card and share on X! #FrameInGoa",
    images: [`${BASE_URL}/og-image.png`],
  },
  metadataBase: new URL(BASE_URL),
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
