# 🗺️ Sistema de Mapa de Predicción de Incidencias

## 📋 Descripción del Proyecto

Este es un sistema de mapeo interactivo desarrollado en React que permite visualizar y analizar diferentes tipos de incidencias y servicios municipales en un mapa. El sistema soporta tanto mapas de Leaflet como Google Maps, proporcionando una interfaz completa para la gestión de datos geográficos y análisis predictivo.

## 🚀 Características Principales

- **Múltiples Capas de Datos**: Cámaras, incidencias, paraderos, residuos, etc.
- **Filtros Avanzados**: Por fecha, horario, jurisdicción, tipo de incidente
- **Clustering Inteligente**: Agrupación de incidencias para mejor visualización
- **Búsqueda de Direcciones**: Integración con servicios de geocodificación
- **Calculadora de Rutas**: Planificación de rutas optimizadas
- **Gestión de Marcadores**: Sistema de puntos personalizados
- **Dual Map Support**: Compatible con Leaflet y Google Maps

## 📁 Estructura del Proyecto

### 🏗️ Arquitectura Principal

```
mapa_prediccion/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 components/               # Componentes React organizados por funcionalidad
│   │   ├── 📁 capas/                # Componentes de capas del mapa
│   │   ├── 📁 Controles/            # Componentes de control de la interfaz
│   │   ├── 📁 filtros/              # Componentes de filtrado de datos
│   │   └── 📁 googlemaps/           # Componentes específicos para Google Maps
│   ├── 📁 hooks/                    # Hooks personalizados
│   ├── 📁 utils/                    # Utilidades y helpers
│   ├── App.jsx                      # Componente principal de la aplicación
│   ├── main.jsx                     # Punto de entrada de React
│   ├── App.css                      # Estilos globales
│   └── index.css                    # Estilos base
├── 📁 public/                       # Archivos públicos y datos
│   ├── 📁 data/                     # Datos geográficos y JSON
│   ├── 📁 icon/                     # Iconos y recursos gráficos
│   ├── logo.jpg/png                 # Logotipos del proyecto
│   └── map.js                       # Configuraciones del mapa
├── 📁 data/                         # Datos adicionales del proyecto
├── package.json                     # Configuración de dependencias
├── vite.config.js                   # Configuración de Vite
├── eslint.config.js                 # Configuración de ESLint
├── web.config                       # Configuración para IIS
└── index.html                       # Archivo HTML principal
```

## 🧩 Documentación Detallada de Componentes

### 📊 Capas de Mapa (`src/components/capas/`)

#### 🔍 Búsqueda y Ubicación

**`BusquedaDirecciones/`**
- **Propósito**: Búsqueda de direcciones con geocodificación
- **Componente**: `CapaBusquedaDirecciones.jsx`
- **Funcionalidad**: Integración con servicios de geocodificación para encontrar direcciones

**`UbicadorPuntos/`**
- **Propósito**: Sistema de marcadores personalizados
- **Componentes**: 
  - `CapaUbicadorPunto.jsx` - Componente principal
  - `CapaUbicadorPunto.css` - Estilos específicos
- **Funcionalidad**: Permite al usuario crear y gestionar puntos personalizados en el mapa

**`CoordenadasNuevas/`**
- **Propósito**: Gestión de coordenadas adicionales
- **Componente**: `CapaCoordenadasNuevas.jsx`
- **Funcionalidad**: Manejo de coordenadas nuevas y actualizaciones

#### 📷 Sistema de Cámaras

**`CamarasMunicipales/`**
- **Propósito**: Cámaras de seguridad municipales con filtros avanzados
- **Componentes**:
  - `CapaCamarasMunicipales.jsx` - Componente principal (484 líneas)
  - `CapaCamarasMunicipales.css` - Estilos
  - `LocationCopyPopup.css` - Estilos para popup de copia de ubicación
- **Funcionalidad**: Visualización de cámaras municipales con filtros por jurisdicción, tipo, etc.

**`CamarasVecinales/`**
- **Propósito**: Cámaras comunitarias
- **Componente**: `CapaCamarasVecinales.jsx`
- **Funcionalidad**: Visualización de cámaras instaladas por la comunidad

**`LeyendaCamaras/`**
- **Propósito**: Leyenda visual para diferenciar tipos de cámaras
- **Componentes**:
  - `LeyendaCamaras.jsx` - Componente principal
  - `LeyendaCamaras.css` - Estilos
