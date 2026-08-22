import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const fonts = {
  sans: GeistSans.variable,
  mono: GeistMono.variable,
  serif: newsreader.variable,
};
