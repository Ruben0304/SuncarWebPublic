import { useEffect, useState, type ComponentType, type ComponentProps, type ReactNode } from "react";

interface DynamicOptions {
  /** Aceptado por compatibilidad con next/dynamic; acá siempre se comporta como ssr:false. */
  ssr?: boolean;
  loading?: () => ReactNode;
}

/**
 * Sustituto de next/dynamic. El import solo ocurre dentro de un useEffect, es
 * decir, nunca en el servidor: algunos de los componentes que cargan así
 * (@google/model-viewer, mapas, el lottie del loader) tocan `HTMLElement`/DOM
 * al definirse y revientan si se evalúan en Node durante el render SSR de la
 * isla. React.lazy + Suspense no evita eso por sí solo, así que no se usa.
 */
export default function dynamic<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T } | T>,
  options: DynamicOptions = {},
) {
  return function DynamicWrapper(props: ComponentProps<T>) {
    const [Comp, setComp] = useState<T | null>(null);

    useEffect(() => {
      let activo = true;
      loader().then((mod) => {
        if (!activo) return;
        const resuelto = (
          typeof mod === "object" && mod !== null && "default" in mod ? (mod as { default: T }).default : mod
        ) as T;
        setComp(() => resuelto);
      });
      return () => {
        activo = false;
      };
    }, []);

    if (!Comp) return options.loading ? <>{options.loading()}</> : null;
    return <Comp {...(props as any)} />;
  };
}