- **Funcionalidad**: Muestra leyenda diferenciando cámaras municipales y vecinales

#### 🚨 Incidencias y Seguridad

**`Incidencias/`**
- **`CapaRobos.jsx`**: Visualización de robos con filtros temporales
- **`CapaExtorsion.jsx`**: Mapeo de extorsiones
- **Funcionalidad**: Ambas capas incluyen filtros por fecha, hora, jurisdicción

**`ClusterIncidencias/`**
- **Propósito**: Agrupación inteligente de incidencias
- **Componentes**:
  - `ClusterIncidencias.jsx` - Componente principal
  - `Cluster_incidencias.jsx` - Componente alternativo
- **Funcionalidad**: Clustering dinámico de incidencias para mejor visualización

**`MapaCalorIncidencias/`**
- **Propósito**: Visualización de calor para análisis de patrones
- **Componentes**:
  - `CapaMapaCalorIncidencias.jsx` - Componente principal
  - `CapaMapaCalorIncidencias.css` - Estilos
- **Funcionalidad**: Mapas de calor para identificar zonas de alta incidencia

#### 🚌 Transporte y Movilidad

**`Paraderos/`**
- **`CapaParaderosAutorizados.jsx`**: Paraderos oficiales
- **`CapaParaderosNoAutorizados.jsx`**: Paraderos informales
- **Funcionalidad**: Visualización de paraderos con información detallada

**`RutasVehiculo/`**
- **Propósito**: Sistema de rutas vehiculares
- **Componente**: `CapaRutas.jsx`
- **Funcionalidad**: Visualización y cálculo de rutas optimizadas

#### 🏛️ Servicios Municipales

**`Jurisdiccion/`**
- **Propósito**: Límites jurisdiccionales
- **Componente**: `CapaJurisdiccion.jsx` (104 líneas)
- **Funcionalidad**: Visualización de límites administrativos

**`DefensaCivil/`**
- **Propósito**: Puntos de defensa civil
- **Componente**: `CapaDefensaCivil.jsx` (104 líneas)
- **Funcionalidad**: Ubicación de centros de defensa civil

**`Residuos/`**
- **Propósito**: Gestión de residuos sólidos
- **Componentes**:
  - `CapaResiduos.jsx` - Componente principal
  - `CapaResiduos.css` - Estilos
  - `CapaResiduosVariantes.jsx` - Variantes del componente
- **Funcionalidad**: Visualización de puntos críticos de residuos

### 🎛️ Controles (`src/components/Controles/`)

#### 🔧 Panel Principal

**`LayerTogglePanel.jsx`** (62 líneas)
- **Propósito**: Panel principal para activar/desactivar capas
- **Funcionalidad**: Toggle de capas, cambio entre Leaflet y Google Maps

#### 📷 Controles de Cámaras

**`Busqueda_Camaras/`**
- **`ControlCamaras.jsx`** (463 líneas) - Búsqueda y filtrado de cámaras
- **`ControlCamaras.css`** - Estilos
- **Funcionalidad**: Filtros avanzados, búsqueda, seguimiento de cámaras

**`Marcador_Camaras/`**
- **`ControlMarcadorCamaras.jsx`** - Gestión de marcadores de cámaras
- **`ControlMarcadorCamaras.css`** - Estilos
- **Funcionalidad**: Control de marcadores personalizados

#### 🗺️ Controles de Mapa

**`Busqueda_Direcciones/`**
- **`ControlBusqueda.jsx`** - Control de búsqueda geográfica
- **`ControlBusqueda.css`** - Estilos
- **Funcionalidad**: Interfaz para búsqueda de direcciones

**`Mapa_Clusters/`**
- **`ControlClusters.jsx`** - Configuración de clustering
- **`ControlClusters.css`** - Estilos
- **Funcionalidad**: Control de radio y parámetros de clustering

**`Control_Mapa_Calor/`**
- **`ControlMapaCalor.jsx`** - Configuración de mapas de calor
- **`ControlMapaCalor.css`** - Estilos
- **Funcionalidad**: Configuración de parámetros de mapas de calor

**`Rutas_Moviles/`**
- **`ControlRutas.jsx`** - Gestión de rutas móviles
- **`ControlRutas.css`** - Estilos
- **Funcionalidad**: Control de cálculo y visualización de rutas

### 🎯 Filtros (`src/components/filtros/`)

