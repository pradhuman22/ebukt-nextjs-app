import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Event Bucket",
  description: "Platform to sale and purchase event ticket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full font-sans antialiased",
        "font-sans",
        roboto.variable
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <main className="flex-1 grow">{children}</main>
      </body>
    </html>
  );
}
