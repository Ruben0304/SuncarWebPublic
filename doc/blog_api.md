# API de Blog - Endpoints GET

Versión resumida de la documentación del blog. Solo incluye los endpoints `GET` necesarios para listar artículos y obtener un blog específico.

## Tabla de Contenidos

1. [Endpoints Públicos (Sin Autenticación)](#endpoints-públicos-sin-autenticación)
   - [Listar Blogs Publicados](#listar-blogs-publicados)
   - [Obtener Blog por Slug](#obtener-blog-por-slug)
2. [Endpoints Administrativos (Con Autenticación)](#endpoints-administrativos-con-autenticación)
   - [Listar Todos los Blogs](#listar-todos-los-blogs)
   - [Obtener Blog por ID](#obtener-blog-por-id)
3. [Modelos de Datos](#modelos-de-datos)
4. [Códigos de Estado HTTP](#códigos-de-estado-http)

---

## Endpoints Públicos (Sin Autenticación)

Endpoints pensados para consumo desde el sitio web o aplicación móvil. Solo exponen artículos con estado `publicado`.

### Listar Blogs Publicados

Obtiene todos los blogs publicados ordenados por fecha de publicación (más reciente primero). Cada elemento sigue el modelo [`BlogPublicoListadoItem`](#blogpublicolistadoitem).

#### Endpoint

```
GET /api/blog/
```

#### Headers

No requiere autenticación.

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Blogs publicados obtenidos",
  "data": [
    {
      "id": "67a1234567890abcdef12345",
      "titulo": "Guía Completa de Instalación de Paneles Solares 2024",
      "slug": "guia-instalacion-paneles-solares-2024",
      "resumen": "Aprende todo sobre la instalación de paneles solares: requisitos, pasos, costos y beneficios para tu hogar o empresa.",
      "imagen_principal": "https://minio.suncar.com/blog/guia-instalacion-paneles-solares-2024-principal.jpg",
      "categoria": "instalacion",
      "tags": ["paneles solares", "instalacion", "energia renovable", "ahorro"],
      "autor": "Equipo SunCar",
      "fecha_publicacion": "2024-01-15T10:00:00Z",
      "visitas": 1234
    }
  ]
}
```

---

### Obtener Blog por Slug

Devuelve el detalle completo de un blog publicado identificado por su `slug`. Incrementa automáticamente el contador de visitas. La respuesta usa el modelo [`BlogPublicoDetalle`](#blogpublicodetalle).

#### Endpoint

```
GET /api/blog/{slug}
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `slug` | string | Slug único del blog |

#### Headers

No requiere autenticación.

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Blog encontrado",
  "data": {
    "id": "67a1234567890abcdef12345",
    "titulo": "Guía Completa de Instalación de Paneles Solares 2024",
    "slug": "guia-instalacion-paneles-solares-2024",
    "resumen": "Aprende todo sobre la instalación de paneles solares: requisitos, pasos, costos y beneficios para tu hogar o empresa.",
    "contenido": "<h1>Guía Completa de Instalación de Paneles Solares</h1><p>Los paneles solares son una excelente inversión...</p>",
    "imagen_principal": "https://minio.suncar.com/blog/guia-instalacion-paneles-solares-2024-principal.jpg",
    "imagenes_adicionales": [
      "https://minio.suncar.com/blog/guia-instalacion-paneles-solares-2024-adicional-0.jpg",
      "https://minio.suncar.com/blog/guia-instalacion-paneles-solares-2024-adicional-1.jpg"
    ],
    "categoria": "instalacion",
    "tags": ["paneles solares", "instalacion", "energia renovable", "ahorro"],
    "autor": "Equipo SunCar",
    "estado": "publicado",
    "fecha_creacion": "2024-01-10T08:00:00Z",
    "fecha_publicacion": "2024-01-15T10:00:00Z",
    "fecha_actualizacion": "2024-01-15T10:00:00Z",
    "seo_meta_descripcion": "Guía completa 2024 sobre instalación de paneles solares: requisitos, pasos, costos y beneficios. Ahorra en tu factura de luz.",
    "visitas": 1235
  }
}
```

#### Errores Comunes

**Blog no encontrado o no publicado**

**Status Code:** `200 OK`

```json
{
  "success": false,
  "message": "Blog no disponible",
  "data": null
}
```

---

## Endpoints Administrativos (Con Autenticación)

Requieren autenticación mediante `Bearer Token`. Incluyen blogs en cualquier estado y no alteran contadores de visitas.

### Listar Todos los Blogs

Obtiene todos los blogs del sistema. La colección sigue el modelo [`BlogAdminListadoItem`](#blogadminlistadoitem).

#### Endpoint

```
GET /api/blog/admin/all
```

#### Headers

```
Authorization: Bearer <token>
```

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Todos los blogs obtenidos",
  "data": [
    {
      "id": "67a1234567890abcdef12345",
      "titulo": "Guía Completa de Instalación de Paneles Solares 2024",
      "slug": "guia-instalacion-paneles-solares-2024",
      "estado": "publicado",
      "categoria": "instalacion",
      "fecha_creacion": "2024-01-10T08:00:00Z",
      "visitas": 1234
    },
    {
      "id": "67a1234567890abcdef12346",
      "titulo": "Borrador: Nuevas Tecnologías en Energía Solar",
      "slug": "nuevas-tecnologias-energia-solar",
      "estado": "borrador",
      "categoria": "novedades",
      "fecha_creacion": "2024-01-12T14:00:00Z",
      "visitas": 0
    }
  ]
}
```

---

### Obtener Blog por ID

Entrega el detalle completo de un blog sin incrementar visitas. La respuesta utiliza el modelo [`BlogAdminDetalle`](#blogadmindetalle).

#### Endpoint

```
GET /api/blog/admin/{blog_id}
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `blog_id` | string | ID del blog |

#### Headers

```
Authorization: Bearer <token>
```

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Blog encontrado",
  "data": {
    "id": "67a1234567890abcdef12345",
    "titulo": "Guía Completa de Instalación de Paneles Solares 2024",
    "slug": "guia-instalacion-paneles-solares-2024",
    "resumen": "Aprende todo sobre la instalación de paneles solares...",
    "contenido": "<h1>Guía Completa...</h1>",
    "imagen_principal": "https://minio.suncar.com/blog/...",
    "imagenes_adicionales": [],
    "categoria": "instalacion",
    "tags": ["paneles solares", "instalacion"],
    "autor": "Equipo SunCar",
    "estado": "publicado",
    "fecha_creacion": "2024-01-10T08:00:00Z",
    "fecha_publicacion": "2024-01-15T10:00:00Z",
    "fecha_actualizacion": "2024-01-15T10:00:00Z",
    "seo_meta_descripcion": "Guía completa 2024...",
    "visitas": 1234
  }
}
```

---

## Modelos de Datos

### BlogPublicoListadoItem

```typescript
interface BlogPublicoListadoItem {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imagen_principal: string | null;
  categoria: Categoria;
  tags: string[];
  autor: string;
  fecha_publicacion: string | null;
  visitas: number;
}
```

### BlogPublicoDetalle

```typescript
interface BlogPublicoDetalle extends BlogPublicoListadoItem {
  contenido: string;
  imagenes_adicionales: string[];
  estado: Estado;
  fecha_creacion: string;
  fecha_actualizacion: string;
  seo_meta_descripcion: string | null;
}
```

### BlogAdminListadoItem

```typescript
interface BlogAdminListadoItem {
  id: string;
  titulo: string;
  slug: string;
  estado: Estado;
  categoria: Categoria;
  fecha_creacion: string;
  visitas: number;
}
```

### BlogAdminDetalle

```typescript
interface BlogAdminDetalle extends BlogPublicoDetalle {
  imagenes_adicionales: string[];
}
```

### Categorias y Estados

```typescript
type Categoria =
  | "instalacion"
  | "mantenimiento"
  | "casos_exito"
  | "ahorro_energetico"
  | "novedades"
  | "normativas";

type Estado = "borrador" | "publicado" | "archivado";
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 401 | No autenticado |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

Para más información o soporte, contactar al equipo de desarrollo de SunCar Backend.
