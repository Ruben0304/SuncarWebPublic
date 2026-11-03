/// <reference types="svelte" />
// Estado de la calculadora solar. Se crea una instancia por isla (no un
// singleton de módulo) para que el render en servidor no comparta estado
// entre peticiones. Los Map se reemplazan enteros en cada cambio, igual que
// hacía el original con useState.
import { calculoEnergeticoService } from "@/services/api/calculoEnergeticoService";
import type { CalculoEnergeticoCategoria } from "@/services/api/calculoEnergeticoService";
import {
  dimensionarSistema,
  inferirTipoCarga,
  horasUsoPorDefecto,
  factorArranquePorDefecto,
  CONSTANTES,
  type EquipoCalculo,
  type ParametrosDimensionamiento,
  type PerfilUso,
  type TecnologiaBateria,
  type TipoCarga,
} from "@/lib/solar/dimensionamiento";
import { toast } from "~/lib/toast.svelte";

export type Modo = "asistido" | "experto";

export type EquipoWithMeta = {
  key: string;
  categoriaId: string;
  categoriaNombre: string;
  nombre: string;
  potencia_kw: number;
  energia_kwh: number;
  horas_uso_dia: number;
  tipo_carga: TipoCarga;
  factor_arranque: number;
  isLocal?: boolean;
};

export interface CreateEquipoForm {
  nombre: string;
  potencia_kw: string;
  energia_kwh: string;
  horas_uso_dia: string;
  tipo_carga: TipoCarga;
  categoria: string;
  categoriaPersonalizada: string;
}

export const categoriaIconos: Record<string, string> = {
  "Electrodomésticos de Cocina": "🏠",
  "Equipos de Sala y Entretenimiento": "🛋️",
  "Climatización y Ventilación": "❄️",
  "Iluminación": "💡",
  "Dormitorio y Uso General": "🛏️",
  "Lavandería y Limpieza": "🧺",
  "Agua y Servicios": "💧",
  "Otros Equipos y Herramientas": "🔧",
};

const getEquipoKey = (categoriaId: string, equipoNombre: string) => `${categoriaId}::${equipoNombre}`;

const createEmptyCreateForm = (): CreateEquipoForm => ({
  nombre: "",
  potencia_kw: "",
  energia_kwh: "",
  horas_uso_dia: "4",
  tipo_carga: "resistiva",
  categoria: "",
  categoriaPersonalizada: "",
});

export const fmt = (n: number, dec = 1) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });

function sinClave<T>(origen: Map<string, T>, key: string) {
  const next = new Map(origen);
  next.delete(key);
  return next;
}

export class EstadoCalculadora {
  modo = $state<Modo>("asistido");
  perfil = $state<PerfilUso>("hogar");
  tecnologiaBateria = $state<TecnologiaBateria>("litio");
  horasAutonomia = $state(8);
  showAvanzado = $state(false);
  avanzado = $state({
    factorSimultaneidad: null as number | null,
    hsp: CONSTANTES.HSP,
    pr: CONSTANTES.PR,
    factorPotencia: CONSTANTES.FACTOR_POTENCIA,
    potenciaPanelKwp: CONSTANTES.POTENCIA_PANEL_KWP,
  });

  categorias = $state.raw<CalculoEnergeticoCategoria[]>([]);
  equiposLocales = $state.raw(new Map<string, EquipoWithMeta>());
  equiposCantidad = $state.raw(new Map<string, number>());
  horasUsoOverride = $state.raw(new Map<string, number>());
  cantidadBuscador = $state.raw(new Map<string, number>());
  openBuscador = $state(false);
  busqueda = $state("");
  isCreateDialogOpen = $state(false);
  createForm = $state<CreateEquipoForm>(createEmptyCreateForm());
  initialLoading = $state(true);
  loadingCategorias = $state(false);
  categoriasError = $state<string | null>(null);

  // Combinar equipos del backend con equipos locales, infiriendo campos faltantes
  equiposConMeta = $derived.by<EquipoWithMeta[]>(() => {
    const equiposBackend = this.categorias.flatMap((categoria) =>
      (categoria.equipos || []).map((equipo) => {
        const tipo = equipo.tipo_carga ?? inferirTipoCarga(equipo.nombre);
        return {
          key: getEquipoKey(categoria.id, equipo.nombre),
          categoriaId: categoria.id,
          categoriaNombre: categoria.nombre,
          nombre: equipo.nombre,
          potencia_kw: equipo.potencia_kw,
          energia_kwh: equipo.energia_kwh,
          horas_uso_dia: equipo.horas_uso_dia ?? horasUsoPorDefecto(categoria.nombre),
          tipo_carga: tipo,
          factor_arranque: equipo.factor_arranque ?? factorArranquePorDefecto(tipo),
          isLocal: false,
        };
      })
    );
    return [...equiposBackend, ...Array.from(this.equiposLocales.values())];
  });

