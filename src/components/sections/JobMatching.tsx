import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { JobOffer, CVJobMatch } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const JobMatching: React.FC = () => {
  const [jobOffer, setJobOffer] = useState<Partial<JobOffer>>({
    title: '',
    company: '',
    description: '',
    requirements: [],
    skills: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<CVJobMatch | null>(null);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    const session = getSession();
    if (session.jobOffer) {
      setJobOffer(session.jobOffer);
    }
    if (session.cvJobMatch) {
      setMatchResult(session.cvJobMatch);
    }
  }, []);

  const handleJobOfferChange = (field: keyof JobOffer, value: string) => {
    const updatedOffer = { ...jobOffer, [field]: value };
    setJobOffer(updatedOffer);
    
    if (field === 'description') {
      // Auto-extract skills from description
      const skills = extractSkillsFromDescription(value);
      updatedOffer.skills = skills;
      setJobOffer(updatedOffer);
    }
  };

  const extractSkillsFromDescription = (description: string): string[] => {
    const commonSkills = [
      'javascript', 'python', 'react', 'angular', 'vue', 'node.js', 'php', 'java',
      'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
      'gestion de projet', 'leadership', 'communication', 'travail en équipe',
      'autonomie', 'créativité', 'innovation', 'analyse', 'résolution de problèmes'
    ];

    const lowerDescription = description.toLowerCase();
    return commonSkills.filter(skill => 
      lowerDescription.includes(skill.toLowerCase())
    ).slice(0, 10);
  };

  const analyzeMatch = async () => {
    const session = getSession();
    if (!session.cvText) {
      setError('Veuillez d\'abord analyser votre CV dans la section précédente.');
      return;
    }

    if (!jobOffer.title || !jobOffer.description) {
      setError('Veuillez remplir au minimum le titre du poste et la description.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const completeJobOffer: JobOffer = {
        title: jobOffer.title || '',
        company: jobOffer.company || 'Entreprise',
        description: jobOffer.description || '',
        requirements: jobOffer.requirements || [],
        skills: jobOffer.skills || []
      };

      saveSession({ jobOffer: completeJobOffer });

      const match = await aiService.matchCVWithJob(session.cvText, completeJobOffer);
      setMatchResult(match);
      saveSession({ cvJobMatch: match });
    } catch (err) {
      setError('Erreur lors de l\'analyse. Veuillez réessayer.');
      console.error('Job Matching Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetMatch = () => {
    setMatchResult(null);
    setError('');
  };

  const getCompatibilityColor = (rate: number) => {
    if (rate >= 80) return 'green';
    if (rate >= 60) return 'orange';
    if (rate >= 40) return 'orange';
    return 'red';
  };

  if (matchResult) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Résultats du Matching</h1>
          <button
            onClick={resetMatch}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Nouvelle analyse
          </button>
        </div>

        {/* Taux de Compatibilité */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Taux de Compatibilité</h2>
            <div className="max-w-md mx-auto">
              <ProgressBar 
                progress={matchResult.compatibilityRate}
                label="Compatibilité avec l'offre"
                color={getCompatibilityColor(matchResult.compatibilityRate)}
                showPercentage={true}
              />
              <p className="text-3xl font-bold mt-4" style={{
                color: getCompatibilityColor(matchResult.compatibilityRate) === 'green' ? '#10b981' :
                       getCompatibilityColor(matchResult.compatibilityRate) === 'orange' ? '#f59e0b' : '#ef4444'
              }}>
                {matchResult.compatibilityRate}%
              </p>
            </div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {matchResult.compatibilityRate >= 80 ? 'Excellente compatibilité ! Votre profil correspond très bien aux attentes.' :
               matchResult.compatibilityRate >= 60 ? 'Bonne compatibilité. Quelques ajustements pourraient améliorer votre profil.' :
               matchResult.compatibilityRate >= 40 ? 'Compatibilité modérée. Des améliorations sont recommandées.' :
               'Compatibilité faible. Considérez développer certaines compétences clés.'}
            </p>
          </div>
        </div>

        {/* Compétences Alignées et Lacunes */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-50 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-green-900">Compétences Alignées</h3>
            </div>
            <div className="space-y-2">
              {matchResult.alignedSkills.map((skill, index) => (
                <div key={index} className="flex items-center bg-green-100 rounded-lg p-3">
                  <Target className="h-4 w-4 text-green-600 mr-2" />
                  <MarkdownRenderer content={skill} className="text-green-800 font-medium" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-xl font-semibold text-red-900">Compétences Manquantes pour ce Poste</h3>
            </div>
            <div className="space-y-2">
              {matchResult.gaps.map((gap, index) => (
                <div key={index} className="flex items-center bg-red-100 rounded-lg p-3">
                  <TrendingUp className="h-4 w-4 text-red-600 mr-2" />
                  <MarkdownRenderer content={`**${gap}** - Compétence recherchée par l'employeur`} className="text-red-800 font-medium" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conseils d'Adaptation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Conseils d'Adaptation</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {matchResult.adaptationTips.map((tip, index) => (
              <div key={index} className="flex items-start bg-blue-50 rounded-lg p-4">
                <Briefcase className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <MarkdownRenderer content={tip} className="text-blue-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Comparaison CV-Offre</h1>
        <p className="text-xl text-gray-600">
          Analysez la compatibilité entre votre CV et une offre d'emploi
        </p>
      </div>

      {isAnalyzing ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoadingSpinner 
            size="lg" 
            text="Analyse du matching en cours... Comparaison de votre profil avec l'offre." 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du poste *
              </label>
              <input
                type="text"
                value={jobOffer.title}
                onChange={(e) => handleJobOfferChange('title', e.target.value)}
                placeholder="Ex: Développeur Full Stack, Chargé de Marketing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise
              </label>
              <input
                type="text"
                value={jobOffer.company}
                onChange={(e) => handleJobOfferChange('company', e.target.value)}
                placeholder="Nom de l'entreprise"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'offre *
              </label>
              <textarea
                value={jobOffer.description}
                onChange={(e) => handleJobOfferChange('description', e.target.value)}
                rows={8}
                placeholder="Collez ici la description complète de l'offre d'emploi..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Auto-detected Skills */}
            {jobOffer.skills && jobOffer.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétences détectées automatiquement
                </label>
                <div className="flex flex-wrap gap-2">
                  {jobOffer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={analyzeMatch}
              disabled={!jobOffer.title || !jobOffer.description}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Analyser la Compatibilité
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Cette analyse vous permettra de :</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Connaître votre taux de compatibilité avec l'offre
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Identifier vos compétences alignées avec les attentes
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Découvrir les lacunes à combler
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Recevoir des conseils pour adapter votre candidature
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;