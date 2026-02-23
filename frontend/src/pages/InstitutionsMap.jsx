import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, GraduationCap, School, Users, X, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { universitiesAPI } from '../api';

// Fix Leaflet default icon path broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom coloured markers
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

const icons = {
  university: makeIcon('#3B82F6'),
  college: makeIcon('#8B5CF6'),
  school: makeIcon('#10B981'),
  selected: makeIcon('#F59E0B'),
  user: makeIcon('#EF4444'),
};

// Fly to a location when selected changes
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 });
  }, [target, map]);
  return null;
}

const TYPE_LABELS = { university: '🎓 University', college: '🏛️ College', school: '🏫 School' };
const TYPE_COLORS = { university: 'bg-blue-500/10 text-blue-400 border-blue-500/20', college: 'bg-purple-500/10 text-purple-400 border-purple-500/20', school: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };

export default function InstitutionsMap() {
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    universitiesAPI.getAll()
      .then(({ data }) => setInstitutions(data.filter((u) => u.lat && u.lng)))
      .catch(() => {});
  }, []);

  const filtered = institutions.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.location?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || u.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (mapRef.current) mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.5 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  // Centre on India by default
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-navy-800 border-b border-navy-500 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-blue-400" />
          <h1 className="text-base font-semibold text-gray-100">Institutions Map</h1>
          <span className="badge bg-navy-600 text-gray-400 border border-navy-500">{filtered.length}</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or city…"
            className="w-full pl-7 pr-7 py-1.5 text-sm bg-navy-700 border border-navy-600 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5">
          {['all', 'university', 'college', 'school'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                typeFilter === t
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-navy-700 text-gray-400 border-navy-600 hover:text-gray-200'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Locate me */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-700 border border-navy-600 text-gray-400 hover:text-gray-200 text-xs font-medium transition-all disabled:opacity-50"
        >
          <Navigation size={13} className={locating ? 'animate-spin' : ''} />
          {locating ? 'Locating…' : 'Near me'}
        </button>
      </div>

      {/* Map + sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar list */}
        <div className="w-72 bg-navy-800 border-r border-navy-500 flex flex-col overflow-hidden flex-shrink-0 hidden lg:flex">
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
                <MapPin size={24} className="opacity-40" />
                No institutions found
              </div>
            ) : (
              filtered.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelected(u)}
                  className={`w-full text-left px-4 py-3 border-b border-navy-700 hover:bg-navy-700 transition-colors ${selected?._id === u._id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selected?._id === u._id ? 'text-blue-400' : 'text-gray-200'}`}>{u.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.location}</p>
                    </div>
                    <span className={`badge border text-xs shrink-0 ${TYPE_COLORS[u.type]}`}>
                      {u.type === 'university' ? '🎓' : u.type === 'college' ? '🏛️' : '🏫'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Users size={11} className="text-gray-600" />
                    <span className="text-xs text-gray-600">
                      {u.currentStudentCount >= u.maxStudents
                        ? 'Full — waitlist'
                        : `${u.maxStudents - u.currentStudentCount} spots left`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%', background: '#0b0f1a' }}
            ref={mapRef}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            {userPos && (
              <Marker position={[userPos.lat, userPos.lng]} icon={icons.user}>
                <Popup><strong>You are here</strong></Popup>
              </Marker>
            )}

            {/* Institution markers */}
            {filtered.map((u) => (
              <Marker
                key={u._id}
                position={[u.lat, u.lng]}
                icon={selected?._id === u._id ? icons.selected : icons[u.type] || icons.university}
                eventHandlers={{ click: () => setSelected(u) }}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{u.location}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{u.description}</div>
                    <div style={{ fontSize: '11px', color: u.currentStudentCount >= u.maxStudents ? '#ef4444' : '#10b981' }}>
                      {u.currentStudentCount >= u.maxStudents
                        ? '⚠ Full — joins waitlist'
                        : `✓ ${u.maxStudents - u.currentStudentCount} spots available`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {selected && <FlyTo target={selected} />}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-navy-800/95 backdrop-blur border border-navy-600 rounded-xl px-3 py-2 flex flex-col gap-1.5 text-xs">
            {[
              { color: '#3B82F6', label: 'University' },
              { color: '#8B5CF6', label: 'College' },
              { color: '#10B981', label: 'School' },
              { color: '#F59E0B', label: 'Selected' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: color }} />
                <span className="text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
