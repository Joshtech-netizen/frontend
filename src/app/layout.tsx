import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Initialize the Inter font
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Ensures text remains visible while the font loads
});

export const metadata: Metadata = {
  title: "Live Storefront | Admin Portal",
  description: "A real-time, decoupled e-commerce platform.",
};

// 2. The Global App Shell
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply Inter to the body, making it the default font for the entire app */}
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased selection:bg-jumia selection:text-white`}>
        {children}
      </body>
    </html>
  );
}