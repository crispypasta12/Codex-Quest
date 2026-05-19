import type { Metadata } from "next";
import type { ReactNode } from "react";
import type React from "react";
import {
  JetBrains_Mono,
  Outfit,
  Pixelify_Sans,
  Silkscreen,
} from "next/font/google";

import "./globals.css";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  weight: ["400", "500", "600", "700"],
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  variable: "--font-silkscreen",
  weight: ["400", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "The Code Academy — Loop Forest",
  description:
    "A cozy pixel-art browser game for learning computer science by lantern light.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelify.variable} ${silkscreen.variable} ${outfit.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
