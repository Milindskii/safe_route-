'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Shield, Search, Navigation, MapPin, Info, Plus, Minus, RotateCcw, Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Replace with your actual token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoib3BlbmJ1aWxkZXIiLCJhIjoiY204Ym96Z29pMDBqZzJqcHh6Z29pMDBqZCJ9.YOUR_MAPBOX_ACCESS_TOKEN';

const DEFAULT_COORDS: [number, number] = [-74.006, 40.7128]; // NYC

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [safetyScore, setSafetyScore] = useState(92);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
        center: DEFAULT_COORDS,
        zoom: 13,
        attributionControl: false,
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add Safety Heatmap
        map.current.addSource('safety-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.006, 40.7128] }, properties: { intensity: 1 } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.010, 40.7150] }, properties: { intensity: 0.8 } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.000, 40.7100] }, properties: { intensity: 0.6 } },
            ]
          }
        });

        map.current.addLayer({
          id: 'safety-heatmap',
          type: 'heatmap',
          source: 'safety-points',
          paint: {
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.5, '#F5A623',
              1, '#4CAF84'
            ],
            'heatmap-intensity': 1.2,
            'heatmap-opacity': 0.6
          }
        });

        // Add Safe Route Line (Placeholder)
        map.current.addSource('safe-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [-74.006, 40.7128],
                [-74.008, 40.7140],
                [-74.010, 40.7150]
              ]
            },
            properties: {}
          }
        });

        map.current.addLayer({
          id: 'safe-route-line',
          type: 'line',
          source: 'safe-route',
          paint: {
            'line-color': '#4CAF84',
            'line-width': 5,
            'line-opacity': 0.85
          }
        });

        // Custom Markers
        const originEl = document.createElement('div');
        originEl.className = 'w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-white shadow-lg';
        originEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>';
        
        new mapboxgl.Marker(originEl)
          .setLngLat([-74.006, 40.7128])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div class="p-2 font-syne"><b>Origin</b><br/><span class="text-xs text-text-muted">Safety Score: 92/100</span></div>'))
          .addTo(map.current);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleRecenter = () => {
    map.current?.flyTo({ center: DEFAULT_COORDS, zoom: 13 });
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-primary-dark">
      {/* Topographic Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-map" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60 Q 30 50 60 60 T 120 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 30 Q 30 20 60 30 T 120 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 90 Q 30 80 60 90 T 120 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-map)" />
        </svg>
      </div>

      {/* Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <Link href="/" className="glass-card p-3 flex items-center gap-2 hover:border-accent transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-syne text-sm uppercase tracking-widest">Back</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 glass-card w-fit">
            <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />
            <span className="font-syne text-[10px] uppercase tracking-[0.2em]">Live Safety Map — Beta</span>
          </div>
        </div>

        <div className="pointer-events-auto">
          <button onClick={toggleTheme} className="glass-card p-3 hover:border-accent transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ y: 80, opacity: 0, rotate: -0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          whileHover={{ rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full max-w-6xl glass-card overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.4)]"
        >
          <div ref={mapContainer} className="w-full h-full" />

          {/* Floating Search Card */}
          <div className="absolute top-6 left-6 w-full max-w-sm pointer-events-none">
            <div className="glass-card p-6 pointer-events-auto space-y-4 border-accent/20">
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Starting point..."
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full bg-primary-dark/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 font-jetbrains text-xs focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Destination..."
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="w-full bg-primary-dark/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 font-jetbrains text-xs focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>
              <button className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Find Safe Route
              </button>
            </div>
          </div>

          {/* Safety Score Badge */}
          <div className="absolute bottom-6 left-6 pointer-events-none">
            <div className="glass-card px-4 py-3 border-l-4 border-l-accent pointer-events-auto">
              <span className="font-jetbrains text-xs tracking-tight">
                Route Safety Score: <span className="text-safe font-bold">{safetyScore}/100</span> ✅
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-6 right-20 pointer-events-none">
            <div className="glass-card px-4 py-3 pointer-events-auto">
              <div className="flex items-center gap-4 font-syne text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-safe" /> Safe
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent" /> Moderate
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Avoid
                </div>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button 
              onClick={handleRecenter}
              className="glass-card p-3 hover:border-accent transition-colors"
              title="Recenter"
            >
              <RotateCcw className="w-5 h-5 text-accent" />
            </button>
            <div className="flex flex-col glass-card overflow-hidden">
              <button 
                onClick={() => map.current?.zoomIn()}
                className="p-3 hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => map.current?.zoomOut()}
                className="p-3 hover:bg-white/5 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
