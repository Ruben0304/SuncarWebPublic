# Guía de prueba de `/feria`

Pasada completa, paso a paso, de todo lo construido. Pensada para hacerse **de una sentada, con la
tablet de la feria**, antes del deploy del miércoles 27.

Lo que sigue está verificado en local con datos simulados. Lo que **no** se pudo probar sin vos
está marcado con 🔴: son las tres cosas que solo funcionan con un usuario real.

## Antes de empezar

```bash
cd /Users/fabi/Proyectos/SunCar/SuncarWebPublic && npm run dev
```

Abrí `http://localhost:3000/feria`. Probá primero en la computadora y repetí después en la tablet,
que es donde importa.

Para arrancar de cero en cualquier momento, pegá esto en la consola del navegador (F12 → Console).
Borra sesión, leads guardados y la caché del modo sin red:

```
localStorage.removeItem('feria:sesion');
indexedDB.deleteDatabase('suncar-feria');
caches.keys().then(k => Promise.all(k.map(n => caches.delete(n))));
navigator.serviceWorker.getRegistrations().then(r => Promise.all(r.map(x => x.unregister()))).then(() => location.reload());
```

---

## 0. Requisito previo: crear la fuente

Sin esto los leads entran con una fuente que no existe y el lunes el filtro no encuentra nada.
En el admin, Gestionar Fuentes, creá una fuente con el nombre **exacto**:

```
Feria Varadero 2026
```

Con `requiere_referencia: true` y `tipo_referencia: trabajador`.

> Si le ponés otro nombre, cambialo también en `FUENTE_FERIA`, en `lib/feria/lead.ts`. Tienen que
> coincidir letra por letra.

---

## 1. Login

| # | Qué hacer | Qué tiene que pasar |
|---|---|---|
| 1.1 | Abrir `/feria` sin haber entrado nunca | Pantalla de bloqueo con CI y contraseña |
| 1.2 | Entrar con un CI que no existe (`00000000000`) y cualquier clave | Mensaje: "Carné o contraseña incorrectos. Si estás seguro, tu usuario todavía no tiene acceso de admin configurado" |
| 1.3 | 🔴 Entrar con **tu usuario real** de SunCar | Entra al stand. Arriba a la izquierda aparece tu nombre |
| 1.4 | 🔴 **Mirar el chip de la derecha** | Tiene que decir **7 días** y la fecha de vencimiento |
| 1.5 | Recargar la página (F5) | Sigue adentro, sin volver a pedir contraseña |
| 1.6 | Tocar el botón de salir (arriba a la derecha) | Vuelve a la pantalla de bloqueo |

> **1.4 es la prueba más importante de toda la guía.** Los 7 días salen de la variable
> `JWT_EXPIRATION_MINUTES` en Railway. Si esa variable no está puesta, el token dura **1 hora** y
> todo el plan offline se cae: el comercial se quedaría afuera a media mañana del viernes. Si el
> chip dice "1 día" o menos, hay que arreglar la variable antes de la feria.

Para probar el aviso de vencimiento sin esperar una semana, pegá esto en la consola:

```
s=JSON.parse(localStorage['feria:sesion']); s.expiraEn=Date.now()+40*3600e3; localStorage['feria:sesion']=JSON.stringify(s); location.reload()
```

El chip tiene que ponerse amarillo y decir "2 días". Y con `Date.now()-1000` en vez de eso, te
tiene que echar a la pantalla de bloqueo.

---

## 2. La calculadora

| # | Qué hacer | Qué tiene que pasar |
|---|---|---|
| 2.1 | Elegir **Casa** | Salta al paso 2 con la lista de equipos cargada |
| 2.2 | Mover el slider de horas | El banco de baterías cambia **en vivo** |
| 2.3 | Tocar el atajo **24 h** | Dice "Pasa el kit más grande (16,0 kWh): hay que ampliar" |
| 2.4 | Volver a 8 h y tocar "Ver el sistema" | 4,7 kWh/día · 1,3 kVA · 2,1 kWh · 3 paneles |
| 2.5 | Mirar los kits | Tres, **ordenados por precio**: $4,580 · $6,950 · $9,800 |
| 2.6 | Volver atrás y elegir **Negocio / hostal** → Ver el sistema | 67,7 kWh/día · 9,6 kVA · 29,3 kWh · 31 paneles, y el bloque **NECESITA AMPLIACIÓN** con base $13,670 + 1 batería + 15 paneles |
| 2.7 | En el paso 2, tocar "Agregar" y sumar un **Calentador de agua eléctrico** | Aparece arriba de la lista y los números suben |
| 2.8 | Bajar todas las cantidades a 0 | El botón "Ver el sistema" se apaga |

