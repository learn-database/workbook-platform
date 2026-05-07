import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn Database Workbook",
  description: "Interactive workbook platform for Learn Database.",
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
