import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

const GoogleMapContainer = ({ center, zoom, children, style }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [google, setGoogle] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });
      
      setMap(googleMap);
      setGoogle(window.google);
    }
  }, [center, zoom, map]);

  return (
    <div ref={mapRef} style={style}>
      {map && google && 
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { map, google });
          }
          return child;
        })
      }
    </div>
  );
};

const GoogleMapWrapper = ({ center, zoom, children, style }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div style={{...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0'}}>
        <div style={{textAlign: 'center', color: '#666'}}>
          <h3>⚠️ API Key de Google Maps no encontrada</h3>
          <p>Por favor agrega VITE_GOOGLE_MAPS_API_KEY a tu archivo .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} libraries={['places', 'geometry', 'routes', 'visualization']}>
      <GoogleMapContainer center={center} zoom={zoom} style={style}>
        {children}
      </GoogleMapContainer>
    </Wrapper>
  );
};

export default GoogleMapWrapper; 