// Markdown -> HTML sin React. micromark ya viene instalado con remark (el
// parser que usaba react-markdown); el HTML crudo del texto se escapa y los
// enlaces con protocolos peligrosos se descartan, así que {@html} es seguro.
// Se importa bajo demanda: solo se paga cuando llega un texto a mostrar.
export async function markdownAHtml(texto: string): Promise<string> {
  const { micromark } = await import("micromark");
  return micromark(texto);
}
