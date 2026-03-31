import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { normalizeRole } from '../utils';

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = normalizeRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = role === 'super_admin' ? '/admin' : '/cabinet';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IX</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:block">
              IndabaX <span className="text-purple-600">Kabale</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/sessions" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors">
              Sessions
            </Link>
            <Link to="/register" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors">
              Register
            </Link>
            {isAuthenticated && role === 'super_admin' && (
              <Link to="/cabinet" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors">
                Session Ops
              </Link>
            )}
            {isAuthenticated && (
              <Link to={dashboardPath} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <Link to="/login" className="hidden md:block px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                Login
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/sessions" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600">Sessions</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600">Register</Link>
              {isAuthenticated && role === 'super_admin' && (
                <Link to="/cabinet" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600">Session Ops</Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600">Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left py-2 text-red-600">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-purple-600 font-medium">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
