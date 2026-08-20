# Plan: `/feria` — stand de SunCar en Varadero (28–30 agosto 2026)

Estado de este documento: **20 de agosto de 2026**. Deploy límite **miércoles 27**.

SunCar patrocina una feria de cierre de verano en la playa de un hotel en Varadero, del
**28 al 30 de agosto de 2026**. Habrá un stand con un comercial y el equipo de marketing.
`/feria` es la herramienta que usa el comercial en una tablet, en la playa, para dimensionar
sistemas delante del cliente y capturar el lead.

---

## Restricciones de diseño (no negociables)

1. **Todo tiene que funcionar sin internet.** El wifi del hotel no es confiable y los datos
   móviles en la playa menos. Lo que se rompa en modo avión no va.
2. **Nada de canales nuevos que nadie mira.** `/cotizacion` se retiró (commit del 23/07/2026)
   porque mandaba todo a Gmail y la empresa no lo revisa: el WhatsApp ya está saturado. Todo
   lo que capture el stand tiene que aterrizar en **Chatwoot/WhatsApp** o en el **admin**.
3. **Sol directo, dedos gordos, 90 segundos por persona.** Números grandes, alto contraste,
   botones de 64px, tres pasos como máximo.

---

## Decisiones ya tomadas (confirmadas por Fabián)

| Tema | Decisión |
|---|---|
| Dónde vive | Ruta `/feria` en **SuncarWebPublic**, servicio "Web publica" de Railway. Sin infra nueva. |
| Autenticación | **Mini-login con el usuario real de cada comercial** (no un usuario compartido). |
| Estado del lead | Estado normal de lead nuevo, con opción de cambiar a "Pendiente de visita"; al cambiar, **badge de advertencia** avisando que eso crea una visita y que conviene reservarlo para clientes de valor, no cargar 80 visitas. |
| Catálogo | **Solo `ofertas/confeccion`**, tal cual lo consume la página de kits. El catálogo viejo no se usa. |
| Kits sin paneles | Se muestran, **abajo y etiquetados** como "solo respaldo". |
| Cliente sin kit que cubra | Mostrar **el kit más grande + dónde le falta**, para que el comercial explique la ampliación y estime el valor agregado. Los kits **son ampliables**. |

---

## Hechos técnicos verificados contra producción

- **Catálogo:** `GET /api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`
  → 20 kits, público (no requiere token). **No usar `/api/ofertas/`** (catálogo antiguo; los dos
  no comparten ni un id).
- **Specs de los kits:** vienen en `nombre_automatico` con formato fijo
  `I-1x7,5kW, B-1x14,3kWh, P-6x600W`. **Ojo: coma decimal.** Parsea 20/20 sin fallos.
- **Equipos:** `GET /api/calculo-energetico/` → 8 categorías, público. Trae potencia, kWh,
  tipo de carga y factor de arranque.
- **Login:** `POST /api/auth/login-admin` con `{ci, adminPass}` — el mismo que usa el admin.
  Devuelve JWT con `ci`, `nombre` y `rol` firmados.
- **JWT dura 7 días** (`JWT_EXPIRATION_MINUTES=10080`). Si el comercial entra el 27, le llega
  hasta el 3 de septiembre sin necesitar red para renovar.
- **Alta de leads:** `POST /api/leads/` (requiere Bearer). Campos requeridos:
  `fecha_contacto`, `nombre`, `telefono`, `estado`. Relevantes: `fuente`, `fuente_referencia`,
  `comercial`, `prioridad`, `comentario` (máx 2000).
- **CORS:** `https://www.suncarsrl.com` quedó habilitado el 20/08/2026 (`ALLOWED_ORIGINS` en
  Railway, servicio Fastapi). Antes daba 400 y habría roto el login en la tablet.
- **CSP:** `next.config.mjs` ya permite `worker-src 'self' blob:` → el service worker entra
  sin tocar cabeceras.
- **El backend NO envía WhatsApp.** Evolution API está conectada a Chatwoot, no al backend.
  Por eso el mensaje lo inicia el cliente desde su teléfono (ver Pieza 5).

### Riesgo de negocio detectado

