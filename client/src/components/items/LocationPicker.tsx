import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { geoApi } from '../../services/endpoints';
import Input from '../ui/Input';
import Button from '../ui/Button';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationValue {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

interface Props {
  value: LocationValue;
  onChange: (val: LocationValue) => void;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ lat: string; lon: string; display_name: string; name?: string }>>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await geoApi.search(query);
      setResults(data);
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place: (typeof results)[0]) => {
    onChange({
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      address: place.display_name,
      placeName: place.name || place.display_name.split(',')[0],
    });
    setResults([]);
    setQuery('');
  };

  const handleMapClick = async (lat: number, lng: number) => {
    onChange({ ...value, latitude: lat, longitude: lng });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search campus location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
        />
        <Button type="button" variant="secondary" onClick={handleSearch} loading={searching}>
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => selectPlace(r)}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="h-64 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={[value.latitude, value.longitude]}
          zoom={16}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <Marker position={[value.latitude, value.longitude]} icon={markerIcon} />
          <MapClickHandler onChange={handleMapClick} />
        </MapContainer>
      </div>

      <p className="text-sm text-slate-500">
        Click on the map or search to set location. {value.placeName && <strong>{value.placeName}</strong>}
      </p>
    </div>
  );
}
