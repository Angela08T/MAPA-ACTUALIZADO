import { useEffect, useState, useMemo } from 'react';
import { Circle, Popup } from 'react-leaflet';
import * as turf from '@turf/turf';
import { logger } from '../../utils/logger';

const Cluster_incidencias = ({ visible }) => {
  const [robosData, setRobosData] = useState([]);
  const [extorsionData, setExtorsionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de robos y extorsiones
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [robosRes, extorsionRes] = await Promise.all([
          fetch('/data/Robos.json'),
          fetch('/data/extorsion.json'),
        ]);

        const robos = await robosRes.json();
        const extorsiones = await extorsionRes.json();

        setRobosData(robos);
        setExtorsionData(extorsiones);
      } catch (error) {
        logger.error('Error cargando datos de incidencias:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      cargarDatos();
    }
  }, [visible]);

  // Función para determinar color según cantidad de incidencias
  const getColorByCount = count => {
    if (count >= 50) return '#8b0000'; // Rojo muy oscuro
    if (count >= 30) return '#dc143c'; // Rojo crimson
    if (count >= 20) return '#ff4500'; // Rojo naranja
    if (count >= 10) return '#ff6347'; // Tomate
    if (count >= 5) return '#ffa500'; // Naranja
    return '#ffd700'; // Dorado
  };

  // Función para determinar opacidad según cantidad
  const getOpacityByCount = count => {
    if (count >= 10) return 0.5;
    if (count >= 6) return 0.4;
    if (count >= 3) return 0.3;
    return 0.2;
  };

  // Función de validación de coordenadas reales
  const validarCoordenadasReales = cluster => {
    if (!cluster || !cluster.puntos || cluster.puntos.length === 0) {
      return false;
    }

    // Verificar que todos los puntos tengan coordenadas válidas
    return cluster.puntos.every(punto => {
      const coords = punto.geometry.coordinates;
      const props = punto.properties;
      return (
        coords &&
        coords.length === 2 &&
        !isNaN(coords[0]) &&
        !isNaN(coords[1]) &&
        props &&
        (props.tipo === 'robo' || props.tipo === 'extorsion') &&
        typeof props.lat === 'number' &&
        typeof props.lng === 'number'
      );
    });
  };

  // Función para calcular centro de masa de los puntos
  const calcularCentroMasa = puntos => {
    if (!puntos || puntos.length === 0) return null;

    if (puntos.length === 1) {
      const coords = puntos[0].geometry.coordinates;
      return turf.point(coords);
    }

    // Calcular centro de masa usando coordenadas ponderadas
    let sumaLng = 0;
    let sumaLat = 0;
    const totalPuntos = puntos.length;

    puntos.forEach(punto => {
      const [lng, lat] = punto.geometry.coordinates;
      sumaLng += lng;
      sumaLat += lat;
    });

    const centroMasaLng = sumaLng / totalPuntos;
    const centroMasaLat = sumaLat / totalPuntos;

    return turf.point([centroMasaLng, centroMasaLat]);
  };

  // Función para verificar que todas las coordenadas estén dentro del radio
  const verificarCobertura = (centroMasa, puntos, radio) => {
    if (!centroMasa || !puntos || puntos.length === 0) return false;

    const distancias = puntos.map(punto => {
      return turf.distance(centroMasa, punto, { units: 'meters' });
    });

    const distanciaMaxima = Math.max(...distancias);
    return distanciaMaxima <= radio;
  };

  // Algoritmo de clustering avanzado usando Turf.js
  const createAdvancedClusters = (incidencias, radiusKm = 0.2) => {
    if (incidencias.length === 0) return [];

    logger.log(`🔍 Iniciando clustering de ${incidencias.length} incidencias`);

    // Convertir incidencias a puntos Turf con validación
    const puntos = incidencias
      .filter(inc => !isNaN(inc.lat) && !isNaN(inc.lng) && inc.lat !== 0 && inc.lng !== 0)
      .map((inc, idx) =>
        turf.point(
          [inc.lng, inc.lat], // [longitude, latitude]
          {
            ...inc,
            originalIndex: idx,
            coordenadasOriginales: `${inc.lat}, ${inc.lng}`,
          }
        )
      );

    logger.log(`✅ ${puntos.length} puntos válidos después de filtrado`);

    const clusters = [];
    const visitados = new Set();

    puntos.forEach((punto, index) => {
      if (visitados.has(index)) return;

      // Crear un nuevo cluster comenzando con este punto
      const cluster = {
        puntos: [punto],
        indices: [index],
      };

      // Buscar todos los puntos dentro del radio especificado
      puntos.forEach((otroPunto, otroIndex) => {
        if (otroIndex === index || visitados.has(otroIndex)) return;

        const distancia = turf.distance(punto, otroPunto, { units: 'kilometers' });

        if (distancia <= radiusKm) {
          cluster.puntos.push(otroPunto);
          cluster.indices.push(otroIndex);
          visitados.add(otroIndex);
        }
      });

      // Validar que el cluster sea válido antes de agregarlo
      if (validarCoordenadasReales(cluster)) {
        visitados.add(index);
        clusters.push(cluster);
      } else {
        logger.warn(`❌ Cluster inválido descartado en índice ${index}`);
      }
    });

    logger.log(`🎯 ${clusters.length} clusters válidos creados`);
    return clusters.filter(cluster => cluster.puntos.length > 0);
  };

  // Procesar y agrupar incidencias usando useMemo para optimización
  const clusters = useMemo(() => {
    if (!visible || loading) {
      return [];
    }

    try {
      // Combinar y normalizar datos
      const incidenciasCombinadas = [
        ...robosData.map((item, index) => ({
          id: `robo-${index}`,
          tipo: 'robo',
          lat: parseFloat(item.Latitud),
          lng: parseFloat(item.Longitud),
          descripcion: item.Descripcion,
          fecha: item['Fecha de Incidencia'] || item.Fecha,
          jurisdiccion: item.Jurisdiccion,
          turno: item.Turno,
          año: item.Año,
        })),
        ...extorsionData.map((item, index) => ({
          id: `extorsion-${index}`,
          tipo: 'extorsion',
          lat: parseFloat(item.Latitud),
          lng: parseFloat(item.Longitud),
          descripcion: item.Descripcion,
          fecha: item.Fecha,
          jurisdiccion: item.Jurisdiccion,
          turno: item.Turno,
          año: item.Año,
        })),
      ].filter(item => !isNaN(item.lat) && !isNaN(item.lng));

      if (incidenciasCombinadas.length === 0) {
        return [];
      }

      // Crear clusters usando nuestro algoritmo avanzado
      const clustersRaw = createAdvancedClusters(incidenciasCombinadas, 0.2); // 200m

      // Procesar clusters para renderizado con validación estricta
      return clustersRaw
        .filter(clusterData => {
          // Validación 1: Verificar que el cluster tenga puntos válidos
          if (!clusterData || !clusterData.puntos || clusterData.puntos.length === 0) {
            logger.warn('❌ Cluster descartado: sin puntos');
            return false;
          }

          // Validación 2: Verificar que todos los puntos tengan coordenadas válidas
          const esValido = validarCoordenadasReales(clusterData);
          if (!esValido) {
            logger.warn('❌ Cluster descartado: coordenadas inválidas');
            return false;
          }

          return true;
        })
        .map((clusterData, index) => {
          const incidenciasDelCluster = clusterData.puntos.map(punto => punto.properties);
          const cantidadIncidencias = incidenciasDelCluster.length;

          // Calcular el centro de masa real de todas las coordenadas
          const centroMasa = calcularCentroMasa(clusterData.puntos);

          if (!centroMasa) {
            logger.error('❌ Error calculando centro de masa');
            return null;
          }

          const [centroLng, centroLat] = centroMasa.geometry.coordinates;

          // Calcular el radio que garantice que todos los puntos estén dentro
          let radioCalculado = 5; // Radio mínimo en metros

          if (cantidadIncidencias > 1) {
            // Calcular la distancia máxima desde el centro de masa a cualquier punto
            const distancias = clusterData.puntos.map(punto => {
              return turf.distance(centroMasa, punto, { units: 'meters' });
            });

            const distanciaMaxima = Math.max(...distancias);
            // Añadir un margen de seguridad del 30% para garantizar cobertura visual completa
            radioCalculado = Math.max(distanciaMaxima * 1.3, 5);
            // Limitar el radio máximo
            radioCalculado = Math.min(radioCalculado, 100);
          }

          // Validación 3: Verificar que el radio calculado cubra todos los puntos
          const coberturaCompleta = verificarCobertura(
            centroMasa,
            clusterData.puntos,
            radioCalculado
          );
          if (!coberturaCompleta) {
            logger.warn(`⚠️ Cluster ${index}: Cobertura incompleta, ajustando radio`);
            // Recalcular con margen mayor si es necesario
            const distancias = clusterData.puntos.map(punto =>
              turf.distance(centroMasa, punto, { units: 'meters' })
            );
            radioCalculado = Math.max(...distancias) * 1.5; // 50% extra de margen
          }

          // Información adicional para validación
          const boundingBox = turf.bbox(turf.featureCollection(clusterData.puntos));
          const area = turf.area(turf.bboxPolygon(boundingBox));

          // Validación 4: Contar coordenadas reales de robos y extorsiones
          const coordenadasRobos = incidenciasDelCluster.filter(inc => inc.tipo === 'robo').length;
          const coordenadasExtorsiones = incidenciasDelCluster.filter(
            inc => inc.tipo === 'extorsion'
          ).length;

          const clusterValidado = {
            id: `cluster-validated-${index}`,
            center: [centroLat, centroLng],
            radius: radioCalculado,
            count: cantidadIncidencias,
            incidencias: incidenciasDelCluster,
            color: getColorByCount(cantidadIncidencias),
            opacity: getOpacityByCount(cantidadIncidencias),
            isCluster: cantidadIncidencias > 1,
            // Información de validación detallada
            boundingBox: boundingBox,
            area: area,
            maxDistanceFromCenter:
              cantidadIncidencias > 1
                ? Math.max(
                    ...clusterData.puntos.map(punto =>
                      turf.distance(centroMasa, punto, { units: 'meters' })
                    )
                  )
                : 0,
            // Lista de coordenadas para verificación
            coordinates: clusterData.puntos.map(punto => punto.geometry.coordinates),
            // Información de validación específica
            coordenadasRobos: coordenadasRobos,
            coordenadasExtorsiones: coordenadasExtorsiones,
            coordenadasTotales: coordenadasRobos + coordenadasExtorsiones,
            centroMasaCalculado: true,
            coberturaVerificada: coberturaCompleta,
            // Coordenadas originales para debugging
            coordenadasOriginales: clusterData.puntos.map(
              punto => punto.properties.coordenadasOriginales
            ),
          };

          logger.log(
            `✅ Cluster ${index} validado: ${coordenadasRobos} robos + ${coordenadasExtorsiones} extorsiones = ${cantidadIncidencias} total`
          );

          return clusterValidado;
        })
        .filter(cluster => cluster !== null); // Eliminar clusters nulos después del procesamiento
    } catch (error) {
      logger.error('Error procesando clusters:', error);
      return [];
    }
  }, [robosData, extorsionData, visible, loading]);

  // Generar contenido del popup para clusters
  const generatePopupContent = cluster => {
    const { count, incidencias, isCluster } = cluster;

    if (!isCluster) {
      // Popup para punto individual
      const inc = incidencias[0];
      return `
        <div style="font-family: Arial, sans-serif; min-width: 250px;">
          <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">
            ${inc.tipo === 'robo' ? '🦹 Robo Individual' : '📞 Extorsión Individual'}
          </h3>
          <div style="margin-bottom: 8px;">
            <strong>Jurisdicción:</strong> ${inc.jurisdiccion || 'N/A'}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Fecha:</strong> ${inc.fecha || 'N/A'}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Turno:</strong> ${inc.turno || 'N/A'}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Coordenadas:</strong> ${inc.lat.toFixed(6)}, ${inc.lng.toFixed(6)}
          </div>
          <div style="font-size: 12px; color: #7f8c8d; margin-top: 10px;">
            ${inc.descripcion ? inc.descripcion.substring(0, 150) + '...' : 'Sin descripción'}
          </div>
        </div>
      `;
    }

    // Popup para cluster
    const roboCount = incidencias.filter(inc => inc.tipo === 'robo').length;
    const extorsionCount = incidencias.filter(inc => inc.tipo === 'extorsion').length;

    // Obtener jurisdicciones únicas
    const jurisdicciones = [...new Set(incidencias.map(inc => inc.jurisdiccion).filter(Boolean))];

    // Obtener años únicos
    const años = [...new Set(incidencias.map(inc => inc.año).filter(Boolean))].sort();

    return `
      <div style="font-family: Arial, sans-serif; min-width: 280px;">
        <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">
          🎯 Cluster Verificado de Incidencias
        </h3>
        <div style="margin-bottom: 8px;">
          <strong>Total de incidencias:</strong> ${count}
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #e74c3c;">🦹 Robos: ${roboCount}</span><br/>
          <span style="color: #f39c12;">📞 Extorsiones: ${extorsionCount}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Jurisdicciones:</strong><br/>
          ${jurisdicciones
            .slice(0, 3)
            .map(j => `• ${j}`)
            .join('<br/>')}
          ${jurisdicciones.length > 3 ? '<br/>• Y más...' : ''}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Años:</strong> ${años.join(', ')}
        </div>
                 <div style="font-size: 11px; color: #27ae60; margin-top: 10px; background: #f0fff0; padding: 5px; border-radius: 3px;">
           ✅ <strong>Validación Completa:</strong><br/>
           • Radio de cobertura: ${Math.round(cluster.radius)}m<br/>
           • Distancia máxima real: ${Math.round(cluster.maxDistanceFromCenter)}m<br/>
           • Centro de masa calculado: ${cluster.centroMasaCalculado ? 'Sí' : 'No'}<br/>
           • Cobertura verificada: ${cluster.coberturaVerificada ? 'Completa' : 'Parcial'}<br/>
           • Coordenadas de robos: ${cluster.coordenadasRobos}<br/>
           • Coordenadas de extorsiones: ${cluster.coordenadasExtorsiones}<br/>
           • Total verificado: ${cluster.coordenadasTotales} incidencias reales
         </div>
      </div>
    `;
  };

  if (!visible || loading) {
    return null;
  }

  return (
    <>
      {clusters.map(cluster => (
        <Circle
          key={cluster.id}
          center={cluster.center}
          radius={cluster.radius}
          pathOptions={{
            color: cluster.color,
            fillColor: cluster.color,
            fillOpacity: cluster.opacity,
            weight: cluster.isCluster ? 3 : 2,
            opacity: 0.8,
            dashArray: cluster.isCluster ? null : '5, 5', // Línea punteada para puntos individuales
          }}
        >
          <Popup maxWidth={350}>
            <div
              dangerouslySetInnerHTML={{
                __html: generatePopupContent(cluster),
              }}
            />
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default Cluster_incidencias;
