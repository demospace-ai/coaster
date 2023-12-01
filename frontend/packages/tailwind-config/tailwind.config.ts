/* eslint-env node */
import { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "400px",
      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        "spin-slow": "spin 15s linear infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "fade-in": "fade-in 200ms ease-in-out",
        "dot-flashing": "dot-flashing 1s infinite linear alternate",
        "infinite-scroll": "infinite-scroll 20s linear infinite",
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          text: "var(--color-primary-text)",
        },
        "gray-10": "#fcfdff",
        "gray-350": "#b9bdc3",
      },
      boxShadow: {
        modal: "0 4px 20px 4px rgba(0, 0, 0, 0.1)",
        "centered-sm": "rgba(99, 99, 99, 0.15) 0 0 4px",
        "centered-md": "rgba(99, 99, 99, 0.15) 0 0 8px",
        "centered-lg": "rgba(99, 99, 99, 0.15) 0 0 16px",
        "dark-sm": "rgba(0,0,0,.15) 0 2px 3px 0",
      },
      width: {
        "100": "400px",
      },
      screens: {
        "3xl": "1600px",
        "4xl": "2000px",
      },
      keyframes: {
        shimmer: {
          "100%": { "-webkit-mask-position": "left" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "dot-flashing": {
          "0%": {
            opacity: "1",
          },
          "30%, 100%": {
            opacity: "0.2",
          },
        },
        "infinite-scroll": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(-50%)",
          },
        },
      },
    },
  },
  prefix: "tw-",
};

export default config;
