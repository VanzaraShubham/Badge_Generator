import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HH Goa 2026 – Builder ID Card Generator",
  description: "Generate your official Hacker House Goa 2026 Builder ID Card and share it on X.",
  openGraph: {
    title: "HH Goa 2026 – Builder ID Card Generator",
    description: "Generate your official Hacker House Goa 2026 Builder ID Card.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
