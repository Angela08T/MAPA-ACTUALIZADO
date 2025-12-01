import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { isDateInRange } from '../utils/dateUtils';
import { logger } from '../utils';

// Función para normalizar texto
const normalizarTexto = texto =>
  (texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Mapeos para convertir filtros a parámetros de API
const mapMes = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const mapTurno = {
  'turno manana': 1,
  'turno tarde': 2,
  'turno noche': 3,
};

const mapDia = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 7,
};

const mapHorario = {
  '00:00 - 01:59': 1,
  '02:00 - 03:59': 2,
  '04:00 - 05:59': 3,
  '06:00 - 07:59': 4,
  '08:00 - 09:59': 5,
  '10:00 - 11:59': 6,
  '12:00 - 13:59': 7,
  '14:00 - 15:59': 8,
  '16:00 - 17:59': 9,
  '18:00 - 19:59': 10,
  '20:00 - 21:59': 11,
  '22:00 - 23:59': 12,
};

const mapJurisdiccion = {
  'caja de agua': 1,
  zarate: 2,
  huayrona: 3,
  'canto rey': 4,
  'santa elizabeth': 5,
  bayovar: 6,
  'mariscal caceres': 7,
  '10 de octubre': 8,
};

// Función para construir parámetros de consulta
const buildQueryParams = (filtros, tipo) => {
  const params = new URLSearchParams();

  const año = filtros?.Año?.trim() || '2025';
  params.append('anio', año);

  if (filtros?.Mes) {
    params.append('mes', mapMes[normalizarTexto(filtros.Mes)] || '');
  }
  if (filtros?.Turno) {
    params.append('turno', mapTurno[normalizarTexto(filtros.Turno)] || '');
  }
  if (filtros?.Dia) {
    params.append('dia', mapDia[normalizarTexto(filtros.Dia)] || '');
  }
  if (filtros?.Horario) {
    params.append('horario', mapHorario[normalizarTexto(filtros.Horario)] || '');
  }
  if (filtros?.Jurisdiccion) {
    params.append('jurisdiccion', mapJurisdiccion[normalizarTexto(filtros.Jurisdiccion)] || '');
  }

  params.append('tipo', tipo); // 1 para extorsiones, 2 para robos

  return params.toString();
};

// Función para hacer la petición a la API
const fetchIncidencias = async (filtros, tipo) => {
  const queryString = buildQueryParams(filtros, tipo);
  const url = `http://192.168.13.80:81/api/incidencias-filtradas?${queryString}`;

  logger.log(`Fetching ${tipo === 1 ? 'extorsiones' : 'robos'} from API:`, url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result || [];
};

// Función para aplicar filtros adicionales (fechas)
const applyAdditionalFilters = (data, filtros) => {
  let filteredData = [...data];

  // Aplicar filtro de rango de fechas si está definido
  if (filtros?.fechaInicio && filtros?.fechaFin) {
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);

    filteredData = filteredData.filter(item => isDateInRange(item.Fecha, fechaInicio, fechaFin));
  }

  return filteredData;
};

// Hook para consultas de robos
export const useRobosQuery = (filtros, enabled = true) => {
  // Crear clave única para el caché basada en los filtros
  const queryKey = ['robos', filtros];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchIncidencias(filtros, 2), // 2 para robos
    enabled: enabled && filtros !== null,
    select: data => {
      const filteredData = applyAdditionalFilters(data, filtros);
      logger.log(`Robos procesados:`, filteredData.length);
      return filteredData;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12 horas
    cacheTime: 12 * 60 * 60 * 1000, // 12 horas
  });

  // Usar useEffect para disparar eventos cuando cambien los datos
  useEffect(() => {
    if (enabled && query.isSuccess && query.data) {
      window.dispatchEvent(
        new CustomEvent('robosTotal', {
          detail: query.data.length,
        })
      );
    } else if (!enabled || query.isError) {
      // Resetear contador cuando no está habilitado o hay error
      window.dispatchEvent(
        new CustomEvent('robosTotal', {
          detail: 0,
        })
      );
    }
  }, [enabled, query.data, query.isSuccess, query.isError]);

  return query;
};

// Hook para consultas de extorsiones
export const useExtorsionesQuery = (filtros, enabled = true) => {
  // Crear clave única para el caché basada en los filtros
  const queryKey = ['extorsiones', filtros];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchIncidencias(filtros, 1), // 1 para extorsiones
    enabled: enabled && filtros !== null,
    select: data => {
      const filteredData = applyAdditionalFilters(data, filtros);
      logger.log(`Extorsiones procesadas:`, filteredData.length);
      return filteredData;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12 horas
    cacheTime: 12 * 60 * 60 * 1000, // 12 horas
  });

  // Usar useEffect para disparar eventos cuando cambien los datos
  useEffect(() => {
    if (enabled && query.isSuccess && query.data) {
      window.dispatchEvent(
        new CustomEvent('extorsionTotal', {
          detail: query.data.length,
        })
      );
    } else if (!enabled || query.isError) {
      // Resetear contador cuando no está habilitado o hay error
      window.dispatchEvent(
        new CustomEvent('extorsionTotal', {
          detail: 0,
        })
      );
    }
  }, [enabled, query.data, query.isSuccess, query.isError]);

  return query;
};

// Hook personalizado para invalidar caché manualmente si es necesario
export const useInvalidateIncidencias = () => {
  const queryClient = useQueryClient();

  const invalidateRobos = () => {
    queryClient.invalidateQueries(['robos']);
  };

  const invalidateExtorsiones = () => {
    queryClient.invalidateQueries(['extorsiones']);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries(['robos']);
    queryClient.invalidateQueries(['extorsiones']);
  };

  return {
    invalidateRobos,
    invalidateExtorsiones,
    invalidateAll,
  };
};
