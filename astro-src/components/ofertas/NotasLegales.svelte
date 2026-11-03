<script lang="ts">
  // Las condiciones al pie de /ofertas, con el tratamiento de las notas de Apple
  // al final de su configurador: sin cajas ni colores, texto pequeño y gris sobre
  // el fondo de la página, a un ancho de lectura, con el título de cada nota en
  // negrita y los enlaces subrayados.
  const NOTA = "mb-4 last:mb-0";
  const TITULO = "font-semibold text-[#1d1d1f]";
  const ENLACE = "text-[#1d1d1f] underline underline-offset-2 hover:no-underline";
</script>

<div class="mb-10 mt-12 px-4">
  <section
    aria-label="Condiciones de los precios"
    class="mx-auto max-w-[980px] border-t border-[#d2d2d7] pt-8 text-[14px] leading-[1.5] tracking-[-0.016em] text-[#515154]"
  >
    <div class={NOTA}>
      <p class={TITULO}>Precios en moneda extranjera</p>
      <p>
        Los precios expresados en USD son referenciales internacionales y se aplican a los pagos desde
        el exterior y a las opciones de financiamiento internacional. Para pagos en Cuba, los precios
        se cobrarán en monedas locales al tipo de cambio vigente.
      </p>
    </div>

    <p class={NOTA}>
      Los precios publicados son referenciales y pueden ajustarse ligeramente (al alza o a la baja)
      según las características finales de cada proyecto. Te avisaremos con antelación si aplica algún
      ajuste.
    </p>

    <p class={NOTA}>
      <span class={TITULO}>Importante.</span> La información aquí presentada es solo referencial. Te
      recomendamos hablar primero con nuestros profesionales para recibir asesoría personalizada y
      obtener detalles precisos sobre tu proyecto solar.
      <a href="/contacto" class={ENLACE}>Contactar ahora</a>.
    </p>

    <div class={NOTA}>
      <p class={TITULO}>Cobertura de servicio</p>
      <p>
        Brindamos servicio garantizado en La Habana y sus municipios. Para otras provincias, existe
        disponibilidad según cada caso: indícanos tu provincia para evaluar las opciones de servicio y
        coordinar la mejor solución para tu proyecto.
      </p>
    </div>

    <p class={NOTA}>
      Los presupuestos tienen una validez de 10 días naturales a partir de su emisión.
    </p>

    <div class={NOTA}>
      <p class={TITULO}>Pago a plazo desde España</p>
      <p>
        Algunas ofertas pueden optarse por pago a plazo a través de un familiar en España. Consulta la
        disponibilidad en cada oferta.
      </p>
    </div>
  </section>
</div>
