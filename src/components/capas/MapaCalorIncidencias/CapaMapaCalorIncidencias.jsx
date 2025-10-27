import { useEffect, useRef, useState } from 'react';
import { useExtorsionesQuery, useRobosQuery } from '../../../hooks/useIncidenciasQuery';
import ControlMapaCalor from '../../Controles/ControlMapaCalor';
import ClipLoader from "react-spinners/ClipLoader";
import './CapaMapaCalorIncidencias.css';

const CapaMapaCalorIncidencias = ({ 
  map, 
  visible = true, 
  filtros,
  showControls = true,
  config: externalConfig
}) => {
  const heatmapRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState(externalConfig || {
    radius: 25,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.75
  });

  // Consultas para obtener datos de incidencias
  const extorsionesQuery = useExtorsionesQuery(filtros, visible);
  const robosQuery = useRobosQuery(filtros, visible);

  // Inicializar la capa de mapa de calor de Google Maps
  useEffect(() => {
    if (!map || !window.google || !window.google.maps.visualization) {
      console.warn('Google Maps o la biblioteca de visualización no están disponibles');
      return;
    }

    console.log('🔥 Inicializando capa de mapa de calor...');

    // Crear la capa de mapa de calor
    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: [],
      map: visible ? map : null,
      radius: config.radius,
      opacity: config.maxOpacity,
      gradient: [
        'rgba(0, 255, 255, 0)',      // Transparente (sin datos)
        'rgba(0, 255, 255, 0.2)',    // Cyan muy claro
        'rgba(0, 191, 255, 0.4)',    // Azul claro
        'rgba(0, 127, 255, 0.6)',    // Azul medio
        'rgba(0, 63, 255, 0.7)',     // Azul intenso
        'rgba(0, 0, 255, 0.8)',      // Azul puro
        'rgba(63, 0, 191, 0.85)',    // Azul-violeta
        'rgba(127, 0, 127, 0.9)',    // Violeta
        'rgba(191, 0, 63, 0.95)',    // Rojo-violeta
        'rgba(255, 0, 0, 1)'         // Rojo intenso (máxima densidad)
      ]
    });

    heatmapRef.current = heatmap;
    setIsReady(true);

    console.log('✅ Capa de mapa de calor inicializada correctamente');

    return () => {
      if (heatmapRef.current) {
        console.log('🧹 Limpiando capa de mapa de calor...');
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
        setIsReady(false);
      }
    };
  }, [map]);

  // Actualizar datos del mapa de calor
  useEffect(() => {
    if (!isReady || !heatmapRef.current) return;

    const extorsionesData = extorsionesQuery.data || [];
    const robosData = robosQuery.data || [];
    
    // Combinar todos los datos de incidencias
    const todasIncidencias = [...extorsionesData, ...robosData];
    
    console.log('🔄 Actualizando mapa de calor con', todasIncidencias.length, 'incidencias');

    // Convertir datos a formato requerido por Google Maps Heatmap
    const heatmapData = todasIncidencias
      .filter(incidencia => {
        // Filtrar incidencias que tengan coordenadas válidas
        const lat = parseFloat(incidencia.Latitud);
        const lng = parseFloat(incidencia.Longitud);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      })
      .map(incidencia => {
        return new window.google.maps.LatLng(
          parseFloat(incidencia.Latitud),
          parseFloat(incidencia.Longitud)
        );
      });

    console.log('📍 Puntos válidos para mapa de calor:', heatmapData.length);

    // Actualizar los datos del mapa de calor
    heatmapRef.current.setData(heatmapData);

    // Dispatch evento con estadísticas
    window.dispatchEvent(new CustomEvent('mapaCalorActualizado', {
      detail: {
        totalPuntos: heatmapData.length,
        extorsiones: extorsionesData.length,
        robos: robosData.length
      }
    }));

  }, [extorsionesQuery.data, robosQuery.data, isReady]);

  // Actualizar configuración del mapa de calor
  useEffect(() => {
    if (!heatmapRef.current) return;

    console.log('⚙️ Actualizando configuración del mapa de calor:', config);

    heatmapRef.current.set('radius', config.radius);
    heatmapRef.current.set('opacity', config.maxOpacity);
    
    // Nota: Google Maps Heatmap no soporta directamente minOpacity y blur
    // pero podemos simular el efecto ajustando el gradiente si es necesario

  }, [config]);

  // Controlar visibilidad de la capa
  useEffect(() => {
    if (!heatmapRef.current) return;

    console.log('👁️ Cambiando visibilidad del mapa de calor:', visible);
    heatmapRef.current.setMap(visible ? map : null);
  }, [visible, map]);

  // Sincronizar configuración externa
  useEffect(() => {
    if (externalConfig) {
      setConfig(externalConfig);
    }
  }, [externalConfig]);

  // Manejar cambios en la configuración desde el control
  const handleConfigChange = (newConfig) => {
    console.log('🎛️ Nueva configuración recibida:', newConfig);
    setConfig(newConfig);
  };

  // Mostrar estado de carga
  const isLoading = extorsionesQuery.isLoading || robosQuery.isLoading;
  const hasError = extorsionesQuery.isError || robosQuery.isError;

  if (!visible) return null;

  return (
    <>
      {/* Indicador de carga similar al patrón de otras capas */}
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

      {/* Control de configuración */}
      {showControls && (
        <ControlMapaCalor
          visible={visible}
          config={config}
          onConfigChange={handleConfigChange}
        />
      )}
    </>
  );
};

export default CapaMapaCalorIncidencias;