import type { Metadata } from "next";
import { Playfair_Display, Syne, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "SafeRoute | Navigate Your City Safely",
  description: "The safest walking routes for vulnerable individuals navigating cities at night.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${syne.variable} ${lora.variable} ${jetbrains.variable} antialiased bg-primary-dark text-text-dark transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
