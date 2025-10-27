import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Función para copiar texto al portapapeles
const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    // Usar la API moderna del portapapeles si está disponible
    navigator.clipboard.writeText(text);
  } else {
    // Fallback para navegadores más antiguos
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }
};

// Función para mostrar el popup estilizado
const showPopupMessage = (message, link) => {
  // Crear el contenedor del popup
  const popup = document.createElement('div');
  popup.className = 'custom-location-popup';

  // Contenido del popup
  popup.innerHTML = `
    <div class="popup-content">
      <p class="popup-message">${message}</p>
      <a href="${link}" target="_blank" class="popup-link">Ver en Google Maps</a>
    </div>
  `;

  // Agregar estilos inline para asegurar que se muestre correctamente
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ffffff;
    border: 2px solid #10b981;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;

  // Agregar estilos para el contenido interno
  const popupContent = popup.querySelector('.popup-content');
  popupContent.style.cssText = `
    text-align: center;
  `;

  const popupMessage = popup.querySelector('.popup-message');
  popupMessage.style.cssText = `
    margin: 0 0 12px 0;
    color: #374151;
    font-weight: 500;
    font-size: 14px;
  `;

  const popupLink = popup.querySelector('.popup-link');
  popupLink.style.cssText = `
    display: inline-block;
    background: #10b981;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 0.2s;
  `;

  // Agregar hover effect
  popupLink.addEventListener('mouseenter', () => {
    popupLink.style.background = '#059669';
  });
  popupLink.addEventListener('mouseleave', () => {
    popupLink.style.background = '#10b981';
  });

  // Agregar el popup al body
  document.body.appendChild(popup);

  // Agregar estilos CSS para la animación
  if (!document.getElementById('location-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'location-popup-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .custom-location-popup {
        animation: slideInRight 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Eliminar el popup después de 3 segundos
  setTimeout(() => {
    if (popup.parentNode) {
      popup.style.animation = 'slideOutRight 0.3s ease-in';
      popup.style.transform = 'translateX(100%)';
      popup.style.opacity = '0';
      
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 300);
    }
  }, 5000);
};

// Hook personalizado para manejar la copia de ubicaciones
export const useMapLocationCopy = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Evento para copiar la ubicación con Ctrl + clic derecho en el mapa
    const handleContextMenu = (e) => {
      if (e.originalEvent.ctrlKey) {
        const { lat, lng } = e.latlng;

        // Generar el enlace de Google Maps
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        // Copiar el enlace al portapapeles
        copyToClipboard(googleMapsLink);

        // Mostrar el popup con el mensaje
        showPopupMessage('Ubicación copiada al portapapeles', googleMapsLink);

        // Prevenir el menú contextual por defecto
        e.originalEvent.preventDefault();
      }
    };

    // Agregar el evento al mapa
    map.on('contextmenu', handleContextMenu);

    // Cleanup: remover el evento cuando el componente se desmonte
    return () => {
      map.off('contextmenu', handleContextMenu);
    };
  }, [map]);

  // Retornar funciones que se pueden usar desde el componente si es necesario
  return {
    copyLocation: (lat, lng) => {
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      copyToClipboard(googleMapsLink);
      showPopupMessage('Ubicación copiada al portapapeles', googleMapsLink);
    }
  };
};
