// CapaCamarasVecinales.jsx
import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { useMapLocationCopy } from "../../../hooks/useMapLocationCopy";
import "../../../components/capas/CamarasMunicipales/LocationCopyPopup.css";

const iconoHikVision = new L.Icon({
  iconUrl: "/icon/camerav.png",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

const iconoDahua = new L.Icon({
  iconUrl: "/icon/camerav2.png",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

// Función para obtener el icono según la marca
const getIconoPorMarca = (marca) => {
  if (marca === "HIK VISION") {
    return iconoHikVision;
  } else if (marca === "DAHUA") {
    return iconoDahua;
  }
  // Icono por defecto si no coincide con ninguna marca
  return iconoHikVision;
};

const CapaCamarasVecinales = ({ visible }) => {
  const [data, setData] = useState([]);
  
  // Usar el hook para habilitar la copia de ubicaciones
  useMapLocationCopy();

  useEffect(() => {
    fetch("/data/camaras-vecinales.geojson")
      .then((res) => res.json())
      .then((data) => setData(data.features || []))
      .catch((err) =>
        console.error("Error cargando cámaras vecinales:", err)
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
            icon={getIconoPorMarca(props.marca)}
          >
            <Popup>
              <div style={{ fontSize: "13px" }}>
                <strong>📹 {props.nombre}</strong><br />
                Tipo: {props.tipo}<br />
                Marca: {props.marca}<br />
                Ubicación: {props.ubicacion}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              {props.nombre}
            </Tooltip>
          </Marker>
        );
      })}
    </LayerGroup>
  );
};

export default CapaCamarasVecinales;
