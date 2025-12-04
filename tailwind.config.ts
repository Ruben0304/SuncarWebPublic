import type { Config } from "tailwindcss"

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        primary: "#0F2B66", // Azul corporativo oscuro
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          start: "#F26729", // Naranja
          end: "#FDB813", // Amarillo/Dorado
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
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
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(253, 184, 19, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(253, 184, 19, 0.8), 0 0 60px rgba(242, 103, 41, 0.6)",
          },
        },
        "rotate-slow": {
          "from": {
            transform: "rotate(0deg)",
          },
          "to": {
            transform: "rotate(360deg)",
          },
        },
        "wiggle": {
          "0%, 100%": {
            transform: "rotate(-3deg)",
          },
          "50%": {
            transform: "rotate(3deg)",
          },
        },
        "shake": {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-2px)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(2px)",
          },
        },
        "elegant-slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(60px) scale(0.9)",
            filter: "blur(5px)",
          },
          "60%": {
            opacity: "0.8",
            transform: "translateY(-5px) scale(1.02)",
            filter: "blur(1px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
        },
        "elegant-fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px) rotateY(30deg)",
            filter: "blur(3px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) rotateY(0deg)",
            filter: "blur(0)",
          },
        },
        "elegant-scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8) rotateZ(-5deg)",
            filter: "blur(4px)",
          },
          "70%": {
            opacity: "0.9",
            transform: "scale(1.05) rotateZ(2deg)",
            filter: "blur(1px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotateZ(0deg)",
            filter: "blur(0)",
          },
        },
        "gentle-float": {
          "0%, 100%": {
            transform: "translateY(0px) rotateZ(0deg)",
          },
          "25%": {
            transform: "translateY(-8px) rotateZ(0.5deg)",
          },
          "50%": {
            transform: "translateY(-12px) rotateZ(0deg)",
          },
          "75%": {
            transform: "translateY(-4px) rotateZ(-0.5deg)",
          },
        },
        "gentle-float-image": {
          "0%, 100%": {
            transform: "translateY(0px) rotateZ(0deg) scale(1)",
          },
          "25%": {
            transform: "translateY(-15px) rotateZ(1deg) scale(1.02)",
          },
          "50%": {
            transform: "translateY(-20px) rotateZ(0deg) scale(1.01)",
          },
          "75%": {
            transform: "translateY(-8px) rotateZ(-1deg) scale(1.02)",
          },
        },
        "pulse-soft": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(64, 138, 126, 0.3)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 30px rgba(64, 138, 126, 0.5)",
          },
        },
        "bounce-soft": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "ai-rank-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)",
          },
          "50%": {
            transform: "scale(1.1)",
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.8), 0 0 35px rgba(59, 130, 246, 0.6)",
          },
        },
        "ai-glow": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(168, 85, 247, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)",
          },
        },
        "ai-recommended-float": {
          "0%, 100%": {
            transform: "translateY(0) rotateZ(0deg)",
            boxShadow: "0 4px 20px rgba(168, 85, 247, 0.1)",
          },
          "50%": {
            transform: "translateY(-5px) rotateZ(0.5deg)",
            boxShadow: "0 8px 30px rgba(168, 85, 247, 0.2)",
          },
        },
        "sparkle": {
          "0%, 100%": {
            transform: "rotate(0deg) scale(1)",
            filter: "brightness(1)",
          },
          "25%": {
            transform: "rotate(90deg) scale(1.1)",
            filter: "brightness(1.2)",
          },
          "50%": {
            transform: "rotate(180deg) scale(1)",
            filter: "brightness(1.4)",
          },
          "75%": {
            transform: "rotate(270deg) scale(1.1)",
            filter: "brightness(1.2)",
          },
        },
        "shimmer": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "progress": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in-right": "fade-in-right 0.8s ease-out forwards",
        "fade-in-left": "fade-in-left 0.8s ease-out forwards",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out infinite",
        "elegant-slide-up": "elegant-slide-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "elegant-fade-in": "elegant-fade-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "elegant-scale-in": "elegant-scale-in 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "gentle-float": "gentle-float 6s ease-in-out infinite",
        "gentle-float-image": "gentle-float-image 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-soft": "bounce-soft 3s ease-in-out infinite",
        "ai-rank-pulse": "ai-rank-pulse 2s ease-in-out infinite",
        "ai-glow": "ai-glow 3s ease-in-out infinite",
        "ai-recommended-float": "ai-recommended-float 4s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "progress": "progress 2s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      animationDelay: {
        "200": "200ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
        "1200": "1200ms",
      },
      backgroundImage: {
        "secondary-gradient": "linear-gradient(90deg, #F26729 0%, #FDB813 100%)",
        "hero-fade": "linear-gradient(to right, transparent 0%, rgba(15, 43, 102, 0.1) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
