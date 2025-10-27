import { useEffect, useState, useRef } from "react";

// Función utilitaria para animación suave en Google Maps
const smoothPanTo = (map, targetPosition, targetZoom, duration = 1500) => {
  const currentPosition = map.getCenter();

  const startTime = performance.now();
  const startLat = currentPosition.lat();
  const startLng = currentPosition.lng();
  const endLat = targetPosition.lat;
  const endLng = targetPosition.lng;
  const startZoom = map.getZoom();
  const endZoom = targetZoom;

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Función de easing para suavizar la animación
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);

    const currentLat = startLat + (endLat - startLat) * easeOutCubic;
    const currentLng = startLng + (endLng - startLng) * easeOutCubic;
    const currentZoom = startZoom + (endZoom - startZoom) * easeOutCubic;

    map.setCenter({ lat: currentLat, lng: currentLng });
    map.setZoom(currentZoom);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const GoogleCapaCamarasMunicipales = ({ visible, map, google, camaraSeleccionada, camarasFiltradas, seguimientoCamara, limpiarSeguimiento }) => {
  const [camaras, setCamaras] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const [circuloSeguimiento, setCirculoSeguimiento] = useState(null);
  const [circulosAnteriores, setCirculosAnteriores] = useState([]);
  const [camarasCercanas, setCamarasCercanas] = useState([]);
  const [historialSeguimiento, setHistorialSeguimiento] = useState([]);
  const markersRef = useRef({});

  useEffect(() => {
    fetch("/data/610_updated.geojson")
      .then((res) => res.json())
      .then((data) => setCamaras(data.features || []))
      .catch((err) =>
        console.error("Error cargando cámaras municipales:", err)
      );
  }, []);

  // Efecto para navegar a la cámara seleccionada
  useEffect(() => {
    if (camaraSeleccionada && map && google) {
      const coords = camaraSeleccionada.geometry?.coordinates || [camaraSeleccionada.lng, camaraSeleccionada.lat];
      if (coords && coords.length >= 2) {
        const [lng, lat] = coords;

        // Navegación suave a la cámara seleccionada con animación
        const targetPosition = { lat, lng };

        // Usar la función utilitaria para animación suave
        smoothPanTo(map, targetPosition, 18, 1500);

        // Abrir info window después de la navegación
        setTimeout(() => {
          const markerId = `marker-${camaraSeleccionada.id}`;
          const marker = markersRef.current[markerId];
          if (marker && marker.infoWindow) {
            // Cerrar todos los InfoWindows primero
            Object.values(markersRef.current).forEach(otherMarker => {
              if (otherMarker.infoWindow) {
                otherMarker.infoWindow.close();
                otherMarker.infoWindowOpen = false;
              }
            });

            // Abrir el InfoWindow de la cámara seleccionada
            marker.infoWindow.open(map, marker);
            marker.infoWindowOpen = true;

            // Agregar listener para detectar cuando se cierra manualmente
            marker.infoWindow.addListener('closeclick', () => {
              marker.infoWindowOpen = false;
            });
          }
        }, 1700); // Aumentar el tiempo para que coincida con la duración de la animación
      }
    }
  }, [camaraSeleccionada, map, google]);

  // Efecto para manejar el seguimiento de cámaras cercanas
  useEffect(() => {
    if (seguimientoCamara && map && google && camaras.length > 0) {
      iniciarSeguimientoCamaras(seguimientoCamara);
    }
  }, [seguimientoCamara, map, google, camaras]);

  // Efecto para limpiar seguimiento cuando se solicita
  useEffect(() => {
    if (limpiarSeguimiento && map) {
      limpiarTodoSeguimiento();
    }
  }, [limpiarSeguimiento, map]);

  // Efecto para manejar el cursor cuando se presiona Ctrl en modo seguimiento
  useEffect(() => {
    if (!seguimientoActivo || !map) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Control' && seguimientoActivo) {
        // Cambiar cursor a crosshair cuando se presiona Ctrl
        const mapDiv = map.getDiv();
        if (mapDiv) {
          mapDiv.style.cursor = 'crosshair';
          mapDiv.title = 'Ctrl+clic en una cámara para crear nuevo círculo de seguimiento';
        }
        console.log('🎯 Ctrl presionado - Modo seguimiento activado');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Control') {
        // Restaurar cursor normal cuando se suelta Ctrl
        const mapDiv = map.getDiv();
        if (mapDiv) {
          mapDiv.style.cursor = '';
          mapDiv.title = '';
        }
        console.log('🎯 Ctrl soltado - Modo seguimiento desactivado');
      }
    };

    // Agregar event listeners globales
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    console.log('🎯 Event listeners de Ctrl agregados para seguimiento');

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (map && map.getDiv()) {
        const mapDiv = map.getDiv();
        mapDiv.style.cursor = '';
        mapDiv.title = '';
      }
      console.log('🎯 Event listeners de Ctrl removidos');
    };
  }, [seguimientoActivo, map]);

  const iniciarSeguimientoCamaras = (camaraCentral) => {
    if (!camaraCentral || !map || !google) return;

    // Guardar el círculo anterior en el historial si existe
    if (circuloSeguimiento) {
      setCirculosAnteriores(prev => [...prev, circuloSeguimiento]);
      // Cambiar el estilo del círculo anterior para que sea menos prominente
      circuloSeguimiento.setOptions({
        strokeColor: '#9ca3af',
        fillColor: '#9ca3af',
        fillOpacity: 0.05,
        strokeWeight: 1,
        strokeOpacity: 0.5
      });
    }

    const lat = camaraCentral.lat;
    const lng = camaraCentral.lng;

    console.log('🎯 Iniciando seguimiento para cámara:', camaraCentral.name);

    // Verificar que la librería de geometría esté disponible
    if (!google.maps.geometry || !google.maps.geometry.spherical) {
      console.error('Google Maps Geometry library not loaded');
      return;
    }

    // Calcular distancias a todas las cámaras usando Google Maps geometry
    const camarasConDistancia = camaras.map((feature, idx) => {
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) return null;

      const [camaraLng, camaraLat] = coords;
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(lat, lng),
        new google.maps.LatLng(camaraLat, camaraLng)
      );

      return {
        feature,
        distance,
        idx,
        properties: feature.properties
      };
    }).filter(item => item !== null);

    // Ordenar por distancia y tomar las 6 más cercanas
    const camarasOrdenadas = camarasConDistancia.sort((a, b) => a.distance - b.distance);
    const camarasCercanas = camarasOrdenadas.slice(0, 6);

    // Calcular el radio máximo
    const radioMaximo = camarasCercanas[camarasCercanas.length - 1].distance;

    // Crear círculo de seguimiento con colores variados
    const coloresSeguimiento = ['#10b981', '#059669', '#047857', '#065f46', '#0891b2', '#0e7490'];
    const colorAleatorio = coloresSeguimiento[Math.floor(Math.random() * coloresSeguimiento.length)];

    const nuevoCirculo = new google.maps.Circle({
      strokeColor: colorAleatorio,
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: colorAleatorio,
      fillOpacity: 0.2,
      map: map,
      center: { lat, lng },
      radius: radioMaximo,
      zIndex: 2000
    });

    // Agregar info window al círculo con botón de cerrar
    const circleInfoWindowId = `circle-info-${Date.now()}`;
    const circleInfoWindow = new google.maps.InfoWindow({
      content: `
        <div id="${circleInfoWindowId}" style="font-size: 12px; position: relative; min-width: 200px;">
          <button 
            onclick="document.getElementById('${circleInfoWindowId}').closest('.gm-style-iw').parentElement.style.display='none'"
            style="
              position: absolute;
              top: -5px;
              right: -5px;
              background: #ff4444;
              color: white;
              border: none;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              cursor: pointer;
              font-size: 12px;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              z-index: 1000;
            "
            title="Cerrar"
          >×</button>
          
          <div style="padding-right: 15px;">
            <strong>🎯 Área de Seguimiento</strong><br/>
            <strong>📍 Centro:</strong> ${camaraCentral.name}<br/>
            <strong>📏 Radio:</strong> ${(radioMaximo / 1000).toFixed(2)}km<br/>
            <strong>📷 Cámaras:</strong> ${camarasCercanas.length}<br/>
            <br/>
            <div style="
              background: rgba(16, 185, 129, 0.1);
              padding: 6px 8px;
              border-radius: 4px;
              font-size: 10px;
              color: #10b981;
              text-align: center;
              border: 1px solid rgba(16, 185, 129, 0.3);
              line-height: 1.3;
            ">
              💡 <strong>Ctrl + Clic</strong> en las cámaras para crear nuevos círculos<br/>
              <span style="font-size: 8px; opacity: 0.8;">Clic normal abre información de la cámara</span>
            </div>
          </div>
        </div>
      `,
      position: { lat, lng }
    });

    // Agregar funcionalidad toggle al círculo también
    nuevoCirculo.circleInfoWindowOpen = false;

    nuevoCirculo.addListener('click', () => {
      if (!nuevoCirculo.circleInfoWindowOpen) {
        circleInfoWindow.open(map);
        nuevoCirculo.circleInfoWindowOpen = true;

        // Agregar listener para detectar cuando se cierra manualmente
        circleInfoWindow.addListener('closeclick', () => {
          nuevoCirculo.circleInfoWindowOpen = false;
        });
      } else {
        circleInfoWindow.close();
        nuevoCirculo.circleInfoWindowOpen = false;
      }
    });

    setCirculoSeguimiento(nuevoCirculo);

    // Filtrar todas las cámaras dentro del círculo
    const camarasDentroDelCirculo = camarasConDistancia.filter(item =>
      item.distance <= radioMaximo
    );

    setCamarasCercanas(camarasDentroDelCirculo);
    setSeguimientoActivo(true);

    // Agregar al historial de seguimiento
    setHistorialSeguimiento(prev => [...prev, {
      camara: camaraCentral,
      timestamp: new Date(),
      radio: radioMaximo,
      camarasEncontradas: camarasDentroDelCirculo.length
    }]);

    // Navegar al área de seguimiento con animación suave
    const targetPosition = { lat, lng };

    // Navegar al área de seguimiento
    map.panTo({ lat, lng });
    map.setZoom(17);

    console.log(`📍 Seguimiento activado: ${camarasDentroDelCirculo.length} cámaras en un radio de ${(radioMaximo / 1000).toFixed(2)}km`);
    console.log('🔍 Cámaras dentro del círculo:', camarasDentroDelCirculo.map(item => item.properties?.name));
    console.log('🎯 Estado actualizado - seguimientoActivo:', true, 'camarasCercanas:', camarasDentroDelCirculo.length);
  };

  const limpiarTodoSeguimiento = () => {
    // Limpiar círculo actual
    if (circuloSeguimiento) {
      circuloSeguimiento.setMap(null);
      setCirculoSeguimiento(null);
    }

    // Limpiar círculos anteriores
    circulosAnteriores.forEach(circulo => {
      circulo.setMap(null);
    });
    setCirculosAnteriores([]);

    // Resetear estados
    setSeguimientoActivo(false);
    setCamarasCercanas([]);
    setHistorialSeguimiento([]);

    console.log('🧹 Seguimiento limpiado');
  };

  // Efecto para limpiar seguimiento cuando se cambian los filtros
  useEffect(() => {
    if (camarasFiltradas && camarasFiltradas.length >= 0 && seguimientoActivo) {
      limpiarTodoSeguimiento();
    }
  }, [camarasFiltradas]);

  useEffect(() => {
    if (!map || !google || !visible) {
      // Limpiar markers y circles si no visible
      markers.forEach(marker => marker.setMap(null));
      circles.forEach(circle => circle.setMap(null));
      setMarkers([]);
      setCircles([]);
      return;
    }

    // Limpiar markers y circles anteriores
    markers.forEach(marker => marker.setMap(null));
    circles.forEach(circle => circle.setMap(null));

    const newMarkers = [];
    const newCircles = [];

    // Determinar qué cámaras mostrar (seguimiento, filtradas o todas)
    let camarasAMostrar;

    console.log('🔍 Determinando cámaras a mostrar:', {
      seguimientoActivo,
      camarasCercanasLength: camarasCercanas.length,
      camarasFiltradas: camarasFiltradas?.length,
      totalCamaras: camaras.length
    });

    if (seguimientoActivo && camarasCercanas.length > 0) {
      // Mostrar solo las cámaras del seguimiento
      camarasAMostrar = camarasCercanas.map(item => item.feature);
      console.log('📍 Mostrando cámaras de seguimiento:', camarasAMostrar.length);
    } else if (camarasFiltradas && camarasFiltradas.length >= 0) {
      // Mostrar cámaras filtradas
      camarasAMostrar = camaras.filter((feature, idx) =>
        camarasFiltradas.some(cf => cf.name === feature.properties?.name)
      );
      console.log('🔍 Mostrando cámaras filtradas:', camarasAMostrar.length);
    } else {
      // Mostrar todas las cámaras
      camarasAMostrar = camaras;
      console.log('📷 Mostrando todas las cámaras:', camarasAMostrar.length);
    }

    camarasAMostrar.forEach((feature, idx) => {
      const coords = feature.geometry?.coordinates;
      const props = feature.properties;
      if (!coords || coords.length < 2) return;

      const [lng, lat] = coords;
      const markerId = `marker-${idx}`;

      // Determinar si esta cámara está seleccionada
      const esSeleccionada = camaraSeleccionada &&
        (camaraSeleccionada.name === props.name || camaraSeleccionada.id === idx);

      // Determinar si esta cámara está en modo seguimiento
      const enSeguimiento = seguimientoActivo && camarasCercanas.some(item =>
        item.properties?.name === props.name
      );

      console.log('🔍 Procesando marcador:', {
        name: props.name,
        enSeguimiento,
        seguimientoActivo,
        camarasCercanasLength: camarasCercanas.length
      });

      // Crear círculo
      const circle = new google.maps.Circle({
        strokeColor: esSeleccionada ? "#667eea" : "#6c5ce7",
        strokeOpacity: 1,
        strokeWeight: esSeleccionada ? 2 : 1,
        fillColor: esSeleccionada ? "#667eea" : "#a29bfe",
        fillOpacity: esSeleccionada ? 0.4 : 0.25,
        map: map,
        center: { lat, lng },
        radius: 120,
        zIndex: 1000
      });

      // Crear marker con icono apropiado según el tipo
      let iconConfig;
      
      // Determinar el icono según el tipo de cámara
      let iconUrl;
      switch (props.tipo) {
        case "TIPO I":
          iconUrl = "/icon/camera.png";
          break;
        case "TIPO II":
          iconUrl = "/icon/camera2.png";
          break;
        case "TIPO III":
          iconUrl = "/icon/camera3.png";
          break;
        default:
          iconUrl = "/icon/camera.png"; // Fallback por defecto
      }
      
      if (esSeleccionada) {
        iconConfig = {
          url: iconUrl,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        };
      } else {
        iconConfig = {
          url: iconUrl,
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 14)
        };
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: props.name,
        icon: iconConfig,
        zIndex: esSeleccionada ? 2000 : (enSeguimiento ? 1500 : 1000)
      });

      // Calcular información de distancia si está en seguimiento
      let infoDistancia = '';
      if (enSeguimiento && circuloSeguimiento && google.maps.geometry && google.maps.geometry.spherical) {
        const centroCirculo = circuloSeguimiento.getCenter();
        const distancia = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(lat, lng),
          centroCirculo
        );
        const distanciaKm = (distancia / 1000).toFixed(2);
        infoDistancia = ` (${distanciaKm}km)`;
      }

      // Info window con botón de cerrar personalizado
      const infoWindowId = `info-${markerId}`;
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div id="${infoWindowId}" style="font-size: 13px; position: relative; min-width: 250px;">
            
            <div style="padding-right: 15px;">
              <strong>📍 ${props.name}${infoDistancia}</strong><br />
              Dirección: ${props.direccion}<br />
              Tipo: ${props.tipo}<br />
              Jurisdicción: ${props.jurisdiccion}<br />
              Megáfono: ${props.megafono ? "✅" : "❌"}<br />
              Botón de pánico: ${props.boton ? "✅" : "❌"}
              
              ${esSeleccionada ? `
                <br /><br />
                <div style="
                  background: rgba(102, 126, 234, 0.2);
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 12px;
                  color: #667eea;
                  font-weight: bold;
                  text-align: center;
                ">
                  🎯 CÁMARA SELECCIONADA
                </div>
              ` : ''}
              
              ${enSeguimiento ? `
                <br /><br />
                <div style="
                  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
                  padding: 8px 10px;
                  border-radius: 6px;
                  font-size: 11px;
                  color: #10b981;
                  font-weight: bold;
                  text-align: center;
                  border: 2px solid rgba(16, 185, 129, 0.4);
                  line-height: 1.4;
                  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
                ">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 4px;">
                    🎯 <span style="background: #047857; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Ctrl</span> + <span style="background: #047857; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Clic</span>
                  </div>
                  <div style="font-size: 10px; opacity: 0.9;">Nuevo círculo de seguimiento</div>
                  <div style="font-size: 8px; opacity: 0.7; margin-top: 2px;">Mantén Ctrl presionado y haz clic aquí</div>
                </div>
              ` : ''}
            </div>
          </div>
        `
      });

      // Ya no necesitamos función global, usamos Ctrl+clic directamente

      // Variable para rastrear si Ctrl está presionado (compartida globalmente)
      if (!window.ctrlPressed) {
        window.ctrlPressed = false;
      }

      // Event listeners para detectar Ctrl (solo agregar una vez)
      if (!window.ctrlListenersAdded) {
        const handleKeyDown = (e) => {
          if (e.key === 'Control') {
            window.ctrlPressed = true;
            console.log('🎯 Ctrl presionado globalmente');
          }
        };

        const handleKeyUp = (e) => {
          if (e.key === 'Control') {
            window.ctrlPressed = false;
            console.log('🎯 Ctrl soltado globalmente');
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        window.ctrlListenersAdded = true;
        
        console.log('🎯 Event listeners globales de Ctrl agregados');
      }

      marker.addListener("click", (event) => {
        console.log('🖱️ Clic en marcador:', {
          name: props.name,
          enSeguimiento: enSeguimiento,
          windowCtrlPressed: window.ctrlPressed,
          eventDomEvent: event.domEvent,
          ctrlKeyFromEvent: event.domEvent?.ctrlKey
        });

        // Verificar si se presionó Ctrl y si está en modo seguimiento
        const isCtrlClick = window.ctrlPressed || (event.domEvent && event.domEvent.ctrlKey);
        
        if (isCtrlClick && enSeguimiento) {
          // Ctrl+clic: Crear nuevo círculo de seguimiento centrado en esta cámara
          const camaraData = {
            name: props.name,
            lat: lat,
            lng: lng,
            direccion: props.direccion,
            tipo: props.tipo,
            jurisdiccion: props.jurisdiccion,
            megafono: props.megafono,
            boton: props.boton
          };

          console.log('🎯 Ctrl+clic detectado - Iniciando nuevo seguimiento:', {
            camaraData,
            seguimientoActivo,
            camarasCercanasLength: camarasCercanas.length
          });
          
          iniciarSeguimientoCamaras(camaraData);

          // Cerrar todos los InfoWindows después de iniciar seguimiento
          newMarkers.forEach(otherMarker => {
            if (otherMarker.infoWindow) {
              otherMarker.infoWindow.close();
              otherMarker.infoWindowOpen = false;
            }
          });

          return; // No continuar con la lógica normal de toggle
        }

        // Comportamiento normal: toggle del InfoWindow
        const isCurrentlyOpen = marker.infoWindowOpen;

        // Cerrar todos los InfoWindows abiertos
        newMarkers.forEach(otherMarker => {
          if (otherMarker.infoWindow) {
            otherMarker.infoWindow.close();
            otherMarker.infoWindowOpen = false;
          }
        });

        // Si no estaba abierto, abrirlo (comportamiento toggle)
        if (!isCurrentlyOpen) {
          infoWindow.open(map, marker);
          marker.infoWindowOpen = true;

          // Agregar listener para detectar cuando se cierra manualmente
          infoWindow.addListener('closeclick', () => {
            marker.infoWindowOpen = false;
          });
        }
      });

      // Ya no necesitamos cleanup individual ya que usamos listeners globales

      // Guardar referencia del marker
      marker.infoWindow = infoWindow;
      marker.markerId = markerId; // Para poder limpiar las funciones globales
      marker.infoWindowOpen = false; // Estado inicial del InfoWindow
      markersRef.current[markerId] = marker;

      newMarkers.push(marker);
      newCircles.push(circle);
    });

    setMarkers(newMarkers);
    setCircles(newCircles);

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        marker.setMap(null);
      });
      newCircles.forEach(circle => circle.setMap(null));
    };
  }, [map, google, visible, camaras]);

  return null; // Este componente no renderiza JSX
};

export default GoogleCapaCamarasMunicipales; 