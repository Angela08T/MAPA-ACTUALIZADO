import React, { useState, useEffect, useRef } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { logger } from '../../../utils';

// Función para calcular distancia entre dos puntos en metros usando fórmula de Haversine
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Función para calcular el centroide de un conjunto de puntos
const calcularCentroide = puntos => {
  if (puntos.length === 0) return { lat: 0, lng: 0 };

  const sumLat = puntos.reduce((sum, punto) => sum + punto.Latitud, 0);
  const sumLng = puntos.reduce((sum, punto) => sum + punto.Longitud, 0);

  return {
    lat: sumLat / puntos.length,
    lng: sumLng / puntos.length,
  };
};

// Función para calcular el radio del cluster basado en la dispersión de puntos
const calcularRadioCluster = (puntos, centroide) => {
  if (puntos.length === 0) return 50;

  const distanciasAlCentroide = puntos.map(punto =>
    calcularDistancia(centroide.lat, centroide.lng, punto.Latitud, punto.Longitud)
  );

  const maxDistancia = Math.max(...distanciasAlCentroide);
  // Añadir un pequeño buffer para asegurar que todos los puntos estén dentro
  return Math.max(maxDistancia + 10, 30); // Mínimo 30 metros
};

// Algoritmo de clustering basado en densidad (DBSCAN mejorado)
const realizarClustering = (puntos, radioMaximo = 50) => {
  logger.debug('CLUSTERING', '🔧 Iniciando algoritmo de clustering...', {
    puntos: puntos.length,
    radio: radioMaximo,
  });
  const clusters = [];
  const visitados = new Set();

  for (let i = 0; i < puntos.length; i++) {
    if (visitados.has(i)) continue;

    const puntoActual = puntos[i];
    const cluster = [puntoActual];
    visitados.add(i);

    // Buscar todos los puntos cercanos al punto actual
    const cola = [i];

    while (cola.length > 0) {
      const indiceActual = cola.shift();
      const puntoBase = puntos[indiceActual];

      // Buscar vecinos del punto base
      for (let j = 0; j < puntos.length; j++) {
        if (visitados.has(j)) continue;

        const distancia = calcularDistancia(
          puntoBase.Latitud,
          puntoBase.Longitud,
          puntos[j].Latitud,
          puntos[j].Longitud
        );

        if (distancia <= radioMaximo) {
          cluster.push(puntos[j]);
          visitados.add(j);
          cola.push(j); // Agregar a la cola para expandir desde este punto
        }
      }
    }

    // Solo crear cluster si tiene al menos 2 puntos
    if (cluster.length >= 2) {
      const centroide = calcularCentroide(cluster);
      const radio = calcularRadioCluster(cluster, centroide);

      clusters.push({
        id: clusters.length + 1,
        puntos: cluster,
        centroide,
        radio,
        cantidad: cluster.length,
      });

      logger.debug('CLUSTERING', `📍 Cluster ${clusters.length} creado:`, {
        puntos: cluster.length,
        centroide: `${centroide.lat.toFixed(6)}, ${centroide.lng.toFixed(6)}`,
        radio: Math.round(radio),
      });
    }
  }

  logger.log('🎯 Clustering completado:', clusters.length, 'clusters creados');
  return clusters;
};

// Función para determinar el tipo de incidencia basado en la descripción
const determinarTipo = descripcion => {
  const desc = (descripcion || '').toLowerCase();
  const esExtorsion =
    desc.includes('extorsion') ||
    desc.includes('extorsionado') ||
    desc.includes('extorsionadores') ||
    desc.includes('explosivo') ||
    desc.includes('amenaza');
  return esExtorsion ? 'Extorsion' : 'Robo';
};

