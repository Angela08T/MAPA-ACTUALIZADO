// LeyendaCamaras.jsx
import React from 'react';
import './LeyendaCamaras.css';

const LeyendaCamaras = ({ camarasVecinalesVisible, camarasMunicipalesVisible }) => {
    // No mostrar la leyenda si ninguna capa está visible
    if (!camarasVecinalesVisible && !camarasMunicipalesVisible) {
        return null;
    }

    return (
        <div className="leyenda-camaras">
            <div className="leyenda-header">
                <h4>Leyenda de Cámaras</h4>
            </div>

            <div className="leyenda-content">
                {/* Cámaras Vecinales */}
                {camarasVecinalesVisible && (
                    <div className="leyenda-section">
                        <h5>Cámaras Vecinales</h5>
                        <div className="leyenda-items">
                            <div className="leyenda-item">
                                <img src="/icon/camerav.png" alt="HIK VISION" className="leyenda-icon" />
                                <span>HIK VISION</span>
                            </div>
                            <div className="leyenda-item">
                                <img src="/icon/camerav2.png" alt="DAHUA" className="leyenda-icon" />
                                <span>DAHUA</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cámaras Municipales */}
                {camarasMunicipalesVisible && (
                    <div className="leyenda-section">
                        <h5>Cámaras Municipales</h5>
                        <div className="leyenda-items">
                            <div className="leyenda-item">
                                <img src="/icon/camera.png" alt="Camara 180" className="leyenda-icon" />
                                <span>Camara 180</span>
                            </div>
                            <div className="leyenda-item">
                                <img src="/icon/camera2.png" alt="Camara 360" className="leyenda-icon" />
                                <span>Camara 360</span>
                            </div>
                            <div className="leyenda-item">
                                <img src="/icon/camera3.png" alt="Camara LPR" className="leyenda-icon" />
                                <span>Camara LPR</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeyendaCamaras;