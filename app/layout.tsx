import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGX Legal Letter AI",
  description: "AI-powered legal letter generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
