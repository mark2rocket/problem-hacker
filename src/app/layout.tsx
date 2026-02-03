import type { Metadata } from "next";
import { JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Problem Hacker v1.1",
  description: "Business value validation tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.variable}>{children}</body>
    </html>
  );
}
