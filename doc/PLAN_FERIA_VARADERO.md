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

**Bloque 1 — UI del stand** — hecho el 20/08/2026. `npm run build` pasa; `/feria` queda estática.

Archivos: `app/feria/page.tsx` (UI), `app/feria/layout.tsx` (`noindex`),
`lib/feria/perfiles.ts` (perfiles), `app/api/feria/equipos/` y `app/api/feria/kits/` (proxies).
`dimensionarSistema` se importa sin tocar; `app/calculadora/page.tsx` no se tocó.

Tres pasos, cada uno del alto exacto de la pantalla (solo scrollean las listas internas):
perfil → apagón → resultado. Verificado en tablet horizontal (1024×768) y vertical (768×1024).

Decisiones que se tomaron construyéndolo:

- **Perfil antes que slider.** El guion pone el slider primero, pero sin equipos cargados no hay
  banco de baterías que crecer. Elegir perfil es un toque; el gancho sigue intacto en el paso 2.
- **Horas de uso por equipo en el perfil.** El backend manda `horas_uso_dia: null` en todo y el
  default de "Electrodomésticos de Cocina" son 2 h: correcto para un microondas, absurdo para una
  nevera. Sin corregirlo una casa daba **3.4 kWh/día**. Neveras, minibares y routers van a 24 h
  declaradas en `lib/feria/perfiles.ts` (dato del perfil, no del motor de cálculo).
- **El perfil Negocio no lleva calentadores eléctricos.** El inversor más grande del catálogo es
  de 10 kW; con 6 aires ya se van 7.8 kW instalados. Con 2 calentadores el perfil se iba a 15.7 kVA
  y `matchKits` se quedaba **sin un solo kit que ofrecer**. Si el cliente los tiene, el comercial
  los agrega y ve en pantalla que el caso se va de catálogo.
- **Orden por precio en pantalla.** `matchKits` ordena por calce, que es lo correcto para *elegir*
  los 3 kits. Pero mostrados así aparecía uno de $9,800 encima de uno de $6,950. Se eligen por
  calce y se muestran por precio. `lib/feria/kits.ts` no se tocó.
- **Botón "Agregar equipo"** contra el catálogo completo: un perfil fijo no cubre al cliente que
  llega con una bomba o un horno. Lo agregado va al principio de la lista para que se vea.
- **Proxies propios** (`/api/feria/*`) en vez de pegarle al backend o reusar
  `/api/calculo-energetico`: recortan el catálogo de kits de **352 KB a 6.8 KB** (el crudo arrastra
  el desglose de materiales) y no dependen de `NEXT_PUBLIC_BACKEND_URL`. Los dos endpoints juntos
  pesan **14 KB**: eso es lo que hay que precachear en el Bloque 4.
- El FAB del asistente de WhatsApp se oculta en `/feria` (`components/ClientWrapper.tsx`), igual
  que ya se hacía en `/tarjeta`.

Números que da la pantalla hoy, con el catálogo real y 8 h de autonomía:

```
CASA           4.7 kWh/día · 1.3 kVA · 2.1 kWh · 3 paneles
  kits: $4,580 · $6,950 · $9,800

CASA + AIRES  26.4 kWh/día · 4.2 kVA · 11.4 kWh · 12 paneles
  kits: $12,700 · $13,670 · $14,330

NEGOCIO       67.7 kWh/día · 9.6 kVA · 29.3 kWh · 31 paneles
  sin kit de fábrica → base I-2x5kW, B-1x15kWh, P-16x600W — $13,670
  ampliar: +1 batería de 15 kWh · +15 paneles de 600 W
  queda:   30.0/29.3 kWh ✓ · 18.6/18.1 kWp ✓
```

El caso Negocio reproduce el hostal de 6 aires documentado más arriba (8.9 kVA · 29.2 kWh ·
17.9 kWp), que se había validado por separado contra `lib/feria/kits.ts`.

**Bloque 2 — Mini-login** — hecho el 20/08/2026. `npm run build` pasa.

Archivos: `lib/feria/sesion.ts` (token y vencimiento), `app/api/feria/login/route.ts` (proxy),
pantalla de bloqueo y cabecera en `app/feria/page.tsx`.

