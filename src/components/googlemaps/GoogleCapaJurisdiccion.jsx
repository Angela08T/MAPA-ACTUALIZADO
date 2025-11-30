import { useEffect, useState } from "react";

const GoogleCapaJurisdiccion = ({ map, google, ubicadorActivo = false, camaraConVision = null, camaraSeleccionada = null }) => {
  const [data, setData] = useState(null);
  const [polygons, setPolygons] = useState([]);

  // Jurisdicciones deben estar inactivas si:
  // 1. El ubicador está activo
  // 2. Una cámara tiene campo de visión activo
  // 3. Una cámara está seleccionada desde la búsqueda
  const esInactivo = ubicadorActivo || camaraConVision !== null || camaraSeleccionada !== null;

  useEffect(() => {
    fetch("/data/juridiccion.geojson")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error cargando jurisdicción:", err));
  }, []);

  useEffect(() => {
    if (!map || !google || !data) return;

    // Limpiar polígonos anteriores
    polygons.forEach(polygon => polygon.setMap(null));
    
    const newPolygons = [];

    data.features?.forEach((feature) => {
      if (feature.geometry?.type === "Polygon") {
        const coordinates = feature.geometry.coordinates[0].map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: feature.properties.color || "#34b429",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: feature.properties.color || "#34b429",
          fillOpacity: 0.3,
        });

        polygon.setMap(map);

        // Agregar info window solo si está activo (no ubicador ni cámara)
        if (!esInactivo) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<b>${feature.properties.name || "Jurisdicción"}</b>`
          });

          polygon.addListener("click", (event) => {
            infoWindow.setPosition(event.latLng);
            infoWindow.open(map);
          });
        }

        // Configurar si el polígono es clickeable
        polygon.setOptions({
          clickable: !esInactivo
        });

        newPolygons.push(polygon);
      }
    });

    setPolygons(newPolygons);

    // Cleanup function
    return () => {
      newPolygons.forEach(polygon => polygon.setMap(null));
    };
  }, [map, google, data, esInactivo, camaraConVision, camaraSeleccionada]);

  return null; // Este componente no renderiza JSX
};

export default GoogleCapaJurisdiccion; 