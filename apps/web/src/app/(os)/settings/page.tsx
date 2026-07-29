"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings2, User, Bell, Shield, Wallet } from "lucide-react";

export default function SettingsPage() {
  const tabs = [
    { icon: <User className="w-4 h-4" />, label: "Profile" },
    { icon: <Bell className="w-4 h-4" />, label: "Notifications" },
    { icon: <Shield className="w-4 h-4" />, label: "Security" },
    { icon: <Wallet className="w-4 h-4" />, label: "Billing" },
  ];

  return (
    <div className="w-full h-full p-8 max-w-5xl mx-auto flex">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="w-64 pr-8 border-r border-zinc-200"
      >
        <div className="flex items-center space-x-2 mb-8">
          <Settings2 className="w-6 h-6 text-zinc-900" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
        </div>

        <div className="space-y-1">
          {tabs.map((tab, idx) => (
            <button key={idx} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm ${idx === 0 ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="flex-1 pl-12"
      >
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Profile Settings</h2>
        
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm max-w-2xl">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-2xl font-bold border border-orange-200">
              JD
            </div>
            <div>
              <button className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors">
                Change Avatar
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Display Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Email Address</label>
              <input type="email" defaultValue="john@omnishop.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
            </div>
            <button className="bg-zinc-900 text-white rounded-full px-6 py-3 font-semibold hover:bg-zinc-800 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
