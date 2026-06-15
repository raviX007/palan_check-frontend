import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palan Check — Agentic Compliance Engine",
  description:
    "Multi-agent reasoning across DPDP Act, Labour Codes, GDPR, and EU AI Act.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-body antialiased text-slate-800 bg-slate-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}