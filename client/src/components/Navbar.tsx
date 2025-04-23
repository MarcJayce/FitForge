import { useState } from 'react';
import { Link } from 'wouter';
import { useSyncStatus } from '@/lib/hooks';

interface NavbarProps {
  currentPath: string;
}

export default function Navbar({ currentPath }: NavbarProps) {
  const { hasPendingSync, triggerSync } = useSyncStatus();
  
  const tabs = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/gym', icon: 'fitness_center', label: 'Gym' },
    { path: '/macros', icon: 'restaurant', label: 'Macros' },
    { path: '/scan', icon: 'qr_code_scanner', label: 'Scan' },
    { path: '/profile', icon: 'person', label: 'Profile' }
  ];

  return (
    <>
      {/* Header Component */}
      <header className="px-4 py-3 flex items-center justify-between bg-slate-900 border-b border-slate-800">
        <div className="flex items-center">
          <h1 className="text-xl font-montserrat font-bold text-white">
            <span className="text-primary">Fit</span><span className="text-accent">Forge</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className={`p-1 rounded-full ${hasPendingSync ? 'text-yellow-500 animate-pulse' : 'text-gray-300 hover:bg-slate-800'}`} 
            onClick={triggerSync}
          >
            <span className="material-icons">sync</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="material-icons text-black">person</span>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 h-16 z-10">
        <div className="grid grid-cols-5 h-full">
          {tabs.map((tab) => (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex flex-col items-center justify-center ${currentPath === tab.path ? 'text-primary' : 'text-gray-400'}`}
            >
              <span className="material-icons">{tab.icon}</span>
              <span className="text-xs mt-0.5">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
