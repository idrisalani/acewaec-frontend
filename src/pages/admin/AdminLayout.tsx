import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileQuestion, 
  Upload, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed: mobile default is closed
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile when resizing
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Questions', href: '/admin/questions', icon: FileQuestion },
    { name: 'Bulk Import', href: '/admin/import', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile Responsive */}
      <motion.aside 
        animate={{
          width: isMobile 
            ? (sidebarOpen ? 256 : 0) 
            : (sidebarOpen ? 256 : 80),
          x: isMobile ? (sidebarOpen ? 0 : -256) : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="md:flex md:flex-col bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white fixed md:relative z-50 md:z-auto h-screen md:h-auto flex flex-col shadow-2xl md:w-80"
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent pointer-events-none" />
        
        {/* Header - Mobile Responsive */}
        <div className="relative px-3 xs:px-4 md:px-6 py-3 xs:py-4 md:py-6 flex items-center justify-between border-b border-indigo-700/50">
          <AnimatePresence mode="wait">
            {sidebarOpen || !isMobile ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 xs:gap-3 min-w-0"
              >
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-indigo-900 flex-shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm xs:text-base md:text-lg truncate">
                    AceWAEC Pro
                  </h1>
                  <p className="text-xs text-indigo-300 hidden xs:block">Admin Panel</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 xs:p-2 rounded-lg hover:bg-indigo-800/50 transition-colors relative z-10"
            aria-label="Toggle sidebar"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.div>
          </motion.button>
        </div>

        {/* Navigation - Mobile Responsive */}
        <nav className="mt-4 xs:mt-6 px-2 xs:px-3 md:px-3 flex-1 relative overflow-y-auto">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-1 xs:mb-2"
            >
              <NavLink
                to={item.href}
                end={item.href === '/admin'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-2 xs:gap-3 px-2 xs:px-4 py-2 xs:py-3.5 rounded-lg xs:rounded-xl transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg xs:rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <item.icon size={18} className="relative z-10 flex-shrink-0" />
                    
                    {sidebarOpen || !isMobile ? (
                      <span className="relative z-10 font-medium text-xs xs:text-sm md:text-base truncate">
                        {item.name}
                      </span>
                    ) : null}
                    
                    {isActive && (sidebarOpen || !isMobile) && (
                      <ChevronRight size={16} className="ml-auto relative z-10 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Logout - Mobile Responsive */}
        <div className="relative px-2 xs:px-3 md:px-4 py-3 xs:py-4 border-t border-indigo-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 xs:gap-3 px-2 xs:px-4 py-2 xs:py-3 rounded-lg xs:rounded-xl w-full text-indigo-200 hover:bg-white/5 hover:text-white transition-all"
            aria-label="Logout"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen || !isMobile ? (
              <span className="font-medium text-xs xs:text-sm md:text-base">Logout</span>
            ) : null}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content - Mobile Responsive */}
      <main className="flex-1 overflow-auto w-full md:flex-1">
        <Outlet />
      </main>
    </div>
  );
}