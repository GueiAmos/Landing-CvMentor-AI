import React from "react";
import logo from "../../assets/logo.png";
import { MessageSquare, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Logo, Brand, Mission */}
            <div>
              <div className="flex items-center mb-3">
                <img
                  src={logo}
                  alt="CvMentor AI Logo"
                  className="w-8 h-8 mr-2"
                />
                <h3 className="text-lg font-bold" translate="no">
                  <span className="text-orange-400">C</span>
                  <span className="text-blue-400">v</span>
                  <span className="text-orange-400">Mentor</span>
                  <span className="text-blue-400"> AI</span>
                </h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">
                Plateforme d'intelligence artificielle dédiée aux jeunes talents
                africains pour optimiser leurs candidatures et réussir leurs
                entretiens d'embauche.
              </p>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-3 mb-5">
                <a
                  href="https://wa.me/2250575081162"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-md font-medium rounded transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-3" />
                  WhatsApp
                </a>
                <a
                  href="tel:+2250160125373"
                  className="inline-flex items-center px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded transition-colors"
                >
                  <Phone className="h-4 w-4 mr-3" />
                  Appeler
                </a>
              </div>

              {/* Notre Mission */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">
                  Notre Mission
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed mb-2">
                  Démocratiser l'accès aux outils de préparation professionnelle
                  et accompagner chaque talent vers la réussite.
                </p>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">
                Fonctionnalités
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-blue-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <p>Analyse de CV</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-orange-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  <p>Matching CV-Offre</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-purple-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <p>Simulation d'entretien</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-green-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <p>Plan de formation</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-indigo-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                  <p>Suivi Candidatures</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-teal-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                  <p>Plateformes d'Emploi</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-pink-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  <p>Lettre de Motivation</p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300 hover:text-red-400 text-xs transition-colors">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <p>Mode Hors Ligne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-300 text-xs mb-2 sm:mb-0" translate="no">
                © {new Date().getFullYear()} CvMentor AI. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-xs">
                  Conditions d'utilisations
                </span>
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-gray-300 text-xs">
                  Termes de confidentialité
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