// Función para obtener color según la cantidad de incidencias
const obtenerColorCluster = cantidad => {
  if (cantidad <= 3) {
    return {
      color: '#FFB000', // Amarillo más intenso
      fillColor: '#FFD700',
      fillOpacity: 0.3,
    };
  } else if (cantidad <= 6) {
    return {
      color: '#FF6600', // Naranja más intenso
      fillColor: '#FF8C00',
      fillOpacity: 0.4,
    };
  } else if (cantidad >= 7) {
    return {
      color: '#CC0000', // Rojo más intenso
      fillColor: '#FF4500',
      fillOpacity: 0.5,
    };
  } else {
    return {
      color: '#FFB000', // Amarillo más intenso
      fillColor: '#FFD700',
      fillOpacity: 0.3,
    };
  }
};

const ClusterIncidencias = ({ visible, radioCluster = 50, filtros = null }) => {
  const [loading, setLoading] = useState(false);
  const map = useMap();
  const circlesRef = useRef([]);

  // Función para limpiar círculos existentes
  const limpiarCirculos = () => {
    circlesRef.current.forEach(circle => {
      if (map.hasLayer(circle)) {
        map.removeLayer(circle);
      }
    });
    circlesRef.current = [];
  };

  // Función para crear círculos usando L.circle
  const crearCirculosCluster = clustersData => {
    limpiarCirculos();

    clustersData.forEach(cluster => {
      const colores = obtenerColorCluster(cluster.cantidad);

      // Crear el círculo usando L.circle directamente
      const circle = L.circle([cluster.centroide.lat, cluster.centroide.lng], {
        radius: cluster.radio, // Radio en metros (no en píxeles)
        color: colores.color,
        fillColor: colores.fillColor,
        fillOpacity: colores.fillOpacity,
        weight: 3,
        opacity: 1,
        dashArray: '8,4',
      });

      // Agregar popup al círculo
      const popupContent = `
        <div style="font-size: 13px; max-width: 260px;">
          <strong>🎯 Cluster de Incidencias</strong><br/>
          <strong>ID:</strong> ${cluster.id}<br/>
          <strong>Cantidad:</strong> ${cluster.cantidad} incidencias<br/>
          <strong>Radio:</strong> ${Math.round(cluster.radio)} metros<br/>
          <strong>Centroide:</strong><br/>
          Lat: ${cluster.centroide.lat.toFixed(6)}<br/>
          Lng: ${cluster.centroide.lng.toFixed(6)}<br/>
          <strong>Tipos de incidencias:</strong><br/>
          ${Object.entries(
            cluster.puntos.reduce((tipos, punto) => {
              tipos[punto.Tipo] = (tipos[punto.Tipo] || 0) + 1;
              return tipos;
            }, {})
          )
            .map(([tipo, cantidad]) => `${tipo}: ${cantidad}`)
            .join(' | ')}
        </div>
      `;

      circle.bindPopup(popupContent);

      // Agregar tooltip al círculo
      const tooltipContent = `
        <div style="font-size: 12px; font-weight: bold; text-align: center;">
          <div>🎯 Cluster ${cluster.id}</div>
          <div>${cluster.cantidad} incidencias</div>
          <div>${Math.round(cluster.radio)}m radio</div>
        </div>
      `;

      circle.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.9,
      });

      // Agregar el círculo al mapa
      circle.addTo(map);

      // Guardar referencia para poder limpiarlo después
      circlesRef.current.push(circle);
    });
  };

  // Limpiar círculos cuando el componente se desmonte o la visibilidad cambie
  useEffect(() => {
    if (!visible) {
      limpiarCirculos();
      return;
    }
  }, [visible]);

  // Limpiar círculos al desmontar el componente
  useEffect(() => {
    return () => {
      limpiarCirculos();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);

    // Cargar datos del archivo Robo_extorsion.json (mismo que usan CapaRobos y CapaExtorsion)
    fetch('/data/Robo_extorsion.json')
      .then(response => {
        logger.log('📡 Respuesta recibida:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(rawData => {
        // Validar que los datos tengan la estructura correcta
        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error('Los datos no tienen el formato esperado o están vacíos');
        }

        // Función helper para convertir fecha del JSON a Date
        const parseJsonDate = fechaStr => {
          if (!fechaStr) return null;
          // Formato: "1/1/25" (M/D/YY)
          const partes = fechaStr.split('/');
          if (partes.length !== 3) return null;

          const mes = parseInt(partes[0]) - 1; // Meses en Date son 0-based
          const dia = parseInt(partes[1]);
          let año = parseInt(partes[2]);

          // Convertir YY a YYYY (asumiendo que 25 = 2025, etc.)
          if (año < 50) {
            año += 2000; // 25 -> 2025
          } else {
            año += 1900; // 99 -> 1999
          }

          return new Date(año, mes, dia);
        };

        // Aplicar filtros si existen
        let datosFiltrados = rawData;
        if (filtros && Object.keys(filtros).length > 0) {
          // Filtro por rango de fechas
          if (filtros.fechaInicio && filtros.fechaFin) {
            const fechaInicio = new Date(filtros.fechaInicio);
            const fechaFin = new Date(filtros.fechaFin);

            datosFiltrados = datosFiltrados.filter(item => {
              const fechaIncidencia = parseJsonDate(item['Fecha']);
              if (!fechaIncidencia) return false;

              return fechaIncidencia >= fechaInicio && fechaIncidencia <= fechaFin;
            });
          }

          // Otros filtros (Turno, Horario, Jurisdiccion)
          datosFiltrados = datosFiltrados.filter(item => {
            return Object.entries(filtros).every(([campo, valor]) => {
              if (!valor || valor.trim() === '' || campo === 'fechaInicio' || campo === 'fechaFin')
                return true;

              const valorItem = (item[campo] || '').toString().toLowerCase().trim();
              const valorFiltro = valor.toString().toLowerCase().trim();

              return valorItem.includes(valorFiltro);
            });
          });
        }

        // Convertir datos al formato esperado por el algoritmo de clustering
        // Solo incluir registros con coordenadas válidas
        const data = datosFiltrados
          .filter(item => {
            const lat = parseFloat(item.Latitud);
            const lng = parseFloat(item.Longitud);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((item, index) => ({
            Id: item.id || index + 1,
            Latitud: parseFloat(item.Latitud),
            Longitud: parseFloat(item.Longitud),
            Tipo: item.Tipo || determinarTipo(item.Descripcion),
          }));

        // Realizar clustering
        const clustersGenerados = realizarClustering(data, radioCluster);

        // Crear círculos usando L.circle
        crearCirculosCluster(clustersGenerados);

        // Dispatch evento con estadísticas
        const puntosClusteados = clustersGenerados.reduce(
          (sum, cluster) => sum + cluster.cantidad,
          0
        );
        const estadisticas = {
          totalClusters: clustersGenerados.length,
          totalPuntos: data.length,
          puntosClusteados: puntosClusteados,
        };

        window.dispatchEvent(
          new CustomEvent('clustersGenerados', {
            detail: estadisticas,
          })
        );
      })
      .catch(error => {
        logger.error('❌ Error cargando datos para clustering:', error);
        logger.error('Detalles del error:', error.message);
        // Limpiar clusters y círculos en caso de error
        limpiarCirculos();
        window.dispatchEvent(
          new CustomEvent('clustersGenerados', {
            detail: {
              totalClusters: 0,
              totalPuntos: 0,
              puntosClusteados: 0,
            },
          })
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [visible, radioCluster, filtros]);

  if (!visible) return null;

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '14px 24px',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Segoe UI, sans-serif',
            border: '1px solid rgba(200, 200, 200, 0.6)',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #3498db',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <span
            style={{
              marginLeft: 12,
              fontSize: '15px',
              fontWeight: '500',
              color: '#2c3e50',
            }}
          >
            Generando clusters...
          </span>
        </div>
      )}

      {/* LayerGroup vacío - los círculos se manejan imperativamente */}
      <LayerGroup>
        {/* Los círculos se crean directamente con L.circle y se agregan al mapa */}
      </LayerGroup>
    </>
  );
};

// Optimizar con React.memo para evitar re-renders innecesarios
export default React.memo(ClusterIncidencias);
