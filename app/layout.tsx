import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/context/authentication";
import { fetchFlixUser } from "@/lib/flix-api.server";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FooFlix - Stream Movies & Series",
  description:
    "Your ultimate destination for streaming movies and TV series. Watch anywhere, anytime.",
  keywords: [
    "movies",
    "series",
    "streaming",
    "watch",
    "entertainment",
    "watch-together",
  ],
  appleWebApp: {
    title: "FooFlix",
  },
};

export const viewport: Viewport = {
  themeColor: "#6b21a8",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await fetchFlixUser();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground pb-16`}
      >
        <AuthProvider initialUser={user}>
          <Navbar />
          <Toaster />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
