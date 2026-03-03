import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Wand2,
  Library,
  Menu,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Plus, label: 'Add Job', path: '/jobs/add' },
    { icon: Wand2, label: 'Generator', path: '/generator' },
    { icon: Library, label: 'Library', path: '/cover-letters' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && <Logo />}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </p>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && !isCollapsed && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />

            {/* Menu Popup */}
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/console');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
