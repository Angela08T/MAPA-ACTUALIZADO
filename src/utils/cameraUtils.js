/**
 * Utilidades para manejo de cámaras y campos de visión
 */

/**
 * Calcula el ángulo entre dos coordenadas geográficas
 * @param {number} lat1 - Latitud de la cámara
 * @param {number} lng1 - Longitud de la cámara
 * @param {number} lat2 - Latitud de referencia (hacia donde mira)
 * @param {number} lng2 - Longitud de referencia (hacia donde mira)
 * @returns {number} - Ángulo en grados (0-360)
 */
export function getAngleFromCoords(lat1, lng1, lat2, lng2) {
  // Convertir de grados a radianes
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  // Calcular el ángulo usando la fórmula de bearing
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let brng = Math.atan2(y, x);

  // Convertir de radianes a grados
  brng = brng * 180 / Math.PI;

  // Normalizar el ángulo para que esté entre 0 y 360
  brng = (brng + 360) % 360;

  return brng;
}

/**
 * Verifica si las coordenadas de referencia son válidas
 * @param {string} referencia - String con formato "lat,lng"
 * @returns {boolean}
 */
export function isValidReferencia(referencia) {
  if (!referencia || typeof referencia !== 'string') {
    return false;
  }

  const parts = referencia.split(',');
  if (parts.length !== 2) {
    return false;
  }

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  return !isNaN(lat) && !isNaN(lng);
}

/**
 * Parsea las coordenadas de referencia de un string
 * @param {string} referencia - String con formato "lat,lng"
 * @returns {[number, number]} - Array con [lat, lng]
 */
export function parseReferencia(referencia) {
  const parts = referencia.split(',').map(s => parseFloat(s.trim()));
  return [parts[0], parts[1]];
}