**Lo que hay que mirar con ojo de comercial en 2.6:** ese es el caso hostal, el cliente de más
valor de Varadero. Fijate si el bloque de ampliación te alcanza para explicarle al cliente qué le
falta, o si le agregarías algo.

---

## 3. Captura del lead

| # | Qué hacer | Qué tiene que pasar |
|---|---|---|
| 3.1 | Desde el resultado, tocar **Guardar lead** | Formulario de nombre y WhatsApp |
| 3.2 | Escribir el teléfono **con espacios**: `+53 5 266 17 89` | Abajo dice "Se guarda como **+5352661789**" |
| 3.3 | Escribir letras o 3 dígitos | Avisa que faltan dígitos y el botón queda apagado |
| 3.4 | Marcar **Pendiente de visita** | Aparece la advertencia amarilla de que eso crea una visita |
| 3.5 | Desmarcarlo y guardar con datos válidos | Pantalla verde **"Lead guardado"** |
| 3.6 | Tocar "Atender a otro" | Vuelve al paso 1, listo para el próximo visitante |
| 3.7 | 🔴 Con internet: mirar el contador de arriba | No aparece, o aparece y baja a 0 en menos de 30 segundos |
| 3.8 | 🔴 Buscar el lead en el admin filtrando por fuente "Feria Varadero 2026" | Está, con tu nombre en comercial y el cálculo completo en el comentario |

**En 3.8, leé el comentario completo.** Es lo único que va a tener quien llame el lunes. Si te
falta un dato ahí, decímelo y lo agrego: está en `construirComentario`, en `lib/feria/lead.ts`.

---

## 4. Modo avión (lo que más importa)

**El ritual del stand:** abrir `/feria` una vez con wifi y esperar a que el chip de la cabecera se
ponga **verde con "sin red ✓"**. Ahí la tablet ya está lista y se puede bajar a la playa.

Ahora poné la tablet **en modo avión** o cortá el wifi de verdad. No uses el simulador del
navegador: lo que hay que probar es la tablet real.

| # | Qué hacer | Qué tiene que pasar |
|---|---|---|
| 4.1 | Con wifi, abrir `/feria` y mirar el chip de la cabecera | Verde, **"sin red ✓"** |
| 4.2 | Modo avión y **recargar la página** | Abre igual, con los tres perfiles y los equipos |
| 4.3 | Hacer un cálculo completo sin red | Los kits y los precios están: salieron de la caché |
| 4.4 | Capturar un lead | Guarda igual, con la pantalla verde |
| 4.5 | Mirar la cabecera | Chip amarillo: **"1 sin enviar"** |
| 4.6 | Capturar dos leads más | El chip dice 3 |
| 4.7 | Tocar el chip | Lista con los tres, nombre, teléfono y hora |
| 4.8 | Tocar "Enviar ahora" sin red | Los leads siguen ahí, con el motivo abajo |
| 4.9 | **Cerrar la pestaña del todo** y volver a abrir `/feria`, siempre en modo avión | Abre, la sesión sigue y los tres leads **siguen ahí** |
| 4.10 | Volver a poner wifi y esperar | El contador baja solo a 0 en menos de 30 segundos, sin tocar nada |
| 4.11 | 🔴 Verificar en el admin | Los tres leads están, con la **fecha y hora en que se capturaron**, no la del envío |

**El 4.9 es la prueba de fuego.** Es lo que separa "funciona mientras no toques nada" de "funciona
en la playa". Repetilo 4 o 5 veces: cerrá, abrí, capturá, cerrá.

> **Lo único que no funciona sin red** es la primera visita: una tablet que nunca abrió `/feria`
> necesita internet una vez. Por eso el ritual de las 8:30 no es opcional.

