                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Target, 
  Lightbulb, 
  BookOpen, 
  AlertTriangle, 
  Users, 
  User,
  Mic,
  Menu,
  X,
  LogOut,
  Bot,
  Sparkles,
  Power,
  ChevronDown,
  Dumbbell,
  Activity,
  FileText,
  Keyboard
} from 'lucide-react'
import GlassmorphismCard from './GlassmorphismCard'

const Navbar = () => {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', color: 'blue' },
    { to: '/tracker', icon: Target, label: 'Tracker', color: 'green' },
    { to: '/assistant', icon: Mic, label: 'Assistant', color: 'purple' },
    { to: '/exercise', icon: Dumbbell, label: 'Exercise', color: 'orange' },
    { to: '/script-analyzer', icon: FileText, label: 'Script Analyzer', color: 'indigo' },
    { to: '/jokes', icon: Sparkles, label: 'Jokes', color: 'amber' },
    { to: '/typing-test', icon: Keyboard, label: 'Typing Test', color: 'cyan' },
    { to: '/tips', icon: Lightbulb, label: 'Daily Tips', color: 'yellow' },
    { to: '/resources', icon: BookOpen, label: 'Resources', color: 'emerald' },
    { to: '/community', icon: Users, label: 'Community', color: 'pink' },
  ]

  const submenuItems = [
    { to: '/diary', icon: BookOpen, label: 'Dino Game', color: 'violet' },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  setIsMoreOpen(false)
  }, [location])

  const handleSignOut = () => {
    // Set loading state for visual feedback
    setIsSigningOut(true)
    
    // Call signOut without awaiting for immediate response
    signOut()
    
    // Optionally close any open menus immediately
    setIsMoreOpen(false)
    setIsMobileMenuOpen(false)
    
    // Reset loading state after a short delay (for visual feedback)
    setTimeout(() => setIsSigningOut(false), 500)
  }

  return (
    <>
      {/* Desktop Navigation - Compact AI Design */}
      <nav className="hidden lg:flex bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex justify-between h-14">
            {/* Logo Section */}
            <div className="flex items-center">
              <NavLink to="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-lg font-bold text-gray-900">IVINFLAMEX</span>
              </NavLink>
            </div>
            
            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.slice(0, 6).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-200`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4 h-4 mr-2 ${isActive ? `text-${item.color}-600` : ''}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-${item.color}-500 rounded-full`}></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Compact More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <span>More</span>
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/60 backdrop-blur-sm z-50">
                    <div className="p-2">
                      {/* Remaining nav items */}
                      {navItems.slice(6).map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMoreOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? `bg-${item.color}-50 text-${item.color}-700`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`
                          }
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </NavLink>
                      ))}
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      {/* Submenu items */}
                      {submenuItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMoreOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? `bg-${item.color}-50 text-${item.color}-700`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`
                          }
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* SOS Button - Compact */}
              <NavLink
                to="/emergency"
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                SOS
              </NavLink>
              
              {/* Profile */}
              <NavLink
                to="/profile"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <div className="relative">
                  <User className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-2 text-sm font-medium hidden xl:block">
                  {user?.email?.split('@')[0]}
                </span>
              </NavLink>
              
              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={`p-2 transition-all duration-200 rounded-lg ${
                  isSigningOut 
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isSigningOut ? "Signing out..." : "Sign Out"}
              >
                {isSigningOut ? (
                  <div className="w-5 h-5 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                ) : (
                  <Power className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation - Simplified */}
      <nav className="hidden md:flex lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200/50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">IVINFLAMEX</span>
            </NavLink>
            
            {/* Essential nav items */}
            <div className="flex items-center space-x-1">
              {navItems.slice(0, 4).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="ml-1 hidden xl:block">{item.label}</span>
                </NavLink>
              ))}
              
              {/* More dropdown for tablet */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Menu className="w-4 h-4" />
                </button>
                
                {isMoreOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {navItems.slice(4).concat(submenuItems).map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMoreOpen(false)}
                          className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right section */}
            <div className="flex items-center space-x-2">
              <NavLink to="/emergency" className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4" />
              </NavLink>
              <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Navigation - Compact */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200/50">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">IVINFLAMEX</span>
            </NavLink>
            
            {/* Right section */}
            <div className="flex items-center space-x-3">
              <NavLink
                to="/emergency"
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
              </NavLink>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white/98 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-${item.color}-50 text-${item.color}-700 border-l-4 border-${item.color}-500`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              ))}

              <div className="border-t border-gray-200 my-3 pt-3 space-y-1">
                {submenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-${item.color}-50 text-${item.color}-700 border-l-4 border-${item.color}-500`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3">
                <NavLink
                  to="/profile"
                  className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="relative mr-3">
                    <User className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  Profile
                </NavLink>
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isSigningOut 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  {isSigningOut ? (
                    <div className="w-5 h-5 mr-3 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                  ) : (
                    <Power className="w-5 h-5 mr-3" />
                  )}
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-sm">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                  isActive
                    ? `text-${item.color}-600 bg-${item.color}-50`
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-${item.color}-500 rounded-t-full`}></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}

export default Navbar
