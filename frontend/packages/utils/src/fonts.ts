import { Lateef, Lora, Work_Sans } from "next/font/google";

export const worksans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const heading = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const lateef = Lateef({
  subsets: ["latin"],
  display: "block",
  weight: ["400", "800"],
});
