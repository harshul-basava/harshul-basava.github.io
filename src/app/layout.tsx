import type { Metadata } from "next";
import { Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Harshul Basava",
  description: "AI safety organizer at Georgia Tech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSansMono.variable}>
      <body>{children}</body>
    </html>
  );
}
