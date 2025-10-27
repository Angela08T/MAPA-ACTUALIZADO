import "./LayerTogglePanel.css";
import { Layers } from "lucide-react";

const LayerTogglePanel = ({ capas, onToggle, mapType, onMapTypeChange }) => {
  return (
    <div className="layer-toggle-panel">
      <div className="panel-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Layers size={18} />
        <h4 style={{ margin: 0 }}>Capas</h4>
      </div>

      <div className="panel-controls">
        {capas.map((capa) => (
          <label key={capa.name} className="layer-checkbox">
            <input
              type="checkbox"
              checked={capa.visible}
              onChange={() => onToggle(capa.name)}
            />
            {capa.label}
          </label>
        ))}

        {/* Separador y toggle de mapas */}
       {/*  <div className="map-toggle-separator"></div>
        <div className="map-toggle-section">
          <h5 className="map-toggle-title">Tipo de Mapa</h5>
          <div className="map-toggle-options">
            <label className="map-toggle-option">
              <input
                type="radio"
                name="mapType"
                value="leaflet"
                checked={mapType === 'leaflet'}
                onChange={(e) => onMapTypeChange(e.target.value)}
              />
              <span className="map-toggle-label">
                🍃 Leaflet
              </span>
            </label>

            <label className="map-toggle-option">
              <input
                type="radio"
                name="mapType"
                value="google"
                checked={mapType === 'google'}
                onChange={(e) => onMapTypeChange(e.target.value)}
              />
              <span className="map-toggle-label">
                🗺️ Google Maps
              </span>
            </label>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LayerTogglePanel;
