import React, { useEffect, useMemo, useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_POSITION = [20.5937, 78.9629];
const hasCoordinate = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16, { animate: true });
  }, [map, position]);
  return null;
};

const MapClickHandler = ({ onPick }) => {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
};

const LocationPicker = ({ latitude, longitude, onSelect }) => {
  const initialPosition = useMemo(() => (
    hasCoordinate(latitude) && hasCoordinate(longitude)
      ? [Number(latitude), Number(longitude)]
      : DEFAULT_POSITION
  ), [latitude, longitude]);
  const [position, setPosition] = useState(initialPosition);
  const [status, setStatus] = useState('Click the map or use your current location.');
  const [locating, setLocating] = useState(false);

  useEffect(() => setPosition(initialPosition), [initialPosition]);

  const resolveAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
        { headers: { Accept: 'application/json' } },
      );
      if (!response.ok) throw new Error('Location lookup failed');
      const result = await response.json();
      onSelect({ latitude: lat, longitude: lng, address: result.address || {} });
      setStatus('Location selected. Review the address fields before saving.');
    } catch {
      onSelect({ latitude: lat, longitude: lng, address: {} });
      setStatus('Location saved. Enter or confirm the address details manually.');
    }
  };

  const selectPosition = (lat, lng) => {
    setPosition([lat, lng]);
    setStatus('Finding address details…');
    resolveAddress(lat, lng);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Location access is not supported by this browser.');
      return;
    }
    setLocating(true);
    setStatus('Getting your current location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        selectPosition(coords.latitude, coords.longitude);
      },
      () => {
        setLocating(false);
        setStatus('Could not access your location. Allow location permission or select a point on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="md:col-span-2 rounded-xl border border-[#E6E1D8] bg-[#FAF8F5] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]"><MapPin size={16} /> Choose Location on Map</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Your location is used only to help fill this delivery address.</p>
        </div>
        <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand)] bg-white px-4 py-2 text-xs font-bold text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white disabled:opacity-60">
          <Crosshair size={14} /> {locating ? 'Locating…' : 'Use Current Location'}
        </button>
      </div>
      <div className="h-72 overflow-hidden rounded-lg border border-[#E6E1D8]">
        <MapContainer center={position} zoom={hasCoordinate(latitude) && hasCoordinate(longitude) ? 16 : 5} className="h-full w-full" scrollWheelZoom>
          <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap position={position} />
          <MapClickHandler onPick={selectPosition} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      <p role="status" className="mt-3 text-xs text-[var(--color-muted)]">{status}</p>
    </div>
  );
};

export default LocationPicker;
