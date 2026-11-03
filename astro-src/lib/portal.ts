// Acción de Svelte equivalente a React createPortal(..., document.body):
// mueve el nodo al final de <body> al montar, para que ningún contenedor con
// transform/z-index lo recorte.
//
// Al desmontar solo se quita: Svelte ya lo retira del DOM al cerrar el bloque
// {#if} y luego llama a destroy(). Reinsertarlo en su sitio original aquí
// (como se hacía antes) lo devolvía a la página y el diálogo no se cerraba.
export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return {
    destroy() {
      node.remove();
    },
  };
}
