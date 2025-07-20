import React from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from '../../assets/logo.png';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const sections = [
    { id: 'home', label: 'Accueil' },
    { id: 'cv-analysis', label: 'Analyse CV' },
    { id: 'job-matching', label: 'Comparaison CV - Offre' },
    { id: 'cover-letter', label: 'Lettre de Motivation' },
    { id: 'interview', label: 'DRH IA' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo avec animation améliorée */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mr-2 sm:mr-3 ">
                <img 
                  src={logo} 
                  alt="CvMentor AI Logo" 
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">
                <span className="text-orange-500">C</span>
                <span className="text-blue-600">v</span>
                <span className="text-orange-500">Mentor</span>
                <span className="text-blue-600"> AI</span>
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block  duration-300">
                Optimisez votre candidature
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Redesigné */}
          <nav className="hidden lg:flex items-center space-x-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={`group relative rounded-xl font-semibold transition-all duration-300 ${
                  currentSection === section.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 px-7 py-3 text-base'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md px-5 py-2.5 text-sm'
                }`}
              >
                <span>{section.label}</span>
                
                {/* Indicateur actif */}
                {currentSection === section.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile menu button - Amélioré */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isMobileMenuOpen 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="relative">
                {isMobileMenuOpen ? (
                  <X size={24} className="transition-transform duration-300 rotate-90" />
                ) : (
                  <Menu size={24} className="transition-transform duration-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Redesigné */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            {/* Overlay pour fermer le menu */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu mobile */}
            <div className="relative z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-xl">
              <div className="px-4 py-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
                  <p className="text-sm text-gray-500">Choisissez une section</p>
                </div>
                
                <nav className="space-y-3">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        onNavigate(section.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full group flex items-center space-x-3 px-4 py-4 rounded-2xl text-left transition-all duration-300 ${
                        currentSection === section.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm sm:text-base">{section.label}</div>
                        
                      </div>
                      <div className={`transition-transform duration-300 ${
                        currentSection === section.id ? 'rotate-180' : 'group-hover:translate-x-1'
                      }`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </nav>
                
                {/* Footer du menu mobile */}
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      CvMentor AI - Optimisez votre candidature
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;