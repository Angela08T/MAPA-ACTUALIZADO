import { useEffect, useState, useRef } from 'react';
import './GoogleCapaUbicadorPunto.css';

const GoogleCapaUbicadorPunto = ({ visible, map, google }) => {
  const [marker, setMarker] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const clickListenerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const currentMarkerRef = useRef(null);

  // Función para obtener dirección mediante geocodificación inversa de Google
  const obtenerDireccion = async (lat, lng) => {
    if (!google || !google.maps) return 'Servicio de geocodificación no disponible';

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              reject(new Error(`Geocoding falló: ${status}`));
            }
          }
        );
      });

      if (response && response[0]) {
        return response[0].formatted_address;
      } else {
        return 'Dirección no encontrada';
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return 'Error al obtener dirección';
    }
  };

  // Función para deshabilitar/habilitar listener de click
  const toggleClickListener = (habilitar) => {
    if (!map || !google) return;
    
    if (habilitar) {
      // Rehabilitar listener si no existe
      if (!clickListenerRef.current) {
        const handleMapClick = (e) => {
          console.log('🎯 Click detectado en ubicador Google Maps:', { isActive, visible });
          
          if (!isActive || !visible) {
            console.log('🚫 Ubicador no está activo en Google Maps, ignorando click');
            return;
          }
          
          // Prevenir propagación en Google Maps
          e.stop();
          
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          console.log(`📍 Punto ubicado en Google Maps: ${lat}, ${lng}`);
          crearMarcador(lat, lng);
        };
        
        clickListenerRef.current = map.addListener('click', handleMapClick);
      }
      // Restaurar cursor crosshair
      map.setOptions({ 
        draggableCursor: 'crosshair',
        draggingCursor: 'crosshair'
      });
      console.log('📍 Listener rehabilitado - cursor crosshair');
    } else {
      // Deshabilitar listener
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      // Restaurar cursor normal
      map.setOptions({ 
        draggableCursor: null,
        draggingCursor: null
      });
      console.log('📍 Listener deshabilitado - cursor normal');
    }
  };

  // Función para limpiar marcador existente
  const limpiarMarcador = () => {
    console.log('🧹 Limpiando marcador anterior:', { 
      marker: !!marker, 
      currentMarkerRef: !!currentMarkerRef.current, 
      infoWindow: !!infoWindowRef.current 
    });
    
    // Cerrar InfoWindow si existe
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
      console.log('✅ InfoWindow cerrado y limpiado');
    }
    
    // Limpiar marcador usando la referencia más reciente
    const markerToRemove = currentMarkerRef.current || marker;
    if (markerToRemove && markerToRemove.setMap) {
      markerToRemove.setMap(null);
      console.log('✅ Marcador anterior eliminado del mapa');
      setMarker(null);
      currentMarkerRef.current = null;
    } else {
      console.log('⚠️ No hay marcador para limpiar');
    }
    
    // Limpiar función global
    if (window.cerrarInfoWindowUbicador) {
      delete window.cerrarInfoWindowUbicador;
    }
    
    // Rehabilitar listener si está activo
    if (isActive) {
      toggleClickListener(true);
    }
  };

  // Función para crear marcador con información
  const crearMarcador = async (lat, lng) => {
    if (!map || !google) return;

    console.log('🎯 Creando nuevo marcador en:', { lat, lng });

    // Limpiar marcador anterior (solo mantener uno a la vez)
    limpiarMarcador();

    // Deshabilitar listener mientras hay InfoWindow abierto
    toggleClickListener(false);

    // Crear marcador
    const newMarker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: `Punto ubicado: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      icon: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj4KICA8IS0tIFBpbiBwcmluY2lwYWwgLS0+CiAgPHBhdGggZD0iTTE2IDRjLTQuNCAwLTggMy42LTggOCAwIDQuNCA2LjIgMTIuOCA3LjIgMTQuMS40LjUgMS4yLjUgMS42IDAgMS0xLjMgNy4yLTkuNyA3LjItMTQuMSAwLTQuNC0zLjYtOC04LTh6IiBmaWxsPSIjZTc0YzNjIiBzdHJva2U9IiNjMDM5MmIiIHN0cm9rZS13aWR0aD0iMSIvPgogIDwhLS0gQ8OtcmN1bG8gaW50ZXJpb3IgLS0+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjYzAzOTJiIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8IS0tIFB1bnRvIGNlbnRyYWwgLS0+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iMS41IiBmaWxsPSIjYzAzOTJiIi8+CiAgPCEtLSBTb21icmEgLS0+CiAgPGVsbGlwc2UgY3g9IjE2IiBjeT0iMjgiIHJ4PSI0IiByeT0iMS41IiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+', // Data URI del SVG
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 28)
      }
    });

    console.log('✅ Nuevo marcador creado, actualizando estado y referencia...');
    setMarker(newMarker);
    currentMarkerRef.current = newMarker;

    // Obtener dirección de forma asíncrona
    const direccion = await obtenerDireccion(lat, lng);

    // Crear función personalizada para cerrar InfoWindow
    const cerrarInfoWindow = (infoWindow) => {
      infoWindow.close();
      // Rehabilitar listener después de cerrar InfoWindow
      setTimeout(() => {
        toggleClickListener(true);
      }, 100);
    };

    // Crear info window completo
    const infoWindowCompleto = new google.maps.InfoWindow({
      content: `
        <div class="popup-ubicador-gmaps" style="font-size: 13px; max-width: 300px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #e74c3c;">📍 Punto Ubicado</strong>
            <button class="close-btn" onclick="window.cerrarInfoWindowUbicador()" 
                    title="Cerrar">×</button>
          </div>
          <strong>Coordenadas:</strong><br/>
          Latitud: ${lat.toFixed(6)}<br/>
          Longitud: ${lng.toFixed(6)}<br/>
          <strong>Dirección:</strong><br/>
          <span style="color: #34495e;">${direccion}</span>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ecf0f1;">
          <small style="color: #7f8c8d;"><em>Haz clic en otro lugar del mapa para ubicar un nuevo punto</em></small>
        </div>
      `,
      disableAutoPan: false,
      headerDisabled: true // Deshabilitar el header que contiene el botón de cerrar predeterminado
    });

    // Guardar referencia del InfoWindow
    infoWindowRef.current = infoWindowCompleto;

    // Hacer función global para el botón de cerrar
    window.cerrarInfoWindowUbicador = () => cerrarInfoWindow(infoWindowCompleto);

    // Abrir InfoWindow
    infoWindowCompleto.open(map, newMarker);
    
    // Ocultar el botón de cerrar predeterminado con CSS
    setTimeout(() => {
      const closeBtn = document.querySelector('.gm-ui-hover-effect');
      if (closeBtn) {
        closeBtn.style.display = 'none';
      }
    }, 100);

    // Actualizar título del marcador
    newMarker.setTitle(`📍 ${direccion.length > 50 ? direccion.substring(0, 50) + '...' : direccion}`);

    // Agregar listener para click en el marcador (rehabilita listener al abrir)
    newMarker.addListener("click", () => {
      toggleClickListener(false);
      infoWindowCompleto.open(map, newMarker);
    });

    // Escuchar cuando se cierre el InfoWindow por otros medios
    infoWindowCompleto.addListener('closeclick', () => {
      setTimeout(() => {
        toggleClickListener(true);
      }, 100);
    });
  };



  // Efecto para agregar/quitar el evento de click
  useEffect(() => {
    if (visible && map && google) {
      setIsActive(true);
      
      // Habilitar listener con la nueva función
      toggleClickListener(true);
      
      // Asegurar que el mapa sea clickeable para el ubicador
      map.setOptions({ clickableIcons: false });
      
      console.log('📍 Modo ubicador de puntos activado en Google Maps - Haz clic en el mapa');
    } else {
      setIsActive(false);
      
      // Deshabilitar listener
      toggleClickListener(false);
      
      // Limpiar TODOS los marcadores cuando se desmarca el checkbox
      limpiarMarcador();
      
      // Restaurar opciones del mapa
      if (map) {
        map.setOptions({ clickableIcons: true });
      }
      
      console.log('📍 Modo ubicador de puntos desactivado - Todos los puntos eliminados');
    }

    return () => {
      if (clickListenerRef.current && google?.maps?.event) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [visible, map, google, isActive]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      limpiarMarcador();
      if (clickListenerRef.current && google?.maps?.event) {
        google.maps.event.removeListener(clickListenerRef.current);
      }
    };
  }, []);

  return null; // Este componente no renderiza JSX
};

export default GoogleCapaUbicadorPunto; 