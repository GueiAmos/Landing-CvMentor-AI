import React, { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
  ArrowRight,
  Star,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { saveSession, getSession } from "../../utils/storage";
import { CoverLetter as CoverLetterType } from "../../types";
import LoadingSpinner from "../ui/LoadingSpinner";
import MarkdownRenderer from "../ui/MarkdownRenderer";

const CoverLetter: React.FC = () => {
  const [tone, setTone] = useState<"formal" | "dynamic" | "creative">("formal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterType | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "preview">("config");

  React.useEffect(() => {
    const session = getSession();
    if (session.coverLetter) {
      setCoverLetter(session.coverLetter);
      setTone(session.coverLetter.tone);
    }
    setIsGenerating(false);
    setError("");
  }, []);

  const generateCoverLetter = async () => {
    const session = getSession();

    if (!session.cvText) {
      setError("Veuillez d'abord analyser votre CV.");
      return;
    }

    if (!session.jobOffer) {
      setError("Veuillez d'abord effectuer une comparaison CV-Offre.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const letter = await aiService.generateCoverLetter(
        session.cvText,
        session.jobOffer,
        tone
      );
      setCoverLetter(letter);
      saveSession({ coverLetter: letter });
      setActiveTab("preview");
    } catch (err) {
      setError("Erreur lors de la génération. Veuillez réessayer.");
      console.error("Cover Letter Generation Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(coverLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const downloadPDF = () => {
    if (!coverLetter) return;

    const element = document.createElement("a");
    const file = new Blob([coverLetter.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "lettre_motivation.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toneDescriptions = {
    formal: {
      title: "Formel",
      description:
        "Style classique et professionnel, adapté aux secteurs traditionnels",
      icon: "👔",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    dynamic: {
      title: "Dynamique",
      description:
        "Ton moderne et énergique, parfait pour les startups et entreprises innovantes",
      icon: "⚡",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    creative: {
      title: "Créatif",
      description:
        "Style original et personnalisé, idéal pour les métiers créatifs",
      icon: "🎨",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Générateur de Lettre de Motivation
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Créez une lettre personnalisée et impactante basée sur votre CV et
              l'offre d'emploi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex bg-white rounded-2xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "config"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "preview"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Aperçu
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Configuration Panel */}
          <div
            className={`lg:block ${
              activeTab === "config" ? "block" : "hidden"
            }`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Configuration
                </h2>
              </div>

              {/* Tone Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Choisissez le ton :
                </h3>
                <div className="space-y-3">
                  {Object.entries(toneDescriptions).map(([key, desc]) => (
                    <label
                      key={key}
                      className={`group relative flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        tone === key
                          ? `${desc.bgColor} ${desc.borderColor} border-2 shadow-lg`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={key}
                        checked={tone === key}
                        onChange={(e) => setTone(e.target.value as typeof tone)}
                        className="sr-only"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{desc.icon}</span>
                          <span className="font-bold text-gray-900">
                            {desc.title}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {desc.description}
                        </p>
                      </div>
                      {tone === key && (
                        <div
                          className={`w-6 h-6 bg-gradient-to-r ${desc.color} rounded-full flex items-center justify-center`}
                        >
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Generation Button */}
              <button
                onClick={generateCoverLetter}
                disabled={isGenerating}
                className="w-full group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2 group-hover:rotate-12 transition-transform" />
                    Générer ma lettre
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-bold text-gray-900">Prérequis :</h4>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Analyse de CV complétée</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">
                      Comparaison CV-Offre effectuée
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div
            className={`lg:block ${
              activeTab === "preview" ? "block" : "hidden"
            }`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Aperçu
                  </h2>
                </div>
                {coverLetter && (
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copied ? "Copié !" : "Copier"}
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </button>
                  </div>
                )}
              </div>

              {isGenerating ? (
                <div className="text-center py-12">
                  <LoadingSpinner
                    size="lg"
                    text="Génération de votre lettre personnalisée..."
                  />
                </div>
              ) : coverLetter ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm sm:text-base">
                      <MarkdownRenderer content={coverLetter.content} />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-800 font-medium">
                        <strong>Ton utilisé :</strong>{" "}
                        {toneDescriptions[coverLetter.tone].title}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Votre lettre apparaîtra ici
                  </p>
                  <p className="text-sm">
                    Configurez et générez votre lettre personnalisée
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Conseils
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-orange-600 mr-2" />
                  Personnalisez davantage
                </h4>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mentionnez des projets spécifiques pertinents</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Ajoutez des éléments sur la culture d'entreprise
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Personnalisez l'accroche selon l'interlocuteur</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Vérifiez avant d'envoyer
                </h4>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Orthographe et grammaire</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cohérence avec votre CV</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Adaptation au secteur d'activité</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
