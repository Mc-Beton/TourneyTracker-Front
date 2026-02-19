import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "WarBracket - System Turniejowy",
  description: "System zarządzania turniejami i wynikami gier",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WarBracket",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-maskable-192x192.png", sizes: "72x72", type: "image/png" },
      { url: "/icon-maskable-192x192.png", sizes: "96x96", type: "image/png" },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        url: "/icon-maskable-192x192.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="apple-touch-icon" href="/icon-maskable-192x192.png" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
