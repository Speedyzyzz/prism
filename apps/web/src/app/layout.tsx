import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prism — The AI Commerce Operating System",
  description:
    "Shopping, Reimagined Through Intelligence. Intent-driven e-commerce assistant with visual search, streamed Generative UI, agentic checkout, and merchant fraud analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
