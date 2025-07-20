import React from 'react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          {/* Logo et Branding */}
          <div className="flex justify-center items-center mb-4 sm:mb-6">
            <img 
              src={logo} 
              alt="CvMentor AI Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4"
            />
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                <span className="text-orange-400">Cv</span>
                <span className="text-blue-400">Mentor</span>
                <span className="text-orange-400"> AI</span>
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
            Plateforme d'intelligence artificielle dédiée aux jeunes talents africains pour optimiser leurs candidatures et réussir leurs entretiens d'embauche.
          </p>

          {/* À propos */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/10">
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">À propos</h4>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              CvMentor AI utilise l'intelligence artificielle pour aider les candidats à améliorer leurs CV, 
              simuler des entretiens d'embauche et développer leurs compétences professionnelles. 
              Notre mission est de démocratiser l'accès aux outils de préparation professionnelle 
              et d'accompagner chaque talent vers la réussite.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm sm:text-base">
                © {currentYear} CvMentor AI. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;