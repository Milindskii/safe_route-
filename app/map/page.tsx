'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Navigation, MapPin, Info, Plus, Minus, RotateCcw, Sun, Moon, ArrowLeft, X, Route } from 'lucide-react';
import Link from 'next/link';
import SafeBot from '../landing/SafeBot';

// Default location (New York)
const DEFAULT_LOCATION = 'New York, NY';

export default function MapPage() {
  const [isDark, setIsDark] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [safetyScore, setSafetyScore] = useState(92);
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [mapUrl, setMapUrl] = useState(
    `https://maps.google.com/maps?q=${encodeURIComponent(DEFAULT_LOCATION)}&output=embed&z=14`
  );

  const updateMapLocation = () => {
    if (searchTo) {
      setCurrentLocation(searchTo);
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(searchTo)}&output=embed&z=15`);
    } else if (searchFrom) {
      setCurrentLocation(searchFrom);
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(searchFrom)}&output=embed&z=15`);
    }
  };

  const handleSampleRoute = () => {
    setSearchFrom('Central Park, New York, NY');
    setSearchTo('Times Square, New York, NY');
    setMapUrl(`https://maps.google.com/maps?q=Times+Square,New+York,NY&output=embed&z=14`);
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleRecenter = () => {
    setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(currentLocation)}&output=embed&z=14`);
  };

  const handleZoomIn = () => {
    // Extract current zoom and increase it
    const currentZoom = parseInt(mapUrl.match(/z=(\d+)/)?.[1] || '14');
    const newZoom = Math.min(currentZoom + 1, 20);
    setMapUrl(mapUrl.replace(/z=\d+/, `z=${newZoom}`));
  };

  const handleZoomOut = () => {
    const currentZoom = parseInt(mapUrl.match(/z=(\d+)/)?.[1] || '14');
    const newZoom = Math.max(currentZoom - 1, 1);
    setMapUrl(mapUrl.replace(/z=\d+/, `z=${newZoom}`));
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-900">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/" className="bg-black/50 backdrop-blur-md border border-gray-700 p-3 rounded-xl flex items-center gap-2 hover:border-green-500 transition-all group shadow-lg">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" />
            <span className="font-syne text-xs uppercase tracking-widest text-white">Back to Home</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-syne text-[10px] uppercase tracking-[0.2em] text-white">Live Safety Intelligence</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 bg-black/50 backdrop-blur-md border border-gray-700 px-4 py-2 rounded-xl shadow-lg">
            <div className="flex flex-col items-end">
              <span className="font-syne text-[8px] uppercase tracking-[0.3em] text-green-400">Region Dashboard</span>
              <span className="font-playfair text-sm text-white font-bold">{currentLocation}</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-700" />
            <div className="flex flex-col items-start">
              <span className="font-jetbrains text-[10px] text-green-400 font-bold uppercase tracking-widest">Connected</span>
              <span className="font-jetbrains text-[8px] text-gray-400">Google Maps</span>
            </div>
          </div>
          <button onClick={toggleTheme} className="bg-black/50 backdrop-blur-md border border-gray-700 p-3 rounded-xl hover:border-green-500 transition-all shadow-lg group">
            {isDark ? <Sun className="w-5 h-5 text-green-400 group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 text-green-400 group-hover:-rotate-12 transition-transform" />}
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
          className="w-full h-full max-w-6xl bg-black/30 backdrop-blur-sm rounded-3xl overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.4)] border border-gray-800"
        >
          {/* Google Maps Iframe */}
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
            title="Google Maps"
          />

          {/* Floating Toggle Button */}
          <div className="absolute top-8 left-8 z-30 pointer-events-auto">
            <button
              onClick={() => setIsRoutePanelOpen(!isRoutePanelOpen)}
              className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 group ${isRoutePanelOpen ? 'bg-green-500 text-black border-transparent' : 'bg-black/90 backdrop-blur-xl border border-gray-700 text-white'
                }`}
            >
              {isRoutePanelOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              <span className="font-syne text-xs uppercase tracking-widest font-bold">
                {isRoutePanelOpen ? 'Close Search' : 'Plan Route'}
              </span>
            </button>
          </div>

          {/* Floating Search Panel */}
          <AnimatePresence>
            {isRoutePanelOpen && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-28 left-8 w-full max-w-sm pointer-events-auto z-20"
              >
                <div className="bg-gray-900/95 backdrop-blur-2xl p-8 rounded-3xl border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8">
                  <div className="space-y-1">
                    <h3 className="font-playfair text-2xl text-white">Plan Your Route</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Powered by Google Maps</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 ml-1">Origin Point</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Central Park, NY"
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          className="w-full bg-gray-800/40 border border-gray-700 rounded-2xl pl-12 pr-4 py-4 font-jetbrains text-xs text-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 ml-1">Destination</label>
                      <div className="relative group">
                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Times Square, NY"
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          className="w-full bg-gray-800/40 border border-gray-700 rounded-2xl pl-12 pr-4 py-4 font-jetbrains text-xs text-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={updateMapLocation}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-syne font-bold py-5 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-[0.1em] text-xs">Search Location</span>
                  </button>

                  {/* Sample route info */}
                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-white">SAMPLE ROUTE</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Central Park → Times Square</p>
                    <p className="text-[10px] text-gray-400">Distance: 2.3 miles | Est. time: 15 min</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-green-500 rounded-full" />
                      </div>
                      <span className="text-xs text-green-400 font-bold">92% Safe</span>
                    </div>
                    <button
                      onClick={handleSampleRoute}
                      className="mt-3 w-full bg-blue-600/50 hover:bg-blue-600 text-white text-xs py-2 rounded-lg border border-blue-500/30 transition-colors"
                    >
                      Try Sample Route
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Safety Score Badge */}
          <div className="absolute bottom-6 left-6 pointer-events-none z-10">
            <div className="bg-black/50 backdrop-blur-md px-4 py-3 border-l-4 border-l-green-500 rounded-lg pointer-events-auto">
              <span className="font-jetbrains text-xs tracking-tight text-white">
                Route Safety Score: <span className="text-green-400 font-bold">{safetyScore}/100</span> ✅
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-6 right-20 pointer-events-none z-10">
            <div className="bg-black/50 backdrop-blur-md px-4 py-3 rounded-lg pointer-events-auto">
              <div className="flex items-center gap-4 font-syne text-[10px] uppercase tracking-widest text-white">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Safe
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" /> Moderate
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
              className="bg-black/50 backdrop-blur-md p-3 rounded-lg hover:border-green-500 transition-colors border border-gray-700"
              title="Recenter"
            >
              <RotateCcw className="w-5 h-5 text-green-400" />
            </button>
            <div className="flex flex-col bg-black/50 backdrop-blur-md rounded-lg overflow-hidden border border-gray-700">
              <button
                onClick={handleZoomIn}
                className="p-3 hover:bg-white/5 transition-colors border-b border-gray-700"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-3 hover:bg-white/5 transition-colors"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Google Attribution */}
          <div className="absolute bottom-2 left-2 text-[10px] text-white/50 bg-black/30 px-2 py-1 rounded">
            Map data © Google
          </div>
        </motion.div>
      </div>
      <SafeBot />
    </div>
  );
}