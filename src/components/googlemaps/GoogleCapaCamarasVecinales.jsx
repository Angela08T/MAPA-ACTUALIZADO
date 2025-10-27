import { useEffect, useState } from "react";

const GoogleCapaCamarasVecinales = ({ visible, map, google }) => {
  const [data, setData] = useState([]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch("/data/camaras-vecinales.geojson")
      .then((res) => res.json())
      .then((data) => setData(data.features || []))
      .catch((err) =>
        console.error("Error cargando cámaras vecinales:", err)
      );
  }, []);

  useEffect(() => {
    if (!map || !google || !visible) {
      // Limpiar markers si no visible
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      return;
    }

    // Limpiar markers anteriores
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = [];

    data.forEach((feature) => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      const props = feature.properties || {};

      if (!lat || !lng) return;

      // Crear marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: props.nombre,
        icon: {
          url: "/icon/camerav.png",
          scaledSize: new google.maps.Size(26, 26),
          anchor: new google.maps.Point(13, 26)
        }
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-size: 13px;">
            <strong>📹 ${props.nombre}</strong><br />
            Tipo: ${props.tipo}<br />
            Marca: ${props.marca}<br />
            Ubicación: ${props.ubicacion}
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, google, visible, data]);

  return null; // Este componente no renderiza JSX
};

export default GoogleCapaCamarasVecinales; 