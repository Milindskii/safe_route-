'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Sun, Moon, ArrowRight, ArrowDown, Search, MapPin, Navigation, RotateCcw, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import SafeBot from './SafeBot';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your actual token
mapboxgl.accessToken = 'pk.eyJ1Ijoib3BlbmJ1aWxkZXIiLCJhIjoiY204Ym96Z29pMDBqZzJqcHh6Z29pMDBqCJ9.YOUR_MAPBOX_ACCESS_TOKEN';

const DEFAULT_COORDS: [number, number] = [-74.006, 40.7128];

const NavLink = ({ href, children, active, onClick }: { href: string, children: React.ReactNode, active: boolean, onClick: () => void }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="relative px-4 py-2 font-syne text-[0.875rem] tracking-[0.08em] uppercase transition-colors hover:text-accent"
  >
    {children}
    {active && (
      <motion.div 
        layoutId="nav-underline"
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
  </Link>
);

const StatItem = ({ number, label, index }: { number: string, label: string, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(number.replace(/[^0-9]/g, ''));
      animate(count, numericValue, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, count, number]);

  const sizes = ["text-5xl md:text-7xl", "text-4xl md:text-6xl", "text-3xl md:text-5xl"];

  return (
    <div ref={ref} className={`flex flex-col gap-2 ${index === 1 ? 'md:mt-12' : index === 2 ? 'md:mt-24' : ''}`}>
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: index * 0.2 }}
        className="h-[2px] bg-accent origin-left mb-4"
      />
      <motion.span className={`font-syne font-bold ${sizes[index]}`}>
        {rounded}{number.includes('+') ? '+' : number.includes('%') ? '%' : ''}
      </motion.span>
      <span className="font-syne text-sm uppercase tracking-widest text-text-muted">{label}</span>
    </div>
  );
};

