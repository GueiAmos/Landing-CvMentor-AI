import React, { useState } from "react";
import {
  Target,
  AlertCircle,
  CheckCircle,
  FileText,
  Briefcase,
  TrendingUp,
  Search,
  Upload,
  Link,
  Sparkles,
  BarChart3,
  Award,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Zap,
  Star,
  Users,
  Clock,
  MapPin,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { saveSession, getSession } from "../../utils/storage";
import { JobOffer, CVJobMatch } from "../../types";
import LoadingSpinner from "../ui/LoadingSpinner";
import ProgressBar from "../ui/ProgressBar";
import MarkdownRenderer from "../ui/MarkdownRenderer";
import LearningPath from "./LearningPath";
import { useRef } from "react";

// Fonction pour extraire intelligemment la description depuis une URL via ScrapingBee
async function extractJobDescriptionFromUrl(url: string): Promise<string> {
  const apiKey =
    "QIJBN17SHS978TM3J9MKBLQ9VRXN69DYNN483MPPNL2EOH9BH5CGOS366H226K5SB4CBCF1PCETM0YUT";
  const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(
    url
  )}&render_js=false`;
  const response = await fetch(apiUrl);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération de la page");
  const html = await response.text();

  // Créer un DOM parser pour analyser le HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Fonction pour extraire le texte d'un sélecteur
  const extractText = (selector: string): string => {
    const element = doc.querySelector(selector);
    return element ? element.textContent?.trim() || "" : "";
  };

  // Fonction pour extraire le texte de plusieurs sélecteurs
  const extractTextMultiple = (selectors: string[]): string => {
    for (const selector of selectors) {
      const text = extractText(selector);
      if (text) return text;
    }
    return "";
  };

  // Détecter le type de site et extraire en conséquence
  const urlLower = url.toLowerCase();
  let extractedContent = "";

  if (urlLower.includes("linkedin.com/jobs")) {
    // LinkedIn Jobs
    const title = extractTextMultiple([
      ".job-details-jobs-unified-top-card__job-title",
      'h1[data-test-id="job-details-jobs-unified-top-card__job-title"]',
      ".job-details-jobs-unified-top-card__job-title",
      "h1",
    ]);

    const company = extractTextMultiple([
      ".job-details-jobs-unified-top-card__company-name",
      '[data-test-id="job-details-jobs-unified-top-card__company-name"]',
      ".job-details-jobs-unified-top-card__company-name",
    ]);

    const description = extractTextMultiple([
      ".job-details-jobs-unified-top-card__job-description",
      ".jobs-description__content",
      '[data-test-id="job-details-jobs-unified-top-card__job-description"]',
      ".jobs-box__html-content",
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  } else if (
    urlLower.includes("indeed.com") ||
    urlLower.includes("indeed.fr")
  ) {
    // Indeed
    const title = extractTextMultiple([
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      ".jobsearch-JobInfoHeader-title",
      "h1",
    ]);

    const company = extractTextMultiple([
      '[data-testid="jobsearch-JobInfoHeader-companyName"]',
      ".jobsearch-JobInfoHeader-companyName",
      ".companyName",
    ]);

    const description = extractTextMultiple([
      '[data-testid="jobsearch-JobComponent-description"]',
      ".jobsearch-JobComponent-description",
      "#jobDescriptionText",
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  } else if (urlLower.includes("apec.fr")) {
    // APEC
    const title = extractTextMultiple([
      ".job-title",
      ".offre-titre",
      "h1",
      ".title",
    ]);

    const company = extractTextMultiple([
      ".company-name",
      ".entreprise",
      ".societe",
    ]);

    const description = extractTextMultiple([
      ".job-description",
      ".offre-description",
      ".description",
      ".content",
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  } else if (urlLower.includes("pole-emploi.fr")) {
    // Pôle Emploi
    const title = extractTextMultiple([
      ".job-title",
      ".intitule-poste",
      "h1",
      ".title",
    ]);

    const company = extractTextMultiple([
      ".company-name",
      ".entreprise",
      ".societe",
    ]);

    const description = extractTextMultiple([
      ".job-description",
      ".description-poste",
      ".description",
      ".content",
    ]);

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  } else {
    // Site générique - extraction intelligente
    const title = extractTextMultiple([
      "h1",
      ".job-title",
      ".poste-titre",
      ".title",
      '[class*="title"]',
      '[class*="job"] h1',
      '[class*="poste"] h1',
    ]);

    const company = extractTextMultiple([
      ".company",
      ".entreprise",
      ".societe",
      '[class*="company"]',
      '[class*="entreprise"]',
      '[class*="societe"]',
    ]);

    // Chercher la description dans les sections les plus probables
    const descriptionSelectors = [
      ".job-description",
      ".description",
      ".content",
      ".poste-description",
      ".offre-description",
      '[class*="description"]',
      '[class*="content"]',
      "main",
      "article",
      ".main-content",
    ];

    let description = "";
    for (const selector of descriptionSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || "";
        if (text.length > 100) {
          // Description significative
          description = text;
          break;
        }
      }
    }

    // Si pas de description trouvée, extraire le texte principal
    if (!description) {
      const mainContent = doc.querySelector(
        "main, article, .main, .content, body"
      );
      if (mainContent) {
        description = mainContent.textContent?.trim() || "";
      }
    }

    extractedContent = `Titre du poste : ${title}\n\nEntreprise : ${company}\n\nDescription :\n${description}`;
  }

  // Nettoyer et formater le contenu extrait
  let cleanedContent = extractedContent
    .replace(/\s+/g, " ") // Remplacer les espaces multiples
    .replace(/\n\s*\n/g, "\n\n") // Nettoyer les lignes vides
    .trim();

  // Limiter la taille si nécessaire
  if (cleanedContent.length > 5000) {
    cleanedContent = cleanedContent.substring(0, 5000) + "...";
  }

  return (
    cleanedContent ||
    "Impossible d'extraire le contenu de cette page. Veuillez copier-coller manuellement la description."
  );
}

interface JobMatchingProps {
  onNavigate?: (section: string) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ onNavigate }) => {
  const [jobOffer, setJobOffer] = useState<Partial<JobOffer>>({
    description: "",
    requirements: [],
    skills: [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<CVJobMatch | null>(null);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"input" | "results">("input");
  const [mobileTab, setMobileTab] = useState<'strengths' | 'gaps'>('strengths');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const session = getSession();
    if (session.jobOffer) {
      setJobOffer(session.jobOffer);
    }
    if (session.cvJobMatch) {
      setMatchResult(session.cvJobMatch);
      setActiveTab("results");
    }
    setIsAnalyzing(false);
    setError("");
  }, []);

  // Scroll en haut à chaque changement d'onglet principal (input/results)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleJobOfferChange = (field: keyof JobOffer, value: string) => {
    const updatedOffer = { ...jobOffer, [field]: value };
    setJobOffer(updatedOffer);

    if (field === "description") {
      // Auto-extract skills from description
      const skills = extractSkillsFromDescription(value);
      updatedOffer.skills = skills;
      setJobOffer(updatedOffer);
    }
  };

  const extractSkillsFromDescription = (description: string): string[] => {
    const commonSkills = [
      "javascript",
      "python",
      "react",
      "angular",
      "vue",
      "node.js",
      "php",
      "java",
      "sql",
      "mongodb",
      "postgresql",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "gestion de projet",
      "leadership",
      "communication",
      "travail en équipe",
      "autonomie",
      "créativité",
      "innovation",
      "analyse",
      "résolution de problèmes",
    ];

    const lowerDescription = description.toLowerCase();
    return commonSkills
      .filter((skill) => lowerDescription.includes(skill.toLowerCase()))
      .slice(0, 10);
  };

  // Extraction structurée fictive (à remplacer par l'IA backend)
  const extractOfferStructure = (description: string) => {
    // Simule une extraction IA (à remplacer par un vrai appel backend)
    // Ici, on cherche des patterns simples pour la démo
    const titleMatch = description.match(
      /(intitulé|poste|titre)\s*[:\-]?\s*(.+)/i
    );
    const levelMatch = description.match(
      /(niveau d'étude|diplôme)\s*[:\-]?\s*(.+)/i
    );
    const expMatch = description.match(/(expérience|années)\s*[:\-]?\s*(.+)/i);
    const skillsMatch = description.match(
      /(compétences|skills)\s*[:\-]?\s*([\w\s,;]+)/i
    );
    const reqMatch = description.match(
      /(exigences|requirements)\s*[:\-]?\s*([\w\s,;]+)/i
    );
    return {
      title: titleMatch ? titleMatch[2] : "",
      level: levelMatch ? levelMatch[2] : "",
      experience: expMatch ? expMatch[2] : "",
      skills: skillsMatch ? skillsMatch[2] : "",
      requirements: reqMatch ? reqMatch[2] : "",
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
      setError(
        "Veuillez d'abord analyser votre CV dans la section précédente."
      );
      return;
    }

    if (!jobOffer.description) {
      setError("Veuillez renseigner la description complète de l'offre.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const completeJobOffer: JobOffer = {
        title: "",
        company: "",
        description: jobOffer.description || "",
        requirements: jobOffer.requirements || [],
        skills: jobOffer.skills || [],
      };

      saveSession({ jobOffer: completeJobOffer });

      // LOG des données extraites du CV
      const extractedCV = session.cvAnalysis?.extractedSections;
      console.log('Données extraites du CV pour la comparaison:', extractedCV);
      if (!extractedCV || Object.values(extractedCV).every(val => !val || val.trim() === "")) {
        setError("Votre CV n'a pas pu être analysé correctement. Veuillez vérifier que le fichier est lisible, bien structuré et contient des informations exploitables.");
        setIsAnalyzing(false);
        return;
      }

      const match = await aiService.matchCVWithJob(
        session.cvText,
        completeJobOffer
      );

      // Validation plus souple : on affiche les résultats si le score est bien un nombre
      const isResultValid = match && typeof match.compatibilityRate === 'number';

      if (!isResultValid) {
        setError("Aucune correspondance réelle trouvée entre votre CV et l'offre. Veuillez vérifier que votre CV contient bien des informations exploitables et que l'offre est complète. Aucune donnée fictive ne sera affichée.");
        setIsAnalyzing(false);
        return;
      }

      setMatchResult(match);

      // Créer un identifiant unique pour cette comparaison
      const matchId = `${completeJobOffer.description.substring(
        0,
        100
      )}_${session.cvText.substring(0, 100)}`;

      saveSession({
        cvJobMatch: match,
        lastMatchId: matchId,
        forceSkillPlanRegeneration: true, // Nouvelle comparaison = nouveau plan à générer
      });

      setActiveTab("results");
    } catch (err) {
      setError("Erreur lors de l'analyse. Veuillez réessayer.");
      console.error("Job Matching Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetMatch = () => {
    setMatchResult(null);
    setError("");
    setActiveTab("input");
  };

  const getCompatibilityColor = (rate: number) => {
    if (rate >= 80) return "green";
    if (rate >= 60) return "orange";
    if (rate >= 40) return "orange";
    return "red";
  };

  const getCompatibilityEmoji = (rate: number) => {
    if (rate >= 80) return "🎯";
    if (rate >= 60) return "👍";
    if (rate >= 40) return "🤔";
    return "⚠️";
  };

  const getCompatibilityMessage = (rate: number) => {
    if (rate >= 80) return "Excellente compatibilité !";
    if (rate >= 60) return "Bonne compatibilité";
    if (rate >= 40) return "Compatibilité modérée";
    return "Compatibilité faible";
  };

  const handleGoToSkills = () => {
    const session = getSession();

    // Vérifier si cette comparaison vient d'être générée
    const currentMatchId = `${jobOffer.description?.substring(
      0,
      100
    )}_${session.cvText?.substring(0, 100)}`;
    const lastMatchId = session.lastMatchId || "";

    // Si c'est une nouvelle comparaison, forcer la régénération du plan
    if (currentMatchId !== lastMatchId) {
      saveSession({ forceSkillPlanRegeneration: true });
      saveSession({ lastMatchId: currentMatchId });
    } else {
      // Si c'est la même comparaison, ne pas forcer la régénération
      saveSession({ forceSkillPlanRegeneration: false });
    }

    onNavigate && onNavigate("skills");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={resetMatch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Revenir à la comparaison
          </button>
        </div>
      </div>
    );
  }

  if (matchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comparaison CV ↔ Offre d'emploi
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Analysez la compatibilité entre votre CV et une offre d'emploi
            </p>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          
          
            {/* Results Panel */}
            <div
              className={`lg:block ${
                activeTab === "results" ? "block" : "hidden"
              }`}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Résultats
                    </h2>
                  </div>
                  <button
                    onClick={resetMatch}
                    className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Nouvelle analyse
                  </button>
                </div>

                {/* Taux de Compatibilité */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {getCompatibilityMessage(matchResult.compatibilityRate)}
                    </h3>
                    <div className="max-w-md mx-auto mb-4">
                      <ProgressBar
                        progress={matchResult.compatibilityRate}
                        label="Compatibilité avec l'offre"
                        color={getCompatibilityColor(
                          matchResult.compatibilityRate
                        )}
                        showPercentage={true}
                      />
                    </div>
                    <p
                      className="text-3xl font-bold mb-2"
                      style={{
                        color:
                          getCompatibilityColor(
                            matchResult.compatibilityRate
                          ) === "green"
                            ? "#10b981"
                            : getCompatibilityColor(
                                matchResult.compatibilityRate
                              ) === "orange"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {matchResult.compatibilityRate}%
                    </p>
                    <p className="text-gray-600 text-sm">
                      {matchResult.compatibilityRate >= 80
                        ? "Excellente compatibilité ! Votre profil correspond très bien aux attentes."
                        : matchResult.compatibilityRate >= 60
                        ? "Bonne compatibilité. Quelques ajustements pourraient améliorer votre profil."
                        : matchResult.compatibilityRate >= 40
                        ? "Compatibilité modérée. Des améliorations sont recommandées."
                        : "Compatibilité faible. Considérez développer certaines compétences clés."}
                    </p>
                  </div>
                </div>

                                  {/* Compétences Alignées et Lacunes */}
                <div className="space-y-6">
                  {/* Vue Mobile - Onglets Points Forts / Compétences Manquantes */}
                  <div className="lg:hidden mb-6">
                    <div className="flex bg-white rounded-2xl p-1 shadow-lg mb-4">
                      <button
                        onClick={() => setMobileTab('strengths')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          mobileTab === 'strengths'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-green-600'
                        }`}
                      >
                        Points forts
                      </button>
                      <button
                        onClick={() => setMobileTab('gaps')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          mobileTab === 'gaps'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-orange-600'
                        }`}
                      >
                        Compétences à développer
                      </button>
                    </div>
                    {/* Contenu de l'onglet sélectionné */}
                    {mobileTab === 'strengths' && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center mb-4">
                          <Award className="h-5 w-5 text-green-600 mr-2" />
                          <h3 className="text-lg font-bold text-green-900">Vos points forts</h3>
                        </div>
                        <p className="text-green-800 text-xs mb-4">
                          Compétences de votre CV qui correspondent aux attentes
                        </p>
                        <div className="space-y-2">
                          {(() => {
                            const aligned = matchResult.alignedSkills || [];
                            if (aligned.length === 0) {
                              return (
                                <div className="text-center py-4">
                                  <div className="text-orange-500 text-sm">
                                    Aucun point fort identifié pour ce poste.
                                  </div>
                                </div>
                              );
                            }
                            return aligned.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-green-100 rounded-xl p-3"
                              >
                                <Star className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                <MarkdownRenderer
                                  content={skill}
                                  className="text-green-800 font-medium text-sm"
                                />
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                    {mobileTab === 'gaps' && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                          <h3 className="text-lg font-bold text-orange-900">Compétences à développer</h3>
                        </div>
                        <p className="text-orange-800 text-xs mb-4">
                          Compétences recherchées par l'employeur
                        </p>
                        <div className="space-y-2">
                          {matchResult.gaps.map((gap, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-orange-100 rounded-xl p-3"
                            >
                              <Target className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                              <MarkdownRenderer
                                content={`**${gap}**`}
                                className="text-orange-800 font-medium text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        {/* Bouton formations dans la zone des compétences manquantes */}
                        {matchResult.gaps.length > 0 && (
                          <div className="mt-6">
                            <button
                              className="w-full group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
                              onClick={handleGoToSkills}
                            >
                              Recommandations de formations
                              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Vue Web - Grille 3 colonnes */}
                  <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                    {/* Points Forts - Vue Web */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <Award className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-bold text-green-900">
                          Vos points forts
                        </h3>
                      </div>
                      <p className="text-green-800 text-sm mb-4">
                        Compétences de votre CV qui correspondent aux attentes
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          const aligned = matchResult.alignedSkills || [];

                          if (aligned.length === 0) {
                            return (
                              <div className="text-center py-4">
                                <div className="text-orange-500 text-sm">
                                  Aucun point fort identifié pour ce poste.
                                </div>
                              </div>
                            );
                          }

                          return aligned.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-green-100 rounded-xl p-3"
                            >
                              <Star className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              <MarkdownRenderer
                                content={skill}
                                className="text-green-800 font-medium text-sm"
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Compétences Manquantes - Vue Web */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                        <h3 className="text-lg font-bold text-orange-900">
                          Compétences à développer
                        </h3>
                      </div>
                      <p className="text-orange-800 text-sm mb-4">
                        Compétences recherchées par l'employeur
                      </p>
                      <div className="space-y-2">
                        {matchResult.gaps.map((gap, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-orange-100 rounded-xl p-3"
                          >
                            <Target className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                            <MarkdownRenderer
                              content={`**${gap}**`}
                              className="text-orange-800 font-medium text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Bouton formations dans la zone des compétences manquantes */}
                      {matchResult.gaps.length > 0 && (
                        <div className="mt-6">
                          <button
                            className="w-full group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                            onClick={handleGoToSkills}
                          >
                            Recommandations de formations
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Conseils d'Adaptation - Vue Web */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center mb-4">
                        <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-bold text-blue-900">
                          Conseils d'adaptation
                        </h3>
                      </div>
                      <p className="text-blue-800 text-sm mb-4">
                        Recommandations pour améliorer votre candidature
                      </p>
                      <div className="space-y-3">
                        {matchResult.adaptationTips.map((tip, index) => (
                          <div
                            key={index}
                            className="flex items-start bg-blue-100 rounded-xl p-3"
                          >
                            <Briefcase className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <MarkdownRenderer
                              content={tip}
                              className="text-blue-800 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vue Mobile - Points Forts */}
                  {/* This section is now redundant as the content is moved to the mobileTab */}
                  {/* <div
                    className={`lg:hidden ${
                      mobileTab === "strengths" ? "block" : "hidden"
                    }`}
                  >
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <Award className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-bold text-green-900">
                          Vos points forts
                        </h3>
                      </div>
                      <p className="text-green-800 text-xs mb-4">
                        Compétences de votre CV qui correspondent aux attentes
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          const aligned = matchResult.alignedSkills || [];

                          if (aligned.length === 0) {
                            return (
                              <div className="text-center py-4">
                                <div className="text-orange-500 text-sm">
                                  Aucun point fort identifié pour ce poste.
                                </div>
                              </div>
                            );
                          }

                          return aligned.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-green-100 rounded-xl p-3"
                            >
                              <Star className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              <MarkdownRenderer
                                content={skill}
                                className="text-green-800 font-medium text-sm"
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div> */}

                  {/* Vue Mobile - Compétences Manquantes */}
                  {/* This section is now redundant as the content is moved to the mobileTab */}
                  {/* <div
                    className={`lg:hidden ${
                      mobileTab === "gaps" ? "block" : "hidden"
                    }`}
                  >
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                        <h3 className="text-lg font-bold text-orange-900">
                          Compétences à développer
                        </h3>
                      </div>
                      <p className="text-orange-800 text-xs mb-4">
                        Compétences recherchées par l'employeur
                      </p>
                      <div className="space-y-2">
                        {matchResult.gaps.map((gap, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-orange-100 rounded-xl p-3"
                          >
                            <Target className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                            <MarkdownRenderer
                              content={`**${gap}**`}
                              className="text-orange-800 font-medium text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Bouton formations dans la zone des compétences manquantes */}
                      {/* {matchResult.gaps.length > 0 && (
                        <div className="mt-6">
                          <button
                            className="w-full group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
                            onClick={handleGoToSkills}
                          >
                            Recommandations de formations
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )} */}
                    {/* </div>
                  </div> */}
                </div>
              </div>
            </div>
         

          {/* Conseils d'Adaptation - Vue Mobile uniquement */}
          <div className="mt-8 sm:mt-12 lg:hidden">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-blue-900">
                  Conseils d'adaptation
                </h3>
              </div>
              <div className="space-y-3">
                {matchResult.adaptationTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-blue-100 rounded-xl p-3"
                  >
                    <Briefcase className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <MarkdownRenderer
                      content={tip}
                      className="text-blue-800 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comparaison CV ↔ Offre d'emploi
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Analysez la compatibilité entre votre CV et une offre d'emploi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {isAnalyzing ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <LoadingSpinner
              size="lg"
              text="Analyse du matching en cours... Comparaison de votre profil avec l'offre."
            />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Analyse de compatibilité
              </h2>
              
            </div>

            <form className="space-y-6">
              {/* Description de l'offre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description de l'offre *
                </label>
                <textarea
                  value={jobOffer.description}
                  onChange={(e) =>
                    handleJobOfferChange("description", e.target.value)
                  }
                  rows={14}
                  placeholder="Collez ici la description complète de l'offre d'emploi (intitulé inclus si besoin)..."
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={analyzeMatch}
                disabled={!jobOffer.description || isAnalyzing}
                className="w-full group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 mr-2 group-hover:scale-110 transition-transform" />
                    Analyser la Compatibilité
                  </>
                )}
              </button>
            </form>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-gray-900">
                  Cette analyse vous permettra de :
                </h4>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">
                    Connaître votre taux de compatibilité avec l'offre
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">
                    Identifier vos compétences alignées avec les attentes
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">
                    Découvrir les lacunes à combler
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">
                    Recevoir des conseils pour adapter votre candidature
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatching;