  equiposIndex = $derived.by(() => {
    const map = new Map<string, EquipoWithMeta>();
    this.equiposConMeta.forEach((equipo) => map.set(equipo.key, equipo));
    return map;
  });

  categoriasPorNombre = $derived.by(() => {
    const map = new Map<string, EquipoWithMeta[]>();
    this.equiposConMeta.forEach((equipo) => {
      const categoria = equipo.categoriaNombre;
      if (!map.has(categoria)) map.set(categoria, []);
      map.get(categoria)!.push(equipo);
    });
    return map;
  });

  // Lista lista para el motor de cálculo
  equiposParaCalculo = $derived.by<EquipoCalculo[]>(() => {
    const lista: EquipoCalculo[] = [];
    this.equiposCantidad.forEach((cantidad, key) => {
      const equipo = this.equiposIndex.get(key);
      if (equipo) {
        lista.push({
          potencia_kw: equipo.potencia_kw,
          energia_kwh: equipo.energia_kwh,
          horas_uso_dia: this.getHorasUso(equipo),
          factor_arranque: equipo.factor_arranque,
          cantidad,
        });
      }
    });
    return lista;
  });

  parametros = $derived.by<ParametrosDimensionamiento>(() => {
    const base: ParametrosDimensionamiento = {
      perfil: this.perfil,
      tecnologiaBateria: this.tecnologiaBateria,
      horasAutonomia: this.horasAutonomia,
    };
    if (this.modo === "experto") {
      return {
        ...base,
        factorSimultaneidad: this.avanzado.factorSimultaneidad ?? undefined,
        hsp: this.avanzado.hsp,
        pr: this.avanzado.pr,
        factorPotencia: this.avanzado.factorPotencia,
        potenciaPanelKwp: this.avanzado.potenciaPanelKwp,
      };
    }
    return base;
  });

  resultado = $derived(dimensionarSistema(this.equiposParaCalculo, this.parametros));

  totalEquipos = $derived(this.equiposCantidad.size);
  tieneEquipos = $derived(this.equiposCantidad.size > 0);
  esExperto = $derived(this.modo === "experto");

  categoriaOptions = $derived.by(() => {
    const categoriasBackend = this.categorias.map((cat) => cat.nombre);
    const categoriasLocales = Array.from(
      new Set(Array.from(this.equiposLocales.values()).map((eq) => eq.categoriaNombre))
    ).filter((cat) => !categoriasBackend.includes(cat));
    return [...categoriasBackend, ...categoriasLocales];
  });

  noEquiposRegistrados = $derived(
    this.categorias.every((categoria) => (categoria.equipos || []).length === 0) && this.equiposLocales.size === 0
  );

  getHorasUso = (equipo: EquipoWithMeta) => this.horasUsoOverride.get(equipo.key) ?? equipo.horas_uso_dia;

  fetchCategorias = async () => {
    this.loadingCategorias = true;
    try {
      const data = await calculoEnergeticoService.getCategorias();
      this.categorias = data;
      this.categoriasError = null;
    } catch (error) {
      console.error("[Calculadora] Error al cargar categorías:", error);
      this.categorias = [];
      this.categoriasError =
        error instanceof Error ? error.message : "No se pudieron cargar los equipos. Intenta nuevamente.";
    } finally {
      this.loadingCategorias = false;
      this.initialLoading = false;
      this.podarClavesInvalidas();
    }
  };

  // Quita cantidades/horas de equipos que ya no existen (se llama al cambiar el catálogo)
  private podarClavesInvalidas() {
    const validKeys = new Set(this.equiposConMeta.map((equipo) => equipo.key));
    const podar = <T>(source: Map<string, T>) => {
      const next = new Map<string, T>();
      source.forEach((value, key) => {
        if (validKeys.has(key)) next.set(key, value);
      });
      return next.size === source.size ? source : next;
    };
    this.equiposCantidad = podar(this.equiposCantidad);
    this.cantidadBuscador = podar(this.cantidadBuscador);
    this.horasUsoOverride = podar(this.horasUsoOverride);
  }

  restablecerParametros = () => {
    this.equiposCantidad = new Map();
    this.cantidadBuscador = new Map();
    this.equiposLocales = new Map();
    this.horasUsoOverride = new Map();
  };

  agregarEquipo = (equipoKey: string, cantidad = 1) => {
    if (!this.equiposIndex.has(equipoKey)) return;
    const next = new Map(this.equiposCantidad);
    next.set(equipoKey, cantidad);
    this.equiposCantidad = next;
  };

