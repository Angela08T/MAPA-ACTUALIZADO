import { useEffect, useRef, useState } from 'react';
import { useExtorsionesQuery, useRobosQuery } from '../../../hooks/useIncidenciasQuery';

const GoogleMapaCalorIncidencias = ({
  map,
  visible = true,
  filtros,
  config = {
    radius: 25,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.75
  }
}) => {
  const heatmapRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Consultas para obtener datos de incidencias
  const extorsionesQuery = useExtorsionesQuery(filtros, visible);
  const robosQuery = useRobosQuery(filtros, visible);

  // Inicializar la capa de mapa de calor de Google Maps
  useEffect(() => {
    if (!map || !window.google || !window.google.maps.visualization) {
      console.warn('Google Maps o la biblioteca de visualización no están disponibles');
      return;
    }

    // Crear la capa de mapa de calor
    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: [],
      map: visible ? map : null,
      radius: config.radius,
      opacity: config.maxOpacity,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });

    heatmapRef.current = heatmap;
    setIsReady(true);

    return () => {
      if (heatmapRef.current) {
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

    console.log('Actualizando mapa de calor Google Maps con', todasIncidencias.length, 'incidencias');

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

    // Actualizar los datos del mapa de calor
    heatmapRef.current.setData(heatmapData);

    // Ajustar vista del mapa si hay datos
    if (heatmapData.length > 0 && map) {
      const bounds = new window.google.maps.LatLngBounds();
      heatmapData.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);
    }

  }, [extorsionesQuery.data, robosQuery.data, isReady]);

  // Actualizar configuración del mapa de calor
  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.set('radius', config.radius);
    heatmapRef.current.set('opacity', config.maxOpacity);
  }, [config]);

  // Controlar visibilidad de la capa
  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.setMap(visible ? map : null);
  }, [visible, map]);

  // Este componente no renderiza nada visible, solo maneja la capa del mapa
  return null;
};
export default GoogleMapaCalorIncidencias;