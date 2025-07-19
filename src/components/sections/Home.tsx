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
      title: 'Simulation d\'Entretien',
      description: 'Préparez-vous avec des entretiens simulés et recevez des conseils personnalisés.',
      action: () => onNavigate('interview')
    },
    {
      icon: <Award className="h-8 w-8 text-orange-500" />,
      title: 'Plan de Compétences',
      description: 'Développez vos compétences avec un plan personnalisé basé sur vos objectifs.',
      action: () => onNavigate('skills')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            CvMentor <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            La plateforme intelligente dédiée aux étudiants et jeunes professionnels africains 
            pour optimiser leurs candidatures et développer leur employabilité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('cv-analysis')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Analyser mon CV
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Simuler un entretien
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Fonctionnalités
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des outils intelligents pour vous accompagner dans votre recherche d'emploi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={feature.action}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                      Commencer →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="h-12 w-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Notre Mission
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Démocratiser l'accès aux outils de développement professionnel en Afrique. 
            Nous croyons que chaque talent mérite sa chance et nous mettons l'intelligence 
            artificielle au service de votre réussite professionnelle.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Prêt à optimiser votre candidature ?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Commencez dès maintenant et donnez un coup d'accélérateur à votre carrière
        </p>
        <button
          onClick={() => onNavigate('cv-analysis')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Commencer gratuitement
        </button>
      </div>
    </div>
  );
};

export default Home;