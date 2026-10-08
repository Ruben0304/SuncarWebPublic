// Capas propias para Google Maps. Las clases se crean al usarlas porque
// `google.maps.OverlayView` solo existe cuando el script ya cargó.

export interface NodoHtml {
  lat: number;
  lng: number;
  el: HTMLElement;
  /** Tamaño del nodo: se centra sobre el punto. */
  ancho: number;
  alto: number;
}

export interface CapaHtml extends google.maps.OverlayView {
  setNodos(nodos: NodoHtml[]): void;
}

/**
 * Elementos HTML anclados a coordenadas. `interactiva` los deja recibir clics;
 * si no, solo se ven.
 */
export function crearCapaHtml(interactiva: boolean): CapaHtml {
  class Capa extends google.maps.OverlayView {
    private raiz: HTMLDivElement | null = null;
    private nodos: NodoHtml[] = [];

    onAdd() {
      this.raiz = document.createElement("div");
      this.raiz.style.position = "absolute";
      this.raiz.style.pointerEvents = "none";
      const panes = this.getPanes();
      (interactiva ? panes?.overlayMouseTarget : panes?.overlayLayer)?.appendChild(
        this.raiz,
      );
      this.pintar();
    }

    setNodos(nodos: NodoHtml[]) {
      this.nodos = nodos;
      this.pintar();
      this.draw();
    }

    private pintar() {
      if (!this.raiz) return;
      this.raiz.replaceChildren(...this.nodos.map((n) => n.el));
    }

    draw() {
      const proyeccion = this.getProjection();
      if (!proyeccion) return;
      for (const n of this.nodos) {
        const p = proyeccion.fromLatLngToDivPixel(
          new google.maps.LatLng(n.lat, n.lng),
        );
        if (!p) continue;
        n.el.style.position = "absolute";
        n.el.style.left = `${p.x - n.ancho / 2}px`;
        n.el.style.top = `${p.y - n.alto / 2}px`;
        n.el.style.width = `${n.ancho}px`;
        n.el.style.height = `${n.alto}px`;
        if (interactiva) n.el.style.pointerEvents = "auto";
      }
    }

    onRemove() {
      this.raiz?.remove();
      this.raiz = null;
    }
  }
  return new Capa() as unknown as CapaHtml;
}

// ─── Mapa de calor ───────────────────────────────────────────────────────────
// HeatmapLayer de Google está retirado, así que se dibuja a mano: cada punto es
// una mancha difuminada, y el brillo acumulado se pinta con el degradado.

export interface PuntoCalor {
  lat: number;
  lng: number;
  intensity: number;
}

export interface OpcionesCalor {
  radius: number;
  blur: number;
  minOpacity: number;
  gradient: Record<number, string>;
}

export interface CapaCalor extends google.maps.OverlayView {
  setPuntos(puntos: PuntoCalor[]): void;
}

function crearPaleta(gradient: Record<number, string>): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const degradado = ctx.createLinearGradient(0, 0, 0, 256);
  for (const [parada, color] of Object.entries(gradient)) {
    degradado.addColorStop(Number(parada), color);
  }
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, 1, 256);
  return ctx.getImageData(0, 0, 1, 256).data;
}

function crearMancha(radio: number, difuminado: number): HTMLCanvasElement {
  const total = radio + difuminado;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = total * 2;
  const ctx = canvas.getContext("2d")!;
  // La sombra se dibuja desplazada para que solo quede el difuminado.
  ctx.shadowOffsetX = ctx.shadowOffsetY = total * 2;
  ctx.shadowBlur = difuminado;
  ctx.shadowColor = "black";
  ctx.beginPath();
  ctx.arc(-total, -total, radio, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

export function crearCapaCalor(opciones: OpcionesCalor): CapaCalor {
  const MARGEN = 80;

  class Capa extends google.maps.OverlayView {
    private canvas: HTMLCanvasElement | null = null;
    private puntos: PuntoCalor[] = [];
    private paleta = crearPaleta(opciones.gradient);
    private mancha = crearMancha(opciones.radius, opciones.blur);

    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.style.pointerEvents = "none";
      this.getPanes()?.overlayLayer.appendChild(this.canvas);
    }

    setPuntos(puntos: PuntoCalor[]) {
      this.puntos = puntos;
      this.draw();
    }

    draw() {
      const proyeccion = this.getProjection();
      const mapa = this.getMap() as google.maps.Map | null;
      const limites = mapa?.getBounds();
      const canvas = this.canvas;
      if (!proyeccion || !limites || !canvas) return;

      const sw = proyeccion.fromLatLngToDivPixel(limites.getSouthWest());
      const ne = proyeccion.fromLatLngToDivPixel(limites.getNorthEast());
      if (!sw || !ne) return;

      const ancho = Math.ceil(ne.x - sw.x) + MARGEN * 2;
      const alto = Math.ceil(sw.y - ne.y) + MARGEN * 2;
      const origenX = sw.x - MARGEN;
      const origenY = ne.y - MARGEN;
      canvas.style.left = `${origenX}px`;
      canvas.style.top = `${origenY}px`;
      canvas.width = ancho;
      canvas.height = alto;

      const ctx = canvas.getContext("2d");
      if (!ctx || ancho <= 0 || alto <= 0) return;
      ctx.clearRect(0, 0, ancho, alto);

      const mitad = opciones.radius + opciones.blur;
      for (const p of this.puntos) {
        const px = proyeccion.fromLatLngToDivPixel(
          new google.maps.LatLng(p.lat, p.lng),
        );
        if (!px) continue;
        ctx.globalAlpha = Math.min(Math.max(p.intensity, opciones.minOpacity), 1);
        ctx.drawImage(this.mancha, px.x - origenX - mitad, px.y - origenY - mitad);
      }

      // Colorea según el brillo acumulado de cada píxel.
      const imagen = ctx.getImageData(0, 0, ancho, alto);
      const datos = imagen.data;
      for (let i = 3; i < datos.length; i += 4) {
        const alfa = datos[i];
        if (!alfa) continue;
        const j = alfa * 4;
        datos[i - 3] = this.paleta[j];
        datos[i - 2] = this.paleta[j + 1];
        datos[i - 1] = this.paleta[j + 2];
      }
      ctx.putImageData(imagen, 0, 0);
    }

    onRemove() {
      this.canvas?.remove();
      this.canvas = null;
    }
  }
  return new Capa() as unknown as CapaCalor;
}
