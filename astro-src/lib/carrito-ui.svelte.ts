// Si el drawer del carrito está abierto. Va aparte de cart.svelte.ts para que
// el WhatsApp flotante (que está en todas las páginas) lo lea sin arrastrar el
// carrito entero.
const ui = $state({ abierto: false });

export const carritoAbierto = () => ui.abierto;
export const abrirCarrito = () => {
  ui.abierto = true;
};
export const cerrarCarrito = () => {
  ui.abierto = false;
};
export const alternarCarrito = () => {
  ui.abierto = !ui.abierto;
};