Contrastado contra el backend (`presentation/routers/auth_router.py` y
`application/services/auth_service.py`, idénticos en `origin/master` y `dev`, así que es lo que
sirve producción):

- Pide `{ci, adminPass}` y devuelve `{success, message, token, user}`.
- **Con credenciales malas contesta 200 con `success:false`, no 401.** Un cliente que mire el
  status HTTP daría por bueno un login fallido.
- El token trae `ci`, `nombre`, `rol`, `is_superAdmin`, `exp` e `iat`.
- Un solo mensaje para dos casos distintos: contraseña incorrecta y trabajador **sin `adminPass`
  configurado**. La pantalla nombra los dos, porque el segundo no se arregla reintentando.

Decisiones:

- **El vencimiento se lee del claim `exp`, nunca se asume.** `JWT_EXPIRATION_MINUTES` vale `"60"`
  por defecto en el código y son los 10080 de Railway los que dan los 7 días. Si esa variable se
  cayera, el token duraría **1 hora** y el plan offline se desarma. La cabecera muestra los días
  restantes justamente para que eso se vea en la tablet: **al entrar el 27 hay que confirmar que
  dice 7 días, no "1 día"**.
- Cabecera: nombre del comercial + chip "N días · vence vie, 28 ago". A 2 días o menos el chip
  se pone en Solar Radiance. Botón de salir al lado.
- Token vencido = sin sesión: se borra del almacén y vuelve la pantalla de bloqueo.
- Los inputs van con `autoComplete="off"`: la tablet es compartida y autocompletar el CI de otro
  comercial haría que el lead salga firmado por quien no atendió.
- El login va por ruta propia y no directo al backend, por lo mismo que los otros endpoints: no
  depender de `ALLOWED_ORIGINS`, que se habilitó recién el 20/08.

Verificado en local: credenciales inválidas contra el backend real (mensaje correcto), sesión
persistida entre recargas, chip de aviso a 2 días, token vencido que expulsa y limpia el almacén,
y botón de salir. El camino de éxito se probó con un token de prueba inyectado en el cliente
—nombre con acentos incluido, para confirmar que el payload se decodifica como UTF-8—; **falta
probarlo con un usuario real**, que es la prueba del 27.

### Riesgo abierto (decisión de Fabián)

El token que queda en la tablet es de **rol admin**: es el mismo `login-admin` del panel. Si la
tablet se pierde en Varadero, quien la tenga conserva ese acceso hasta que el token venza (7 días)
o hasta que se revoquen las sesiones del trabajador (`infrastucture/security/session_revocation.py`,
que usa el claim `iat`). Opciones: dejarlo así y confiar en que la tablet no se separa del equipo,
usar comerciales con un rol acotado, o tener a mano cómo revocar la sesión desde el admin.

**Bloque 3 — Captura del lead** — hecho el 20/08/2026. `npm run build` pasa.

Archivos: `lib/feria/cola.ts` (IndexedDB), `lib/feria/lead.ts` (armado del lead),
`app/api/feria/leads/route.ts` (proxy), y en `app/feria/page.tsx` el formulario, el contador y el
panel de la cola.

Regla: **guardar nunca falla**. El lead se escribe en IndexedDB antes de intentar mandarlo, así
que da igual si hay wifi. El envío es un intento aparte que se reintenta al entrar, cuando vuelve
la red (`online`), cada 30 s y a mano desde el panel.

Contrastado contra `presentation/schemas/requests/LeadCreateRequest.py`:

- **El teléfono tiene que matchear `^\+?\d{6,15}$`.** Sin espacios, guiones ni paréntesis. Un
  "+53 5 266 17 89" escrito con dedos gordos habría dado 422 y el lead se quedaba en la cola para
  siempre. El stand lo limpia solo (como hace la integración de Chatwoot) y **muestra el número
  que va a guardar** antes de aceptarlo.
- `prioridad` es un enum cerrado: Ninguna | Baja | Media | Alta | Urgente.
- El comentario topa en 2000 caracteres; se recorta.
- `fecha_contacto` va en DD/MM/YYYY, que es lo que escribe el admin y lo que parsea
  `prioridad_calculator.py`. Es la fecha de **captura**, no la de envío.

