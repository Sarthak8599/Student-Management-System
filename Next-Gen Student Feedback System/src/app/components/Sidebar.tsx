import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  onLogout: () => void;
  isOpen: boolean;
}

export const Sidebar = ({ role, onLogout, isOpen }: SidebarProps) => {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
    { name: 'My Courses', path: '/courses', icon: BookOpen, roles: ['student', 'faculty'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['faculty', 'admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['student', 'faculty', 'admin'] },
  ];

  const filteredLinks = links.filter(l => l.roles.includes(role));

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-[#F8F9FD] border-r border-[#E9E6F7] transition-all duration-300 z-50 flex flex-col shadow-xl shadow-[#7A6AD8]/5",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="h-16 flex items-center justify-center border-b border-[#E9E6F7]">
        <div className="w-8 h-8 bg-gradient-to-br from-[#C8BFE7] to-[#E9E6F7] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        {isOpen && <span className="ml-3 font-bold text-[#2E2E4D] tracking-wide">EduPulse</span>}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-3 rounded-xl transition-all group",
              isActive 
                ? "bg-[#E9E6F7] text-[#C8BFE7]" 
                : "text-[#6B6B8A] hover:bg-[#F8F9FD] hover:text-[#C8BFE7]"
            )}
          >
            <link.icon className="w-5 h-5 min-w-[20px]" />
            {isOpen && <span className="ml-3 font-medium text-sm">{link.name}</span>}
            
            {/* Hover Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-20 bg-[#2E2E4D] text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {link.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[#E9E6F7]">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-3 text-[#6B6B8A] hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {isOpen && <span className="ml-3 font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};
