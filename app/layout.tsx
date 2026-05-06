import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { PROJECT } from "@/config";

export const metadata: Metadata = {
  title: {
    default: PROJECT.name,
    template: `%s — ${PROJECT.name}`,
  },
  description: PROJECT.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}