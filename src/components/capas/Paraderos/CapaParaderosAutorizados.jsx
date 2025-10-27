// CapaParaderosAutorizados.jsx
import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip, LayerGroup } from "react-leaflet";
import L from "leaflet";

const iconoParaderoAutorizado = new L.Icon({
  iconUrl: "/icon/motoa.png",
  iconSize: [16, 16],
  iconAnchor: [6, 16],
  popupAnchor: [0, -26],
});

const CapaParaderosAutorizados = ({ visible }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/paraderos_autorizados.geojson")
      .then((res) => res.json())
      .then((data) => setData(data.features || []))
      .catch((err) =>
        console.error("Error cargando paraderos autorizados:", err)
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
            icon={iconoParaderoAutorizado}
          >
            <Popup>
              <div style={{ fontSize: "13px" }}>
                <strong>🛵 Paradero Autorizado</strong><br />
                {props.name || "Sin nombre"}
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

export default CapaParaderosAutorizados;
