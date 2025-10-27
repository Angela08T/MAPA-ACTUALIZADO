// CapaJurisdiccion.jsx
import { useEffect, useState, useRef } from "react";
import { GeoJSON } from "react-leaflet";

const CapaJurisdiccion = ({ ubicadorActivo = false }) => {
  const [data, setData] = useState(null);
  const [key, setKey] = useState(0); // Para forzar re-render
  const geoJsonRef = useRef(null);

  useEffect(() => {
    fetch("/data/juridiccion.geojson")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error cargando jurisdicción:", err));
  }, []);

  const estiloPorDefecto = (feature) => ({
    color: feature.properties.color || "#34b429",
    weight: 2,
    fillOpacity: ubicadorActivo ? 0.1 : 0.2, // Menos opacidad cuando ubicador está activo
    interactive: !ubicadorActivo, // Control directo de interactividad
    bubblingMouseEvents: ubicadorActivo ? false : true, // Prevenir bubbling cuando ubicador activo
  });

  const popupJurisdiccion = (feature, layer) => {
    const nombre = feature.properties.name || "Jurisdicción";

    if (!ubicadorActivo) {
      layer.bindPopup(`<b>${nombre}</b>`);
      
      layer.on('click', function() {
        layer.openPopup();
      });
    } else {
      // Cuando ubicador está activo, remover completamente todos los eventos
      layer.off();
      layer.unbindPopup();
      layer.unbindTooltip();
      
      // Hacer la capa completamente no interactiva
      if (layer.setStyle) {
        layer.setStyle({
          interactive: false,
          bubblingMouseEvents: false
        });
      }
    }
  };

  // Efecto para manejar cambios en el estado del ubicador
  useEffect(() => {
    if (data) {
      // Forzar re-render cuando cambie el estado del ubicador
      setKey(prev => prev + 1);
      console.log(`🗺️ Jurisdicciones - Ubicador ${ubicadorActivo ? 'ACTIVO' : 'INACTIVO'}`);
    }
  }, [ubicadorActivo, data]);

  // Efecto para aplicar estilos CSS cuando el ubicador esté activo
  useEffect(() => {
    if (ubicadorActivo) {
      // Agregar clase CSS para hacer las jurisdicciones no clickeables
      const jurisdiccionElements = document.querySelectorAll('.leaflet-interactive');
      jurisdiccionElements.forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'crosshair';
      });
    } else {
      // Restaurar interactividad
      const jurisdiccionElements = document.querySelectorAll('.leaflet-interactive');
      jurisdiccionElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.cursor = '';
      });
    }

    return () => {
      // Cleanup: restaurar cuando se desmonte
      const jurisdiccionElements = document.querySelectorAll('.leaflet-interactive');
      jurisdiccionElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.cursor = '';
      });
    };
  }, [ubicadorActivo]);

  if (!data) return null;

  return (
    <GeoJSON
      key={key} // Forzar re-render completo cuando cambie el estado
      ref={geoJsonRef}
      data={data}
      style={estiloPorDefecto}
      onEachFeature={popupJurisdiccion}
      interactive={!ubicadorActivo}
      bubblingMouseEvents={!ubicadorActivo}
      pane={ubicadorActivo ? 'shadowPane' : 'overlayPane'} // Mover a capa inferior cuando ubicador activo
    />
  );
};

export default CapaJurisdiccion;
