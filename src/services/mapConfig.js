import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon URLs with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export const NEPAL_CENTER_LATLNG = [28.0, 84.2];
export const NEPAL_DEFAULT_ZOOM = 7;

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Approximate geographic centroids for Nepal's 7 Provincial Hubs
export const PROVINCE_COORDINATES = {
  'Koshi Province': { lat: 26.6644, lng: 87.2718, hub: 'Biratnagar' },
  'Madhesh Province': { lat: 26.7288, lng: 85.9244, hub: 'Janakpurdham' },
  'Bagmati Province': { lat: 27.7172, lng: 85.324, hub: 'Kathmandu' },
  'Gandaki Province': { lat: 28.2096, lng: 83.9856, hub: 'Pokhara' },
  'Lumbini Province': { lat: 27.7006, lng: 83.4484, hub: 'Butwal' },
  'Karnali Province': { lat: 28.6019, lng: 81.6338, hub: 'Birendranagar' },
  'Sudurpashchim Province': { lat: 28.6852, lng: 80.5977, hub: 'Dhangadhi' },
};

// Approximate district centroids for aggregate regional donor cluster display
export const DISTRICT_CENTROIDS = {
  Kathmandu: [27.7172, 85.324],
  Lalitpur: [27.6588, 85.3247],
  Bhaktapur: [27.671, 85.4298],
  Chitwan: [27.5291, 84.3542],
  Kaski: [28.2096, 83.9856],
  Morang: [26.6644, 87.2718],
  Sunsari: [26.8124, 87.2834],
  Jhapa: [26.6438, 87.9898],
  Rupandehi: [27.5756, 83.4735],
  Dhanusha: [26.7288, 85.9244],
  Parsa: [27.0149, 84.8767],
  Surkhet: [28.6019, 81.6338],
  Kailali: [28.6852, 80.5977],
  Kanchanpur: [28.9167, 80.3333],
  Makwanpur: [27.4289, 85.0322],
  Kavrepalanchok: [27.6253, 85.5561],
};

// Known verified hospital coordinates in Nepal
export const HOSPITAL_COORDINATES = {
  'HOSP-NP-101': [27.7363, 85.3308], // Maharajgunj, Kathmandu
  'HOSP-NP-102': [27.6667, 85.3222], // Lagankhel, Lalitpur
  'HOSP-NP-103': [28.2096, 83.9856], // Pokhara, Kaski
  'HOSP-NP-104': [27.6833, 84.4333], // Bharatpur, Chitwan
  'HOSP-NP-105': [26.4525, 87.2718], // Biratnagar, Morang
  'HOSP-NP-106': [27.7006, 83.4484], // Butwal, Rupandehi
  'HOSP-NP-107': [28.6019, 81.6338], // Birendranagar, Surkhet
  'HOSP-NP-108': [28.6852, 80.5977], // Dhangadhi, Kailali
};

// Create custom icon builders
export function createHospitalIcon() {
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `<div style="background-color: #16A34A; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold; font-size: 14px;">H</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function createDonorClusterIcon(count) {
  const size = Math.min(44, 26 + count * 2);
  return L.divIcon({
    className: 'custom-donor-marker',
    html: `<div style="background-color: #DC2626; color: white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(220,38,38,0.4); border: 2px solid white; font-weight: 700; font-size: 12px;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
