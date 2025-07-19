import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { JobOffer, CVJobMatch } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import SkillsDevelopment from './SkillsDevelopment';
import { useRef } from 'react';

// Fonction pour extraire intelligemment la description depuis une URL via ScrapingBee
async function extractJobDescriptionFromUrl(url: string): Promise<string> {
  const apiKey = 'QIJBN17SHS978TM3J9MKBLQ9VRXN69DYNN483MPPNL2EOH9BH5CGOS366H226K5SB4CBCF1PCETM0YUT';
  const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=false`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Erreur lors de la récupération de la page');
  const html = await response.text();

  // Créer un DOM parser pour analyser le HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Fonction pour extraire le texte d'un sélecteur
  const extractText = (selector: string): string => {
    const element = doc.querySelector(selector);
    return element ? element.textContent?.trim() || '' : '';
  };

  // Fonction pour extraire le texte de plusieurs sélecteurs
  const extractTextMultiple = (selectors: string[]): string => {
    for (const selector of selectors) {
      const text = extractText(selector);
      if (text) return text;
    }
    return '';
  };

  // Détecter le type de site et extraire en conséquence
  const urlLower = url.toLowerCase();
  let extractedContent = '';

  if (urlLower.includes('linkedin.com/jobs')) {
    // LinkedIn Jobs
    const title = extractTextMultiple([
      '.job-details-jobs-unified-top-card__job-title',
      'h1[data-test-id="job-details-jobs-unified-top-card__job-title"]',
      '.job-details-jobs-unified-top-card__job-title',
      'h1'
    ]);

    const company = extractTextMultiple([
      '.job-details-jobs-unified-top-card__company-name',
      '[data-test-id="job-details-jobs-unified-top-card__company-name"]',
      '.job-details-jobs-unified-top-card__company-name'
    ]);

    const description = extractTextMultiple([
      '.job-details-jobs-unified-top-card__job-description',
      '.jobs-description__content',
      '[data-test-id="job-details-jobs-unified-top-card__job-description"]',
      '.jobs-box__html-content'
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;

  } else if (urlLower.includes('indeed.com') || urlLower.includes('indeed.fr')) {
    // Indeed
    const title = extractTextMultiple([
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      '.jobsearch-JobInfoHeader-title',
      'h1'
    ]);

    const company = extractTextMultiple([
      '[data-testid="jobsearch-JobInfoHeader-companyName"]',
      '.jobsearch-JobInfoHeader-companyName',
      '.companyName'
    ]);

    const description = extractTextMultiple([
      '[data-testid="jobsearch-JobComponent-description"]',
      '.jobsearch-JobComponent-description',
      '#jobDescriptionText'
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;

  } else if (urlLower.includes('apec.fr')) {
    // APEC
    const title = extractTextMultiple([
      '.job-title',
      '.offre-titre',
      'h1',
      '.title'
    ]);

    const company = extractTextMultiple([
      '.company-name',
      '.entreprise',
      '.societe'
    ]);

    const description = extractTextMultiple([
      '.job-description',
      '.offre-description',
      '.description',
      '.content'
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;

  } else if (urlLower.includes('pole-emploi.fr')) {
    // Pôle Emploi
    const title = extractTextMultiple([
      '.job-title',
      '.intitule-poste',
      'h1',
      '.title'
    ]);

    const company = extractTextMultiple([
      '.company-name',
      '.entreprise',
      '.societe'
    ]);

    const description = extractTextMultiple([
      '.job-description',
      '.description-poste',
      '.description',
      '.content'
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;

  } else {
    // Site générique - extraction intelligente
    const title = extractTextMultiple([
      'h1',
      '.job-title',
      '.poste-titre',
      '.title',
      '[class*="title"]',
      '[class*="job"] h1',
      '[class*="poste"] h1'
    ]);

    const company = extractTextMultiple([
      '.company',
      '.entreprise',
      '.societe',
      '[class*="company"]',
      '[class*="entreprise"]',
      '[class*="societe"]'
    ]);

    // Chercher la description dans les sections les plus probables
    const descriptionSelectors = [
      '.job-description',
      '.description',
      '.content',
      '.poste-description',
      '.offre-description',
      '[class*="description"]',
      '[class*="content"]',
      'main',
      'article',
      '.main-content'
    ];

    let description = '';
    for (const selector of descriptionSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text.length > 100) { // Description significative
          description = text;
          break;
        }
      }
    }

    // Si pas de description trouvée, extraire le texte principal
    if (!description) {
      const mainContent = doc.querySelector('main, article, .main, .content, body');
      if (mainContent) {
        description = mainContent.textContent?.trim() || '';
      }
    }

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  }

  // Nettoyer et formater le contenu extrait
  let cleanedContent = extractedContent
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .replace(/\n\s*\n/g, '\n\n') // Nettoyer les lignes vides
    .trim();

  // Limiter la taille si nécessaire
  if (cleanedContent.length > 5000) {
    cleanedContent = cleanedContent.substring(0, 5000) + '...';
  }

  return cleanedContent || 'Impossible d\'extraire le contenu de cette page. Veuillez copier-coller manuellement la description.';
}

interface JobMatchingProps {
  onNavigate?: (section: string) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ onNavigate }) => {
  const [jobOffer, setJobOffer] = useState<Partial<JobOffer>>({
    description: '',
    requirements: [],
    skills: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<CVJobMatch | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const session = getSession();
    if (session.jobOffer) {
      setJobOffer(session.jobOffer);
    }
    if (session.cvJobMatch) {
      setMatchResult(session.cvJobMatch);
    }
    // Annuler tout état "en cours" si on revient sur la page
    setIsAnalyzing(false);
    setError('');
    // Optionnel : effacer les résultats partiels si on veut forcer une nouvelle comparaison
    // setMatchResult(null);
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

  // Extraction structurée fictive (à remplacer par l'IA backend)
  const extractOfferStructure = (description: string) => {
    // Simule une extraction IA (à remplacer par un vrai appel backend)
    // Ici, on cherche des patterns simples pour la démo
    const titleMatch = description.match(/(intitulé|poste|titre)\s*[:\-]?\s*(.+)/i);
    const levelMatch = description.match(/(niveau d'étude|diplôme)\s*[:\-]?\s*(.+)/i);
    const expMatch = description.match(/(expérience|années)\s*[:\-]?\s*(.+)/i);
    const skillsMatch = description.match(/(compétences|skills)\s*[:\-]?\s*([\w\s,;]+)/i);
    const reqMatch = description.match(/(exigences|requirements)\s*[:\-]?\s*([\w\s,;]+)/i);
    return {
      title: titleMatch ? titleMatch[2] : '',
      level: levelMatch ? levelMatch[2] : '',
      experience: expMatch ? expMatch[2] : '',
      skills: skillsMatch ? skillsMatch[2] : '',
      requirements: reqMatch ? reqMatch[2] : '',
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setJobOffer((prev) => ({ ...prev, description: text }));
    };
    reader.readAsText(file);
  };

  const analyzeMatch = async () => {
    const session = getSession();
    if (!session.cvText) {
      setError('Veuillez d\'abord analyser votre CV dans la section précédente.');
      return;
    }

    if (!jobOffer.description) {
      setError('Veuillez renseigner la description complète de l\'offre.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const completeJobOffer: JobOffer = {
        title: '',
        company: '',
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

  const handleGoToSkills = () => {
    const session = getSession();
    // Identifiant unique du CV : nom + taille
    const currentCVId = session.uploadedFile ? `${session.uploadedFile.name}_${session.uploadedFile.size}` : '';
    // Identifiant du dernier plan généré
    const lastSkillPlanCVId = session.lastSkillPlanCVId || '';
    // Si le plan n'est pas à jour, forcer la régénération
    if (currentCVId && currentCVId !== lastSkillPlanCVId) {
      saveSession({ forceSkillPlanRegeneration: true });
    } else {
      saveSession({ forceSkillPlanRegeneration: false });
    }
    onNavigate && onNavigate('skills');
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
              <h3 className="text-xl font-semibold text-green-900">Vos points forts pour ce poste</h3>
            </div>
            <p className="text-green-800 text-xs sm:text-sm mb-3">Ce sont les compétences de votre CV qui correspondent aux attentes de l'offre d'emploi.</p>
            <div className="space-y-2">
              {(() => {
                // Intersection réelle si possible
                let aligned: string[] = [];
                if (matchResult.cvSkills && matchResult.offerSkills) {
                  const cvSkills = matchResult.cvSkills.map((s: string) => s.trim().toLowerCase());
                  const offerSkills = matchResult.offerSkills.map((s: string) => s.trim().toLowerCase());
                  aligned = cvSkills.filter(skill => offerSkills.includes(skill));
                  // Optionnel : recouper avec alignedSkills du backend si dispo
                  if (matchResult.alignedSkills) {
                    const backendAligned = matchResult.alignedSkills.map((s: string) => s.trim().toLowerCase());
                    aligned = aligned.filter(skill => backendAligned.includes(skill));
                  }
                } else if (matchResult.alignedSkills) {
                  aligned = matchResult.alignedSkills;
                }
                if (aligned.length === 0) {
                  return <div className="text-xs text-orange-600">Aucune compétence commune détectée entre votre CV et l'offre.</div>;
                }
                return aligned.map((skill, index) => (
                <div key={index} className="flex items-center bg-green-100 rounded-lg p-3">
                  <Target className="h-4 w-4 text-green-600 mr-2" />
                    <MarkdownRenderer content={skill} className="text-green-800 font-medium text-sm" />
                </div>
                ));
              })()}
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
        {matchResult.gaps.length > 0 && (
  <div className="flex justify-end mt-6">
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors"
      onClick={handleGoToSkills}
    >
      Voir des formations pour ces compétences
    </button>
  </div>
)}

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Comparaison CV ↔ Offre d'emploi</h1>
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
            {/* Description de l'offre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'offre *
              </label>
              <textarea
                value={jobOffer.description}
                onChange={(e) => handleJobOfferChange('description', e.target.value)}
                rows={14}
                placeholder="Collez ici la description complète de l'offre d'emploi (intitulé inclus si besoin)..."
                className="w-full px-4 py-5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

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
              disabled={!jobOffer.description}
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