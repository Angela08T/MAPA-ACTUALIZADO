/**
 * Utilidades de validación centralizadas
 * Provee funciones de validación reutilizables para todo el proyecto
 */

import { logger } from './logger';

/**
 * Valida si una coordenada (latitud o longitud) es válida
 */
export const isValidCoordinate = (lat, lng) => {
  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    return false;
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return false;
  }

  return latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
};

/**
 * Valida un array de coordenadas
 * @param {Array} coords - Array de [lat, lng]
 * @returns {boolean}
 */
export const isValidCoordinatesArray = coords => {
  if (!Array.isArray(coords) || coords.length !== 2) {
    return false;
  }

  return isValidCoordinate(coords[0], coords[1]);
};

/**
 * Valida una incidencia (robo o extorsión)
 */
export const isValidIncidencia = incidencia => {
  if (!incidencia || typeof incidencia !== 'object') {
    return false;
  }

  // Validaciones básicas
  const hasLatLng = isValidCoordinate(incidencia.Latitud, incidencia.Longitud);

  if (!hasLatLng) {
    logger.warn('Incidencia inválida - coordenadas incorrectas:', incidencia);
    return false;
  }

  // Validaciones opcionales (pueden faltar pero si existen deben ser válidas)
  if (incidencia.Fecha && !isValidDate(incidencia.Fecha)) {
    logger.warn('Incidencia con fecha inválida:', incidencia);
    return false;
  }

  return true;
};

/**
 * Valida una cámara
 */
export const isValidCamara = camara => {
  if (!camara || typeof camara !== 'object') {
    return false;
  }

  // Si es un feature de GeoJSON
  if (camara.geometry && camara.properties) {
    const coords = camara.geometry.coordinates;
    if (!coords || coords.length < 2) {
      return false;
    }

    // En GeoJSON es [lng, lat]
    return isValidCoordinate(coords[1], coords[0]);
  }

  // Si es un objeto simple
  return isValidCoordinate(camara.lat || camara.Latitud, camara.lng || camara.Longitud);
};

/**
 * Valida una fecha
 * @param {string|Date} fecha
 * @returns {boolean}
 */
export const isValidDate = fecha => {
  if (!fecha) return false;

  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
};

/**
 * Valida un rango de fechas
 */
export const isValidDateRange = (fechaInicio, fechaFin) => {
  if (!isValidDate(fechaInicio) || !isValidDate(fechaFin)) {
    return false;
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  return inicio <= fin;
};

/**
 * Valida un filtro de incidencias
 */
export const isValidFiltro = filtro => {
  if (!filtro || typeof filtro !== 'object') {
    return false;
  }

  // Los filtros pueden estar vacíos, eso es válido
  // Solo validamos si tienen valores que sean correctos
  if (filtro.Año && (isNaN(Number(filtro.Año)) || filtro.Año.length !== 4)) {
    return false;
  }

  if (filtro.fechaInicio && filtro.fechaFin) {
    return isValidDateRange(filtro.fechaInicio, filtro.fechaFin);
  }

  return true;
};

/**
 * Valida un punto de usuario
 */
export const isValidPuntoUsuario = punto => {
  if (!punto || typeof punto !== 'object') {
    return false;
  }

  // Debe tener ID y coordenadas válidas
  if (!punto.id) {
    return false;
  }

  if (punto.position && Array.isArray(punto.position)) {
    return isValidCoordinatesArray(punto.position);
  }

  return isValidCoordinate(punto.lat, punto.lng);
};

/**
 * Valida parámetros de ruta
 */
export const isValidRouteParams = markers => {
  if (!Array.isArray(markers) || markers.length < 2) {
    logger.warn('Se requieren al menos 2 puntos para una ruta');
    return false;
  }

  return markers.every(marker => {
    if (marker.position && Array.isArray(marker.position)) {
      return isValidCoordinatesArray(marker.position);
    }
    return isValidCoordinate(marker.lat, marker.lng);
  });
};

/**
 * Sanitiza coordenadas (asegura que sean números válidos)
 */
export const sanitizeCoordinates = (lat, lng) => {
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    logger.error('Coordenadas inválidas al sanitizar:', { lat, lng });
    return null;
  }

  // Limitar a rangos válidos
  const sanitizedLat = Math.max(-90, Math.min(90, latNum));
  const sanitizedLng = Math.max(-180, Math.min(180, lngNum));

  return {
    lat: sanitizedLat,
    lng: sanitizedLng,
  };
};

/**
 * Filtra array de incidencias, removiendo las inválidas
 */
export const filterValidIncidencias = incidencias => {
  if (!Array.isArray(incidencias)) {
    return [];
  }

  const validas = incidencias.filter(isValidIncidencia);

  if (validas.length !== incidencias.length) {
    logger.warn(`${incidencias.length - validas.length} incidencias inválidas fueron filtradas`);
  }

  return validas;
};

/**
 * Filtra array de cámaras, removiendo las inválidas
 */
export const filterValidCamaras = camaras => {
  if (!Array.isArray(camaras)) {
    return [];
  }

  const validas = camaras.filter(isValidCamara);

  if (validas.length !== camaras.length) {
    logger.warn(`${camaras.length - validas.length} cámaras inválidas fueron filtradas`);
  }

  return validas;
};

/**
 * Valida estructura de GeoJSON
 */
export const isValidGeoJSON = geojson => {
  if (!geojson || typeof geojson !== 'object') {
    return false;
  }

  // Debe tener type y features (para FeatureCollection)
  if (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature') {
    return false;
  }

  if (geojson.type === 'FeatureCollection') {
    return Array.isArray(geojson.features);
  }

  if (geojson.type === 'Feature') {
    return geojson.geometry && geojson.properties;
  }

  return false;
};

/**
 * Valida objeto de configuración de cluster
 */
export const isValidClusterConfig = config => {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Radio debe ser un número positivo
  if (config.radio !== undefined) {
    const radio = Number(config.radio);
    if (isNaN(radio) || radio <= 0) {
      return false;
    }
  }

  return true;
};

/**
 * Valida string no vacío
 */
export const isNonEmptyString = str => {
  return typeof str === 'string' && str.trim().length > 0;
};

/**
 * Valida número en rango
 */
export const isNumberInRange = (num, min, max) => {
  const n = Number(num);
  if (isNaN(n)) return false;
  return n >= min && n <= max;
};

export default {
  isValidCoordinate,
  isValidCoordinatesArray,
  isValidIncidencia,
  isValidCamara,
  isValidDate,
  isValidDateRange,
  isValidFiltro,
  isValidPuntoUsuario,
  isValidRouteParams,
  sanitizeCoordinates,
  filterValidIncidencias,
  filterValidCamaras,
  isValidGeoJSON,
  isValidClusterConfig,
  isNonEmptyString,
  isNumberInRange,
};
