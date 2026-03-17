'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { x: -40, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Auth Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col relative z-10 bg-primary-light dark:bg-primary-dark transition-colors duration-500">
        {/* Logo & Theme Toggle */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Shield className="text-accent w-8 h-8" />
            <span className="font-playfair text-2xl font-bold tracking-tight">SafeRoute</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary-dark" />}
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full mx-auto my-auto"
        >
          <motion.h1 variants={itemVariants} className="font-playfair text-4xl md:text-5xl mb-4">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </motion.h1>
          <motion.p variants={itemVariants} className="font-lora text-text-muted mb-10">
            Your safer city journey starts here.
          </motion.p>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="email" 
                placeholder="Email Address"
                className="input-floating pl-12"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                className="input-floating pl-12 pr-12"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className="btn-primary w-full group"
            >
              <span className="relative z-10">{isLogin ? 'Sign In' : 'Get Started'}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </motion.button>

            <motion.div variants={itemVariants} className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-text-muted/20"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-primary-light dark:bg-primary-dark px-2 text-text-muted font-syne tracking-widest">Or continue with</span></div>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              className="w-full border border-text-muted/30 rounded-lg py-3.5 font-syne text-sm font-semibold flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>

            <motion.p variants={itemVariants} className="text-center font-lora text-text-muted mt-8">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:underline font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Brand Visual Panel */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden bg-[#0D1B2A]">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary-dark/40 to-accent/20" />
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-12 text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              <Shield className="w-32 h-32 text-accent animate-float" />
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full -z-10" />
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-playfair text-5xl text-white mb-12 leading-tight"
          >
            Walk Safer.<br />Navigate Smarter.
          </motion.h2>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            {[
              { icon: "🔦", text: "Lighting Grid Data" },
              { icon: "👥", text: "Crowdsourced Safety Reports" },
              { icon: "🗺️", text: "Real-Time Route Intelligence" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="glass-card px-6 py-4 flex items-center gap-4 text-white font-syne text-sm tracking-wide border-white/10"
              >
                <span className="text-xl">{feature.icon}</span>
                {feature.text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-safe/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
