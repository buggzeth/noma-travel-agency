// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOMA Travel Agency | Luxury Travel, Expert Advisors",
  description:
    "NOMA connects discerning travelers with expert advisors to craft unforgettable luxury journeys around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="tpembars-loader"
          strategy="afterInteractive"
          data-noptimize="1"
          data-cfasync="false"
          data-wpfc-render="false"
        >
          {`
            (function () {
              var script = document.createElement("script");
              script.async = true;
              script.src = "https://tpembars.com/NTAyNjg1.js?t=502685";
              document.head.appendChild(script);
            })();
          `}
        </Script>
      </head>
      <body className={`${playfair.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