**`FiltroIncidentes.jsx`**
- **Propósito**: Filtros avanzados para incidentes
- **Estilos**: `FiltroIncidentes.css`
- **Funcionalidad**: Filtros por fecha, hora, tipo, jurisdicción

**`FiltroGiro.jsx`**
- **Propósito**: Filtros específicos por giro comercial
- **Funcionalidad**: Filtrado por tipo de negocio o actividad comercial

### 🌐 Google Maps (`src/components/googlemaps/`)

#### 🔄 Componentes Duales

**Componentes Principales:**
- **`GoogleMapContainer.jsx`** - Contenedor principal para Google Maps
- **`GoogleCapaCamarasMunicipales.jsx`** - Cámaras municipales en Google Maps
- **`GoogleCapaCamarasVecinales.jsx`** - Cámaras vecinales en Google Maps
- **`GoogleCapaJurisdiccion.jsx`** - Jurisdicción en Google Maps
- **`GoogleCapaRobos.jsx`** - Robos en Google Maps
- **`GoogleCapaExtorsion.jsx`** - Extorsiones en Google Maps
- **`GoogleCapaResiduos.jsx`** - Residuos en Google Maps
- **`GoogleCapaBusquedaDirecciones.jsx`** - Búsqueda en Google Maps
- **`GoogleClusterIncidencias.jsx`** - Clustering en Google Maps
- **`GoogleRoutesCalculator.jsx`** - Calculadora de rutas optimizada

**Componentes Especializados:**
- **`GoogleCapaUbicadorPuntos/`**:
  - `GoogleCapaUbicadorPunto.jsx` - Ubicador de puntos en Google Maps
  - `GoogleCapaUbicadorPunto.css` - Estilos específicos
- **`GoogleCapaMapaCalor_Incidencias/`**:
  - `GoogleMapaCalorIncidencias.jsx` - Mapa de calor para Google Maps
  - `MapaCalorIncidencias.jsx` - Componente base
  - `MapaCalorIncidencias.css` - Estilos

**Estilos:**
- **`GoogleMapsStyles.css`** - Estilos específicos para Google Maps

### 🎣 Hooks Personalizados (`src/hooks/`)

**`useIncidenciasQuery.js`**
- **Propósito**: Hook para consultas de incidencias con React Query
- **Funcionalidad**: Gestión de estado del servidor, caché, y consultas de incidencias

**`useMapLocationCopy.js`**
- **Propósito**: Hook para gestión de ubicaciones y copia de coordenadas
- **Funcionalidad**: Funcionalidad de copiar coordenadas al portapapeles

### 🛠️ Utilidades (`src/utils/`)

**`dateUtils.js`**
- **Propósito**: Utilidades para manejo de fechas y rangos temporales
- **Funcionalidad**: Formateo, validación y manipulación de fechas

**`index.js`**
- **Propósito**: Utilidades generales y helpers
- **Funcionalidad**: Funciones de utilidad general para el proyecto

## 📊 Documentación de Datos (`public/data/`)

### 🗺️ Archivos GeoJSON

**Datos Geográficos Principales:**
- **`juridiccion.geojson`** - Límites jurisdiccionales con propiedades detalladas
  - Estructura: FeatureCollection con polígonos
  - Propiedades: id, name, description, color, timestamps, zoneId, userId
  - Coordenadas: Sistema de coordenadas geográficas

- **`610_updated.geojson`** - Datos actualizados de las 610 camaras
  - Estructura: FeatureCollection de puntos de cámaras
  - Propiedades: name, jurisdiccion, tipo, camara, megafono, boton, direccion
  - Incluye información técnica de cámaras (TIPO II, 360°, etc.)

- **`camaras-vecinales.geojson`** - Ubicaciones de cámaras vecinales
  - Estructura: FeatureCollection de puntos
  - Propiedades: nombre, tipo (Fija), marca (DAHUA), ubicacion
  - Cámaras instaladas por la comunidad

**Datos de Transporte:**
- **`paraderos_autorizados.geojson`** - Paraderos oficiales
  - Propiedades: name, description con información detallada
  - Incluye número de unidades de estacionamiento

- **`paraderos_no_autorizados.geojson`** - Paraderos informales
  - Similar estructura a paraderos autorizados

- **`radiocamera.geojson`** - Cámaras de radio
  - Sistema de cámaras con comunicación por radio

### 📈 Datos de Incidencias

