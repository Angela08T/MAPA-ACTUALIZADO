// CapaParaderosNoAutorizados.jsx
import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip, LayerGroup } from "react-leaflet";
import L from "leaflet";

const iconoParaderoNoAutorizado = new L.Icon({
  iconUrl: "/icon/moton.png",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

const CapaParaderosNoAutorizados = ({ visible }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/paraderos_no_autorizados.geojson")
      .then((res) => res.json())
      .then((data) => setData(data.features || []))
      .catch((err) =>
        console.error("Error cargando paraderos no autorizados:", err)
      );
  }, []);

  if (!visible) return null;

  return (
    <LayerGroup>
      {data.map((feature, idx) => {
        const [lng, lat] = feature.geometry?.coordinates || [];
        const props = feature.properties || {};

        if (!lat || !lng) return null;

        return (
          <Marker
            key={idx}
            position={[lat, lng]}
            icon={iconoParaderoNoAutorizado}
          >
            <Popup>
              <div style={{ fontSize: "13px" }}>
                <strong>🚫 Paradero NO Autorizado</strong><br />
                <strong>ID:</strong> {props.name || "Sin nombre"}<br />
                <strong>Descripción:</strong><br />
                {props.description || "Sin detalle"}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              {props.name || "Paradero"}
            </Tooltip>
          </Marker>
        );
      })}
    </LayerGroup>
  );
};

export default CapaParaderosNoAutorizados;
