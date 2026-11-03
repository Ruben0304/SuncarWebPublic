import { clientStorage } from "@/lib/clientStorage";
import { kitsConfigurables } from "@/lib/ofertas/configurador";
import {
  OFERTAS_PUBLICAS_QUERY,
  cargarPotencias,
  mapOfertasPublicas,
} from "@/lib/ofertas/ofertas-publicas";
import { recomendadorService } from "@/services/api/recomendadorService";
import type { OfertaSimplificada, RecomendadorData } from "@/types/ofertas";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export interface PropsOfertas {
  // null si el servidor no pudo traer los kits: entonces se piden desde aquí.
  initialOfertas: OfertaSimplificada[] | null;
  marcaParam: string | null;
  /** "lista" abre directo el listado; si no, se abre "Comprar un kit". */
  modoParam?: string | null;
  /** Número del kit a dejar elegido en "Comprar un kit" (?kit=OF-…). */
  kitParam?: string | null;
}

const tieneDescuento = (oferta: OfertaSimplificada) =>
  Boolean(
    oferta.descuentos && typeof oferta.descuentos === "string" && oferta.descuentos.trim().length > 0,
  );

/**
 * Estado de /ofertas: los kits, la vista (configurador o listado), el
 * recomendador de IA y el filtro por marca. El menú y la portada enlazan con
 * ?marca= / ?modo= / ?kit=, que son navegaciones completas: la vista se decide
 * una vez, al cargar la página.
 */
export class EstadoOfertas {
  readonly cargaDesdeNavegador: boolean;
  /** Marca elegida desde el menú (?marca=); null muestra todas. */
  readonly marcaElegida: string | null;

  ofertas = $state.raw<OfertaSimplificada[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  // "Comprar un kit" es lo primero que se ve. Los enlaces del menú por marca
  // (?marca=…) y ?modo=lista llevan directo al listado.
  modo = $state<"lista" | "armar">("armar");
  kitElegido = $state<string | null>(null);
  isClient = $state(false);

  recommendationData = $state.raw<RecomendadorData | null>(null);
  isRecommendationLoading = $state(false);
  recommendationError = $state<string | null>(null);
  showRecommendations = $state(false);

  // "Comprar un kit" necesita al menos dos kits con inversor y batería legibles
  // para que haya algo que elegir; si no, solo existe el listado.
  puedeArmar = $derived(kitsConfigurables(this.ofertas).length >= 2);
  enArmar = $derived(this.modo === "armar" && this.puedeArmar);
  enLista = $derived(!this.enArmar);

  listas = $derived.by(() => {
    const coincideMarca = (oferta: OfertaSimplificada) =>
      !this.marcaElegida ||
      (Boolean(oferta.marca) && oferta.marca!.trim().toLowerCase() === this.marcaElegida);

    if (this.showRecommendations && this.recommendationData) {
      return {
        todas: this.recommendationData.ofertas.filter(coincideMarca),
        conDescuento: [] as OfertaSimplificada[],
        sinDescuento: [] as OfertaSimplificada[],
      };
    }

    const todas = this.ofertas.filter(coincideMarca).sort((a, b) => a.precio - b.precio);
    return {
      todas,
      conDescuento: todas.filter(tieneDescuento),
      sinDescuento: todas.filter((o) => !tieneDescuento(o)),
    };
  });

  constructor(props: PropsOfertas) {
    const { initialOfertas, marcaParam, modoParam, kitParam } = props;
    this.cargaDesdeNavegador = initialOfertas === null;
    this.marcaElegida = marcaParam;
    this.ofertas = initialOfertas ?? [];
    this.loading = initialOfertas === null;
    this.modo = modoParam === "lista" || (marcaParam && !kitParam) ? "lista" : "armar";
    this.kitElegido = kitParam ?? null;
  }

  /** Lo que solo se sabe en el navegador: si hay un cliente verificado y, si faltaron, los kits. */
  iniciarEnNavegador() {
    this.isClient = clientStorage.getClientData() !== null;
    if (this.cargaDesdeNavegador) void this.fetchOfertas();
  }

  fetchOfertas = async () => {
    try {
      this.loading = true;
      this.error = null;

      const [response, potencias] = await Promise.all([
        fetch(`${BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`),
        cargarPotencias(BACKEND_URL),
      ]);
      if (!response.ok) {
        this.error = `Error al cargar ofertas (${response.status})`;
        return;
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        this.ofertas = mapOfertasPublicas(data.data, potencias);
      } else {
        this.error = data.message || "Error al cargar ofertas";
      }
    } catch (err) {
      console.error("Error fetching ofertas:", err);
      this.error = "Error de conexión al cargar ofertas";
    } finally {
      this.loading = false;
    }
  };

  cambiarModo(nuevo: "lista" | "armar") {
    this.modo = nuevo;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /** "Comprar un kit" desde el listado, sin ningún kit ya elegido. */
  volverAArmar() {
    this.kitElegido = null;
    this.cambiarModo("armar");
  }

  // Elegir un kit del listado lo abre en "Comprar un kit" con sus opciones ya
  // elegidas. Un kit que el configurador no entiende pasa al contacto.
  elegirOferta(ofertaId?: string | null) {
    if (!ofertaId) return;

    const oferta = this.ofertas.find((o) => o.id === ofertaId);
    if (oferta?.config) {
      this.kitElegido = ofertaId;
      this.cambiarModo("armar");
      return;
    }
    window.location.href = "/contacto";
  }

  handleRecommendationSearch = async (query: string) => {
    try {
      this.isRecommendationLoading = true;
      this.recommendationError = null;

      const response = await recomendadorService.recomendarOfertas(query);

      if (response.success && response.data) {
        this.recommendationData = response.data;
        this.showRecommendations = true;
      } else {
        this.recommendationError = response.message || "Error al obtener recomendaciones";
      }
    } catch (error) {
      console.error("Error en búsqueda de recomendaciones:", error);
      this.recommendationError = "Error de conexión al obtener recomendaciones";
    } finally {
      this.isRecommendationLoading = false;
    }
  };

  clearRecommendations() {
    this.recommendationData = null;
    this.showRecommendations = false;
    this.recommendationError = null;
  }
}
