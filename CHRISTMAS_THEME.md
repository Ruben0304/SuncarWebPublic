# 🎄 Tema Navideño de Suncar

Este proyecto incluye un tema navideño especial que se activa automáticamente durante la temporada navideña.

## 📅 Período de Activación

El tema navideño se activa automáticamente del **1 al 26 de diciembre**.

## 🎨 Componentes Navideños

### 1. **Navigation Christmas** (`components/navigation-christmas.tsx`)
- Barra de navegación con fondo verde esmeralda elegante
- Luces navideñas animadas en la parte superior
- Copos de nieve flotantes
- Texto en colores festivos (amarillo dorado, blanco, rojo)
- Botón CTA con tema de regalo
- Detalles navideños: emoji de Santa en el logo, mensaje "Feliz Navidad"

### 2. **Hero Section Christmas** (`components/landing-sections/hero-section-christmas.tsx`)
- Fondo degradado verde esmeralda oscuro elegante
- Animación sutil de nieve cayendo (solo 15 copos discretos)
- Badge de "Ofertas Especiales de Navidad" minimalista
- Mensajes navideños refinados sin emojis excesivos
- Colores festivos elegantes (rojo, verde, amarillo dorado)
- Efecto de brillo sutil en el modelo 3D
- Promoción especial con descuentos
- Elementos decorativos mínimos en el fondo

### 3. **Footer Christmas** (`components/footer-christmas.tsx`)
- Fondo degradado verde esmeralda consistente con la navegación
- Luces navideñas animadas en la parte superior (rojo, amarillo, verde)
- Copos de nieve sutiles flotando de fondo
- Logo navideño con mensaje "Feliz Navidad"
- Títulos de secciones con emojis navideños (✨, 🎁, ☃️)
- Viñetas decorativas en rojo para los enlaces
- Botón de cotización con tema de regalo navideño
- Borde inferior decorativo con colores navideños
- Mensaje "¡Felices Fiestas!" con Santa animado

## 🔧 Cómo Funciona

El sistema usa una función de utilidad en `lib/christmas-utils.ts`:

```typescript
export function isChristmasSeason(): boolean {
  const now = new Date()
  const month = now.getMonth() // 0-11, where 11 is December
  const day = now.getDate() // 1-31

  // December (month 11) from day 1 to 26
  return month === 11 && day >= 1 && day <= 26
}
```

En `app/page.tsx`, esta función determina qué componentes renderizar:

```tsx
const [isChristmas, setIsChristmas] = useState(false)

useEffect(() => {
  setIsChristmas(isChristmasSeason())
}, [])

// Renderizado condicional
{isChristmas ? <NavigationChristmas /> : <Navigation />}
{isChristmas ? <HeroSectionChristmas /> : <HeroSection />}
{isChristmas ? <FooterChristmas /> : <Footer />}
```

## 🎯 Características del Diseño

### Paleta de Colores Navideña
- **Verde Esmeralda**: `from-emerald-900 via-green-800 to-emerald-900`
- **Rojo Festivo**: `#ef4444`, `from-red-600 to-red-500`
- **Amarillo/Dorado**: `#fbbf24`, `text-yellow-300`
- **Blanco Nieve**: `text-white/90`

### Animaciones
- **Snowfall**: Copos de nieve cayendo suavemente
- **Christmas Twinkle**: Luces navideñas parpadeantes
- **Bounce**: Elementos rebotando (regalos, badges)
- **Pulse**: Efectos de pulsación en decoraciones
- **Float**: Elementos flotantes (Santa, decoraciones)

### Elementos Decorativos
- 🎄 Árboles de Navidad
- ❄️ Copos de nieve
- 🎅 Santa Claus
- ⛄ Muñeco de nieve
- 🎁 Regalos
- ✨ Estrellas brillantes
- 💡 Luces navideñas (rojo, amarillo, verde)

## 🚀 Activación Manual (Para Testing)

Para probar el tema navideño fuera de la temporada, puedes modificar temporalmente la función en `lib/christmas-utils.ts`:

```typescript
export function isChristmasSeason(): boolean {
  return true // Siempre activado para testing
}
```

**¡Recuerda revertir este cambio antes de deployar a producción!**

## 📝 Notas Importantes

1. **Automático**: No requiere configuración manual, se activa/desactiva según la fecha
2. **Sin Impacto**: Los componentes originales permanecen intactos
3. **Rendimiento**: Las animaciones están optimizadas con CSS puro
4. **Responsive**: Totalmente adaptable a móviles y tablets
5. **Accesibilidad**: Mantiene la estructura semántica y navegación

## 🎨 Personalización

Para modificar las fechas de activación, edita `lib/christmas-utils.ts`:

```typescript
// Ejemplo: Activar desde el 15 de diciembre hasta el 31
return month === 11 && day >= 15 && day <= 31
```

Para cambiar colores, edita los gradientes en los componentes navideños:
- `navigation-christmas.tsx` - líneas 200-210
- `hero-section-christmas.tsx` - línea 23

## 📦 Archivos Relacionados

```
/lib/christmas-utils.ts                              # Utilidad de fecha
/components/navigation-christmas.tsx                 # Nav navideña
/components/footer-christmas.tsx                     # Footer navideño
/components/landing-sections/hero-section-christmas.tsx  # Hero navideño
/app/page.tsx                                        # Lógica condicional
/styles/globals.css                                  # Animaciones CSS
```

---

**¡Felices Fiestas! 🎄✨**
