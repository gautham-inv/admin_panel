import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Innovin Admin Panel",
  description: "Admin panel for managing applications and contact messages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="pb-20 sm:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