Decisiones:

- **Estado inicial: "Revisando ofertas".** El admin no ofrece ningún estado "nuevo"
  (`components/feats/leads/create-lead-dialog.tsx`); de su lista, ese es el que describe lo que
  pasó —el visitante vio kits con precio— y además es el estado más usado de la base. Si preferís
  otro, es una constante en `lib/feria/lead.ts`.
- **"Pendiente de visita" implica prioridad Alta.** Si el comercial se juega a pedir una visita es
  porque el cliente vale el viaje, y el lunes esa es la lista por la que hay que empezar. Evita
  agregarle un campo más al flujo de 90 segundos.
- `fuente_referencia` va con el **nombre legible** del trabajador, que es como lo guarda el admin
  (`fuente-selector.tsx`), no con el CI.
- **Un 401 no expulsa al comercial.** La sincronización corre en segundo plano: sacarlo de la
  pantalla en mitad de una captura le haría creer que perdió el lead. Se enciende un aviso
  "Volvé a entrar" en la cabecera y él decide cuándo. Los leads siguen en la cola.
- Un lead rechazado (422) **no se descarta**: queda en la cola con el mensaje del backend visible
  en el panel. Perder un contacto es peor que reintentar cien veces.

Formato del comentario, tal como sale hoy:

```
[FERIA VARADERO] Consumo 26.4 kWh/día · pico 12.9 kW
Sistema: inversor 4.2 kVA · baterías 11.4 kWh · 12 paneles · 8h autonomía
Kit sugerido: I-1x8kW, B-1x16kWh, P-12x600W — $12,700 USD
Equipos: Refrigerador, 2 Aire acondicionado 12000 BTU, Televisor LED 50", ...
Atendió: Ramón Peña Díaz · vie 21/08 10:41
```

Verificado en local: captura offline con confirmación, contador, panel de pendientes, salida de la
cola al volver la red, reintento manual, 401 que enciende el aviso sin expulsar, y 422 que deja el
lead en la cola con el motivo a la vista. **Falta la pasada con backend real** (guía en
`doc/PRUEBA_FERIA.md`).

**Bloque 4 — Offline** — hecho el 20/08/2026. `npm run build` pasa.

Archivos: `public/sw-feria.js` (el worker), `lib/feria/offline.ts` (registro y precarga), la
cabecera `Service-Worker-Allowed` en `next.config.mjs` y el chip de estado en la cabecera.

- **Scope acotado a `/feria`.** El worker vive en la raíz pero solo controla esa ruta: el resto de
  suncarsrl.com no pasa por él. Eso exige la cabecera `Service-Worker-Allowed: /feria`, que se
  agregó en `next.config.mjs` (verificada: `curl -I /sw-feria.js` la devuelve).
- **Precacheo dirigido.** Los chunks de Next llevan hash y cambian en cada build, así que no se
  pueden listar a mano. La página lee del Performance API lo que realmente cargó y se lo pasa al
  worker por `postMessage`. Con eso **una sola visita con wifi deja todo guardado**, que es
  exactamente el ritual de las 8:30 del guion.
- Estrategias: navegación y catálogos por **red primero** (con wifi trae precios del día, sin red
  abre igual); `/_next/static/*` por **caché primero**; los POST de login y leads no se tocan —sin
  red tienen que fallar para que la cola de IndexedDB haga su trabajo.
- **En `localhost` los chunks van por red primero**: en `next dev` la misma URL devuelve código
  distinto en cada recompilación y servirlos desde caché dejaría la pantalla congelada en una
  versión vieja. La caché queda igual como respaldo, así que el modo avión se puede probar en local.
- `cache.match` usa `ignoreVary: true`: Next manda `Vary` en el HTML y sin eso el documento
  guardado no se devolvería. Un detalle así se descubriría en la playa, sin forma de depurar.
- **Chip visible de estado** en la cabecera: verde "sin red ✓" cuando la tablet ya está guardada.
  Es lo que se mira a las 8:30 antes de bajar a la playa.