El catálogo topa en **15.36 kWh de batería y 9.6 kWp de paneles**. Un hostal de 6 aires necesita
~29.2 kWh y ~17.9 kWp; un restaurante de 3 aires con cocina, ~22.8 kWh. **Ningún kit cubre de
fábrica a un hostal o restaurante mediano** — justo el público de más valor en Varadero. Ambos
casos aterrizan en el mismo kit base de $13,670 y necesitan **duplicar la batería**.

El comercial debería ir con el precio de la **batería de 15 kWh** y del **panel de 600 W** en la
cabeza: son los dos números que va a usar todo el fin de semana.

---

## Estado de la construcción

### Hecho y verificado

**`lib/feria/kits.ts`** — parser, match y cálculo de ampliación.

- `parsearEspecificaciones()` — lee `nombre_automatico`; devuelve totales + capacidad unitaria
  de batería y panel (necesarias para calcular la ampliación).
- `aKitFeria()` — mapea una oferta cruda a kit utilizable; descarta las que no tienen inversor.
- `matchKits()` — ordena por etiqueta (`ajustado` → `holgado` → `solo-respaldo`) y después por
  holgura. **La etiqueta manda sobre la holgura**: un kit sin paneles nunca acumula exceso
  fotovoltaico y si se ordena solo por holgura encabeza el ranking de alguien que sí quería
  generar. Ese bug ya se corrigió; no reintroducirlo.
- `calcularAmpliacion()` — déficit en **unidades comprables** (baterías y paneles enteros), no
  en kWh sueltos, porque es lo que el comercial cotiza en el stand.
- `mejorBaseAmpliable()` — para el caso hostal: elige el kit que menos ampliación requiere.

Validado con casos reales:

```
CASA + 2 AIRES → 2.7 kVA · 8.2 kWh · 10 paneles
  top: I-1x5kW, B-2x5,12kWh, P-8x600W — $8,420 USD

HOSTAL 6 AIRES → 8.9 kVA · 29.2 kWh · 17.9 kWp
  base:    I-2x5kW, B-1x15kWh, P-16x600W — $13,670 USD
  ampliar: +1 batería de 15 kWh · +14 paneles de 600 W
  queda:   30.0/29.2 kWh ✓ · 18.0/17.9 kWp ✓
```

### Pendiente

**Bloque 1 — UI del stand** (`app/feria/page.tsx`) ← *empezar por acá*

Importa `dimensionarSistema` de `lib/solar/dimensionamiento.ts` **sin modificarlo**.
No tocar `app/calculadora/page.tsx` (1226 líneas, funciona en producción, no se toca a 7 días
de la feria).

- Tres perfiles precargados: Casa / Casa + aires / Negocio-hostal. Cada uno carga un set típico
  de equipos; el comercial ajusta cantidades con `+`/`−` grandes.
- Slider de horas de autonomía **a media pantalla**: mover "8 horas de apagón" y ver crecer el
  banco de baterías en vivo es el gancho que vende. No es el ahorro, es el apagón.
- Resultado: números grandes + los 2-3 kits con precio real + bloque de ampliación cuando aplique.
- Tres pasos, sin scroll infinito.

**Bloque 2 — Mini-login**
`POST /api/auth/login-admin`. Token y `nombre` en localStorage. Pantalla de bloqueo si no hay
sesión, mostrando **cuántos días le quedan al token** (para que el viernes vea que vence el martes).

**Bloque 3 — Captura del lead** (depende del 2)
Cola en IndexedDB → `POST /api/leads/` con Bearer. `fuente` y `comercial` se inyectan **desde el
token**, no se escriben a mano. **Contador visible de leads sin enviar** — el comercial tiene que
ver que nada se perdió. Reintento automático al volver la red.

Formato del comentario (es lo que hace útil al lead el lunes):

```
[FERIA VARADERO] Consumo 14.2 kWh/día · pico 7.1 kW
Sistema: inversor 5.2 kVA · baterías 12.4 kWh · 9 paneles · 8h autonomía
Kit sugerido: I-1x5kW, B-2x5,12kWh, P-8x600W — $8,420 USD
Equipos: nevera, 2 aires, bomba, TV, 6 luces
Atendió: <nombre del token> · sáb 29/08 14:30
```

