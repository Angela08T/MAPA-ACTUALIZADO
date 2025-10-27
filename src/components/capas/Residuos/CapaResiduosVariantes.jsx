import { useEffect, useState } from "react";
import { LayerGroup, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import ClipLoader from "react-spinners/ClipLoader";
import { 
  Trash2, 
  Recycle, 
  TreePine, 
  MapPin, 
  CircleDot,
  AlertTriangle,
  Package,
  Leaf
} from "lucide-react";
import { createRoot } from "react-dom/client";

// Función mejorada para crear iconos usando Lucide React
const createLucideIcon = (IconComponent, color, bgColor, size = 35) => {
  const iconHtml = document.createElement('div');
  iconHtml.className = 'lucide-marker-icon';
  iconHtml.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background-color: ${bgColor};
    border: 3px solid ${color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    position: relative;
    transition: transform 0.2s ease;
  `;
  
  // Agregar pseudo-elemento para el "pin" del marcador
  const pinElement = document.createElement('div');
  pinElement.style.cssText = `
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 12px solid ${color};
  `;
  iconHtml.appendChild(pinElement);
  
  // Contenedor para el icono
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    position: relative;
  `;
  iconHtml.appendChild(iconContainer);
  
  // Crear el root de React y renderizar el icono
  const root = createRoot(iconContainer);
  root.render(<IconComponent size={18} color={color} strokeWidth={2.5} />);
  
  return L.divIcon({
    html: iconHtml.outerHTML,
    className: 'custom-lucide-residuos-icon',
    iconSize: [size, size + 12],
    iconAnchor: [size/2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
};

// ========== DIFERENTES VARIANTES DE ICONOS ==========

// VARIANTE 1: Ecológico/Reciclaje
const iconosEcologicos = {
  verde: createLucideIcon(Recycle, '#198754', '#d1e7dd'),
  amarillo: createLucideIcon(AlertTriangle, '#fd7e14', '#ffeeba')
};

// VARIANTE 2: Basura/Residuos
const iconosBasura = {
  verde: createLucideIcon(Trash2, '#20c997', '#d4edda'),
  amarillo: createLucideIcon(Trash2, '#ffc107', '#fff3cd')
};

// VARIANTE 3: Naturaleza/Paquetes
const iconosNaturaleza = {
  verde: createLucideIcon(TreePine, '#28a745', '#d4edda'),
  amarillo: createLucideIcon(Package, '#fd7e14', '#fff3cd')
};

// VARIANTE 4: Puntos simples con colores
const iconosPuntos = {
  verde: createLucideIcon(CircleDot, '#198754', '#c3f7d0'),
  amarillo: createLucideIcon(CircleDot, '#fd7e14', '#ffe4b5')
};

// VARIANTE 5: Marcadores de mapa
const iconosMapa = {
  verde: createLucideIcon(MapPin, '#20c997', '#d1e7dd'),
  amarillo: createLucideIcon(MapPin, '#f39c12', '#fcf3cf')
};

// VARIANTE 6: Eco-Friendly
const iconosEcoFriendly = {
  verde: createLucideIcon(Leaf, '#2d6a4f', '#d8f3dc'),
  amarillo: createLucideIcon(AlertTriangle, '#b08500', '#fff8db')
};

// Seleccionar qué variante usar (cambiar aquí para probar diferentes estilos)
const VARIANTE_ACTIVA = 'ecologicos'; // opciones: 'ecologicos', 'basura', 'naturaleza', 'puntos', 'mapa', 'ecoFriendly'

const variantesDisponibles = {
  ecologicos: iconosEcologicos,
  basura: iconosBasura,
  naturaleza: iconosNaturaleza,
  puntos: iconosPuntos,
  mapa: iconosMapa,
  ecoFriendly: iconosEcoFriendly
};

const iconosSeleccionados = variantesDisponibles[VARIANTE_ACTIVA];

const CapaResiduosVariantes = ({ visible, variante = VARIANTE_ACTIVA }) => {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Usar la variante especificada o la por defecto
  const iconos = variantesDisponibles[variante] || iconosSeleccionados;

  useEffect(() => {
    if (!visible) {
      setPuntos([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/puntos_criticos_residuos.json");
        const data = await response.json();
        setPuntos(data);
      } catch (error) {
        console.error("Error fetching residuos data:", error);
        setPuntos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible]);

  if (!visible) return null;

  if (loading) {
    return (
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        padding: "20px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
      }}>
        <ClipLoader color="#28a745" size={20} />
        <span>Cargando puntos de residuos...</span>
      </div>
    );
  }

  return (
    <LayerGroup>
      {puntos.map((punto, idx) => {
        const lat = parseFloat(punto.latitud);
        const lng = parseFloat(punto.longitud);

        if (isNaN(lat) || isNaN(lng)) return null;

        const icon = iconos[punto.id_tipo];
        const colorTexto = punto.id_tipo === 'verde' ? '#198754' : '#fd7e14';
        const bgColor = punto.id_tipo === 'verde' ? '#d1e7dd' : '#fff3cd';

        return (
          <Marker
            key={`residuo-${variante}-${idx}-${punto.nombre}`}
            position={[lat, lng]}
            icon={icon}
          >
            <Popup>
              <div style={{ 
                fontSize: "13px", 
                maxWidth: "280px",
                fontFamily: "Arial, sans-serif",
                backgroundColor: bgColor,
                padding: "10px",
                borderRadius: "8px",
                border: `2px solid ${colorTexto}`
              }}>
                <strong style={{ 
                  color: colorTexto,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  🗑️ Punto Crítico de Residuos
                </strong>
                <hr style={{ margin: "8px 0", border: `1px solid ${colorTexto}` }} />
                <div style={{ marginBottom: "5px" }}>
                  <strong>Código:</strong> <span style={{ color: colorTexto }}>{punto.nombre}</span>
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Tipo:</strong> 
                  <span style={{ 
                    color: colorTexto, 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: colorTexto,
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '5px',
                    fontSize: '11px'
                  }}>
                    {punto.id_tipo}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#666" }}>
                  <strong>Coordenadas:</strong><br />
                  Lat: {punto.latitud} | Lng: {punto.longitud}
                </div>
                <div style={{ 
                  marginTop: "8px", 
                  fontSize: "10px", 
                  color: "#888",
                  textAlign: "center"
                }}>
                  Variante: {variante}
                </div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -25]} opacity={0.9}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: "bold",
                color: colorTexto,
                backgroundColor: "white",
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${colorTexto}`,
                textAlign: "center"
              }}>
                <div>{punto.nombre}</div>
                <div style={{ fontSize: "9px", textTransform: "uppercase" }}>
                  {punto.id_tipo}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </LayerGroup>
  );
};

export default CapaResiduosVariantes;

// ========== GUÍA DE USO ==========
/*
Para usar diferentes variantes de iconos:

1. Cambiar la constante VARIANTE_ACTIVA al inicio del archivo
2. O pasar la prop 'variante' al componente:
   <CapaResiduosVariantes visible={true} variante="basura" />

Variantes disponibles:
- 'ecologicos': Recycle (verde) + AlertTriangle (amarillo)
- 'basura': Trash2 para ambos, diferentes colores
- 'naturaleza': TreePine (verde) + Package (amarillo)  
- 'puntos': CircleDot para ambos, diferentes colores
- 'mapa': MapPin para ambos, diferentes colores
- 'ecoFriendly': Leaf (verde) + AlertTriangle (amarillo)
*/ 