> Si estás probando con `npm run dev`, el chip verde tarda un poco más en aparecer y puede hacer
> falta recargar una vez: en desarrollo los archivos cambian en cada recompilación y el worker
> está hecho para no servirlos viejos.

---

## 5. QR de WhatsApp

Para esto hacen falta **dos teléfonos**: la tablet y el tuyo, haciendo de visitante.

| # | Qué hacer | Qué tiene que pasar |
|---|---|---|
| 5.1 | En el resultado, tocar el botón del QR (abajo a la derecha) | Pantalla blanca con el QR grande |
| 5.2 | 🔴 Escanearlo con **otro teléfono**, con la cámara normal | Se abre WhatsApp con el chat de SunCar y el mensaje ya escrito |
| 5.3 | Leer el mensaje antes de enviarlo | Consumo, sistema, kit con precio y quién atendió |
| 5.4 | 🔴 Enviarlo | Llega al WhatsApp de la empresa y aparece en **Chatwoot** con tu número real |
| 5.5 | Guardar un lead y, en la pantalla verde, tocar "Pasarle el resumen" | El mismo QR, como acción principal |
| 5.6 | Repetir 5.1 con el perfil **Negocio / hostal** | El mensaje dice "Base ... Ampliar con 1 batería y 15 paneles" |
| 5.7 | En modo avión, abrir el QR | Se arma igual: el número está en la caché |

**El 5.2 hay que hacerlo al sol, con la tablet que se va a usar.** Es la prueba de si el código se
deja escanear en la playa: si cuesta, subí el brillo de la tablet al máximo y probá de nuevo. Si
aun así cuesta, decímelo y acorto más el mensaje —cada línea que saco agranda los cuadraditos.

> Ojo con una confusión fácil: **el QR no manda nada desde la tablet**. Lo escanea el visitante con
> su teléfono y es él quien aprieta enviar. Por eso el mensaje llega con el número real del cliente
> y por eso funciona aunque la tablet no tenga señal: si el visitante tampoco tiene, su propio
> WhatsApp encola el mensaje y lo suelta al salir de la playa.

---

## 6. Qué hacer si algo falla

| Síntoma | Qué mirar |
|---|---|
| El chip dice "1 día" al entrar | `JWT_EXPIRATION_MINUTES` en Railway, servicio Fastapi. Tiene que ser 10080 |
| Aparece "Volvé a entrar" en la cabecera | El backend rechazó el token. Los leads **no se perdieron**: tocá el botón, volvé a entrar y andá al panel de la cola → "Enviar ahora" |
| Un lead queda trabado con un mensaje | Es el motivo que da el backend. Si es del teléfono, hay que corregirlo a mano en el admin cuando llegue |
| El contador no baja con wifi | Abrí el panel y tocá "Enviar ahora": ahí se ve el error real |
| El chip de la cabecera queda oscuro, "sin guardar" | El worker no se registró. Mirá la consola: casi siempre es la cabecera `Service-Worker-Allowed`. Comprobala con `curl -I https://www.suncarsrl.com/sw-feria.js` |
| Se publicó una versión nueva y la tablet muestra la vieja | Hay que subir `VERSION` en `public/sw-feria.js` en cada deploy que toque `/feria` |

---

## Resumen de lo que queda sin probar hasta que hagas esta pasada

1. **Login con usuario real** y, sobre todo, que el token dure 7 días (paso 1.4).
2. **Alta de leads contra el backend real**, incluida la creación automática de la visita cuando se
   marca "Pendiente de visita" (pasos 3.8 y 4.11).
3. **La fuente "Feria Varadero 2026"**, que todavía no existe (paso 0).
4. **Escanear el QR con un teléfono de verdad, al sol** (paso 5.2) y que el mensaje aterrice en
   Chatwoot (paso 5.4).

Todo lo demás está verificado con datos simulados: cálculo, kits, ampliación, cola offline,
contador, reintentos, expulsión por token vencido, rechazo del backend y modo sin red.

El modo sin red se probó contra el build de producción **apagando el servidor**, que es más duro
que el modo avión: el origen deja de existir y la página abre igual, con los catálogos y los leads
intactos. Lo que falta probar en la tablet real es que el chip verde aparezca ahí también —depende
de la cabecera que sirve Railway, no del código— y el paso 4.9 con la pestaña cerrada de verdad.