const StepCard = ({ step, index }: { step: any, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ x: index % 2 === 0 ? -60 : 60, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.15 }}
      className={`glass-card p-8 md:p-12 relative overflow-hidden max-w-3xl ${index === 1 ? 'ml-auto' : ''}`}
    >
      <span className="absolute -top-4 -left-4 font-playfair text-[8rem] opacity-[0.06] pointer-events-none select-none">
        0{index + 1}
      </span>
      <div className="relative z-10">
        <div className="text-4xl mb-6">{step.icon}</div>
        <h3 className="font-playfair text-3xl mb-4">{step.title}</h3>
        <p className="font-lora text-lg leading-relaxed text-text-muted">{step.description}</p>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(13, 27, 42, 0)", "rgba(13, 27, 42, 0.85)"]
  );

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
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
        // Add heatmap and route layers (similar to map/page.tsx)
        map.current.addSource('safety-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.006, 40.7128] }, properties: { intensity: 1 } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.010, 40.7150] }, properties: { intensity: 0.8 } },
            ]
          }
        });

        map.current.addLayer({
          id: 'safety-heatmap',
          type: 'heatmap',
          source: 'safety-points',
          paint: {
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.5, '#F5A623', 1, '#4CAF84'],
            'heatmap-intensity': 1.2,
            'heatmap-opacity': 0.6
          }
        });
      });
    }
  }, [isDark]);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen selection:bg-accent/30">
      {/* Scroll Progress Line */}
      <motion.div 
        className="fixed left-0 top-0 bottom-0 w-[1px] bg-accent/30 z-50 origin-top"
        style={{ scaleY: useTransform(scrollY, [0, 5000], [0, 1]) }}
      />

      {/* Navbar */}
      <motion.nav 
        style={{ backgroundColor: navBg, backdropFilter: "blur(16px)" }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-accent w-6 h-6" />
            <span className="font-playfair text-xl font-bold">SafeRoute</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {['Home', 'How It Works', 'Safety Map', 'About'].map((item) => (
              <NavLink 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                active={activeTab === item}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/map" className="btn-primary py-2 px-6 text-sm hidden sm:block">
              Open Map
            </Link>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-[1.5fr_1fr] gap-12 items-center">
          <div className="relative z-10">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-playfair text-[clamp(3rem,6vw,6rem)] leading-[1.1] tracking-tight mb-8"
            >
              Navigate the night <br />with confidence.
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-[2px] bg-accent mb-8"
            />

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="font-lora text-xl text-text-muted max-w-xl mb-10 leading-relaxed"
            >
              SafeRoute synthesizes real-time lighting data and community intelligence to guide you through the most illuminated paths in your city.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/map" className="btn-primary group">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey <ArrowRight className="w-4 h-4" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              </Link>
              <button className="px-7 py-3.5 rounded-lg border border-accent text-accent font-syne font-semibold tracking-wide hover:bg-accent/5 transition-all">
                How it Works
              </button>
            </motion.div>
          </div>

          <div className="relative hidden md:block">
            <motion.div
              initial={{ rotate: -2, opacity: 0, scale: 0.9 }}
              animate={{ rotate: -2, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="glass-card p-4 shadow-[0_0_50px_rgba(245,166,35,0.15)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
                alt="Map Preview" 
                className="rounded-lg grayscale contrast-125 brightness-75"
              />
            </motion.div>
            
            {/* Route Drawing SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 400">
              <motion.path
                d="M 50 350 Q 150 250 250 300 T 350 50"
                stroke="#4CAF84"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 1 }}
              />
            </svg>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-safe/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
        >
          <div className="w-[1px] h-12 bg-text-muted/30" />
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 px-6 bg-primary-dark/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
          <StatItem number="12000" label="Safe Routes Generated" index={0} />
          <StatItem number="94%" label="User Safety Rating" index={1} />
          <StatItem number="47" label="Cities Covered" index={2} />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-playfair text-[clamp(2rem,4vw,3.5rem)] mb-4">How SafeRoute Works</h2>
            <p className="font-lora text-xl text-text-muted max-w-2xl">Our intelligence engine processes millions of data points to ensure your path is always illuminated and active.</p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                icon: "🏙️",
                title: "Municipal Lighting Grid",
                description: "We integrate live city lighting data to identify well-lit corridors and avoid dark zones entirely. Our system maps every streetlight to ensure you're never in the dark."
              },
              {
                icon: "👥",
                title: "Crowdsourced Foot Traffic",
                description: "Community reports and real-time pedestrian density guide every route we generate. We prioritize paths with active foot traffic for collective safety."
              },
              {
                icon: "🔦",
                title: "Environmental Safety Scoring",
                description: "Each path is scored in real-time based on lighting, activity, and historical safety data. You get a transparent safety score for every turn you take."
              }
            ].map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* Topographic Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 Q 25 40 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 20 Q 25 10 50 20 T 100 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 80 Q 25 70 50 80 T 100 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>
      </section>

      {/* Map + Chatbot Section */}
      <section id="safety-map" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />
              <span className="font-syne text-[10px] uppercase tracking-[0.2em] text-accent">Live Safety Map — Beta</span>
            </div>
            <h2 className="font-playfair text-[clamp(2rem,4vw,3.5rem)]">Navigate Your City — Live</h2>
          </div>

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-8 items-stretch min-h-[600px]">
            {/* Map Column */}
            <motion.div
              initial={{ y: 80, opacity: 0, rotate: -0.5 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              whileHover={{ rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden relative min-h-[500px] lg:min-h-full"
            >
              <div ref={mapContainer} className="absolute inset-0" />
              
              {/* Map Overlays */}
              <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start">
                <div className="glass-card p-4 pointer-events-auto w-full max-w-[240px] space-y-3 border-accent/20">
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                    <input type="text" placeholder="From..." className="w-full bg-primary-dark/40 border border-white/10 rounded-md pl-7 pr-2 py-1.5 font-jetbrains text-[10px] focus:outline-none focus:border-accent" />
                  </div>
                  <div className="relative">
                    <Navigation className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                    <input type="text" placeholder="To..." className="w-full bg-primary-dark/40 border border-white/10 rounded-md pl-7 pr-2 py-1.5 font-jetbrains text-[10px] focus:outline-none focus:border-accent" />
                  </div>
                  <button className="btn-primary w-full py-2 text-[10px] uppercase tracking-widest">Find Route</button>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="glass-card px-3 py-2 border-l-2 border-l-accent pointer-events-auto">
                  <span className="font-jetbrains text-[10px]">Safety Score: <span className="text-safe font-bold">92/100</span> ✅</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button onClick={() => map.current?.flyTo({ center: DEFAULT_COORDS, zoom: 13 })} className="glass-card p-2 hover:border-accent transition-colors">
                  <RotateCcw className="w-4 h-4 text-accent" />
                </button>
                <div className="flex flex-col glass-card overflow-hidden">
                  <button onClick={() => map.current?.zoomIn()} className="p-2 hover:bg-white/5 border-b border-white/5"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => map.current?.zoomOut()} className="p-2 hover:bg-white/5"><Minus className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>

            {/* Chatbot Column */}
            <div className="h-full min-h-[500px]">
              <SafeBot />
            </div>
          </div>
        </div>

        {/* Topographic Background */}
        <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo-landing" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 Q 30 50 60 60 T 120 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 30 Q 30 20 60 30 T 120 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo-landing)" />
          </svg>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-accent/20 bg-primary-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-accent w-6 h-6" />
              <span className="font-playfair text-xl font-bold">SafeRoute</span>
            </div>
            <p className="font-lora italic text-text-muted">"Making every walk safer, one route at a time."</p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-syne font-bold uppercase tracking-widest text-sm">Navigation</h4>
            <Link href="#home" className="text-text-muted hover:text-accent transition-colors">Home</Link>
            <Link href="#how-it-works" className="text-text-muted hover:text-accent transition-colors">How It Works</Link>
            <Link href="/map" className="text-text-muted hover:text-accent transition-colors">Safety Map</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-syne font-bold uppercase tracking-widest text-sm">Contact</h4>
            <p className="text-text-muted">hello@saferoute.city</p>
            <div className="flex gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-accent transition-colors cursor-pointer">𝕏</div>
              <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-accent transition-colors cursor-pointer">IG</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-text-muted text-sm font-jetbrains">
          © 2025 SAFEROUTE TECHNOLOGIES. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