  eliminarEquipo = (equipoKey: string) => {
    this.equiposCantidad = sinClave(this.equiposCantidad, equipoKey);
  };

  incrementarCantidad = (equipoKey: string) => {
    const next = new Map(this.equiposCantidad);
    next.set(equipoKey, (next.get(equipoKey) || 0) + 1);
    this.equiposCantidad = next;
  };

  decrementarCantidad = (equipoKey: string) => {
    const next = new Map(this.equiposCantidad);
    const actual = next.get(equipoKey) || 0;
    if (actual > 1) next.set(equipoKey, actual - 1);
    else next.delete(equipoKey);
    this.equiposCantidad = next;
  };

  actualizarHorasUso = (equipoKey: string, horas: number) => {
    const next = new Map(this.horasUsoOverride);
    next.set(equipoKey, Math.min(24, Math.max(0.5, horas)));
    this.horasUsoOverride = next;
  };

  agregarDesdeBuscador = (equipoKey: string) => {
    const cantidad = Math.max(1, this.cantidadBuscador.get(equipoKey) || 1);
    this.agregarEquipo(equipoKey, cantidad);
    this.cantidadBuscador = sinClave(this.cantidadBuscador, equipoKey);
    this.openBuscador = false;
    this.busqueda = "";
  };

  actualizarCantidadBuscador = (equipoKey: string, cantidad: number) => {
    const next = new Map(this.cantidadBuscador);
    if (cantidad > 0) next.set(equipoKey, cantidad);
    else next.delete(equipoKey);
    this.cantidadBuscador = next;
  };

  handleCreateDialogChange = (open: boolean) => {
    this.isCreateDialogOpen = open;
    if (!open) this.createForm = createEmptyCreateForm();
  };

  handleCreateEquipoLocal = () => {
    const form = this.createForm;
    const nombre = form.nombre.trim();
    const potencia = parseFloat(form.potencia_kw);
    const energia = parseFloat(form.energia_kwh);
    const horas = parseFloat(form.horas_uso_dia);
    const categoriaSeleccionada =
      form.categoria === "otro" ? form.categoriaPersonalizada.trim() : form.categoria.trim();

    if (!nombre) {
      toast("Campos incompletos", { descripcion: "Ingresa el nombre del equipo.", tipo: "error" });
      return;
    }
    if (!categoriaSeleccionada) {
      toast("Campos incompletos", { descripcion: "Selecciona o ingresa una categoría.", tipo: "error" });
      return;
    }
    if (Number.isNaN(potencia) || potencia <= 0) {
      toast("Dato inválido", { descripcion: "La potencia debe ser un número positivo en kW.", tipo: "error" });
      return;
    }
    if (Number.isNaN(energia) || energia <= 0) {
      toast("Dato inválido", { descripcion: "El consumo debe ser un número positivo en kWh.", tipo: "error" });
      return;
    }
    const horasUso = Number.isNaN(horas) || horas <= 0 ? 4 : Math.min(24, horas);

    const categoriaId = `local-${categoriaSeleccionada.toLowerCase().replace(/\s+/g, "-")}`;
    const equipoKey = getEquipoKey(categoriaId, nombre);

    if (this.equiposLocales.has(equipoKey) || this.equiposIndex.has(equipoKey)) {
      toast("Equipo duplicado", {
        descripcion: "Ya existe un equipo con ese nombre en esta categoría.",
        tipo: "error",
      });
      return;
    }

    const nuevoEquipo: EquipoWithMeta = {
      key: equipoKey,
      categoriaId,
      categoriaNombre: categoriaSeleccionada,
      nombre,
      potencia_kw: potencia,
      energia_kwh: energia,
      horas_uso_dia: horasUso,
      tipo_carga: form.tipo_carga,
      factor_arranque: factorArranquePorDefecto(form.tipo_carga),
      isLocal: true,
    };

    const next = new Map(this.equiposLocales);
    next.set(equipoKey, nuevoEquipo);
    this.equiposLocales = next;

    toast("Equipo agregado", { descripcion: "El equipo se agregó a tu calculadora (solo en esta sesión)." });
    this.handleCreateDialogChange(false);
  };

  eliminarEquipoLocal = (equipoKey: string) => {
    this.equiposLocales = sinClave(this.equiposLocales, equipoKey);
    this.equiposCantidad = sinClave(this.equiposCantidad, equipoKey);
    this.cantidadBuscador = sinClave(this.cantidadBuscador, equipoKey);
    toast("Equipo eliminado", { descripcion: "El equipo personalizado fue eliminado." });
  };
}
