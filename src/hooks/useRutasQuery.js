import { useQuery } from '@tanstack/react-query';
import { logger } from '../utils';

/**
 * Hook para consultar rutas OSRM con caché
 * Cachea las rutas por 30 minutos (las rutas no cambian frecuentemente en el día)
 */
export const useOSRMRouteQuery = (markers, enabled = true) => {
  // Crear clave única basada en las coordenadas de los marcadores
  const queryKey = ['osrm-route', markers];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!markers || markers.length < 2) {
        throw new Error('Se requieren al menos 2 puntos para calcular una ruta');
      }

      // Convertir coordenadas a formato OSRM (longitude,latitude)
      const coordinates = markers
        .map(marker => `${marker.position[1]},${marker.position[0]}`)
        .join(';');

      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

      logger.log('Fetching OSRM route:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error en la solicitud OSRM: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No se pudo encontrar una ruta entre los puntos seleccionados');
      }

      // Extraer la geometría de la ruta
      const routeGeometry = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

      const routeInfo = {
        geometry: routeGeometry,
        distance: (data.routes[0].distance / 1000).toFixed(2), // km
        duration: Math.round(data.routes[0].duration / 60), // minutos
        waypoints: markers.length,
      };

      logger.log('Ruta OSRM calculada:', {
        distancia: routeInfo.distance + ' km',
        duracion: routeInfo.duration + ' min',
        puntos: routeInfo.waypoints,
      });

      return routeInfo;
    },
    enabled: enabled && markers && markers.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Hook para precarga de rutas comunes
 * Útil para rutas que se consultan frecuentemente
 *
 * NOTA: Actualmente deshabilitado. Los hooks de React Query
 * deben usarse directamente en los componentes.
 */
export const usePrefetchRoute = () => {
  // Retorna una función dummy que no hace nada
  // En el futuro, esto podría implementarse usando queryClient.prefetchQuery
  return {
    prefetch: () => {
      // No-op: usar useOSRMRouteQuery directamente en el componente
    },
  };
};
