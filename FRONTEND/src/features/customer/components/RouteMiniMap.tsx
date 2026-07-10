import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-zooming when bounds change
const MapBoundsUpdater: React.FC<{ bounds: L.LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1.5 });
    } else {
      // Default view to Vietnam
      map.setView([16.047079, 108.206230], 5);
    }
  }, [bounds, map]);
  return null;
};

interface RouteMiniMapProps {
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

const RouteMiniMap: React.FC<RouteMiniMapProps> = ({ pickupLat, pickupLng, deliveryLat, deliveryLng }) => {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (pickupLat && pickupLng && deliveryLat && deliveryLng) {
      const newBounds = L.latLngBounds(
        L.latLng(pickupLat, pickupLng),
        L.latLng(deliveryLat, deliveryLng)
      );
      setBounds(newBounds);
    } else {
      setBounds(null);
    }
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng]);

  return (
    <div className="w-full h-full min-h-[300px] relative z-0">
      <MapContainer
        center={[16.047079, 108.206230]} // Default to Vietnam
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapBoundsUpdater bounds={bounds} />

        {pickupLat && pickupLng && (
          <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />
        )}

        {deliveryLat && deliveryLng && (
          <Marker position={[deliveryLat, deliveryLng]} icon={deliveryIcon} />
        )}

        {pickupLat && pickupLng && deliveryLat && deliveryLng && (
          <Polyline 
            positions={[
              [pickupLat, pickupLng],
              [deliveryLat, deliveryLng]
            ]} 
            color="#8b5cf6" // Purple-500
            weight={4}
            dashArray="10, 10"
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMiniMap;
