import React from "react";
import {
  Brain,
  FileText,
  Users,
  Target,
  Award,
  TrendingUp,
  Star,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Mic,
  MessageCircle,
} from "lucide-react";
import logo from "../../assets/logo.png";

interface HomeProps {
  onNavigate: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Analyse de CV",
      description:
        "Évaluation complète avec intelligence artificielle pour améliorer votre CV",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      action: () => onNavigate("cv-analysis"),
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Matching CV-Offre",
      description:
        "Comparaison intelligente entre votre profil et les offres d'emploi",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      action: () => onNavigate("job-matching"),
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "DRH IA Live",
      description: "Entretien réaliste avec notre DRH IA par écrit ou vocal",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      action: () => onNavigate("interview"),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Plan de Compétences",
      description:
        "Recommandations personnalisées pour développer vos compétences",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      action: () => onNavigate("skills"),
    },
  ];

  const stats = [
    {
      value: "2 min",
      label: "Pour améliorer votre CV",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      value: "80%",
      label: "Précision dans l'analyse",
      icon: <Target className="h-5 w-5" />,
    },
    {
      value: "80%",
      label: "Chances d'embauche améliorées",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  const benefits = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Analyse IA Avancée",
      description:
        "Évaluation intelligente de votre CV avec suggestions d'amélioration",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Matching CV-Offre",
      description:
        "Comparaison précise pour adapter votre CV aux exigences du poste",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Simulation d'Entretien",
      description: "Entraînement réaliste avec notre DRH IA pour vous préparer",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Développement de Compétences",
      description: "Plan personnalisé pour combler vos lacunes et progresser",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Accompagnement Gratuit",
      description: "Disponible 24/7 sans frais, dédié aux talents africains",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Préparation Professionnelle",
      description: "Outils pour vous préparer efficacement au monde du travail",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Hero Section - Redesigné */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            {/* Logo avec animation */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex justify-center">
                <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <img 
                    src={logo} 
                    alt="CvMentor AI Logo" 
                    translate="no"
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              
              {/* Nom de la plateforme avec les mêmes couleurs que le header */}
              <div className="mt-1 sm:mt-2">
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold group-hover:scale-105 transition-all duration-300">
                  <span translate="no"><span className="text-orange-500">C</span><span className="text-blue-600">v</span><span className="text-orange-500">Mentor</span><span className="text-blue-600"> AI</span></span>
                </h1>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed font-medium px-2">
                La plateforme intelligente qui aide les jeunes talents africains à améliorer leurs candidatures
               et à mieux se préparer au monde du travail grâce à l'intelligence artificielle.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mb-6 sm:mb-8 lg:mb-10 px-4">
              <button
                onClick={() => onNavigate("cv-analysis")}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center w-full sm:w-auto"
              >
                <FileText className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                Analyser mon CV
              </button>
              <button
                onClick={() => onNavigate("interview")}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center w-full sm:w-auto"
              >
                <MessageCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                Parler au DRH IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Redesigné */}
      <div className="bg-white/50 backdrop-blur-sm py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex justify-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Redesigné */}
      <div className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
              Outils d'Amélioration Intelligents
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Des fonctionnalités avancées pour améliorer votre candidature et vous préparer au monde du travail
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group ${feature.bgColor} rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-gray-200`}
                onClick={feature.action}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                      Commencer maintenant
                      <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section - Redesigné */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 sm:py-10 lg:py-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              Pourquoi choisir{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400" translate="no">
                CvMentor AI
              </span>{" "}
              ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-2">
              Une plateforme intelligente qui améliore votre candidature et vous prépare au monde du travail
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`group ${benefit.bgColor} rounded-xl p-3 sm:p-4 lg:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/10 backdrop-blur-sm`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {benefit.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-xs">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section - Redesigné */}
      <div className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Prêt à améliorer votre candidature ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              Commencez dès maintenant et améliorez vos chances de succès professionnel
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => onNavigate("cv-analysis")}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <FileText className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                Analyser mon CV gratuitement
              </button>
              <button
                onClick={() => onNavigate("interview")}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <MessageCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                Parler au DRH IA
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;