import { NextResponse } from "next/server";

interface OfertaConfeccionItem {
  material_codigo?: string;
  descripcion?: string;
  categoria?: string;
  cantidad?: number;
  precio?: number;
  foto?: string;
}

interface OfertaConfeccion {
  _id: string;
  nombre_completo?: string;
  nombre_oferta?: string;
  precio_final: number;
  moneda_pago: string;
  foto_portada?: string;
  estado: string;
  tipo_oferta: string;
  items?: OfertaConfeccionItem[];
  materiales?: OfertaConfeccionItem[];
}

interface OfertaConfeccionResponse {
  success: boolean;
  message?: string;
  data?: OfertaConfeccion;
}

interface TerminosCondicionesResponse {
  success: boolean;
  message?: string;
  data?: {
    texto: string;
  };
}

interface BackendMaterial {
  codigo?: string | number;
  descripcion?: string;
  foto?: string | null;
}

interface BackendProductoCategoria {
  id?: string;
  categoria?: string;
  foto?: string | null;
  materiales?: BackendMaterial[];
}

interface ProductosResponse {
  success?: boolean;
  message?: string;
  data?: BackendProductoCategoria[];
}

interface TokenLoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
}

function extractMarcaFromItems(items?: OfertaConfeccionItem[]): string | null {
  if (!items || items.length === 0) return null;

  const inversor = items.find((item) => item.categoria?.toUpperCase() === "INVERSORES");
  if (!inversor || !inversor.descripcion) return null;

  const palabras = inversor.descripcion.split(" ");
  const marcaPosibles = palabras.filter((palabra, index) => {
    if (index === 0 && (palabra.toLowerCase() === "inversor" || palabra.toLowerCase() === "inversores")) {
      return false;
    }
    if (/^\d+/.test(palabra) || /^(kw|w|v|a|kwh)$/i.test(palabra)) {
      return false;
    }
    return /^[A-Z]/.test(palabra);
  });

  return marcaPosibles.length > 0 ? marcaPosibles.join(" ") : null;
}

