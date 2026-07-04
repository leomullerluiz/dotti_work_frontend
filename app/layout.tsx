import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { STORAGE_KEYS } from "@/data/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_DOTTI_SITE_URL ?? "https://dotti.work";
const title = "dotti.work - Open source project matching";
const description =
  "Find open source projects that match your stack, seniority, and contribution goals.";
const socialImage = {
  url: "/dotti-wordmark.svg",
  width: 220,
  height: 56,
  alt: "dotti.work",
  type: "image/svg+xml",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: [{ url: "/dotti-icon.svg", type: "image/svg+xml", sizes: "any" }],
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "dotti.work",
    images: [socialImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

const themeScript = `
(function () {
  try {
    var storedTheme = window.localStorage.getItem(${JSON.stringify(STORAGE_KEYS.theme)});
    var theme = storedTheme ? JSON.parse(storedTheme) : "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var useDark = theme === "dark" || (theme === "system" && prefersDark);
    var root = document.documentElement;

    root.classList.toggle("dark", useDark);
    root.style.colorScheme = useDark ? "dark" : "light";
  } catch {
    var fallbackDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", fallbackDark);
    document.documentElement.style.colorScheme = fallbackDark ? "dark" : "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
