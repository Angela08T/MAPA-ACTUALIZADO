import { useEffect, useState } from "react";
import { LayerGroup, Circle, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

const iconoCamara = new L.Icon({
  iconUrl: "/icon/camera.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Componente para manejar clics en el mapa
const MapClickHandler = ({ marcadorActivo, onAgregarPunto }) => {
  useMapEvents({
    click: (e) => {
      if (marcadorActivo) {
        const { lat, lng } = e.latlng;
        onAgregarPunto(lat, lng);
      }
    },
  });

  return null;
};

// Función para obtener dirección usando Nominatim (reverse geocoding)
const obtenerDireccion = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MapaPrediccion/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en reverse geocoding: ${response.status}`);
    }

    const data = await response.json();
    
    // Construir dirección detallada como en el tooltip
    const address = data.address || {};
    const partes = [
      address.road || address.pedestrian || address.footway,
      address.house_number,
      address.neighbourhood || address.suburb,
      address.city_district || address.quarter,
      address.town || address.city || address.municipality,
      address.state || address.region,
      address.postcode,
      address.country
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(', ') : data.display_name || 'Dirección no disponible';
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    return 'Error obteniendo dirección';
  }
};

const CapaCoordenadasNuevas = ({ 
  visible, 
  marcadorActivo = false, 
  puntosUsuario = [], 
  onAgregarPunto 
}) => {
  const [coordenadas, setCoordenadas] = useState([]);

  useEffect(() => {
    fetch("/data/Coordenadas_nuevas.json")
      .then((res) => res.json())
      .then((data) => setCoordenadas(data.coordenadas_nuevas || []))
      .catch((err) =>
        console.error("Error cargando coordenadas nuevas:", err)
      );
  }, []);

  // Función para manejar clic en el mapa y agregar punto
  const handleAgregarPunto = async (lat, lng) => {
    if (!onAgregarPunto) return;

    const nuevoPunto = {
      id: Date.now(), // ID único basado en timestamp
      latitud: lat,
      longitud: lng,
      direccion: 'Obteniendo dirección...',
      fechaCreacion: new Date().toLocaleString(),
      esUsuario: true
    };

    // Agregar punto inmediatamente
    onAgregarPunto(nuevoPunto);

    // Obtener dirección en background
    try {
      const direccion = await obtenerDireccion(lat, lng);
      // Actualizar la dirección
      onAgregarPunto({
        ...nuevoPunto,
        direccion: direccion
      });
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      onAgregarPunto({
        ...nuevoPunto,
        direccion: 'Error obteniendo dirección'
      });
    }
  };

  if (!visible) return null;

  return (
    <LayerGroup>
      {/* Manejador de clics en el mapa */}
      <MapClickHandler 
        marcadorActivo={marcadorActivo} 
        onAgregarPunto={handleAgregarPunto} 
      />

      {/* Coordenadas del JSON original */}
      {coordenadas.map((coordenada, idx) => {
        const { latitud, longitud } = coordenada;
        if (!latitud || !longitud) return null;

        return (
          <div key={`json-${idx}`}>
            <Circle
              center={[latitud, longitud]}
              radius={120}
              pathOptions={{
                color: "#00bb2d",
                fillColor: "#75d633",
                fillOpacity: 0.25,
                weight: 1,
                dashArray: "4 4"
              }}
            />
            <Marker
              position={[latitud, longitud]}
              icon={iconoCamara}
            >
              <Popup>
                <div style={{ fontSize: "13px" }}>
                  <strong>📍 Coordenada Original</strong><br />
                  <strong>Latitud:</strong> {latitud}<br />
                  <strong>Longitud:</strong> {longitud}<br />
                  <em>Fuente: JSON original</em>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}

      {/* Puntos marcados por el usuario */}
      {puntosUsuario.map((punto) => (
        <div key={`user-${punto.id}`}>
          <Circle
            center={[punto.latitud, punto.longitud]}
            radius={120}
            pathOptions={{
              color: "#00bb2d",
                fillColor: "#75d633",
              fillOpacity: 0.3,
              weight: 2,
              dashArray: "2 2"
            }}
          />
          <Marker
            position={[punto.latitud, punto.longitud]}
            icon={iconoCamara}
          >
            <Popup>
              <div style={{ fontSize: "13px" }}>
                <strong>📍 Punto Marcado</strong><br />
                <strong>Latitud:</strong> {punto.latitud.toFixed(6)}<br />
                <strong>Longitud:</strong> {punto.longitud.toFixed(6)}<br />
                <strong>Dirección:</strong> {punto.direccion}<br />
                <strong>Creado:</strong> {punto.fechaCreacion}<br />
                <em>Fuente: Marcado por usuario</em>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </LayerGroup>
  );
};

export default CapaCoordenadasNuevas; 