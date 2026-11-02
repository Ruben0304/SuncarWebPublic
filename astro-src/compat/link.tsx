import type { AnchorHTMLAttributes, ReactNode } from "react";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: ReactNode;
}

/** Sustituto de next/link: navegación normal del navegador, sin prefetch de Next. */
export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
