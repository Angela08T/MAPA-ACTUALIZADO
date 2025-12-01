/* eslint-disable no-console */
/**
 * Sistema de logging inteligente
 * Solo muestra logs en modo desarrollo
 * En producción, solo muestra errores críticos
 *
 * NOTA: console.log está permitido SOLO en este archivo
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Logs normales - solo en desarrollo
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Warnings - solo en desarrollo
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Errores - siempre se muestran (incluso en producción)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Debug con etiqueta - solo en desarrollo
   */
  debug: (tag, ...args) => {
    if (isDev) {
      console.log(`[${tag}]`, ...args);
    }
  },

  /**
   * Información - solo en desarrollo
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Tabla - solo en desarrollo
   */
  table: data => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Grupo de logs - solo en desarrollo
   */
  group: (label, fn) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
};

// Export default para imports más limpios
export default logger;
