import { NextResponse } from 'next/server';

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
  materiales?: OfertaConfeccionItem[];  // El endpoint por ID puede devolver "materiales"
  descuento_porcentaje?: number;
}

interface OfertaConfeccionResponse {
  success: boolean;
  message?: string;
  data?: OfertaConfeccion;  // Una sola oferta (respuesta del endpoint por ID)
}

interface TerminosCondicionesResponse {
  success: boolean;
  message?: string;
  data?: {
    texto: string;
  };
}

interface Material {
  codigo: string;
  descripcion: string;
  categoria?: string;
  foto?: string;
}

interface MaterialesResponse {
  success: boolean;
  message?: string;
  data?: Material[];
}

// Función para extraer la marca del inversor
function extractMarcaFromItems(items?: OfertaConfeccionItem[]): string | null {
  if (!items || items.length === 0) return null;

  const inversor = items.find(item =>
    item.categoria?.toUpperCase() === 'INVERSORES'
  );

  if (!inversor || !inversor.descripcion) return null;

  const descripcion = inversor.descripcion;
  const palabras = descripcion.split(' ');

  const marcaPosibles = palabras.filter((palabra, index) => {
    if (index === 0 && (palabra.toLowerCase() === 'inversor' || palabra.toLowerCase() === 'inversores')) {
      return false;
    }
    if (/^\d+/.test(palabra) || /^(kw|w|v|a|kwh)$/i.test(palabra)) {
      return false;
    }
    return /^[A-Z]/.test(palabra);
  });

  return marcaPosibles.length > 0 ? marcaPosibles.join(' ') : null;
}

// Función para obtener términos y condiciones (garantías)
async function fetchTerminosCondiciones(backendUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${backendUrl}/api/terminos-condiciones/activo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error al obtener términos y condiciones');
      return [];
    }

    const data: TerminosCondicionesResponse = await response.json();

    if (data.success && data.data?.texto) {
      // Dividir el texto en líneas y filtrar líneas vacías
      const lineas = data.data.texto
        .split('\n')
        .map(linea => linea.trim())
        .filter(linea => linea.length > 0);

      return lineas;
    }

    return [];
  } catch (error) {
    console.error('Error fetching términos y condiciones:', error);
    return [];
  }
}

// Función para obtener el catálogo de materiales (con fotos)
async function fetchMateriales(backendUrl: string): Promise<Map<string, string>> {
  try {
    const response = await fetch(`${backendUrl}/api/materiales/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error al obtener materiales');
      return new Map();
    }

    const data: MaterialesResponse = await response.json();

    // Crear un mapa: material_codigo → foto (con URL completa)
    const fotosMap = new Map<string, string>();

    if (data.success && data.data) {
      data.data.forEach(material => {
        if (material.foto && material.codigo) {
          // Si la foto es una URL relativa, construir URL completa
          let fotoUrl = material.foto;
          if (fotoUrl && !fotoUrl.startsWith('http://') && !fotoUrl.startsWith('https://')) {
            // Es una URL relativa, agregar el backend URL
            fotoUrl = `${backendUrl}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
          }
          fotosMap.set(material.codigo.toString(), fotoUrl);
          console.log(`Material ${material.codigo}: foto original="${material.foto}", foto procesada="${fotoUrl}"`);
        }
      });
    }

    console.log(`Mapa de fotos creado: ${fotosMap.size} materiales con foto`);
    return fotosMap;
  } catch (error) {
    console.error('Error fetching materiales:', error);
    return new Map();
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // En Next.js 15, params es una Promise y debe ser awaited
    const resolvedParams = await params;
    const ofertaId = resolvedParams.id;

    // Usar el endpoint directo por ID del backend
    const targetUrl = `${backendUrl}/api/ofertas/confeccion/${ofertaId}`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Obteniendo oferta con ID: ${ofertaId}`);
    console.log(`=== END DEBUG ===`);

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);

      return NextResponse.json({
        success: false,
        message: backendResponse.status === 404 ? 'Oferta no encontrada' : 'Error al obtener oferta'
      }, { status: backendResponse.status });
    }

    const backendData: OfertaConfeccionResponse = await backendResponse.json();

    if (!backendData.success || !backendData.data) {
      return NextResponse.json({
        success: false,
        message: backendData.message || 'Oferta no encontrada'
      }, { status: 404 });
    }

    // La respuesta del endpoint por ID devuelve directamente la oferta
    const oferta = backendData.data;

    // Obtener garantías (términos y condiciones) y catálogo de materiales en paralelo
    const [garantias, fotosMap] = await Promise.all([
      fetchTerminosCondiciones(backendUrl),
      fetchMateriales(backendUrl)
    ]);

    // Mapear items/materiales a elementos
    // El endpoint por ID puede devolver "materiales" en lugar de "items"
    const materialesArray = oferta.materiales || oferta.items || [];

    console.log('=== ITEMS/MATERIALES DE LA OFERTA ===');
    console.log('Tiene materiales:', !!oferta.materiales);
    console.log('Tiene items:', !!oferta.items);
    console.log('Total elementos:', materialesArray.length);
    console.log('Tamaño del mapa de fotos:', fotosMap.size);
    console.log('Códigos en el mapa:', Array.from(fotosMap.keys()));

    const elementos = materialesArray.map((item, index) => {
      // Buscar la foto en el mapa usando el material_codigo
      // Normalizar el código a string para la búsqueda
      const codigoNormalizado = item.material_codigo ? String(item.material_codigo).trim() : null;
      const foto = codigoNormalizado ? fotosMap.get(codigoNormalizado) : null;

      // Si la foto del item es una URL relativa, construir URL completa
      let fotoItem = item.foto;
      if (fotoItem && !fotoItem.startsWith('http://') && !fotoItem.startsWith('https://')) {
        fotoItem = `${backendUrl}${fotoItem.startsWith('/') ? '' : '/'}${fotoItem}`;
      }

      const fotoFinal = foto || fotoItem || null;

      console.log(`Elemento ${index + 1}:`, {
        material_codigo: item.material_codigo,
        codigo_normalizado: codigoNormalizado,
        descripcion: item.descripcion,
        categoria: item.categoria,
        foto_original_item: item.foto,
        foto_item_procesada: fotoItem,
        foto_desde_catalogo: foto,
        foto_final: fotoFinal,
        encontrado_en_mapa: !!foto
      });

      return {
        categoria: item.categoria || null,
        foto: fotoFinal,
        descripcion: item.descripcion || null,
        cantidad: item.cantidad || null
      };
    });

    console.log('=== FIN ITEMS/MATERIALES ===');

    // Mapear oferta al formato esperado por el frontend
    const ofertaDetallada = {
      id: oferta._id,
      descripcion: oferta.nombre_completo || oferta.nombre_oferta || 'Oferta sin nombre',
      descripcion_detallada: oferta.nombre_completo || null,
      marca: extractMarcaFromItems(materialesArray),
      precio: oferta.precio_final,
      precio_cliente: null,
      imagen: oferta.foto_portada || null,
      moneda: oferta.moneda_pago,
      financiamiento: true,
      descuentos: null,
      pdf: null,
      garantias: garantias,
      elementos: elementos,
      is_active: oferta.tipo_oferta === 'generica' && oferta.estado === 'aprobada_para_enviar'
    };

    return NextResponse.json({
      success: true,
      message: 'Oferta obtenida exitosamente',
      data: ofertaDetallada
    });

  } catch (error) {
    console.error('Error en obtener oferta por ID:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