**Archivos JSON de Incidencias:**
- **`Robos.json`** - Base de datos de robos
- **`extorsion.json`** - Base de datos de extorsiones
- **`Robo_extorsion.json`** - Datos combinados de robos y extorsiones
- **`cluster_data.json`** - Datos preprocesados para clustering

**Estructura de Datos de Incidencias:**
```json
{
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM",
  "jurisdiccion": "string",
  "tipo": "string",
  "coordenadas": [longitud, latitud],
  "descripcion": "string"
}
```

### 🏛️ Servicios Municipales

**Datos de Servicios:**
- **`defensaCivil.json`** - Puntos de defensa civil
- **`puntos_criticos_residuos.json`** - Puntos críticos de residuos
- **`LICENCIAS_2025.json`** - Licencias municipales 2025

### 📍 Otros Datos

**Datos Adicionales:**
- **`Coordenadas_nuevas.json`** - Coordenadas adicionales
- **`PUNTOS.kml`** - Archivo KML con puntos de interés

## 🎨 Recursos Gráficos (`public/icon/`)

### 📷 Iconos de Cámaras
- **Formatos múltiples**: SVG, PNG, WebP para optimización
- **Tipos**: `camara.svg`, `camera.png`, `camera2.png`, `camera2.webp`
- **Variantes**: `camera3.png`, `camera3.webp`, `camerav.png`, `camerav2.png`

### 🚨 Iconos de Incidencias
- **`robo.png`** - Icono para robos
- **`extorsion.png`** - Icono para extorsiones
- **`motoa.png`** - Motos autorizadas
- **`moton.png`** - Motos no autorizadas

### 🏛️ Iconos de Servicios
- **`defensa.png`** - Defensa civil
- **`ubicacion.svg`** - Ubicaciones generales

### 🎯 Iconos de Interfaz
- **`globo-amarillo.svg`** - Indicadores amarillos
- **`globo-verde.svg`** - Indicadores verdes

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **API Key de Google Maps** (para funcionalidades de Google Maps)

### Instalación

1. **Clonar el repositorio:**
```bash
git clone [URL_DEL_REPOSITORIO]
cd mapa_prediccion
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
VITE_API_BASE_URL=url_de_tu_api_backend
VITE_CACHE_DURATION=43200000  # 12 horas en milisegundos
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

5. **Construir para producción:**
```bash
npm run build
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.1.0** - Framework principal
- **Vite** - Build tool y dev server
- **Leaflet 1.9.4** - Librería de mapas open source
- **React-Leaflet 5.0.0** - Integración de Leaflet con React

### Mapas
- **Google Maps API** - Mapas de Google
- **@react-google-maps/api 2.20.7** - Integración de Google Maps con React
- **@googlemaps/react-wrapper 1.2.0** - Wrapper para Google Maps

### Gestión de Estado y Datos
- **@tanstack/react-query 5.83.0** - Gestión de estado del servidor y caché
- **React Hooks** - Gestión de estado local

### Visualización
- **Heatmap.js 2.0.5** - Mapas de calor
- **Leaflet-heatmap 1.0.0** - Mapas de calor para Leaflet
- **Leaflet.heat 0.2.0** - Alternativa para mapas de calor
- **Lucide React 0.525.0** - Iconos

### Utilidades
- **React Date Range 2.0.1** - Selectores de fechas
- **XLSX 0.18.5** - Procesamiento de archivos Excel
- **JSZip 3.10.1** - Manejo de archivos ZIP
- **@tmcw/togeojson 7.1.2** - Conversión de formatos geoespaciales
- **React Spinners 0.17.0** - Indicadores de carga

### Desarrollo
- **ESLint 9.25.0** - Linting de código
- **Vite Plugin Static Copy 3.0.2** - Copia de archivos estáticos

## 🎯 Funcionalidades Principales

### 🗺️ Sistema de Mapas Dual
- **Cambio dinámico** entre Leaflet y Google Maps
- **Mantenimiento de estado** entre cambios de proveedor
- **Optimización de rendimiento** según el tipo de mapa
- **Sincronización de capas** entre ambos sistemas

### 📊 Gestión de Capas
- **Activación/desactivación dinámica** de capas
- **Filtrado avanzado** por múltiples criterios
- **Leyendas interactivas** y personalizables
- **Gestión de estado** centralizada en App.jsx

