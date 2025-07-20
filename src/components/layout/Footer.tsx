import React from 'react';
import { Heart, Mail, Globe, Github, Linkedin, Twitter } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Mail className="h-5 w-5" />, href: "mailto:contact@cvmentor.ai", label: "Email" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Github className="h-5 w-5" />, href: "#", label: "GitHub" }
  ];

  const footerLinks = [
    {
      title: "Fonctionnalités",
      links: [
        { name: "Analyse de CV", href: "#cv-analysis" },
        { name: "Comparaison CV-Offre", href: "#job-matching" },
        { name: "DRH IA", href: "#interview" },
        { name: "Plan de Compétences", href: "#skills" }
      ]
    },
    {
      title: "Ressources",
      links: [
        { name: "Guide d'utilisation", href: "#" },
        { name: "Conseils CV", href: "#" },
        { name: "Préparation entretien", href: "#" },
        { name: "Blog", href: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Centre d'aide", href: "#" },
        { name: "FAQ", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Feedback", href: "#" }
      ]
    }
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <img 
                  src={logo} 
                  alt="CvMentor AI Logo" 
                  className="w-12 h-12 mr-3"
                />
                <div>
                  <h3 className="text-xl font-bold">
                    <span className="text-orange-400">Cv</span>
                    <span className="text-blue-400">Mentor</span>
                    <span className="text-orange-400"> AI</span>
                  </h3>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                La plateforme intelligente qui aide les jeunes talents africains à améliorer leurs candidatures et à se préparer au monde du travail.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            {footerLinks.map((section, index) => (
              <div key={index} className="lg:col-span-1">
                <h4 className="text-lg font-semibold mb-6 text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-300">
                <span>© {currentYear} CvMentor AI. Tous droits réservés.</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-300">
                <span>Fait avec</span>
                <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                <span>pour les talents africains</span>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;