import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import { useExtorsionesQuery, useRobosQuery } from '../../../hooks/useIncidenciasQuery';
import ClipLoader from "react-spinners/ClipLoader";

const MapaCalorIncidencias = ({ 
  filtros, 
  visible = true, 
  config = {
    radius: 25,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.75
  }
}) => {
  const map = useMap(); // Usar el mapa existente de react-leaflet
  const heatLayerRef = useRef(null);

  // Consultas para obtener datos de incidencias
  const extorsionesQuery = useExtorsionesQuery(filtros, visible);
  const robosQuery = useRobosQuery(filtros, visible);

  // Limpiar capa anterior
  const clearHeatLayer = () => {
    if (heatLayerRef.current && map) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
  };

  // Crear/actualizar capa de calor
  useEffect(() => {
    if (!visible || !map) {
      clearHeatLayer();
      return;
    }

    const extorsionesData = extorsionesQuery.data || [];
    const robosData = robosQuery.data || [];
    
    // Combinar todos los datos de incidencias
    const todasIncidencias = [...extorsionesData, ...robosData];
    
    console.log('🔄 Actualizando mapa de calor Leaflet con', todasIncidencias.length, 'incidencias');

    // Convertir datos a formato requerido por Leaflet Heatmap
    const heatmapData = todasIncidencias
      .filter(incidencia => {
        const lat = parseFloat(incidencia.Latitud);
        const lng = parseFloat(incidencia.Longitud);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      })
      .map(incidencia => [
        parseFloat(incidencia.Latitud),
        parseFloat(incidencia.Longitud),
        1 // Intensidad (peso) del punto
      ]);

    console.log('📍 Puntos válidos para mapa de calor Leaflet:', heatmapData.length);

    // Limpiar capa anterior
    clearHeatLayer();

    // Crear nueva capa de calor si hay datos
    if (heatmapData.length > 0) {
      const heatLayer = L.heatLayer(heatmapData, {
        radius: config.radius,
        blur: Math.round(config.blur * 20), // Leaflet usa valores diferentes
        maxZoom: 18,
        max: 1.0,
        minOpacity: config.minOpacity,
        gradient: {
          0.0: 'rgba(0, 255, 255, 0)',      // Transparente
          0.1: 'rgba(0, 255, 255, 0.2)',    // Cyan muy claro
          0.2: 'rgba(0, 191, 255, 0.4)',    // Azul claro
          0.4: 'rgba(0, 127, 255, 0.6)',    // Azul medio
          0.6: 'rgba(0, 63, 255, 0.7)',     // Azul intenso
          0.7: 'rgba(0, 0, 255, 0.8)',      // Azul puro
          0.8: 'rgba(63, 0, 191, 0.85)',    // Azul-violeta
          0.9: 'rgba(127, 0, 127, 0.9)',    // Violeta
          0.95: 'rgba(191, 0, 63, 0.95)',   // Rojo-violeta
          1.0: 'rgba(255, 0, 0, 1)'         // Rojo intenso
        }
      });

      // Aplicar opacidad máxima
      heatLayer.setOptions({ 
        ...heatLayer.options,
        maxOpacity: config.maxOpacity 
      });

      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;

      console.log('✅ Capa de mapa de calor Leaflet creada correctamente');
    }

    // Dispatch evento con estadísticas
    window.dispatchEvent(new CustomEvent('mapaCalorActualizado', {
      detail: {
        totalPuntos: heatmapData.length,
        extorsiones: extorsionesData.length,
        robos: robosData.length
      }
    }));

  }, [visible, extorsionesQuery.data, robosQuery.data, map, config]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearHeatLayer();
    };
  }, []);

  // Mostrar estado de carga
  const isLoading = extorsionesQuery.isLoading || robosQuery.isLoading;
  const hasError = extorsionesQuery.isError || robosQuery.isError;

  if (!visible) return null;

  return (
    <>
      {/* Indicador de carga */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "14px 24px",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          fontFamily: "Segoe UI, sans-serif",
          border: "1px solid rgba(200, 200, 200, 0.6)",
        }}>
          <ClipLoader size={28} color="#3498db" />
          <span style={{
            marginLeft: 12,
            fontSize: "15px",
            fontWeight: "500",
            color: "#2c3e50"
          }}>
            Cargando mapa de calor...
          </span>
        </div>
      )}
      
      {/* Indicador de error */}
      {hasError && (
        <div style={{
          position: "absolute",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "12px 20px",
          backgroundColor: "rgba(255, 99, 99, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}>
          ❌ Error cargando mapa de calor: {hasError ? 'Error en la consulta' : ''}
        </div>
      )}
    </>
  );
};

export default MapaCalorIncidencias;