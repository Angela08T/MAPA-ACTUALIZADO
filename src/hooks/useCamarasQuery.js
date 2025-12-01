import { useQuery } from '@tanstack/react-query';
import { logger } from '../utils';

/**
 * Hook para consultar cámaras municipales con caché
 * Cachea los datos por 24 horas ya que las cámaras no cambian frecuentemente
 */
export const useCamarasQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['camaras-municipales'],
    queryFn: async () => {
      logger.log('Fetching cámaras municipales...');
      const response = await fetch('/data/camaras-municipales.geojson');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.log(`Cámaras municipales cargadas: ${data.features?.length || 0}`);
      return data;
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 horas (las cámaras cambian poco)
    cacheTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook para consultar cámaras vecinales con caché
 */
export const useCamarasVecinalesQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['camaras-vecinales'],
    queryFn: async () => {
      logger.log('Fetching cámaras vecinales...');
      const response = await fetch('/data/camaras-vecinales.geojson');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.log(`Cámaras vecinales cargadas: ${data.features?.length || 0}`);
      return data;
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};
