import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './ControlClusters.css';

const ControlClusters = ({ visible, radioCluster, onRadioChange, mapType = 'leaflet' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalClusters: 0,
    totalPuntos: 0,
    puntosClusteados: 0
  });

  useEffect(() => {
    const handleClusterStats = (event) => {
      setEstadisticas(event.detail);
    };

    window.addEventListener('clustersGenerados', handleClusterStats);
    return () => {
      window.removeEventListener('clustersGenerados', handleClusterStats);
    };
  }, []);

  if (!visible) return null;

  const porcentajeClusteado = estadisticas.totalPuntos > 0 
    ? ((estadisticas.puntosClusteados / estadisticas.totalPuntos) * 100).toFixed(1)
    : 0;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`control-clusters ${mapType}-mode ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="control-clusters-header" onClick={toggleCollapse}>
        <div className="header-content">
          <h3>🎯 Control de Clusters</h3>
          <button className="collapse-btn">
            {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      
      <div className={`control-clusters-content ${isCollapsed ? 'hidden' : ''}`}>
        <div className="radio-control">
          <label htmlFor="radio-slider">
            <strong>Radio de Clustering:</strong>
          </label>
          <div className="slider-container">
            <input
              id="radio-slider"
              type="range"
              min="10"
              max="100"
              value={radioCluster}
              onChange={(e) => onRadioChange(Number(e.target.value))}
              className="radio-slider"
            />
            <span className="radio-value">{radioCluster}m</span>
          </div>
        </div>

        <div className="estadisticas">
          <h4>📊 Estadísticas</h4>
          <div className="stat-item">
            <span className="stat-label">Total de puntos:</span>
            <span className="stat-value">{estadisticas.totalPuntos.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Clusters generados:</span>
            <span className="stat-value">{estadisticas.totalClusters}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Puntos clusteados:</span>
            <span className="stat-value">{estadisticas.puntosClusteados.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Porcentaje clusteado:</span>
            <span className="stat-value">{porcentajeClusteado}%</span>
          </div>
        </div>

        <div className="leyenda">
          <h4>🎨 Leyenda</h4>
          <div className="leyenda-item">
            <div className="color-box amarillo"></div>
            <span>2-3 incidencias</span>
          </div>
          <div className="leyenda-item">
            <div className="color-box naranja"></div>
            <span>4-6 incidencias</span>
          </div>
          <div className="leyenda-item">
            <div className="color-box rojo"></div>
            <span>7+ incidencias</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlClusters; 