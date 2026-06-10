import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM Security Lab",
  description: "OWASP Top 10 for LLMs — Interactive Security Research",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>

      <body
        className="h-full overflow-hidden"
        style={{
          backgroundColor: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        {children}
      </body>
    </html>
  );
}