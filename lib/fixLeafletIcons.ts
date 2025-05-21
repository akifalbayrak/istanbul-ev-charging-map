import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IconDefaultPrototype {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
}); 