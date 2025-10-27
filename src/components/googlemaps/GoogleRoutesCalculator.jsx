import React, { useState, useEffect, useCallback } from 'react';

const GoogleRoutesCalculator = ({
  visible,
  map,
  google,
  onRouteCalculated,
  onClearRoute,
  includeTraffic = true,
  optimizeWaypoints = true
}) => {
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // Inicializar servicios de Google Maps
  useEffect(() => {
    // Si no está visible o no hay map/google, limpiar todo
    if (!visible || !map || !google) {
      if (directionsRenderer) {
        try {
          directionsRenderer.setDirections({ routes: [] });
          directionsRenderer.setMap(null);
        } catch (error) {
          console.warn('Error limpiando DirectionsRenderer:', error);
        }
      }
      setDirectionsService(null);
      setDirectionsRenderer(null);
      return;
    }

    // Solo crear nuevos servicios si no existen ya
    if (!directionsService || !directionsRenderer) {
      try {
        const service = new google.maps.DirectionsService();
        const renderer = new google.maps.DirectionsRenderer({
          draggable: true,
          panel: null,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 6
          }
        });

        renderer.setMap(map);
        setDirectionsService(service);
        setDirectionsRenderer(renderer);

        // Listener para cuando el usuario arrastra la ruta
        const dragListener = renderer.addListener('directions_changed', () => {
          const directions = renderer.getDirections();
          console.log('🔄 Ruta cambiada por arrastre, recalculando...');
          updateRouteInfo(directions);
        });

        // Cleanup al desmontar
        return () => {
          try {
            if (renderer) {
              renderer.setDirections({ routes: [] });
              renderer.setMap(null);
            }
            if (dragListener) {
              google.maps.event.removeListener(dragListener);
            }
          } catch (error) {
            console.warn('Error en cleanup de DirectionsRenderer:', error);
          }
        };
      } catch (error) {
        console.error('Error inicializando servicios de Google Maps:', error);
      }
    }
  }, [map, google, visible, directionsService, directionsRenderer]);

  // Limpiar estados cuando la capa no es visible
  useEffect(() => {
    if (!visible) {
      setWaypoints([]);
      setOrigin(null);
      setDestination(null);
      setRouteInfo(null);
      setError(null);
      
      // Notificar al componente padre que la ruta se ha limpiado
      if (onRouteCalculated) {
        onRouteCalculated(null);
      }
    }
  }, [visible, onRouteCalculated]);

  // Función interna para limpiar ruta (sin dependencias externas)
  const handleClearRouteEvent = useCallback(() => {
    if (visible && directionsRenderer) {
      try {
        // Limpiar estados
        setOrigin(null);
        setDestination(null);
        setWaypoints([]);
        setRouteInfo(null);
        setError(null);

        // Limpiar ruta del renderer
        directionsRenderer.setDirections({ routes: [] });

        // Notificar callbacks
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }

        if (onClearRoute) {
          onClearRoute();
        }
      } catch (error) {
        console.warn('Error limpiando ruta:', error);
      }
    }
  }, [visible, directionsRenderer, onRouteCalculated, onClearRoute]);

  // Escuchar evento de limpiar ruta
  useEffect(() => {
    window.addEventListener('clearRoute', handleClearRouteEvent);

    return () => {
      window.removeEventListener('clearRoute', handleClearRouteEvent);
    };
  }, [handleClearRouteEvent]);

  // Manejar clics en el mapa
  useEffect(() => {
    if (!map || !visible) return;

    const handleMapClick = (event) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      if (!origin) {
        // Primer clic: establecer origen
        console.log('🎯 ESTABLECIENDO ORIGEN:', clickedLocation);
        setOrigin(clickedLocation);
        setError(null);
      } else if (!destination) {
        // Segundo clic: establecer destino y calcular ruta
        console.log('🏁 ESTABLECIENDO DESTINO:', clickedLocation);
        setDestination(clickedLocation);
        calculateRoute(origin, clickedLocation, waypoints);
      } else {
        // Clics adicionales: agregar waypoints
        const newWaypoints = [...waypoints, { location: clickedLocation, stopover: true }];
        console.log('📍 AGREGANDO WAYPOINT:', {
          newWaypoint: clickedLocation,
          totalWaypoints: newWaypoints.length,
          allWaypoints: newWaypoints
        });
        setWaypoints(newWaypoints);
        calculateRoute(origin, destination, newWaypoints);
      }
    };

    const clickListener = map.addListener('click', handleMapClick);

    return () => {
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
    };
  }, [map, visible, origin, destination, waypoints, google]);

  // Función para calcular la ruta
  const calculateRoute = useCallback((start, end, waypointsArray = []) => {
    if (!directionsService || !directionsRenderer || !start || !end || !visible) {
      console.warn('Cálculo de ruta cancelado: servicios no disponibles o componente no visible');
      return;
    }

    setLoading(true);
    setError(null);

    const request = {
      origin: start,
      destination: end,
      waypoints: waypointsArray,
      optimizeWaypoints: optimizeWaypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS
      },
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    // Incluir condiciones de tráfico si está habilitado
    if (includeTraffic) {
      request.drivingOptions = {
        ...request.drivingOptions,
        trafficModel: google.maps.TrafficModel.BEST_GUESS
      };
    }

    console.log('🚀 ENVIANDO SOLICITUD A GOOGLE DIRECTIONS:', {
      origin: start,
      destination: end,
      waypoints: waypointsArray,
      waypointsCount: waypointsArray.length
    });

    directionsService.route(request, (result, status) => {
      setLoading(false);

      if (status === 'OK') {
        console.log('✅ RESPUESTA EXITOSA DE GOOGLE DIRECTIONS');
        console.log('Ruta recibida:', result.routes[0]);
        console.log('Número de legs en respuesta:', result.routes[0].legs.length);
        
        directionsRenderer.setDirections(result);
        updateRouteInfo(result);
      } else {
        const errorMessage = getErrorMessage(status);
        setError(errorMessage);
        console.error('❌ Error al calcular la ruta:', status, errorMessage);
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
      }
    });
  }, [directionsService, directionsRenderer, google, includeTraffic, optimizeWaypoints, onRouteCalculated]);

  // Actualizar información de la ruta
  const updateRouteInfo = useCallback((directions) => {
    if (!directions || !directions.routes || directions.routes.length === 0) return;

    const route = directions.routes[0];

    // Calcular totales para todas las etapas (legs)
    let totalDistance = 0;
    let totalDuration = 0;
    let totalDurationInTraffic = 0;

    console.log('🔍 ANÁLISIS COMPLETO DE RUTA:');
    console.log('Total de tramos (legs):', route.legs.length);
    console.log('Waypoints en estado:', waypoints.length);

    // Procesar cada tramo de la ruta
    route.legs.forEach((leg, index) => {
      const legDistance = leg.distance.value;
      const legDuration = leg.duration.value;
      const legTrafficDuration = leg.duration_in_traffic?.value || 0;

      console.log(`📍 TRAMO ${index + 1}:`);
      console.log(`  - Distancia: ${leg.distance.text} (${legDistance} metros)`);
      console.log(`  - Duración: ${leg.duration.text} (${legDuration} segundos)`);
      console.log(`  - Con tráfico: ${leg.duration_in_traffic?.text || 'N/A'} (${legTrafficDuration} segundos)`);
      
      // Sumar a los totales
      totalDistance += legDistance;
      totalDuration += legDuration;
      if (legTrafficDuration > 0) {
        totalDurationInTraffic += legTrafficDuration;
      }
    });

    // Mostrar totales calculados
    console.log('📊 TOTALES FINALES:');
    console.log(`  - Distancia total: ${(totalDistance / 1000).toFixed(2)} km`);
    console.log(`  - Tiempo total: ${Math.round(totalDuration / 60)} min`);
    console.log(`  - Tiempo con tráfico: ${totalDurationInTraffic > 0 ? Math.round(totalDurationInTraffic / 60) + ' min' : 'N/A'}`);
    console.log(`  - Waypoints: ${waypoints.length}`);

    const info = {
      distance: {
        text: `${(totalDistance / 1000).toFixed(2)} km`,
        value: totalDistance
      },
      duration: {
        text: `${Math.round(totalDuration / 60)} min`,
        value: totalDuration
      },
      durationInTraffic: totalDurationInTraffic > 0 ? {
        text: `${Math.round(totalDurationInTraffic / 60)} min`,
        value: totalDurationInTraffic
      } : null,
      waypointsCount: waypoints.length,
      totalStops: waypoints.length + 2,
      waypoints: route.waypoint_order || [],
      optimizedOrder: optimizeWaypoints ? route.waypoint_order : null,
      overview_polyline: route.overview_polyline,
      bounds: route.bounds,
      legs: route.legs
    };

    console.log('📤 INFO ENVIADA AL PANEL:', info);

    setRouteInfo(info);

    if (onRouteCalculated) {
      onRouteCalculated(info);
    }
  }, [onRouteCalculated, optimizeWaypoints, waypoints]);

  // Obtener mensaje de error legible
  const getErrorMessage = (status) => {
    const errorMessages = {
      'NOT_FOUND': 'No se pudo encontrar una ruta entre los puntos especificados',
      'ZERO_RESULTS': 'No se encontraron rutas entre el origen y destino',
      'MAX_WAYPOINTS_EXCEEDED': 'Demasiados puntos de ruta (máximo 25)',
      'MAX_ROUTE_LENGTH_EXCEEDED': 'La ruta solicitada es demasiado larga',
      'INVALID_REQUEST': 'Solicitud inválida',
      'OVER_DAILY_LIMIT': 'Se ha excedido el límite diario de la API',
      'OVER_QUERY_LIMIT': 'Se ha excedido el límite de consultas',
      'REQUEST_DENIED': 'Solicitud denegada',
      'UNKNOWN_ERROR': 'Error desconocido del servidor'
    };

    return errorMessages[status] || `Error desconocido: ${status}`;
  };

  // Función para limpiar la ruta (reutiliza la función interna)
  const clearRoute = useCallback(() => {
    handleClearRouteEvent();
  }, [handleClearRouteEvent]);

  // Función para recalcular con configuraciones diferentes
  const recalculateRoute = useCallback((options = {}) => {
    if (origin && destination) {
      const newIncludeTraffic = options.includeTraffic !== undefined ? options.includeTraffic : includeTraffic;
      const newOptimizeWaypoints = options.optimizeWaypoints !== undefined ? options.optimizeWaypoints : optimizeWaypoints;

      // Actualizar configuraciones si se proporcionan
      if (options.includeTraffic !== undefined) {
        // Esta función se puede llamar desde el componente padre para cambiar configuraciones
      }

      calculateRoute(origin, destination, waypoints);
    }
  }, [origin, destination, waypoints, calculateRoute, includeTraffic, optimizeWaypoints]);

  // Modificar el renderizado para mostrar más información de depuración
  if (!visible || !map || !google) return null;

  return (
    <>
      {/* Mostrar información de depuración si hay problemas */}
      {(!map || !google) && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(234, 67, 53, 0.95)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 4000,
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px',
            textAlign: 'center'
          }}
        >
          ⚠️ Error de inicialización:
          <br />
          {!map && 'Mapa no proporcionado '}
          {!google && 'Objeto Google no proporcionado'}
        </div>
      )}

      {loading && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(66, 133, 244, 0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          <div style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Calculando...
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(234, 67, 53, 0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 4000,
            fontSize: '12px',
            fontWeight: '500',
            maxWidth: '200px'
          }}
        >
          ⚠️ Error en ruta
        </div>
      )}

      {/* Instrucciones */}
      {visible && !origin && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          🖱️ Haz clic en el mapa para establecer el punto de origen
        </div>
      )}

      {visible && origin && !destination && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          🎯 Haz clic en el mapa para establecer el destino
        </div>
      )}

      {visible && origin && destination && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          ➕ Haz clic para agregar paradas intermedias (waypoints)
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default GoogleRoutesCalculator;