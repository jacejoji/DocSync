"use client";

import React from "react";
import { Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center relative"
      >
        {/* --- CENTRAL COMPONENT WRAPPER --- */}
        {/* We use a defined height here to ensure layout stability */}
        <div className="relative flex items-center justify-center w-[600px] h-[300px] mb-8">
          
          {/* 1. THE MASSIVE EKG LINE (Background Layer z-0) */}
          {/* Scaled up significantly: w-[600px] ensures it spans wide behind the logo */}
          <svg
            className="absolute z-0 w-full h-full pointer-events-none opacity-40"
            viewBox="0 0 400 200" // Increased viewbox for a taller spike
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
                left: "50%", 
                top: "50%", 
                transform: "translate(-50%, -50%)" 
            }}
          >
            <motion.path
              // The path: M(start) -> L(flat) -> L(spike up) -> L(spike down) -> L(return) -> L(end)
              // Coordinates adjusted to be much taller (20 to 180 on Y axis)
              d="M0 100 L140 100 L160 20 L180 180 L200 100 L220 100 L400 100"
              stroke="#3B82F6" 
              strokeWidth="6" // Thicker stroke to be visible at this scale
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
              style={{ filter: "drop-shadow(0px 0px 10px rgba(59, 130, 246, 0.4))" }}
            />
          </svg>

          {/* 2. The Pulse Ripples (Middle Layer z-10) */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute border border-blue-400/30 rounded-full z-10"
              initial={{ width: "100px", height: "100px", opacity: 0 }}
              animate={{
                width: ["100px", "400px"], // Much wider ripple
                height: ["100px", "400px"],
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

          {/* 3. The White Container (Foreground z-20) */}
          {/* This sits perfectly in the center, on top of the line */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-20 flex items-center justify-center w-28 h-28 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(29,78,216,0.25)]"
          >
             {/* The Icon Heartbeat */}
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
              <Stethoscope className="w-14 h-14 text-blue-600" strokeWidth={2} />
            </motion.div>
          </motion.div>

        </div>

        {/* --- TYPOGRAPHY --- */}
        <div className="text-center z-30 -mt-10"> {/* Negative margin to pull text closer to the graphic */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-slate-800"
          >
            Doc<span className="text-blue-600">Sync</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-1 mt-4"
          >
            <span className="text-slate-500 font-medium text-xl">
              Syncing workspace
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              className="text-slate-500 text-xl"
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="text-slate-500 text-xl"
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="text-slate-500 text-xl"
            >.</motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}