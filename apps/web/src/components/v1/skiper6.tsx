"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  name: string;
  image: string;
}

interface HoverMemberProps {
  teamMembers: Member[];
}

export const HoverMember: React.FC<HoverMemberProps> = ({ teamMembers }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center space-x-[-12px]">
      {teamMembers.map((member, idx) => (
        <div
          key={idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-50"
              >
                <div className="bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap shadow-xl border border-zinc-700">
                  {member.name}
                </div>
                <div className="w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 transform rotate-45 -mt-1.5 z-40"></div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.img
            src={member.image}
            alt={member.name}
            className={`w-10 h-10 rounded-full border-2 border-[#09090b] object-cover transition-transform duration-300 relative ${
              hoveredIndex === idx ? "z-30 shadow-lg shadow-indigo-500/30 scale-110" : "z-10"
            }`}
          />
        </div>
      ))}
    </div>
  );
};
