import { Building2, Layers, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { NEPAL_PROVINCES } from '../../data/locations';
import {
  createDonorClusterIcon,
  createHospitalIcon,
  DISTRICT_CENTROIDS,
  HOSPITAL_COORDINATES,
  NEPAL_CENTER_LATLNG,
  NEPAL_DEFAULT_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  PROVINCE_COORDINATES,
} from '../../services/mapConfig';
import { Surface } from './ui';

// Non-overlapping provincial hub coordinates in 820x340 cartographic projection
const HUB_MARKERS = [
  { province: 'Sudurpashchim Province', city: 'Dhangadhi', district: 'Kailali', x: 136, y: 184, labelX: 136, labelY: 212 },
  { province: 'Karnali Province', city: 'Birendranagar', district: 'Surkhet', x: 226, y: 162, labelX: 226, labelY: 138 },
  { province: 'Lumbini Province', city: 'Butwal', district: 'Rupandehi', x: 358, y: 238, labelX: 358, labelY: 266 },
  { province: 'Gandaki Province', city: 'Pokhara', district: 'Kaski', x: 404, y: 178, labelX: 404, labelY: 154 },
  { province: 'Bagmati Province', city: 'Kathmandu', district: 'Kathmandu', x: 522, y: 204, labelX: 522, labelY: 180 },
  { province: 'Madhesh Province', city: 'Janakpurdham', district: 'Dhanusha', x: 586, y: 274, labelX: 586, labelY: 300 },
  { province: 'Koshi Province', city: 'Biratnagar', district: 'Morang', x: 702, y: 268, labelX: 702, labelY: 244 },
];

export default function NepalLocatorMap({
  selectedProvince = '',
  selectedDistrict = '',
  onSelectProvince,
  onSelectDistrict,
  hospitals = [],
  donors = [],
}) {
  const [mapMode, setMapMode] = useState('leaflet'); // 'leaflet' | 'vector'

  // Aggregate donors by district for privacy-preserving clusters
  const districtDonorClusters = useMemo(() => {
    const clusterMap = {};
    donors.forEach((donor) => {
      const dist = donor.district;
      if (!dist) return;
      if (!clusterMap[dist]) {
        clusterMap[dist] = {
          district: dist,
          province: donor.province,
          count: 0,
          bloodGroups: {},
        };
      }
      clusterMap[dist].count += 1;
      clusterMap[dist].bloodGroups[donor.bloodGroup] =
        (clusterMap[dist].bloodGroups[donor.bloodGroup] || 0) + 1;
    });

    return Object.values(clusterMap).map((item) => {
      const coords = DISTRICT_CENTROIDS[item.district] || [27.7, 85.3];
      return {
        ...item,
        lat: coords[0],
        lng: coords[1],
      };
    });
  }, [donors]);

  // Verified hospitals with geographical positioning
  const mappedHospitals = useMemo(() => {
    return hospitals
      .filter((h) => h.verificationStatus === 'Verified')
      .map((h) => {
        const coords = HOSPITAL_COORDINATES[h.id] || DISTRICT_CENTROIDS[h.district] || [27.7172, 85.324];
        return {
          ...h,
          lat: coords[0],
          lng: coords[1],
        };
      });
  }, [hospitals]);

  const getCountsForProvince = (provinceName) => {
    const donorCount = donors.filter((d) => d.province === provinceName).length;
    const hospitalCount = hospitals.filter(
      (h) => h.province === provinceName && h.verificationStatus === 'Verified'
    ).length;
    return { donorCount, hospitalCount };
  };

  return (
    <Surface className="overflow-hidden p-5 sm:p-6">
      {/* Header with View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Nepal Blood Coordination & Donor Discovery Map
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Interactive OpenStreetMap with approximate district donor clusters and verified blood banks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-control border border-border p-0.5 bg-background">
            <button
              type="button"
              onClick={() => setMapMode('leaflet')}
              className={`px-3 py-1 text-xs font-medium rounded-control transition-colors ${
                mapMode === 'leaflet'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Interactive Map
            </button>
            <button
              type="button"
              onClick={() => setMapMode('vector')}
              className={`px-3 py-1 text-xs font-medium rounded-control transition-colors ${
                mapMode === 'vector'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Provincial Vector
            </button>
          </div>

          {(selectedProvince || selectedDistrict) && (
            <button
              type="button"
              onClick={() => {
                if (onSelectProvince) onSelectProvince('');
                if (onSelectDistrict) onSelectDistrict('');
              }}
              className="text-xs font-medium text-primary hover:underline ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-4 flex items-center gap-2 rounded-control bg-primary-tint/50 border border-primary/20 px-3 py-2 text-xs text-foreground">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Privacy Guard:</strong> Individual donor home addresses and contact numbers are strictly confidential. Pins represent aggregate district centers and licensed hospital blood transfusion centers only.
        </span>
      </div>

      {/* Map View Rendering */}
      {mapMode === 'leaflet' ? (
        <div className="relative h-[420px] w-full rounded-control overflow-hidden border border-border z-0">
          <MapContainer
            center={NEPAL_CENTER_LATLNG}
            zoom={NEPAL_DEFAULT_ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

            {/* Approximate District Donor Clusters */}
            {districtDonorClusters.map((cluster) => (
              <Marker
                key={`donor-cluster-${cluster.district}`}
                position={[cluster.lat, cluster.lng]}
                icon={createDonorClusterIcon(cluster.count)}
                eventHandlers={{
                  click: () => {
                    if (onSelectDistrict) onSelectDistrict(cluster.district);
                    if (onSelectProvince) onSelectProvince(cluster.province);
                  },
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{cluster.district} District</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{cluster.province}</p>
                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="font-medium text-foreground">
                        {cluster.count} voluntary {cluster.count === 1 ? 'donor' : 'donors'} registered
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(cluster.bloodGroups).map(([bg, num]) => (
                          <span
                            key={bg}
                            className="inline-block bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
                          >
                            {bg}: {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    {onSelectDistrict && (
                      <button
                        type="button"
                        onClick={() => onSelectDistrict(cluster.district)}
                        className="mt-2 w-full text-center text-xs bg-primary text-white py-1 rounded font-medium hover:bg-primary-deep transition-colors"
                      >
                        Filter by {cluster.district}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Verified Hospital Markers */}
            {mappedHospitals.map((hosp) => (
              <Marker
                key={`hosp-${hosp.id}`}
                position={[hosp.lat, hosp.lng]}
                icon={createHospitalIcon()}
              >
                <Popup>
                  <div className="p-1 min-w-[210px]">
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                      <Building2 className="h-4 w-4 text-success" />
                      <span>{hosp.hospitalName.replace('(Demo Institution)', '')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-success font-medium mt-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Blood Bank</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{hosp.address}, {hosp.district}</p>
                    <div className="mt-2 text-xs border-t border-slate-200 pt-1.5">
                      <div className="text-muted">Emergency Hotline:</div>
                      <div className="font-mono font-medium text-foreground">{hosp.emergencyDeskPhone || hosp.contactNumber}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* Vector SVG Overview Map */
        <div className="border-t border-border/50 pt-4">
          <svg
            viewBox="0 0 820 340"
            role="img"
            aria-label="Provincial blood coordination map of Nepal from Sudurpashchim to Koshi"
            className="h-auto w-full max-w-4xl select-none"
          >
            <path
              d="M 74 114 L 154 94 L 246 86 L 342 118 L 448 138 L 552 156 L 656 176 L 758 202 L 764 278 L 664 290 L 548 292 L 444 266 L 336 258 L 222 232 L 106 206 Z"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 136 184 L 226 162 L 404 178 L 522 204 L 702 268"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.75"
              strokeDasharray="4 4"
            />
            <path
              d="M 136 184 L 358 238 L 586 274 L 702 268"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />

            {HUB_MARKERS.map((hub) => {
              const isSelected = selectedProvince === hub.province;
              return (
                <g
                  key={hub.province}
                  onClick={() =>
                    onSelectProvince &&
                    onSelectProvince(isSelected ? '' : hub.province)
                  }
                  className={onSelectProvince ? 'cursor-pointer' : ''}
                >
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={isSelected ? 9 : 6.5}
                    fill={isSelected ? '#991B1B' : '#DC2626'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}

            {HUB_MARKERS.map((hub) => {
              const { donorCount, hospitalCount } = getCountsForProvince(hub.province);
              return (
                <g
                  key={`${hub.province}-label`}
                  onClick={() =>
                    onSelectProvince &&
                    onSelectProvince(selectedProvince === hub.province ? '' : hub.province)
                  }
                  className={onSelectProvince ? 'cursor-pointer' : ''}
                >
                  <text
                    x={hub.labelX}
                    y={hub.labelY}
                    textAnchor="middle"
                    className="map-halo-label text-[12px] font-semibold fill-foreground"
                  >
                    {hub.city}
                  </text>
                  <text
                    x={hub.labelX}
                    y={hub.labelY + 14}
                    textAnchor="middle"
                    className="map-halo-label text-[10px] font-medium fill-muted"
                  >
                    {donorCount}d · {hospitalCount}h
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Quick Province Selector Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
        {NEPAL_PROVINCES.map((prov) => {
          const active = selectedProvince === prov.name;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => onSelectProvince && onSelectProvince(active ? '' : prov.name)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-control border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground hover:bg-background'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{prov.name.replace(' Province', '')}</span>
            </button>
          );
        })}
      </div>
    </Surface>
  );
}
