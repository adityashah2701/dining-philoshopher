import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { NavBar } from "@/components/ui/NavBar";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press" });
const vt = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt" });

export const metadata: Metadata = {
  title: "Pixel Diner · Dining Philosophers",
  description:
    "An 8-bit, playable explainer of the Dining Philosophers problem: deadlock, starvation and how operating systems prevent them.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${press.variable} ${vt.variable}`}>
      <body className="crt">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
