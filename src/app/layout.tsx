import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Belvedere — Block Management",
  description:
    "Management system for the building: announcements, meetings, decisions, documents and projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
