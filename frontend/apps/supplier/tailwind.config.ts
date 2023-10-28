import sharedConfig from "@coaster/tailwind-config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "presets" | "content"> = {
  presets: [sharedConfig],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "../../packages/**/*.{js,ts,jsx,tsx}"],
};

export default config;
