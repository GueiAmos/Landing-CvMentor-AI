import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Clock, Star, ExternalLink, Target, Award } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { SkillGap, Resource } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

const SkillsDevelopment: React.FC = () => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<SkillGap | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session.skillGaps) {
      setSkillGaps(session.skillGaps);
    } else {
      // Auto-générer le plan si des lacunes sont disponibles
      if (session.cvJobMatch?.gaps && session.cvJobMatch.gaps.length > 0) {
        generateSkillPlan(session.cvJobMatch.gaps);
      }
    }
  }, []);

  const generateSkillPlan = async (gaps?: string[]) => {
    const session = getSession();
    let gapsToAnalyze = gaps;

    if (!gapsToAnalyze) {
      if (!session.cvJobMatch?.gaps || session.cvJobMatch.gaps.length === 0) {
        setError('Veuillez d\'abord effectuer une comparaison CV-Offre pour identifier vos lacunes.');
        return;
      }
      gapsToAnalyze = session.cvJobMatch.gaps;
    }

    setIsLoading(true);
    setError('');

    try {
      const plan = await aiService.generateSkillDevelopmentPlan(gapsToAnalyze);
      setSkillGaps(plan);
      saveSession({ skillGaps: plan });
    } catch (err) {
      setError('Erreur lors de la génération du plan. Veuillez réessayer.');
      console.error('Skill Development Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Priorité basse';
      default: return 'Non défini';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-orange-600 bg-orange-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <BookOpen className="h-4 w-4" />;
      case 'course': return <Award className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const resetPlan = () => {
    setSkillGaps([]);
    setSelectedSkill(null);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoadingSpinner 
            size="lg" 
            text="Génération de votre plan de développement personnalisé..." 
          />
        </div>
      </div>
    );
  }

  if (skillGaps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plan de Développement des Compétences</h1>
          <p className="text-xl text-gray-600">
            Développez vos compétences avec un plan personnalisé
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Aucun plan de développement disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Effectuez d'abord une comparaison CV-Offre pour identifier vos lacunes et générer un plan personnalisé.
            </p>
            <button
              onClick={() => generateSkillPlan()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Générer un plan
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plan de Développement</h1>
        <button
          onClick={resetPlan}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Nouveau plan
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Liste des Compétences */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compétences à Développer</h2>
            
            <div className="space-y-4">
              {skillGaps.map((skill, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedSkill === skill
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{skill.skill}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImportanceColor(skill.importance)}`}>
                      {getImportanceLabel(skill.importance)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{skill.resources.length} ressource(s) de formation</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="text-sm">Formations spécialisées disponibles</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Détail de la Compétence Sélectionnée */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            {selectedSkill ? (
              <>
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">{selectedSkill.skill}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Priorité :</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(selectedSkill.importance)}`}>
                      {getImportanceLabel(selectedSkill.importance)}
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-4">Ressources de Formation</h4>
                <div className="space-y-3">
                  {selectedSkill.resources.map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{resource.title}</h5>
                        <div className="flex items-center text-blue-600">
                          {getTypeIcon(resource.type)}
                        </div>
                      </div>
                      
                      {resource.description && (
                        <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                          {resource.difficulty}
                        </span>
                        {resource.duration && (
                          <span className="text-xs text-gray-500">{resource.duration}</span>
                        )}
                      </div>
                      
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        Accéder à la ressource
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  Sélectionnez une compétence pour voir les ressources recommandées
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conseils Généraux */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Conseils pour votre développement</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Planification :</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Commencez par les compétences haute priorité</li>
              <li>• Consacrez du temps régulier à l'apprentissage</li>
              <li>• Fixez-vous des objectifs réalisables</li>
              <li>• Pratiquez régulièrement ce que vous apprenez</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mise en pratique :</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Créez des projets personnels</li>
              <li>• Rejoignez des communautés en ligne</li>
              <li>• Participez à des événements networking</li>
              <li>• Mettez à jour votre CV régulièrement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsDevelopment;