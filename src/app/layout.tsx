import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RUHVIQUE — Premium Fashion & Streetwear",
  description:
    "RUHVIQUE — premium modern fashion & streetwear. Shop T-Shirts, Apparel, Hoodies and Gym Wear.",
  keywords: ["RUHVIQUE", "Ruhvique", "fashion", "streetwear", "t-shirts", "hoodies", "gym wear"],
  authors: [{ name: "RUHVIQUE" }],
  icons: {
    icon: "/ruhvique-monogram.svg",
    shortcut: "/ruhvique-monogram.svg",
    apple: "/ruhvique-monogram.svg",
  },
  openGraph: {
    title: "RUHVIQUE — Premium Fashion & Streetwear",
    description: "Premium modern fashion & streetwear. T-Shirts, Apparel, Hoodies, Gym Wear.",
    siteName: "RUHVIQUE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <SessionProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
