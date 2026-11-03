// Markdown del artículo → HTML con las mismas clases que daba react-markdown
// (aquí sin React: el artículo llega ya hecho en el HTML del servidor).
//
// Mismo comportamiento que react-markdown: GFM + saltos de línea, el HTML
// crudo del texto se muestra como texto (nunca se inyecta) y los enlaces con
// protocolos raros (javascript:) se vacían.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import { toHtml } from "hast-util-to-html";

interface Nodo {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Nodo[];
}

const CLASES: Record<string, string> = {
  p: "mb-8 text-[1.125rem] leading-[1.9] text-gray-700",
  h1: "text-5xl font-bold text-gray-900 mb-8 mt-16 leading-tight tracking-tight",
  h2: "text-4xl font-bold text-gray-900 mb-6 mt-14 leading-tight tracking-tight",
  h3: "text-3xl font-bold text-gray-900 mb-5 mt-12 leading-tight tracking-tight",
  h4: "text-2xl font-bold text-gray-900 mb-4 mt-10",
  ul: "my-8 list-disc pl-8 space-y-3",
  ol: "my-8 list-decimal pl-8 space-y-3",
  li: "text-gray-700 my-3 leading-[1.8] text-[1.125rem]",
  blockquote:
    "border-l-4 border-gray-900 pl-8 italic text-gray-700 my-10 py-2 font-medium text-xl leading-relaxed",
  hr: "border-gray-200 my-16",
  strong: "font-bold text-gray-900",
  em: "italic text-gray-600",
  a: "text-primary font-medium no-underline hover:underline hover:text-[#AFEB17]",
  pre: "bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-10 border border-gray-800",
  // El original dependía de @tailwindcss/typography (no instalado), así que
  // imágenes y tablas salían sin estilo; se les da el que pedían sus clases prose.
  img: "rounded-lg my-12 w-full h-auto shadow-md",
  table: "border-collapse w-full my-10",
  th: "border border-gray-200 p-4 text-left font-semibold text-gray-900 bg-gray-50",
  td: "border border-gray-200 p-4 text-gray-700",
};

const CODIGO_EN_LINEA = "bg-gray-100 text-gray-900 px-2 py-1 rounded text-base font-mono";

const PROTOCOLO_SEGURO = /^(https?|ircs?|mailto|xmpp)$/i;

function urlSegura(valor: string): string {
  const dosPuntos = valor.indexOf(":");
  const interrogacion = valor.indexOf("?");
  const almohadilla = valor.indexOf("#");
  const barra = valor.indexOf("/");
  if (
    dosPuntos === -1 ||
    (barra !== -1 && dosPuntos > barra) ||
    (interrogacion !== -1 && dosPuntos > interrogacion) ||
    (almohadilla !== -1 && dosPuntos > almohadilla) ||
    PROTOCOLO_SEGURO.test(valor.slice(0, dosPuntos))
  ) {
    return valor;
  }
  return "";
}

function recorrer(nodo: Nodo, padre?: Nodo) {
  if (nodo.type === "element" && nodo.tagName) {
    const props = (nodo.properties ??= {});
    const clase = CLASES[nodo.tagName];
    if (clase) props.className = [clase];
    if (nodo.tagName === "code") {
      // `pre > code` es bloque; el resto, código en línea.
      props.className = [
        ...(Array.isArray(props.className) ? (props.className as string[]) : []),
        ...(padre?.tagName === "pre" ? ["block"] : CODIGO_EN_LINEA.split(" ")),
      ];
    }
    for (const llave of ["href", "src"]) {
      if (typeof props[llave] === "string") props[llave] = urlSegura(props[llave] as string);
    }
    if (nodo.tagName === "a" && typeof props.href === "string" && /^https?:/i.test(props.href)) {
      props.rel = ["noopener", "noreferrer"];
    }
    if (nodo.tagName === "img") props.loading = "lazy";
  }
  const hijos = nodo.children;
  if (!hijos) return;
  for (let i = 0; i < hijos.length; i++) {
    // HTML crudo del artículo → texto literal, igual que react-markdown sin rehype-raw.
    if (hijos[i].type === "raw") hijos[i] = { type: "text", value: hijos[i].value };
    else recorrer(hijos[i], nodo);
  }
}

// Normaliza saltos de línea (Windows / Mac antiguos), como hacía el original.
const normalizar = (contenido: string) => contenido.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const procesador = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkRehype, { allowDangerousHtml: true });

export function markdownAHtml(contenido: string): string {
  const arbol = procesador.runSync(procesador.parse(normalizar(contenido))) as unknown as Nodo;
  recorrer(arbol);
  return toHtml(arbol as never);
}
