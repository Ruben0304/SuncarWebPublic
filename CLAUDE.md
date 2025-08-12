# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Suncar solar energy company landing page** built with **Next.js 15, React 19, and TypeScript**. The project is automatically synced with v0.dev deployments and uses modern web technologies including Tailwind CSS and Radix UI components.

## Development Commands

- **Development server**: `npm run dev` (Next.js development mode)
- **Build**: `npm run build` (Production build)
- **Start**: `npm run start` (Start production server)
- **Lint**: `npm run lint` (Next.js built-in ESLint)

## Architecture & Structure

### Core Framework
- **Next.js 15** with App Router (`app/` directory structure)
- **React 19** with client-side components
- **TypeScript** for type safety
- **Tailwind CSS** with custom configuration and design system

### Key Directories
- `app/` - Next.js app router pages and layouts
- `components/` - Reusable UI components
  - `ui/` - Shadcn/ui component library
  - `feats/` - Feature-specific components (chat assistant)
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and configurations
- `public/` - Static assets including project images
- `styles/` - Global CSS files

### Design System
- **Primary color**: `#0F2B66` (corporate dark blue)
- **Secondary gradient**: `#F26729` (orange) to `#FDB813` (yellow/gold)
- **Component library**: Radix UI with shadcn/ui styling
- **Responsive design**: Mobile-first approach with Tailwind breakpoints

### Page Structure
- **Homepage** (`app/page.tsx`): Main landing page with hero, about, testimonials, and CTA sections
- **Projects** (`app/projectos/page.tsx`): Project showcase page
- **Contact** (`app/contacto/page.tsx`): Contact information page
- **Quotation** (`app/cotizacion/page.tsx`): Solar installation quotation page with appliance selection
- **Services** (`app/servicios/page.tsx`): Services information page
- **Testimonials** (`app/testimonios/page.tsx`): Customer testimonials page
- **Layout** (`app/layout.tsx`): Root layout with global ChatAssistant component

### Key Features
1. **Interactive Chat Assistant** (`components/feats/chat/ChatAssistant.tsx`):
   - Client-side React component with mock backend
   - Feedback system with modal interactions
   - Suggestion system for common questions
   - TypeScript interfaces for message handling

2. **Navigation System** (`components/navigation.tsx`):
   - Fixed floating navigation with backdrop blur
   - Mobile-responsive hamburger menu
   - Scroll-aware styling changes

3. **Animation System**:
   - Custom Tailwind animations and keyframes
   - Lottie animations integration (`components/lottie-animation.tsx`)
   - Smooth transitions and hover effects

4. **Location Services** (`components/LocationMapPicker.tsx`):
   - Interactive map component for location selection
   - Leaflet and React Leaflet integration
   - Geographic data handling for service areas

### Package Management
- Uses **npm** (package-lock.json present)
- Also has **pnpm-lock.yaml** (pnpm compatible)
- Key dependencies: Next.js, React, Radix UI, Tailwind CSS, Lucide icons, React Markdown, Leaflet, React Hook Form, Zod

## Development Notes

- This is a **client-side focused** application with "use client" directives
- **Image optimization** using Next.js Image component
- **Responsive design** prioritized throughout components
- **Spanish language** content for Cuban solar energy market
- **Mock data** used for testimonials and chat responses
- **Form handling** with React Hook Form and Zod validation
- **Map integration** with Leaflet for location-based services
- **Comprehensive UI library** with extensive Radix UI components
- **v0.dev integration** - changes sync automatically from v0.dev deployments