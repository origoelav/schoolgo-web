import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Usando o token do sistema
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface SchoolMapProps {
  center?: [number, number];
  zoom?: number;
  drivers?: any[];
  routes?: any[];
  students?: any[];
}

const SchoolMap: React.FC<SchoolMapProps> = ({ center = [-46.6333, -23.5505], zoom = 12, drivers = [], routes = [], students = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
    currentMarkers.forEach(m => m.remove());

    const markers: mapboxgl.Marker[] = [];

    // Add markers for students (Small dots)
    students.forEach(student => {
       if (student.address) {
          // Em um sistema real, usaríamos coordenadas. 
          // Como temos apenas endereço, simulamos perto do centro para visualização
          const lat = -23.5505 + (Math.random() * 0.04 - 0.02);
          const lng = -46.6333 + (Math.random() * 0.04 - 0.02);

          const el = document.createElement('div');
          el.className = 'student-marker';
          el.style.width = '8px';
          el.style.height = '8px';
          el.style.background = '#FACC15';
          el.style.borderRadius = '50%';
          el.style.border = '1px solid white';
          el.style.boxShadow = '0 0 10px #FACC15';

          const marker = new mapboxgl.Marker(el)
             .setLngLat([lng, lat])
             .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
                <div style="padding: 10px; color: #000; font-family: sans-serif;">
                   <p style="font-weight: 900; margin: 0; font-size: 12px; text-transform: uppercase;">${student.name}</p>
                   <p style="font-size: 10px; color: #666; margin: 5px 0;">📍 ${student.region || 'Região Base'}</p>
                   <p style="font-size: 9px; font-weight: 800; color: #4B6BFB; text-transform: uppercase;">${student.school}</p>
                </div>
             `))
             .addTo(map.current!);
          
          markers.push(marker);
       }
    });

    // Add markers for drivers
    drivers.forEach(driver => {
        if (driver.location) {
            const el = document.createElement('div');
            el.className = 'driver-marker';
            el.innerHTML = `
                <div style="background: #4B6BFB; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 900; white-space: nowrap; margin-bottom: 5px; transform: translateY(-30px); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    ${driver.name}
                </div>
                <div style="width: 35px; height: 35px; background: white; border-radius: 12px; padding: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2px solid #4B6BFB; display: flex; align-items: center; justify-content: center; color: #4B6BFB;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><path d="M14 18H9"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="18" r="2.5"/></svg>
                </div>
            `;
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.cursor = 'pointer';

            const marker = new mapboxgl.Marker(el)
                .setLngLat([driver.location.lng, driver.location.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="padding: 10px; color: #000; font-family: sans-serif;">
                        <p style="font-weight: 900; margin: 0;">${driver.name}</p>
                        <p style="font-size: 10px; color: #666; margin: 2px 0;">PLACA: ${driver.vehicle_plate || 'S/ PLACA'}</p>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                           <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
                           <span style="font-size: 9px; font-weight: 900; color: #10b981; text-transform: uppercase;">Conectado via APK</span>
                        </div>
                    </div>
                `))
                .addTo(map.current!);
            
            markers.push(marker);
        }
    });

    return () => {
        markers.forEach(m => m.remove());
    };
  }, [drivers, students]);

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-school-blue mb-1">Status do Monitor</p>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">Monitorando {drivers.length} veículos</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolMap;
