import React from "react";
import { Stethoscope } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// Ensure this path matches where you saved your ThemeProvider
import { useTheme } from "../components/theme/ThemeProvider"; 

export default function LoadingPage() {
  // 1. Access your theme state directly
  const { theme } = useTheme();
  
  // 2. Derive boolean for logic simplicity
  const isDark = theme === "dark";

  // 3. Define Dynamic Colors based on JavaScript state
  // These are needed for the SVG Glow/Filter effects which Tailwind classes can't handle easily
  const shadowColor = isDark 
    ? "rgba(96, 165, 250, 0.9)" // Neon Blue (Dark Mode)
    : "rgba(37, 99, 235, 0.4)"; // Soft Blue (Light Mode)

  return (
    // Tailwind 'dark:' classes automatically handle the background color
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-500">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center relative"
      >
        {/* --- CENTRAL COMPONENT WRAPPER --- */}
        <div className="relative flex items-center justify-center w-[300px] sm:w-[600px] h-[300px] mb-8">
          
          {/* 1. THE MASSIVE EKG LINE (Background Layer z-0) */}
          <svg
            className="absolute z-0 w-full h-full pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-500"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
                left: "50%", 
                top: "50%", 
                transform: "translate(-50%, -50%)" 
            }}
          >
            <motion.path
              d="M0 100 L140 100 L160 20 L180 180 L200 100 L220 100 L400 100"
              // Tailwind handles the stroke color transition
              className="stroke-blue-500 dark:stroke-blue-400 transition-colors duration-500"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1], 
                opacity: [0, 1, 0],    
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              // Inline style handles the Glow effect using our Context state
              style={{ 
                filter: `drop-shadow(0px 0px 10px ${shadowColor})`,
                transition: "filter 0.5s ease" 
              }}
            />
          </svg>

          {/* 2. The Pulse Ripples (Middle Layer z-10) */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute border border-blue-400/30 dark:border-blue-400/20 rounded-full z-10"
              initial={{ width: "100px", height: "100px", opacity: 0 }}
              animate={{
                width: ["100px", "300px"], 
                height: ["100px", "300px"],
                opacity: [0.3, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                delay: index * 0.5,
                ease: "easeOut",
              }}
            />
          ))}

          {/* 3. The Central Box (Foreground z-20) */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-20 flex items-center justify-center w-28 h-28 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(29,78,216,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(29,78,216,0.5)] dark:border dark:border-slate-800 transition-all duration-500"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                times: [0, 0.15, 1],
                ease: "easeInOut"
              }}
            >
              <Stethoscope className="w-14 h-14 text-blue-600 dark:text-blue-500 transition-colors duration-500" strokeWidth={2} />
            </motion.div>
          </motion.div>
        </div>

        {/* --- TYPOGRAPHY --- */}
        <div className="text-center z-30 -mt-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors duration-500"
          >
            Doc<span className="text-blue-600 dark:text-blue-400 transition-colors duration-500">Sync</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-1 mt-4"
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium text-xl transition-colors duration-500">
              Syncing workspace
            </span>
            {[0, 1, 2].map((i) => (
               <motion.span
               key={i}
               animate={{ opacity: [0, 1, 0] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
               className="text-slate-500 dark:text-slate-400 text-xl"
             >.</motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}