import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex h-full min-h-full flex-col font-sans antialiased",
          roboto.variable
        )}
      >
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 grow">{children}</main>
          <Toaster
            toastOptions={{
              classNames: {
                error: "!bg-red-100 !text-red-600 !border-red-200",
                success: "!bg-green-100 !text-green-600 !border-green-200",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
