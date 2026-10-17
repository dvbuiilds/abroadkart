import type { Config } from "tailwindcss";
import { fontFamily as defaultFontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultFontFamily.sans],
      },
      // Article prose for /blogs/<slug>. Used via the `prose` class on ArticleBody.
      // Measure is set by the container (720px), not here.
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            fontSize: "1.125rem",
            lineHeight: "1.75",
            maxWidth: "none",
            p: {
              marginTop: "1.25em",
              marginBottom: "1.25em",
            },
            strong: {
              color: theme("colors.gray.900"),
              fontWeight: "600",
            },
            a: {
              color: theme("colors.blue.700"),
              fontWeight: "500",
              textDecorationLine: "underline",
              textDecorationColor: theme("colors.blue.300"),
              textDecorationThickness: "1.5px",
              textUnderlineOffset: "4px",
            },
            "a:hover": {
              textDecorationColor: theme("colors.blue.700"),
            },
            "h2, h3, h4": {
              color: theme("colors.gray.900"),
              fontWeight: "700",
              letterSpacing: "-0.02em",
              scrollMarginTop: "6rem",
            },
            h2: {
              fontSize: "1.625rem",
              lineHeight: "1.25",
              marginTop: "3.5rem",
              marginBottom: "1rem",
            },
            h3: {
              fontSize: "1.3125rem",
              fontWeight: "600",
              letterSpacing: "-0.01em",
              marginTop: "2.25em",
              marginBottom: "0.6em",
            },
            "ul > li::marker, ol > li::marker": {
              color: theme("colors.blue.500"),
            },
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            "h2 + p, h3 + p": {
              marginTop: "0.5em",
            },
          },
        },
      }),
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
