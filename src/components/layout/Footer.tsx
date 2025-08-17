import React from "react";
import logo from "../../assets/logo.png";
import { ArrowRight, MessageSquare, Phone, Mail, MapPin, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-[#12456e] to-[#15679d] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(21, 103, 157, 0.35) 0%, transparent 45%),
                              radial-gradient(circle at 80% 70%, rgba(241, 112, 28, 0.22) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Logo, Brand, Mission */}
            <div className="mr-0">
              <div className="flex items-center mb-3">
                <img
                  src={logo}
                  alt="CvMentor AI Logo"
                  className="w-8 h-8 mr-2"
                />
                <h3 className="text-lg font-bold" translate="no">
                  <span className="text-[#f1701c]">C</span>
                  <span className="text-[#15679d]">v</span>
                  <span className="text-[#f1701c]">Mentor</span>
                  <span className="text-[#15679d]"> AI</span>
                </h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-0">
                Plateforme d'intelligence artificielle dédiée aux jeunes talents
                africains pour optimiser leurs candidatures et réussir leurs
                entretiens d'embauche.
              </p>
            </div>



            {/* Contact */}
            <div className="ml-0 sm:ml-16">
              <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#f1701c]" />
                  <a href="https://wa.me/2250575081162" target="_blank" rel="noopener noreferrer" className="hover:text-[#f1701c] transition-colors">WhatsApp</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#f1701c]" />
                  <a href="tel:+2250160125373" className="hover:text-[#f1701c] transition-colors">+225 01 60 12 53 73</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#f1701c]" />
                  <a href="mailto:contact@cvmentor.ai" className="hover:text-[#f1701c] transition-colors">contact@cvmentor.ai</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#f1701c]" />
                  <span>Abidjan, Côte d'Ivoire</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Prêt à commencer ?</h4>
              <p className="text-gray-300 text-xs mb-4">Essayez CvMentor AI gratuitement et optimisez vos candidatures.</p>
              <a
                href="#features"
                className="inline-flex items-center justify-center w-full md:w-auto gap-2 bg-white text-[#15679d] px-4 py-2 rounded-md font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                translate="no"
              >
                Commencer
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-gray-300 text-xs mb-2 sm:mb-0" translate="no">
                © {new Date().getFullYear()} CvMentor AI. Tous droits réservés.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-300 text-xs hover:text-[#f1701c] transition-colors">Conditions d'utilisations</a>
                <span className="text-gray-500">•</span>
                <a href="#" className="text-gray-300 text-xs hover:text-[#f1701c] transition-colors">Termes de confidentialité</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
