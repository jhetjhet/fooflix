import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { FlixUser } from "@/types/flix";
import { flixFetch } from "@/lib/flix-fetch";
import { AuthProvider } from "@/context/authentication";

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

const fetchUser = async (): Promise<FlixUser | null> => {
  try {
    const user = await flixFetch("/auth/users/me/");
    
    return user;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await fetchUser();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider initialUser={user}>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