### 🔍 Búsqueda y Navegación
- **Geocodificación de direcciones** con múltiples proveedores
- **Búsqueda de cámaras** por criterios específicos
- **Sistema de marcadores personalizados**
- **Navegación optimizada** con zoom automático

### 📈 Análisis de Datos
- **Clustering inteligente** de incidencias con radio configurable
- **Mapas de calor** para identificación de patrones
- **Filtros temporales y espaciales** avanzados
- **Análisis predictivo** de tendencias

### 🛣️ Planificación de Rutas
- **Calculadora de rutas optimizadas** con Google Maps
- **Consideración de tráfico** en tiempo real
- **Optimización de waypoints** automática
- **Visualización de rutas** en ambos tipos de mapa

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
VITE_API_BASE_URL=url_de_tu_api_backend
VITE_CACHE_DURATION=43200000  # 12 horas en milisegundos
```

### Configuración de Caché
El sistema utiliza **React Query** con configuración de caché de 12 horas:
- **staleTime**: 12 horas para optimizar el rendimiento
- **cacheTime**: 12 horas para reducir llamadas innecesarias
- **retry**: 3 reintentos con delay exponencial
- **refetchOnWindowFocus**: false para evitar recargas innecesarias

### Optimización de Build (Vite)
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.svg'],
  build: {
    copyPublicDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.webp')) {
            return 'assets/[name].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})
```

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (puerto 3000)
npm run build    # Construcción para producción
npm run preview  # Preview de la construcción
npm run lint     # Ejecutar ESLint
```

## 🏗️ Arquitectura de Componentes

### Flujo de Datos Principal
```
App.jsx (Estado Global)
├── LayerTogglePanel (Control de Capas)
├── Filtros (FiltroIncidentes, FiltroGiro)
├── Controles Específicos (ControlCamaras, ControlBusqueda, etc.)
└── MapContainer (Leaflet) / GoogleMapWrapper (Google Maps)
    ├── Capas de Datos (CapaRobos, CapaCamaras, etc.)
    ├── Componentes de Interacción (UbicadorPunto, BusquedaDirecciones)
    └── Componentes de Análisis (ClusterIncidencias, MapaCalor)
```

### Gestión de Estado
- **Estado Global**: Centralizado en App.jsx
- **Estado Local**: Componentes específicos para su funcionalidad
- **Caché**: React Query para datos del servidor
- **Persistencia**: localStorage para preferencias del usuario

## 📊 Formatos de Datos Soportados

### GeoJSON
- **Puntos**: Cámaras, paraderos, incidencias
- **Polígonos**: Jurisdicciones, límites administrativos
- **Propiedades**: Metadatos extensos para cada feature

### JSON
- **Incidencias**: Estructura estandarizada con timestamps
- **Configuraciones**: Parámetros de sistema y usuario
- **Datos de Clustering**: Información preprocesada

### KML
- **Puntos de Interés**: Compatibilidad con Google Earth
- **Conversión**: Utilizando @tmcw/togeojson

## 🚀 Despliegue

### IIS (Windows)
- Configuración en `web.config`
- Soporte para SPA (Single Page Application)
- Rewrite rules para React Router

### Variables de Entorno de Producción
```env
NODE_ENV=production
VITE_GOOGLE_MAPS_API_KEY=production_api_key
VITE_API_BASE_URL=https://api.production.com
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **ESLint**: Configuración estricta para React
- **Nomenclatura**: PascalCase para componentes, camelCase para funciones
- **Estructura**: Separación clara de responsabilidades
- **Documentación**: Comentarios en funciones complejas

<<<<<<< HEAD
## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
=======
>>>>>>> 99fd946f2bcaa3ca013c039b69280775fef87b43

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- **Issues**: Crear un issue en el repositorio
- **Documentación**: Consultar este README
- **Contacto**: Equipo de desarrollo

## 🔄 Historial de Versiones

### v0.0.0 (Actual)
- Sistema dual de mapas (Leaflet + Google Maps)
- Gestión completa de capas
- Sistema de filtros avanzado
- Clustering inteligente
- Calculadora de rutas
- Búsqueda geográfica
- Sistema de marcadores personalizados


<<<<<<< HEAD
*Sistema de mapeo predictivo para análisis de seguridad ciudadana y gestión municipal eficiente.*
=======
*Sistema de mapeo predictivo para análisis de seguridad ciudadana y gestión municipal eficiente de CECOM SJL.*
>>>>>>> 99fd946f2bcaa3ca013c039b69280775fef87b43
