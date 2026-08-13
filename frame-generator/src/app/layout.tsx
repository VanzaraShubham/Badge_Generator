import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: 'swap',
});

// Dynamic metadata - no hardcoded URLs
// metadataBase is automatically inferred from request headers in production
export const metadata: Metadata = {
  title: {
    default: "HH Goa 2026 – Builder Badge Generator",
    template: "%s | HH Goa 2026"
  },
  description:
    "Generate your official Hacker House Goa 2026 Builder Badge in seconds. Upload your photo, customize your details, and share on X. #FrameInGoa",
  keywords: [
    "HH Goa", 
    "Hacker House Goa", 
    "2026", 
    "Builder Badge", 
    "FrameInGoa",
    "Badge Generator",
    "Profile Picture",
    "Builder ID"
  ],
  authors: [{ name: "Hacker House Goa" }],
  creator: "Hacker House Goa",
  publisher: "Hacker House Goa",
  openGraph: {
    title: "HH Goa 2026 – Builder Badge Generator",
    description:
      "Generate your official Hacker House Goa 2026 Builder Badge. Upload your photo, get your badge, share on X! #FrameInGoa",
    type: "website",
    siteName: "HH Goa 2026 Badge Generator",
    images: [
      {
        url: "/og-image.png", // Relative URL - automatically resolved
        width: 1200,
        height: 630,
        alt: "HH Goa 2026 – Builder Badge Generator",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 – Builder Badge Generator",
    description:
      "Generate your official Hacker House Goa 2026 Builder Badge and share on X! #FrameInGoa",
    images: ["/og-image.png"], // Relative URL
    creator: "@HackerHouseGoa",
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
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
