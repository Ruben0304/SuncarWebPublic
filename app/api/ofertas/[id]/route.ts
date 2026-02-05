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

    // Obtener garantías (términos y condiciones)
    const garantias = await fetchTerminosCondiciones(backendUrl);

    // Mapear items/materiales a elementos
    // El endpoint por ID puede devolver "materiales" en lugar de "items"
    const materialesArray = oferta.materiales || oferta.items || [];

    console.log('=== ITEMS/MATERIALES DE LA OFERTA ===');
    console.log('Tiene materiales:', !!oferta.materiales);
    console.log('Tiene items:', !!oferta.items);
    console.log('Total elementos:', materialesArray.length);

    const elementos = materialesArray.map((item, index) => {
      console.log(`Elemento ${index + 1}:`, {
        descripcion: item.descripcion,
        categoria: item.categoria,
        foto: item.foto,
        tiene_foto: !!item.foto
      });

      return {
        categoria: item.categoria || null,
        foto: item.foto || null,
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
