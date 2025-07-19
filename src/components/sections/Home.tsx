import React from 'react';
import { Brain, FileText, Users, Target, Award, TrendingUp } from 'lucide-react';

interface HomeProps {
  onNavigate: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: 'Analyse de CV Intelligente',
      description: 'Évaluation complète avec IA pour optimiser votre CV et augmenter vos chances de succès.',
      action: () => onNavigate('cv-analysis')
    },
    {
      icon: <Target className="h-8 w-8 text-orange-500" />,
      title: 'Comparaison CV-Offre',
      description: 'Matching intelligent entre votre profil et les offres d\'emploi pour identifier les points forts.',
      action: () => onNavigate('job-matching')
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: 'DRH IA - Entretien Live',
      description: 'Échangez avec notre DRH IA par écrit ou par vocal pour un entretien réaliste.',
      action: () => onNavigate('interview')
    },
    {
      icon: <Award className="h-8 w-8 text-orange-500" />,
      title: 'Plan de Compétences',
      description: 'Recevez des recommandations de formations personnalisées pour combler vos lacunes après la comparaison.',
      action: () => onNavigate('job-matching')
    }
  ];

  const stats = [
    { value: '10,000+', label: 'CV Analysés' },
    { value: '85%', label: 'Taux de Satisfaction' },
    { value: '50+', label: 'Secteurs Couverts' },
    { value: '24/7', label: 'Disponibilité' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="text-center">
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">AI</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            CvMentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">AI</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto px-4 leading-relaxed">
            La plateforme intelligente dédiée aux étudiants et jeunes professionnels africains 
            pour optimiser leurs candidatures et développer leur employabilité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <button
              onClick={() => onNavigate('cv-analysis')}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
                Analyser mon CV
              </span>
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
                Parler au DRH IA
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-semibold text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Nos Fonctionnalités
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
            Des outils intelligents pour vous accompagner dans votre recherche d'emploi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 cursor-pointer border border-gray-100 hover:border-blue-200"
              onClick={feature.action}
            >
              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="h-6 w-6 sm:h-8 sm:w-8">
                      {feature.icon}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm sm:text-base group-hover:translate-x-2 transition-transform">
                    Commencer 
                    <span className="ml-2 text-lg">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">
            Notre Mission
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 leading-relaxed px-4 max-w-4xl mx-auto">
            Démocratiser l'accès aux outils de développement professionnel en Afrique. 
            Nous croyons que chaque talent mérite sa chance et nous mettons l'intelligence 
            artificielle au service de votre réussite professionnelle.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-orange-200">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
            Prêt à optimiser votre candidature ?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 px-4 max-w-3xl mx-auto leading-relaxed">
            Commencez dès maintenant et donnez un coup d'accélérateur à votre carrière
          </p>
          <button
            onClick={() => onNavigate('cv-analysis')}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 sm:px-16 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">🚀</span>
              Commencer gratuitement
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;