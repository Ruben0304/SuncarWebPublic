import { NextResponse } from 'next/server';

interface OfertaConfeccionItem {
  material_codigo?: string;
  descripcion?: string;
  categoria?: string;
  cantidad?: number;
  precio?: number;
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

// Función para construir descripción detallada con materiales
function buildDescripcionDetallada(oferta: OfertaConfeccion): string {
  const nombreCompleto = oferta.nombre_completo || oferta.nombre_oferta || '';
  
  if (!oferta.items || oferta.items.length === 0) {
    return nombreCompleto;
  }
  
  // Construir lista de materiales
  const materiales = oferta.items
    .filter(item => item.descripcion)
    .map(item => {
      const cantidad = item.cantidad ? `${item.cantidad}x ` : '';
      const categoria = item.categoria ? `[${item.categoria}] ` : '';
      return `${cantidad}${categoria}${item.descripcion}`;
    })
    .join(', ');
  
  return `${nombreCompleto}. Materiales: ${materiales}`;
}

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    const body = await request.json();
    const { texto } = body;

    if (!texto || typeof texto !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'El campo "texto" es requerido'
      }, { status: 400 });
    }

    // Obtener todas las ofertas genéricas aprobadas del nuevo endpoint
    const ofertasUrl = `${backendUrl}/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`;
    
    console.log('=== OBTENIENDO OFERTAS DE CONFECCIÓN ===');
    console.log('URL:', ofertasUrl);
    
    const ofertasResponse = await fetch(ofertasUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!ofertasResponse.ok) {
      const errorText = await ofertasResponse.text();
      console.error(`Error al obtener ofertas: ${ofertasResponse.status} - ${errorText}`);

      return NextResponse.json({
        success: false,
        message: 'Error al obtener ofertas para recomendación'
      }, { status: ofertasResponse.status });
    }

    const ofertasData: OfertaConfeccionResponse = await ofertasResponse.json();

    if (!ofertasData.success || !ofertasData.data) {
      return NextResponse.json({
        success: false,
        message: 'No se pudieron obtener las ofertas'
      }, { status: 500 });
    }

    console.log(`Ofertas obtenidas: ${ofertasData.data.length}`);
    
    // Debug: Ver la estructura de la primera oferta
    if (ofertasData.data.length > 0) {
      console.log('=== ESTRUCTURA DE PRIMERA OFERTA ===');
      console.log('Keys:', Object.keys(ofertasData.data[0]));
      console.log('_id:', ofertasData.data[0]._id);
      console.log('id:', (ofertasData.data[0] as any).id);
      console.log('Oferta completa:', JSON.stringify(ofertasData.data[0], null, 2));
      console.log('=== FIN ESTRUCTURA ===');
    }

    // Construir el payload para el recomendador con descripciones detalladas
    const ofertasParaRecomendador = ofertasData.data.map((oferta: OfertaConfeccion) => {
      // El backend puede devolver 'id' o '_id', intentar ambos
      const ofertaId = oferta._id || (oferta as any).id;
      
      if (!ofertaId) {
        console.error('Oferta sin ID:', oferta);
      }
      
      return {
        id: ofertaId,
        descripcion: oferta.nombre_completo || oferta.nombre_oferta || 'Oferta sin nombre',
        descripcion_detallada: buildDescripcionDetallada(oferta),
        precio: oferta.precio_final,
        moneda: oferta.moneda_pago,
        imagen: oferta.foto_portada || null,
        financiamiento: true,
        marca: extractMarcaFromItems(oferta.items),
        is_active: oferta.tipo_oferta === 'generica' && oferta.estado === 'aprobada_para_enviar'
      };
    });

    // Llamar al recomendador del backend
    const recomendadorUrl = `${backendUrl}/api/ofertas/recomendador`;
    
    console.log('=== LLAMANDO AL RECOMENDADOR ===');
    console.log('URL:', recomendadorUrl);
    console.log('Texto:', texto);
    console.log('Cantidad de ofertas enviadas:', ofertasParaRecomendador.length);
    console.log('Primera oferta (muestra):', JSON.stringify(ofertasParaRecomendador[0], null, 2));
    console.log('=== FIN DEBUG ===');

    const requestBody = {
      texto,
      ofertas: ofertasParaRecomendador
    };

    console.log('=== REQUEST BODY ===');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('=== FIN REQUEST BODY ===');

    const recomendadorResponse = await fetch(recomendadorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!recomendadorResponse.ok) {
      const errorText = await recomendadorResponse.text();
      console.error('=== ERROR DEL BACKEND ===');
      console.error(`Status: ${recomendadorResponse.status}`);
      console.error(`StatusText: ${recomendadorResponse.statusText}`);
      console.error(`Body: ${errorText}`);
      console.error('=== FIN ERROR ===');

      // Intentar parsear el error como JSON para más detalles
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error parseado:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('No se pudo parsear el error como JSON');
      }

      return NextResponse.json({
        success: false,
        message: `Error al obtener recomendaciones: ${errorText}`
      }, { status: recomendadorResponse.status });
    }

    const recomendadorData = await recomendadorResponse.json();

    console.log('=== RESPUESTA DEL RECOMENDADOR ===');
    console.log('Success:', recomendadorData.success);
    console.log('Texto:', recomendadorData.data?.texto);
    console.log('Tipo de ofertas:', typeof recomendadorData.data?.ofertas);
    console.log('Es array:', Array.isArray(recomendadorData.data?.ofertas));
    console.log('Cantidad:', recomendadorData.data?.ofertas?.length);
    if (recomendadorData.data?.ofertas?.length > 0) {
      console.log('Primera oferta:', recomendadorData.data.ofertas[0]);
    }
    console.log('=== FIN RESPUESTA ===');

    if (!recomendadorData.success || !recomendadorData.data) {
      return NextResponse.json({
        success: false,
        message: recomendadorData.message || 'No se pudieron obtener recomendaciones'
      }, { status: 500 });
    }

    // Verificar si ofertas existe y es un array
    if (!recomendadorData.data.ofertas || !Array.isArray(recomendadorData.data.ofertas)) {
      console.error('El recomendador no devolvió un array de ofertas:', recomendadorData.data);
      return NextResponse.json({
        success: false,
        message: 'Formato de respuesta del recomendador inválido'
      }, { status: 500 });
    }

    // El recomendador puede devolver IDs o ofertas completas
    // Verificar el formato de la primera oferta
    const primeraOferta = recomendadorData.data.ofertas[0];
    const esArrayDeIds = typeof primeraOferta === 'string';

    let ofertasRecomendadas;

    if (esArrayDeIds) {
      // El backend devolvió IDs, necesitamos mapearlos a las ofertas completas
      console.log('Mapeando IDs a ofertas completas...');
      ofertasRecomendadas = recomendadorData.data.ofertas
        .map((ofertaId: string) => {
          const oferta = ofertasData.data!.find((o: OfertaConfeccion) => o._id === ofertaId);
          
          if (!oferta) {
            console.warn(`Oferta con ID ${ofertaId} no encontrada`);
            return null;
          }

          return {
            id: oferta._id,
            descripcion: oferta.nombre_completo || oferta.nombre_oferta || 'Oferta sin nombre',
            descripcion_detallada: buildDescripcionDetallada(oferta),
            marca: extractMarcaFromItems(oferta.items),
            precio: oferta.precio_final,
            precio_cliente: null,
            imagen: oferta.foto_portada || null,
            moneda: oferta.moneda_pago,
            financiamiento: true,
            descuentos: null,
            pdf: null,
            is_active: oferta.tipo_oferta === 'generica' && oferta.estado === 'aprobada_para_enviar'
          };
        })
        .filter(Boolean); // Filtrar nulls
    } else {
      // El backend ya devolvió ofertas completas, solo necesitamos asegurar el formato
      console.log('Usando ofertas completas del backend...');
      ofertasRecomendadas = recomendadorData.data.ofertas.map((oferta: any) => ({
        id: oferta.id,
        descripcion: oferta.descripcion,
        descripcion_detallada: oferta.descripcion_detallada || oferta.descripcion,
        marca: oferta.marca || null,
        precio: oferta.precio,
        precio_cliente: oferta.precio_cliente || null,
        imagen: oferta.imagen || null,
        moneda: oferta.moneda || 'USD',
        financiamiento: oferta.financiamiento !== undefined ? oferta.financiamiento : true,
        descuentos: oferta.descuentos || null,
        pdf: oferta.pdf || null,
        is_active: oferta.is_active !== undefined ? oferta.is_active : true
      }));
    }

    console.log(`Ofertas recomendadas procesadas: ${ofertasRecomendadas.length}`);

    return NextResponse.json({
      success: true,
      message: 'Recomendaciones obtenidas exitosamente',
      data: {
        texto: recomendadorData.data.texto,
        ofertas: ofertasRecomendadas
      }
    });

  } catch (error) {
    console.error('Error en recomendador:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
