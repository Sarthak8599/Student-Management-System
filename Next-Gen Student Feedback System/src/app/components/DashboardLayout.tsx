import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Role } from '../types';
import { Menu, GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
  role: Role;
  onLogout: () => void;
}

export const DashboardLayout = ({ role, onLogout }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#2E2E4D] flex">
      <Sidebar role={role} onLogout={onLogout} isOpen={sidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 border-b border-[#E9E6F7] bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#E9E6F7] rounded-lg text-[#6B6B8A] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* EduPulse Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7A6AD8] to-[#5B4FCF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7A6AD8]/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#2E2E4D]">EduPulse</h1>
                <p className="text-xs text-[#9C8ADE]">Student Feedback System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-sm font-medium text-[#2E2E4D] capitalize">{role}</div>
                <div className="text-xs text-[#9C8ADE]">Logged In</div>
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E9E6F7] to-[#C8BFE7] border-2 border-[#E9E6F7]" />
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
