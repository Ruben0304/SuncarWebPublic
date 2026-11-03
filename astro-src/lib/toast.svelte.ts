// Avisos breves ("Guardado", "No se pudo enviar"). Estado compartido entre
// islas: cualquier componente llama toast(...) y el <Toaster> del layout lo
// muestra.
export type Aviso = { id: number; titulo: string; descripcion?: string; tipo: "info" | "error" | "exito" };

export const avisos = $state<Aviso[]>([]);
let siguiente = 1;

export function toast(titulo: string, opciones: { descripcion?: string; tipo?: Aviso["tipo"]; ms?: number } = {}) {
  const id = siguiente++;
  avisos.push({ id, titulo, descripcion: opciones.descripcion, tipo: opciones.tipo ?? "info" });
  setTimeout(() => quitar(id), opciones.ms ?? 4000);
  return id;
}

export function quitar(id: number) {
  const i = avisos.findIndex((a) => a.id === id);
  if (i >= 0) avisos.splice(i, 1);
}
