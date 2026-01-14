/**
 * Hand Motion Studio - Root Layout
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 * 
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hand Motion Studio | Created by Moraouf",
  description: "Interactive 3D particle system controlled by hand gestures. Created by Moraouf © 2026",
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
