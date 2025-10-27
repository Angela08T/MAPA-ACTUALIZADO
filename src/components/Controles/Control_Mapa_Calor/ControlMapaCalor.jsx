import { useState, useEffect } from 'react';
import { Thermometer, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import './ControlMapaCalor.css';

const ControlMapaCalor = ({ 
  visible, 
  onConfigChange,
  config = {
    radius: 25,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.75
  }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  // Sincronizar localConfig con config cuando cambie desde el padre
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!visible) return null;

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: parseFloat(value) };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      radius: 25,
      maxOpacity: 0.8,
      minOpacity: 0.1,
      blur: 0.75
    };
    setLocalConfig(defaultConfig);
    onConfigChange?.(defaultConfig);
  };

  return (
    <div className="control-mapa-calor">
      <div 
        className="control-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="control-title">
          <Thermometer size={16} />
          <span>Configuración Mapa de Calor</span>
        </div>
        <button className="expand-btn">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="control-content">
          <div className="config-group">
            <label className="config-label">
              <span>Radio: {localConfig.radius}px</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={localConfig.radius}
                onChange={(e) => handleConfigChange('radius', e.target.value)}
                className="config-slider"
              />
            </label>
          </div>

          <div className="config-group">
            <label className="config-label">
              <span>Opacidad Máxima: {Math.round(localConfig.maxOpacity * 100)}%</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={localConfig.maxOpacity}
                onChange={(e) => handleConfigChange('maxOpacity', e.target.value)}
                className="config-slider"
              />
            </label>
          </div>

          <div className="config-group">
            <label className="config-label">
              <span>Opacidad Mínima: {Math.round(localConfig.minOpacity * 100)}%</span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={localConfig.minOpacity}
                onChange={(e) => handleConfigChange('minOpacity', e.target.value)}
                className="config-slider"
              />
            </label>
          </div>

          <div className="config-group">
            <label className="config-label">
              <span>Difuminado: {Math.round(localConfig.blur * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localConfig.blur}
                onChange={(e) => handleConfigChange('blur', e.target.value)}
                className="config-slider"
              />
            </label>
          </div>

          <div className="control-actions">
            <button 
              className="reset-btn"
              onClick={resetToDefaults}
              title="Restaurar valores por defecto"
            >
              <Settings size={14} />
              Restaurar
            </button>
          </div>

          <div className="info-panel">
            <div className="info-item">
              <strong>Radio:</strong> Tamaño del área de influencia de cada punto
            </div>
            <div className="info-item">
              <strong>Opacidad:</strong> Intensidad visual del mapa de calor
            </div>
            <div className="info-item">
              <strong>Difuminado:</strong> Suavizado de los bordes del calor
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlMapaCalor;