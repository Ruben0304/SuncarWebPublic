import { NextResponse } from 'next/server';

interface OfertaConfeccionItem {
  material_codigo?: string;
  descripcion?: string;
  categoria?: string;
  cantidad?: number;
  precio?: number;
}

interface OfertaConfeccion {
  _id?: string;
  numero_oferta?: string;
  nombre_completo?: string;
  nombre_oferta?: string;
  precio_final: number;
  moneda_pago: string;
  foto_portada?: string;
  estado: string;
  tipo_oferta: string;
  items?: OfertaConfeccionItem[];
  descuento_porcentaje?: number;
}

interface OfertaConfeccionResponse {
  success: boolean;
  message?: string;
  data?: OfertaConfeccion[];
}

// Función para extraer la marca del inversor
function extractMarcaFromItems(items?: OfertaConfeccionItem[]): string | null {
  if (!items || items.length === 0) return null;
  
  const inversor = items.find(item => 
    item.categoria?.toUpperCase() === 'INVERSORES'
  );
  
  if (!inversor || !inversor.descripcion) return null;
  
  // Extraer marca del nombre del material
  // Ejemplo: "Inversor 5kW Felicity Solar" -> "Felicity Solar"
  const descripcion = inversor.descripcion;
  const palabras = descripcion.split(' ');
  
  // Buscar palabras que parezcan marcas (capitalizadas, después de números/especificaciones)
  const marcaPosibles = palabras.filter((palabra, index) => {
    // Ignorar palabras comunes al inicio
    if (index === 0 && (palabra.toLowerCase() === 'inversor' || palabra.toLowerCase() === 'inversores')) {
      return false;
    }
    // Ignorar números y unidades
    if (/^\d+/.test(palabra) || /^(kw|w|v|a|kwh)$/i.test(palabra)) {
      return false;
    }
    // Tomar palabras capitalizadas
    return /^[A-Z]/.test(palabra);
  });
  
  return marcaPosibles.length > 0 ? marcaPosibles.join(' ') : null;
}

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // Llamar al nuevo endpoint de ofertas-confeccion
    const targetUrl = `${backendUrl}/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`Target URL: ${targetUrl}`);
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
        message: 'Error al obtener ofertas'
      }, { status: backendResponse.status });
    }

    const backendData: OfertaConfeccionResponse = await backendResponse.json();

    if (!backendData.success || !backendData.data) {
      return NextResponse.json({
        success: false,
        message: backendData.message || 'No se pudieron obtener las ofertas'
      }, { status: 500 });
    }

    // Mapear ofertas de confección al formato simplificado esperado por el frontend
    const ofertasSimplificadas = backendData.data.map((oferta: OfertaConfeccion) => {
      // Usar numero_oferta o _id como identificador
      const id = oferta.numero_oferta || oferta._id;

      console.log(`=== MAPEANDO OFERTA ===`);
      console.log(`_id:`, oferta._id);
      console.log(`numero_oferta:`, oferta.numero_oferta);
      console.log(`ID usado:`, id);
      console.log(`nombre:`, oferta.nombre_completo || oferta.nombre_oferta);
      console.log(`=== FIN MAPEO ===`);

      return {
        id: id,
        descripcion: oferta.nombre_completo || oferta.nombre_oferta || 'Oferta sin nombre',
        descripcion_detallada: oferta.nombre_completo || null,
        marca: extractMarcaFromItems(oferta.items),
        precio: oferta.precio_final,
        precio_cliente: null, // No disponible en ofertas de confección
        imagen: oferta.foto_portada || null,
        moneda: oferta.moneda_pago,
        financiamiento: true, // Por defecto todas tienen financiamiento
        descuentos: null, // Las ofertas actuales no tienen descuentos
        pdf: null, // No disponible
        is_active: oferta.tipo_oferta === 'generica' && oferta.estado === 'aprobada_para_enviar'
      };
    });

    console.log(`Ofertas mapeadas: ${ofertasSimplificadas.length}`);

    return NextResponse.json({
      success: true,
      message: 'Ofertas obtenidas exitosamente',
      data: ofertasSimplificadas
    });

  } catch (error) {
    console.error('Error en obtener ofertas simplificadas:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}