- **Al publicar una versión nueva del sitio hay que subir `VERSION` en `public/sw-feria.js`.** Es
  lo que borra la caché vieja.

Probado contra el build de producción **apagando el servidor**, que es más duro que el modo avión
—el origen deja de existir— en 5 pasadas: (1) recarga con el servidor caído: abre y se puede
calcular y capturar; (2) pestaña cerrada y abierta de nuevo: sesión, catálogos y leads intactos;
(3-4) dos leads más encolados sin red; (5) servidor de vuelta: la cola se vacía sola. 18 recursos
en caché: HTML, 13 chunks/CSS, la fuente y los dos catálogos.

**Bloque 5 — QR de WhatsApp** — hecho el 20/08/2026. `npm run build` pasa.

Archivos: `lib/feria/whatsapp.ts` (mensaje y enlace), `app/api/feria/contacto/route.ts` (número) y
la pantalla del QR en `app/feria/page.tsx`. Dependencia nueva: **`qrcode.react` 4.2.0**, la única
del plan. Renderiza SVG inline, así que no pide nada a la red ni choca con el CSP.

- El número sale de `/api/contactos` (público) por una ruta propia que además lo deja en el
  formato que exige wa.me: **solo dígitos, sin "+" ni espacios**. El backend lo devuelve como
  "+53 6 396 2417" y así no funciona.
- `/api/feria/contacto` se agregó a los esenciales del service worker (`VERSION` subida a
  `feria-v2`): sin el número no hay QR, y el QR es lo último que hace el comercial con cada
  visitante. Verificado que la caché vieja se borra al subir la versión.
- El QR aparece en dos lugares: como acción principal después de guardar el lead —paso 5 del
  guion— y como botón suelto en el resultado, para el visitante con prisa que no deja el número
  pero sí quiere llevarse el cálculo.

**El tamaño del QR era el problema real.** La primera redacción del mensaje daba un código de 77
módulos: con sol de frente y la pantalla con huellas, eso no se escanea. Se recortó el texto a lo
telegráfico y se bajó la corrección de error a nivel L —la redundancia extra sirve contra códigos
impresos rotos, no contra una pantalla— y quedó en **65 módulos** (69 en el caso hostal, que lleva
dos líneas más). El QR además se agranda a lo que dé la pantalla. Resultado: 6 px por módulo en
vez de 4,4.

Mensaje que se lleva el visitante, verificado decodificando el QR:

```
Hola SunCar, estuve en el stand de Varadero.
Consumo 67,7 kWh/día, respaldo 8 h.
Necesito 9,6 kVA, 29,3 kWh y 31 paneles.
Base I-2x5kW, B-1x15kWh, P-16x600W - $13,670 USD.
Ampliar con 1 batería y 15 paneles.
Me atendió Ramón Peña Díaz.
```

Probado con el servidor apagado: el QR se arma igual, con el número servido desde caché.

### Pendiente — todo sin código, requiere el admin

**No queda código por escribir del plan.** Lo que falta necesita acceso al admin y datos que no
tengo, y son las tres cosas que pueden hundir la feria si se olvidan.

1. **Crear la fuente** — sin esto los leads entran con una fuente inexistente y el lunes el filtro
   no encuentra nada: no hay forma de medir el retorno del patrocinio.
   `POST /api/fuentes/` con
   `{"nombre":"Feria Varadero 2026","requiere_referencia":true,"tipo_referencia":"trabajador","activo":true,"orden":1}`.
   El nombre tiene que coincidir **letra por letra** con `FUENTE_FERIA` en `lib/feria/lead.ts`.
2. **Probar el login con un usuario real** y confirmar que el chip de la cabecera dice **7 días**.
   Si dice "1 día", falta `JWT_EXPIRATION_MINUTES=10080` en Railway y el plan offline se cae.
3. **Tarjetas digitales de los comerciales** — ya existen (`/api/tarjetas/{slug}/qr` y `/vcard`,
   con contador de vistas y guardados). Hay que crear la tarjeta de cada uno e imprimir su QR.

- ✅ CORS de `www` — hecho el 20/08/2026.

La pasada de prueba completa está en `doc/PRUEBA_FERIA.md`.

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
