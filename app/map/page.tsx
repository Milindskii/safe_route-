'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Navigation, MapPin, Info, Plus, Minus, RotateCcw, Sun, Moon, ArrowLeft, X, Route, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import SafeBot from '../landing/SafeBot'; // Keep your SafeBot import

export default function MapPage() {
  const [isDark, setIsDark] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('Times Square, New York, NY');
  const [safetyScore, setSafetyScore] = useState(92);
  const [mapSrc, setMapSrc] = useState(
    `https://www.google.com/maps?q=Times+Square,New+York,NY&output=embed`
  );
  const [mapKey, setMapKey] = useState(Date.now());

  const updateMapLocation = () => {
    if (!searchTo) return;

    let newSrc = '';
    
    if (searchFrom && searchTo) {
      // Show route between two locations
      const encodedOrigin = encodeURIComponent(searchFrom);
      const encodedDest = encodeURIComponent(searchTo);
      newSrc = `https://www.google.com/maps?saddr=${encodedOrigin}&daddr=${encodedDest}&output=embed`;
    } else {
      // Show single location
      const encodedLocation = encodeURIComponent(searchTo);
      newSrc = `https://www.google.com/maps?q=${encodedLocation}&output=embed&z=15`;
    }

    setMapSrc(newSrc);
    setMapKey(Date.now()); // Force iframe to reload
    setSafetyScore(Math.floor(Math.random() * 30) + 70);
  };

  const handleSampleRoute = () => {
    const from = 'Central Park, New York, NY';
    const to = 'Times Square, New York, NY';
    setSearchFrom(from);
    setSearchTo(to);
    setMapSrc(`https://www.google.com/maps?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}&output=embed`);
    setMapKey(Date.now());
    setSafetyScore(92);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateMapLocation();
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleRecenter = () => {
    if (searchTo) {
      updateMapLocation();
    } else {
      setMapSrc(`https://www.google.com/maps?q=New+York,NY&output=embed&z=12`);
      setMapKey(Date.now());
    }
  };

  const handleZoomIn = () => {
    // Extract current zoom level and increase it
    const zoomMatch = mapSrc.match(/z=(\d+)/);
    const currentZoom = zoomMatch ? parseInt(zoomMatch[1]) : 15;
    const newZoom = Math.min(currentZoom + 1, 20);
    const newSrc = mapSrc.replace(/z=\d+/, `z=${newZoom}`);
    setMapSrc(newSrc);
    setMapKey(Date.now());
  };

  const handleZoomOut = () => {
    const zoomMatch = mapSrc.match(/z=(\d+)/);
    const currentZoom = zoomMatch ? parseInt(zoomMatch[1]) : 15;
    const newZoom = Math.max(currentZoom - 1, 1);
    const newSrc = mapSrc.replace(/z=\d+/, `z=${newZoom}`);
    setMapSrc(newSrc);
    setMapKey(Date.now());
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-primary-dark">
      {/* Topographic Background - From first code */}
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

      {/* Header with Back Button and Theme Toggle - From first code style */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="bg-surface/80 backdrop-blur-md border border-border p-3 rounded-xl flex items-center gap-2 hover:border-accent transition-all group shadow-lg">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-text-primary" />
            <span className="font-syne text-xs uppercase tracking-widest text-text-primary">Back</span>
          </Link>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-surface/80 backdrop-blur-md border border-border rounded-xl shadow-lg">
            <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />
            <span className="font-syne text-[10px] uppercase tracking-[0.2em] text-text-primary">Live Safety Intelligence</span>
          </div>
          <button onClick={toggleTheme} className="bg-surface/80 backdrop-blur-md border border-border p-3 rounded-xl hover:border-accent transition-all shadow-lg group">
            {isDark ? <Sun className="w-5 h-5 text-accent group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 text-accent group-hover:-rotate-12 transition-transform" />}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full max-w-7xl glass-card overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.4)]"
        >
          {/* Google Maps Iframe with key to force refresh */}
          <iframe
            key={mapKey}
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
            title="Google Maps"
          />

          {/* HORIZONTAL SEARCH BAR */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-3xl px-4 pointer-events-auto">
            <div className="bg-background/95 backdrop-blur-2xl rounded-2xl border border-border shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {/* From Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Starting point (optional)"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-surface/40 border border-border rounded-xl pl-9 pr-3 py-3.5 font-jetbrains text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                {/* To Input */}
                <div className="flex-1 relative group">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-safe transition-colors" />
                  <input
                    type="text"
                    placeholder="Destination (required)"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-surface/40 border border-border rounded-xl pl-9 pr-3 py-3.5 font-jetbrains text-sm text-text-primary focus:outline-none focus:border-safe focus:ring-2 focus:ring-safe/20 transition-all"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={updateMapLocation}
                  className="bg-accent hover:bg-accent-hover text-background font-syne font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Go</span>
                </button>

                {/* Sample Route Button */}
                <button
                  onClick={handleSampleRoute}
                  className="bg-surface/80 hover:bg-surface border border-border text-text-primary p-3.5 rounded-xl transition-all active:scale-[0.98]"
                  title="Try sample route"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap items-center gap-2 mt-3 px-2">
                <span className="text-[8px] uppercase tracking-widest text-text-secondary">Popular:</span>
                {[
                  { name: 'Empire State', query: 'Empire State Building, New York, NY' },
                  { name: 'Brooklyn Bridge', query: 'Brooklyn Bridge, New York, NY' },
                  { name: 'Statue of Liberty', query: 'Statue of Liberty, New York, NY' },
                  { name: 'Central Park', query: 'Central Park, New York, NY' },
                  { name: 'London', query: 'London, UK' },
                  { name: 'Paris', query: 'Paris, France' },
                  { name: 'Tokyo', query: 'Tokyo, Japan' },
                ].map((place) => (
                  <button
                    key={place.name}
                    onClick={() => {
                      setSearchTo(place.query);
                      const newSrc = `https://www.google.com/maps?q=${encodeURIComponent(place.query)}&output=embed&z=15`;
                      setMapSrc(newSrc);
                      setMapKey(Date.now());
                    }}
                    className="px-2.5 py-1.5 bg-surface/40 hover:bg-surface/60 text-text-secondary hover:text-text-primary text-[9px] rounded-md border border-border transition-all"
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Score Badge */}
          <div className="absolute bottom-6 left-6 pointer-events-none z-10">
            <div className="glass-card px-4 py-3 border-l-4 border-l-accent pointer-events-auto">
              <span className="font-jetbrains text-xs tracking-tight text-text-primary">
                Safety Score: <span className="text-safe font-bold">{safetyScore}/100</span> ✅
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-6 right-20 pointer-events-none z-10">
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
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
            <button
              onClick={handleRecenter}
              className="glass-card p-3 hover:border-accent transition-colors"
              title="Recenter"
            >
              <RotateCcw className="w-5 h-5 text-accent" />
            </button>
            <div className="flex flex-col glass-card overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-3 hover:bg-white/5 transition-colors border-b border-white/5"
                title="Zoom in"
              >
                <Plus className="w-5 h-5 text-text-primary" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-3 hover:bg-white/5 transition-colors"
                title="Zoom out"
              >
                <Minus className="w-5 h-5 text-text-primary" />
              </button>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/${encodeURIComponent(searchFrom)}/${encodeURIComponent(searchTo)}`, '_blank')}
              className="glass-card p-3 hover:border-accent transition-colors"
              title="Get Directions"
            >
              <Route className="w-5 h-5 text-accent" />
            </button>
          </div>

          {/* Google Attribution */}
          <div className="absolute bottom-2 left-2 text-[8px] text-text-secondary/50 bg-black/20 px-2 py-1 rounded z-10">
            Map data © Google
          </div>
        </motion.div>
      </div>
      
      {/* SafeBot - Added exactly as in the first code */}
      <SafeBot />
    </div>
  );
}