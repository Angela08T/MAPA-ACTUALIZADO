/**
 * Convierte una fecha del formato DD/MM/YY (del endpoint) a un objeto Date
 * @param {string} fechaStr - Fecha en formato "DD/MM/YY" (ej: "11/6/25", "30/6/25")
 * @returns {Date|null} - Objeto Date o null si la fecha es inválida
 */
export const parseEndpointDate = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return null;
  
  // Formato esperado: DD/MM/YY
  const partes = fechaStr.trim().split('/');
  if (partes.length !== 3) return null;
  
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // Meses en Date son 0-based (0 = enero)
  let año = parseInt(partes[2], 10);
  
  // Convertir YY a YYYY
  // Asumimos que años 00-49 son 2000-2049, y 50-99 son 1950-1999
  if (año >= 0 && año <= 49) {
    año += 2000; // 25 -> 2025
  } else if (año >= 50 && año <= 99) {
    año += 1900; // 99 -> 1999
  }
  
  // Validar que los valores sean válidos
  if (isNaN(dia) || isNaN(mes) || isNaN(año)) return null;
  if (dia < 1 || dia > 31) return null;
  if (mes < 0 || mes > 11) return null;
  
  const fecha = new Date(año, mes, dia);
  
  // Verificar que la fecha creada sea válida
  if (fecha.getFullYear() !== año || fecha.getMonth() !== mes || fecha.getDate() !== dia) {
    return null;
  }
  
  return fecha;
};

/**
 * Convierte un objeto Date a formato DD/MM/YY (para el endpoint)
 * @param {Date} date - Objeto Date
 * @returns {string|null} - Fecha en formato "DD/MM/YY" o null si es inválida
 */
export const formatDateToEndpoint = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const año = (date.getFullYear() % 100).toString().padStart(2, '0');
  
  return `${dia}/${mes}/${año}`;
};

/**
 * Verifica si una fecha está dentro de un rango específico
 * @param {string} fechaStr - Fecha en formato DD/MM/YY del endpoint
 * @param {Date} fechaInicio - Fecha de inicio del rango
 * @param {Date} fechaFin - Fecha de fin del rango
 * @returns {boolean} - true si está dentro del rango, false en caso contrario
 */
export const isDateInRange = (fechaStr, fechaInicio, fechaFin) => {
  const fecha = parseEndpointDate(fechaStr);
  if (!fecha || !fechaInicio || !fechaFin) return false;
  
  // Comparar solo fechas (sin horas)
  const fechaSoloFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const inicioSoloFecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
  const finSoloFecha = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
  
  return fechaSoloFecha >= inicioSoloFecha && fechaSoloFecha <= finSoloFecha;
};

/**
 * Obtiene el nombre del mes en español
 * @param {number} mes - Número del mes (0-11)
 * @returns {string} - Nombre del mes en español
 */
export const getNombreMes = (mes) => {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return meses[mes] || '';
};

/**
 * Obtiene el nombre del día de la semana en español
 * @param {Date} fecha - Objeto Date
 * @returns {string} - Nombre del día en español
 */
export const getNombreDia = (fecha) => {
  if (!fecha || !(fecha instanceof Date)) return '';
  
  const dias = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ];
  return dias[fecha.getDay()] || '';
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param {string} fechaStr - Fecha en formato DD/MM/YY del endpoint
 * @returns {string} - Fecha formateada para mostrar (ej: "11 de junio de 2025")
 */
export const formatDateForDisplay = (fechaStr) => {
  const fecha = parseEndpointDate(fechaStr);
  if (!fecha) return fechaStr; // Retorna la fecha original si no se puede parsear
  
  const dia = fecha.getDate();
  const mes = getNombreMes(fecha.getMonth());
  const año = fecha.getFullYear();
  
  return `${dia} de ${mes} de ${año}`;
}; 