function normalizeCode(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeImageUrl(url: string | null | undefined, backendUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getTokenCandidates(): string[] {
  const raw = [
    process.env.BACKEND_AUTH_TOKEN,
    process.env.AUTH_TOKEN,
    process.env.NEXT_PUBLIC_BACKEND_AUTH_TOKEN,
    "suncar-token-2025",
  ].filter((value): value is string => Boolean(value && value.trim()));

  return [...new Set(raw)];
}

function getCredentialCandidates(): Array<{ usuario: string; contrasena: string }> {
  const pairs = [
    [process.env.BACKEND_AUTH_USER, process.env.BACKEND_AUTH_PASSWORD],
    [process.env.BACKEND_ADMIN_USER, process.env.BACKEND_ADMIN_PASSWORD],
    [process.env.AUTH_USER, process.env.AUTH_PASSWORD],
    [process.env.API_AUTH_USER, process.env.API_AUTH_PASSWORD],
    [process.env.BACKEND_USUARIO, process.env.BACKEND_CONTRASENA],
  ];

  return pairs
    .filter(([usuario, contrasena]) => Boolean(usuario && contrasena))
    .map(([usuario, contrasena]) => ({
      usuario: String(usuario),
      contrasena: String(contrasena),
    }));
}

function mapFotosFromProductos(data: ProductosResponse, backendUrl: string): Map<string, string> {
  const fotosMap = new Map<string, string>();
  const categorias = Array.isArray(data.data) ? data.data : [];

  categorias.forEach((categoria) => {
    const fotoCategoria = normalizeImageUrl(categoria.foto ?? null, backendUrl);
    const materiales = Array.isArray(categoria.materiales) ? categoria.materiales : [];

    materiales.forEach((material) => {
      const codigo = normalizeCode(material.codigo);
      if (!codigo) return;

      const fotoMaterial = normalizeImageUrl(material.foto ?? null, backendUrl);
      const fotoFinal = fotoMaterial || fotoCategoria;
      if (!fotoFinal) return;

      if (!fotosMap.has(codigo)) {
        fotosMap.set(codigo, fotoFinal);
      }
    });
  });

  return fotosMap;
}

async function fetchProductosWithToken(backendUrl: string, token?: string): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${backendUrl}/api/productos/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
}

async function tryLoginToken(backendUrl: string): Promise<string | null> {
  const credentials = getCredentialCandidates();
  if (credentials.length === 0) return null;

  for (const credential of credentials) {
    try {
      const response = await fetch(`${backendUrl}/api/auth/login-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credential),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data: TokenLoginResponse = await response.json();
      if (data.success && data.token) {
        return data.token;
      }
    } catch (error) {
      console.error("Error al intentar login-token:", error);
    }
  }

  return null;
}

async function fetchMateriales(backendUrl: string): Promise<Map<string, string>> {
  const tokenCandidates = getTokenCandidates();

  for (const token of tokenCandidates) {
    try {
      const response = await fetchProductosWithToken(backendUrl, token);
      if (response.status === 401) {
        continue;
      }
      if (!response.ok) {
        console.error(`Error en /api/productos/ con token candidato (${response.status})`);
        continue;
      }

      const data: ProductosResponse = await response.json();
      const fotosMap = mapFotosFromProductos(data, backendUrl);
      if (fotosMap.size > 0) {
        console.log(`Mapa de fotos creado desde /api/productos/: ${fotosMap.size}`);
        return fotosMap;
      }
    } catch (error) {
      console.error("Error consultando /api/productos/ con token candidato:", error);
    }
  }

  const tokenFromLogin = await tryLoginToken(backendUrl);
  if (tokenFromLogin) {
    try {
      const response = await fetchProductosWithToken(backendUrl, tokenFromLogin);
      if (response.ok) {
        const data: ProductosResponse = await response.json();
        const fotosMap = mapFotosFromProductos(data, backendUrl);
        if (fotosMap.size > 0) {
          console.log(`Mapa de fotos creado desde /api/productos/ con login-token: ${fotosMap.size}`);
          return fotosMap;
        }
      }
    } catch (error) {
      console.error("Error consultando /api/productos/ con login-token:", error);
    }
  }

  console.error(
    "No se pudieron obtener materiales con foto. /api/productos/ requiere token valido. " +
      "Configura BACKEND_AUTH_TOKEN o BACKEND_AUTH_USER/BACKEND_AUTH_PASSWORD en .env."
  );
  return new Map();
}

async function fetchTerminosCondiciones(backendUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${backendUrl}/api/terminos-condiciones/activo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error al obtener terminos y condiciones");
      return [];
    }

    const data: TerminosCondicionesResponse = await response.json();
    if (!data.success || !data.data?.texto) return [];

    return data.data.texto
      .split("\n")
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 0);
  } catch (error) {
    console.error("Error fetching terminos y condiciones:", error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Error de configuracion del servidor",
        },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const ofertaId = resolvedParams.id;
    const targetUrl = `${backendUrl}/api/ofertas/confeccion/${ofertaId}`;

    console.log("=== DEBUG BACKEND CALL ===");
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Obteniendo oferta con ID: ${ofertaId}`);
    console.log("=== END DEBUG ===");

    const backendResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          message: backendResponse.status === 404 ? "Oferta no encontrada" : "Error al obtener oferta",
        },
        { status: backendResponse.status }
      );
    }

    const backendData: OfertaConfeccionResponse = await backendResponse.json();
    if (!backendData.success || !backendData.data) {
      return NextResponse.json(
        {
          success: false,
          message: backendData.message || "Oferta no encontrada",
        },
        { status: 404 }
      );
    }

    const oferta = backendData.data;
    const [garantias, fotosMap] = await Promise.all([
      fetchTerminosCondiciones(backendUrl),
      fetchMateriales(backendUrl),
    ]);

    const materialesArray = oferta.materiales || oferta.items || [];

    console.log("=== ITEMS/MATERIALES DE LA OFERTA ===");
    console.log("Tiene materiales:", !!oferta.materiales);
    console.log("Tiene items:", !!oferta.items);
    console.log("Total elementos:", materialesArray.length);
    console.log("Tamano del mapa de fotos:", fotosMap.size);
    console.log("Codigos en el mapa:", Array.from(fotosMap.keys()));

    const elementos = materialesArray.map((item, index) => {
      const codigoNormalizado = normalizeCode(item.material_codigo);
      const fotoCatalogo = codigoNormalizado ? fotosMap.get(codigoNormalizado) || null : null;
      const fotoItem = normalizeImageUrl(item.foto ?? null, backendUrl);
      const fotoFinal = fotoCatalogo || fotoItem || null;

      console.log(`Elemento ${index + 1}:`, {
        material_codigo: item.material_codigo,
        codigo_normalizado: codigoNormalizado,
        descripcion: item.descripcion,
        categoria: item.categoria,
        foto_original_item: item.foto,
        foto_item_procesada: fotoItem,
        foto_desde_catalogo: fotoCatalogo,
        foto_final: fotoFinal,
        encontrado_en_mapa: !!fotoCatalogo,
      });

      return {
        categoria: item.categoria || null,
        foto: fotoFinal,
        descripcion: item.descripcion || null,
        cantidad: item.cantidad || null,
      };
    });

    console.log("=== FIN ITEMS/MATERIALES ===");

    const ofertaDetallada = {
      id: oferta._id,
      descripcion: oferta.nombre_completo || oferta.nombre_oferta || "Oferta sin nombre",
      descripcion_detallada: oferta.nombre_completo || null,
      marca: extractMarcaFromItems(materialesArray),
      precio: oferta.precio_final,
      precio_cliente: null,
      imagen: normalizeImageUrl(oferta.foto_portada ?? null, backendUrl),
      moneda: oferta.moneda_pago,
      financiamiento: true,
      descuentos: null,
      pdf: null,
      garantias,
      elementos,
      is_active: oferta.tipo_oferta === "generica" && oferta.estado === "aprobada_para_enviar",
    };

    return NextResponse.json({
      success: true,
      message: "Oferta obtenida exitosamente",
      data: ofertaDetallada,
    });
  } catch (error) {
    console.error("Error en obtener oferta por ID:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
