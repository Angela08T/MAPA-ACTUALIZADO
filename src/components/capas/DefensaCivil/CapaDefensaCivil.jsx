import { useEffect, useState } from 'react';
import { Marker, Popup, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import FiltroGiro from '../../filtros/FiltroGiro';
import { logger } from '../../../utils/logger.js';

const iconoDefensa = new L.Icon({
  iconUrl: '/icon/defensa.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

const normalizarTexto = texto =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const CapaDefensaCivil = ({ visible }) => {
  const [lugares, setLugares] = useState([]);
  const [filtroGiro, setFiltroGiro] = useState('');
  const [girosDisponibles, setGirosDisponibles] = useState([]);

  useEffect(() => {
    if (!visible) return;

    fetch('/data/defensaCivil.json')
      .then(res => {
        if (!res.ok) throw new Error('Respuesta no válida');
        return res.json();
      })
      .then(data => {
        const datos = Array.isArray(data) ? data : [];
        setLugares(datos);

        const giros = [
          ...new Set(
            datos
              .map(item => item.GIro)
              .filter(giro => typeof giro === 'string' && giro.trim() !== '')
          ),
        ];
        setGirosDisponibles(giros);
      })
      .catch(err => {
        logger.error('❌ Error cargando defensaCivil.json:', err);
        setLugares([]);
        setGirosDisponibles([]);
      });
  }, [visible]);

  if (!visible) return null;

  const lugaresFiltrados =
    filtroGiro.trim() === ''
      ? lugares
      : lugares.filter(item => normalizarTexto(item.GIro).includes(normalizarTexto(filtroGiro)));

  return (
    <>
      <FiltroGiro
        value={filtroGiro}
        onChangeFiltro={setFiltroGiro}
        listaOriginal={girosDisponibles}
      />

      <LayerGroup>
        {lugaresFiltrados.map((item, idx) => {
          const lat = parseFloat(item.Latitud);
          const lng = parseFloat(item.Longitud);

          if (isNaN(lat) || isNaN(lng)) {
            logger.warn(`⚠️ Coordenadas inválidas en índice ${idx}:`, item);
            return null;
          }

          return (
            <Marker key={`${lat}-${lng}-${idx}`} position={[lat, lng]} icon={iconoDefensa}>
              <Popup>
                <div style={{ fontSize: '13px', maxWidth: '260px' }}>
                  <strong>🏢 Defensa Civil</strong>
                  <br />
                  <strong>Dirección:</strong> {item.Dirección || 'Sin dirección'}
                  <br />
                  <strong>Giro:</strong> {item.GIro || 'Sin giro'}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                {item.GIro || 'Defensa Civil'}
              </Tooltip>
            </Marker>
          );
        })}
      </LayerGroup>
    </>
  );
};

export default CapaDefensaCivil;