**Bloque 4 — Offline** (depende de 1 y 3)
Service worker precacheando la página, `/api/calculo-energetico/` y `/api/ofertas/confeccion/`.
**Prueba en modo avión de punta a punta, 5 pasadas completas.** Sin esto la calculadora ni abre
en la playa.

**Bloque 5 — Complementos** (independiente)
- QR de WhatsApp: `https://wa.me/<numero>?text=<resumen>`. Lo escanea el visitante con **su**
  teléfono; si no hay señal WhatsApp lo encola y sale solo al recuperarla. Entra al WhatsApp de
  la empresa → aparece en Chatwoot con el número real. El número sale de `GET /api/contactos`
  (público, ya lo usa el hook `useContactos`). Requiere una librería cliente de QR (~20 KB):
  única dependencia nueva del plan.
- Tarjetas digitales: ya existen (`/api/tarjetas/{slug}/qr` y `/vcard`, con contador de vistas
  y guardados). Solo hay que crear las tarjetas de los comerciales e imprimir los QR. **Cero código.**

**Bloque 0 — Config, sin código**
- Crear la fuente: `POST /api/fuentes/` con
  `{"nombre":"Feria Varadero 2026","requiere_referencia":true,"tipo_referencia":"trabajador","activo":true,"orden":1}`
  (requiere token de admin). Sin esto no hay forma de medir el retorno del patrocinio.
- ✅ CORS de `www` — hecho el 20/08/2026.

---

## Guion del stand

**8:30, con wifi del hotel:** abrir `/feria` una vez. El service worker precachea. A partir de
ahí funciona sin red.

**Visitante (90 s):**
1. *"¿Cuánto tiempo llevás sin corriente al día?"* → mover el slider. **Este es el gancho.**
2. Perfil: Casa / Casa+aires / Negocio. Ajustar 2-3 cantidades.
3. Resultado + kits con precio real (o base + ampliación si es hostal).
4. *"¿Te paso el resumen?"* → nombre y WhatsApp. **Lead capturado.**
5. QR de WhatsApp para que se lleve el cálculo.
6. Si hay tiempo: QR de la tarjeta.

**Con prisa (15 s):** solo el QR de la tarjeta.

**Cierre del día:** volver al hotel con wifi, ver el contador de pendientes bajar a 0, confirmar
en el admin filtrando por `fuente = "Feria Varadero 2026"`.

**Lunes 31:** filtrar por fuente, ordenar por prioridad, llamar. Cada lead trae el cálculo completo.

---

## Fuera de alcance (decidido)

- Cotizador desde Fichas de Costo — muy valioso, no cabe en el plazo.
- Revivir `/cotizacion` — `/feria` es su reemplazo y va a WhatsApp, no a Gmail.
- Pantalla con producción en vivo — requiere monitoreo no verificado.
- PDF de cotización — el resumen de WhatsApp cumple la misma función.

---

## Detalles logísticos que hunden ferias

- Probar la tablet **al sol** antes de viajar.
- Power banks y funda: arena y salitre matan tablets.
- 50 formularios impresos de respaldo.
- Idea fuerte: **alimentar el stand con un sistema solar propio de SunCar**. Resuelve que en la
  arena no hay tomacorrientes y es la mejor demo posible.

---

## Contexto de repos (al 20/08/2026)

Cinco repos en `/Users/fabi/Proyectos/SunCar/`: `SunCarBackend` (FastAPI+MongoDB),
`SuncarWebPublic` (Next.js, la web), `SunCarWeb` (admin), `SuncarTrabajador` (Android),
`suncar-whatsapp-manager` (Chatwoot). Todo en un único proyecto Railway llamado `Suncar`.

**Ambos repos trabajan sobre `dev`.** Producción despliega desde `master` (backend) y `main`
(admin), y `dev` va muy por delante de ambas (105+ commits). **No mergear `dev` para publicar
algo puntual**: la vía es una rama desde la de producción con solo ese cambio.

Hay otra sesión de Claude trabajando en paralelo en estos repos. Verificar el estado de git
antes de asumir nada.
