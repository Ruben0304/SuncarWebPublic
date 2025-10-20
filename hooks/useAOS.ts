'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Configuration options for AOS
interface AOSOptions {
  duration?: number;
  once?: boolean;
  offset?: number;
  easing?: string;
  delay?: number;
  disable?: boolean | 'phone' | 'tablet' | 'mobile' | (() => boolean);
}

/**
 * Global AOS (Animate On Scroll) hook
 * Initializes AOS once per mount to avoid multiple initializations
 *
 * @param options - AOS configuration options
 * @default { duration: 600, once: true, easing: 'ease-out' }
 */
export function useAOS(options?: AOSOptions) {
  useEffect(() => {
    // Default configuration optimized for performance
    const defaultOptions: AOSOptions = {
      duration: 600,
      once: true,
      easing: 'ease-out',
      offset: 50,
      delay: 0,
      disable: false,
    };

    // Merge user options with defaults
    const config = { ...defaultOptions, ...options };

    // Initialize AOS
    AOS.init(config);

    // Refresh AOS on route changes (optional, uncomment if needed)
    // AOS.refresh();

    // Cleanup function
    return () => {
      // AOS doesn't provide a destroy method, but we can refresh
      // to clear any pending animations
      AOS.refresh();
    };
  }, []); // Empty dependency array ensures this runs only once
}
